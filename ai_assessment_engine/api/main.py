"""
FastAPI REST API for the SIH 2026 AI Assessment & Skill Mapping Engine.
Provides endpoints for P2 Backend, P3 Frontend, P4 Industry, and P5 Analytics.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any
from ai_assessment_engine.knowledge_graph.graph_loader import registry
from ai_assessment_engine.engine.session_manager import session_manager
from ai_assessment_engine.analytics.profiler import SkillProfiler
from ai_assessment_engine.analytics.role_matcher import RoleMatcher
from ai_assessment_engine.analytics.recommender import LearningRecommender
from ai_assessment_engine.api.schemas import (
    StartSessionRequest,
    StartSessionResponse,
    SubmitResponseRequest,
    SubmitResponseResult,
    MatchJDRequest
)

app = FastAPI(
    title="SIH 2026 — AI Assessment & Skill Mapping Engine API",
    description="Adaptive Conversational Assessment, 4D Rubric Evaluation, Skill Profiling, and Role Compatibility for Academia-Industry Portal.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "AI Assessment Engine"}


@app.get("/api/domains", tags=["Knowledge Graph"])
def list_available_domains():
    """Lists all loaded knowledge graph domains (Engineering, Ayush, etc.)."""
    return registry.list_domains()


@app.post("/api/assessment/start", response_model=StartSessionResponse, tags=["Assessment Engine"])
def start_assessment_session(req: StartSessionRequest):
    """Initializes an adaptive assessment session and returns the opening question."""
    try:
        session = session_manager.create_session(req.student_name, req.domain_id)
        return StartSessionResponse(
            session_id=session.session_id,
            student_name=session.student_name,
            domain_id=session.domain_id,
            domain_name=session.domain_name,
            first_question=session.current_question
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/assessment/respond", response_model=SubmitResponseResult, tags=["Assessment Engine"])
def submit_student_answer(req: SubmitResponseRequest):
    """Processes student answer across 4D Rubric and returns evaluation + next question or completion."""
    try:
        result = session_manager.process_student_response(req.session_id, req.student_answer)
        return SubmitResponseResult(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/assessment/report/{session_id}", tags=["Skill Profile & Analytics"])
def get_assessment_report(session_id: str):
    """Generates the full structured assessment report with the ASCII tree breakdown."""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return SkillProfiler.generate_json_report(session)


@app.post("/api/profile/match-roles", tags=["Role Compatibility"])
def match_predefined_roles(student_scores: Dict[str, float]):
    """Calculates compatibility percentage across all predefined industry job roles."""
    return RoleMatcher.match_all_predefined_roles(student_scores)


@app.post("/api/profile/match-jd", tags=["Role Compatibility"])
def match_custom_company_jd(req: MatchJDRequest):
    """Calculates compatibility score against a specific Company Job Description (JD)."""
    return RoleMatcher.match_custom_jd(req.student_scores, req.jd_title, req.required_skills)


@app.get("/api/recommendations/{session_id}", tags=["Learning Recommendations"])
def get_personalized_recommendations(session_id: str):
    """Surfaces targeted NPTEL and industry training courses for identified concept gaps."""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return LearningRecommender.get_recommendations_for_session(session.domain_id, session.concept_scores)
