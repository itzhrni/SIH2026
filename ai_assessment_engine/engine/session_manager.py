"""
Session Manager State Machine for Adaptive Assessment.
Flow: Knowledge Graph -> Question -> Student Answer -> Evaluate -> Follow-up / Advance / Gap -> Final Report.
"""
import uuid
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from ai_assessment_engine.knowledge_graph.schema import KnowledgeGraphDomain, ConceptNode
from ai_assessment_engine.knowledge_graph.graph_loader import registry
from ai_assessment_engine.engine.evaluator import RubricEvaluator, EvaluationResult
from ai_assessment_engine.engine.question_generator import QuestionGenerator
from ai_assessment_engine.ai.llm_client import llm_client


class AssessmentTurn(BaseModel):
    concept_id: str
    concept_name: str
    question: str
    student_answer: str
    is_follow_up: bool = False
    evaluation: EvaluationResult


class AssessmentSessionState(BaseModel):
    session_id: str
    student_name: str
    domain_id: str
    domain_name: str
    current_concept_index: int = 0
    current_probe_index: int = 0
    is_waiting_for_follow_up: bool = False
    current_question: str = ""
    is_completed: bool = False
    turns: List[AssessmentTurn] = Field(default_factory=list)
    concept_scores: Dict[str, float] = Field(default_factory=dict)
    flagged_gaps: List[Dict[str, Any]] = Field(default_factory=list)
    overall_domain_score: float = 0.0
    llm_mode: str = ""


class AssessmentSessionManager:
    """Manages live adaptive assessment sessions."""

    def __init__(self, evaluator: Optional[RubricEvaluator] = None, question_gen: Optional[QuestionGenerator] = None):
        self.sessions: Dict[str, AssessmentSessionState] = {}
        self.evaluator = evaluator or RubricEvaluator()
        self.question_gen = question_gen or QuestionGenerator()

    def create_session(self, student_name: str, domain_id: str) -> AssessmentSessionState:
        domain = registry.get_domain(domain_id)
        if not domain:
            raise ValueError(f"Domain '{domain_id}' not found in registry.")

        session_id = str(uuid.uuid4())[:8]
        first_concept = domain.concepts[0]
        initial_q = self.question_gen.get_foundational_question(
            concept=first_concept,
            domain_name=domain.domain_name,
            prerequisites=first_concept.prerequisites
        )

        state = AssessmentSessionState(
            session_id=session_id,
            student_name=student_name,
            domain_id=domain_id,
            domain_name=domain.domain_name,
            current_concept_index=0,
            current_probe_index=0,
            is_waiting_for_follow_up=False,
            current_question=initial_q,
            is_completed=False,
            turns=[],
            concept_scores={},
            flagged_gaps=[],
            overall_domain_score=0.0,
            llm_mode=llm_client.get_current_mode()
        )
        self.sessions[session_id] = state
        return state

    def get_session(self, session_id: str) -> Optional[AssessmentSessionState]:
        return self.sessions.get(session_id)

    def process_student_response(self, session_id: str, student_answer: str) -> Dict[str, Any]:
        state = self.get_session(session_id)
        if not state:
            raise ValueError(f"Session '{session_id}' not found.")
        if state.is_completed:
            return {"status": "COMPLETED", "message": "Assessment is already finished."}

        domain = registry.get_domain(state.domain_id)
        current_concept = domain.concepts[state.current_concept_index]

        # 4D Hybrid Evaluation
        evaluation = self.evaluator.evaluate_response(
            concept=current_concept,
            domain_name=domain.domain_name,
            question=state.current_question,
            student_answer=student_answer,
            is_follow_up=state.is_waiting_for_follow_up
        )

        # Record Turn
        turn = AssessmentTurn(
            concept_id=current_concept.id,
            concept_name=current_concept.name,
            question=state.current_question,
            student_answer=student_answer,
            is_follow_up=state.is_waiting_for_follow_up,
            evaluation=evaluation
        )
        state.turns.append(turn)

        # State Decision Branching
        if evaluation.action_decision == "FOLLOW_UP_PROBE":
            # Generate dynamic follow-up probing question targeting missing concepts
            state.is_waiting_for_follow_up = True
            state.current_probe_index += 1
            follow_up_q = self.question_gen.get_dynamic_follow_up(
                concept=current_concept,
                original_question=state.current_question,
                student_answer=student_answer,
                strengths=evaluation.strengths,
                weaknesses=evaluation.weaknesses,
                missing_concepts=evaluation.missing_concepts
            )
            state.current_question = follow_up_q

            return {
                "status": "FOLLOW_UP",
                "concept_id": current_concept.id,
                "concept_name": current_concept.name,
                "evaluation": evaluation.model_dump() if hasattr(evaluation, "model_dump") else evaluation.dict(),
                "next_question": follow_up_q,
                "is_completed": False
            }

        # Handle Advance or Flag Gap
        final_concept_score = evaluation.composite_score
        state.concept_scores[current_concept.id] = final_concept_score

        if evaluation.action_decision == "FLAG_GAP":
            state.flagged_gaps.append({
                "concept_id": current_concept.id,
                "concept_name": current_concept.name,
                "score": final_concept_score,
                "sub_gaps": evaluation.identified_sub_gaps,
                "root_cause": evaluation.summary_feedback
            })

        # Advance to Next Concept Node
        state.current_concept_index += 1
        state.is_waiting_for_follow_up = False
        state.current_probe_index = 0

        if state.current_concept_index < len(domain.concepts):
            next_concept = domain.concepts[state.current_concept_index]
            
            # Formulate prior history & weaknesses context for adaptive question generation
            history_summary = ", ".join([f"{c.name}: {state.concept_scores.get(c.id, 0)}%" for c in domain.concepts[:state.current_concept_index]])
            prior_weaknesses = ", ".join([g["concept_name"] for g in state.flagged_gaps]) or "None"
            
            next_q = self.question_gen.get_foundational_question(
                concept=next_concept,
                domain_name=domain.domain_name,
                prerequisites=next_concept.prerequisites,
                history_context=history_summary,
                prior_weaknesses=prior_weaknesses
            )
            state.current_question = next_q

            return {
                "status": "ADVANCED",
                "concept_id": current_concept.id,
                "concept_name": current_concept.name,
                "evaluation": evaluation.model_dump() if hasattr(evaluation, "model_dump") else evaluation.dict(),
                "next_question": next_q,
                "is_completed": False
            }
        else:
            # Assessment Complete
            state.is_completed = True
            state.current_question = ""
            
            # Compute Weighted Overall Domain Score
            total_weight = sum(c.weight for c in domain.concepts)
            weighted_sum = sum(state.concept_scores.get(c.id, 0.0) * c.weight for c in domain.concepts)
            state.overall_domain_score = round(weighted_sum / total_weight, 1) if total_weight > 0 else 0.0

            return {
                "status": "COMPLETED",
                "concept_id": current_concept.id,
                "concept_name": current_concept.name,
                "evaluation": evaluation.model_dump() if hasattr(evaluation, "model_dump") else evaluation.dict(),
                "overall_score": state.overall_domain_score,
                "is_completed": True
            }

session_manager = AssessmentSessionManager()
