"""
Hybrid 4-Dimensional Rubric Evaluator.
Combines:
- AI LLM evaluation for qualitative dimensions & missing concept extraction
- Strict deterministic Python calculation for weighted composite score & state decisions.
"""
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from ai_assessment_engine.knowledge_graph.schema import ConceptNode
from ai_assessment_engine.ai.llm_client import llm_client
from ai_assessment_engine.ai.structured_outputs import LLMEvaluationOutput


class DimensionScore(BaseModel):
    score: float = Field(..., ge=0, le=100)
    feedback: str


class EvaluationResult(BaseModel):
    concept_id: str
    concept_name: str
    correctness: DimensionScore
    depth: DimensionScore
    tradeoff_awareness: DimensionScore
    real_world_applicability: DimensionScore
    composite_score: float = Field(..., ge=0, le=100)
    is_gap: bool = False
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    missing_concepts: List[str] = Field(default_factory=list)
    identified_sub_gaps: List[str] = Field(default_factory=list)
    action_decision: str = Field(..., description="'ADVANCE', 'FOLLOW_UP_PROBE', or 'FLAG_GAP'")
    summary_feedback: str


class RubricEvaluator:
    """Evaluates student answers against the 4D Rubric using Hybrid AI + Deterministic Logic."""

    def __init__(self, client=None):
        self.client = client or llm_client

    @staticmethod
    def calculate_composite_score(c: float, d: float, t: float, r: float) -> float:
        """
        Deterministic Weighted Composition:
        - Correctness: 35%
        - Depth: 25%
        - Trade-offs: 20%
        - Real-World Applicability: 20%
        """
        composite = (c * 0.35) + (d * 0.25) + (t * 0.20) + (r * 0.20)
        return round(composite, 1)

    def evaluate_response(
        self,
        concept: ConceptNode,
        domain_name: str,
        question: str,
        student_answer: str,
        is_follow_up: bool = False
    ) -> EvaluationResult:
        # 1. Invoke LLM Service Layer for Structured Diagnostic Evaluation
        llm_out: LLMEvaluationOutput = self.client.evaluate_answer(
            concept=concept,
            domain_name=domain_name,
            question=question,
            student_answer=student_answer
        )

        c_score = llm_out.correctness
        d_score = llm_out.depth
        t_score = llm_out.tradeoff_awareness
        r_score = llm_out.real_world_applicability

        # 2. Strict Deterministic Composite Score Calculation
        composite = self.calculate_composite_score(c_score, d_score, t_score, r_score)

        # 3. Deterministic State Decision Tree:
        # - Score >= 70.0: ADVANCE
        # - 45.0 <= Score < 70.0 (on initial): FOLLOW_UP_PROBE
        # - Score < 45.0 or failed follow-up: FLAG_GAP
        identified_sub_gaps = []
        if composite >= 70.0:
            decision = "ADVANCE"
            is_gap = False
            summary = f"Strong mastery of {concept.name} ({composite}%). Advanced to next concept."
        elif 45.0 <= composite < 70.0 and not is_follow_up:
            decision = "FOLLOW_UP_PROBE"
            is_gap = False
            summary = f"Partial depth on {concept.name} ({composite}%). Follow-up probe generated for missing concepts."
        else:
            decision = "FLAG_GAP"
            is_gap = True
            summary = f"Identified critical knowledge gap on {concept.name} ({composite}%)."
            if concept.rubric.sub_gaps_taxonomy:
                identified_sub_gaps.append(concept.rubric.sub_gaps_taxonomy[0])
            if llm_out.missing_concepts:
                identified_sub_gaps.extend(llm_out.missing_concepts[:2])

        return EvaluationResult(
            concept_id=concept.id,
            concept_name=concept.name,
            correctness=DimensionScore(score=c_score, feedback="; ".join(llm_out.strengths[:2]) if llm_out.strengths else "Basic definition"),
            depth=DimensionScore(score=d_score, feedback="; ".join(llm_out.weaknesses[:2]) if llm_out.weaknesses else "Mechanics understood"),
            tradeoff_awareness=DimensionScore(score=t_score, feedback="Trade-off reasoning evaluated"),
            real_world_applicability=DimensionScore(score=r_score, feedback="Production applicability evaluated"),
            composite_score=composite,
            is_gap=is_gap,
            strengths=llm_out.strengths,
            weaknesses=llm_out.weaknesses,
            missing_concepts=llm_out.missing_concepts,
            identified_sub_gaps=identified_sub_gaps,
            action_decision=decision,
            summary_feedback=summary + f" Reason: {llm_out.reasoning}"
        )
