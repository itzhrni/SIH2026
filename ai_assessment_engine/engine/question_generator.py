"""
Hybrid Question Generator.
Generates initial questions and dynamic follow-up probes using AI LLM.
"""
from typing import List, Optional
from ai_assessment_engine.knowledge_graph.schema import ConceptNode
from ai_assessment_engine.ai.llm_client import llm_client
from ai_assessment_engine.ai.structured_outputs import LLMQuestionOutput, LLMFollowUpOutput


class QuestionGenerator:
    """Generates initial and targeted follow-up questions."""

    def __init__(self, client=None):
        self.client = client or llm_client

    def get_foundational_question(
        self,
        concept: ConceptNode,
        domain_name: str,
        prerequisites: List[str],
        history_context: str = "None",
        prior_weaknesses: str = "None"
    ) -> str:
        q_out: LLMQuestionOutput = self.client.generate_initial_question(
            concept=concept,
            domain_name=domain_name,
            prerequisites=prerequisites,
            history_context=history_context,
            prior_weaknesses=prior_weaknesses
        )
        return q_out.question

    def get_dynamic_follow_up(
        self,
        concept: ConceptNode,
        original_question: str,
        student_answer: str,
        strengths: List[str],
        weaknesses: List[str],
        missing_concepts: List[str]
    ) -> str:
        follow_up_out: LLMFollowUpOutput = self.client.generate_follow_up_question(
            concept=concept,
            original_question=original_question,
            student_answer=student_answer,
            strengths=strengths,
            weaknesses=weaknesses,
            missing_concepts=missing_concepts
        )
        return follow_up_out.follow_up_question
