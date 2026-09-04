"""
Knowledge Graph Schema for Domain-Agnostic Adaptive Assessment.
Supports Engineering, Ayush, Healthcare, Management, etc.
"""
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class EvaluationRubric(BaseModel):
    """4-Dimensional Rubric for evaluating concept understanding."""
    correctness_criteria: str = Field(..., description="Core factual accuracy requirements")
    depth_criteria: str = Field(..., description="Underlying mechanics and theoretical depth")
    tradeoff_criteria: str = Field(..., description="Awareness of alternatives, bottlenecks, and trade-offs")
    applicability_criteria: str = Field(..., description="Application to real-world scenario/edge cases")
    sub_gaps_taxonomy: List[str] = Field(default_factory=list, description="Common misconception/sub-gap categories")


class LearningResource(BaseModel):
    title: str
    provider: str  # e.g., 'NPTEL', 'Official Docs', 'Company Program'
    url: str
    duration_hours: Optional[int] = 10
    level: str = "Intermediate"


class ConceptNode(BaseModel):
    id: str
    name: str
    description: str
    weight: float = Field(default=1.0, ge=0.1, le=5.0, description="Importance weight in domain (1.0 to 5.0)")
    prerequisites: List[str] = Field(default_factory=list, description="Node IDs that should ideally be tested first")
    rubric: EvaluationRubric
    foundational_question: str
    targeted_probes: List[str] = Field(default_factory=list, description="Probing follow-up questions for partial answers")
    learning_resources: List[LearningResource] = Field(default_factory=list)


class KnowledgeGraphDomain(BaseModel):
    domain_id: str
    domain_name: str
    sector: str  # 'Engineering & IT', 'Ayush & Healthcare', 'Management', etc.
    description: str
    concepts: List[ConceptNode]

    def get_concept(self, concept_id: str) -> Optional[ConceptNode]:
        for c in self.concepts:
            if c.id == concept_id:
                return c
        return None
