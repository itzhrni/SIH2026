"""
FastAPI Request and Response Models.
"""
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class StartSessionRequest(BaseModel):
    student_name: str = Field(..., example="Harini")
    domain_id: str = Field(..., example="system_design")


class StartSessionResponse(BaseModel):
    session_id: str
    student_name: str
    domain_id: str
    domain_name: str
    first_question: str


class SubmitResponseRequest(BaseModel):
    session_id: str
    student_answer: str


class SubmitResponseResult(BaseModel):
    status: str  # 'ADVANCED', 'FOLLOW_UP', 'COMPLETED'
    concept_id: str
    concept_name: str
    evaluation: Dict[str, Any]
    next_question: Optional[str] = None
    overall_score: Optional[float] = None
    is_completed: bool


class MatchJDRequest(BaseModel):
    student_scores: Dict[str, float] = Field(
        ...,
        example={"load_balancing": 85.0, "caching": 72.0, "db_sharding": 41.0, "scalability": 78.0}
    )
    jd_title: str = Field(..., example="Senior Backend Engineer - FinTech")
    required_skills: Dict[str, float] = Field(
        ...,
        example={"db_sharding": 60.0, "caching": 70.0, "scalability": 70.0}
    )
