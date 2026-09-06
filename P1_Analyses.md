# P1 Analysis: SIH 2026 AI Assessment & Skill Mapping Engine

## Project Overview

**SIH 2026** is a Python-based **AI Adaptive Assessment and Skill Mapping Engine** built for the Smart India Hackathon. The project implements a pedigree-free, evidence-based technical assessment system that evaluates students' domain knowledge using AI-powered semantic analysis and deterministic scoring, then maps their skill profiles to industry job roles with personalized learning recommendations.

---

## Architecture

The codebase follows a modular layered architecture with four primary layers:

### 1. Knowledge Graph Layer (`ai_assessment_engine/knowledge_graph/`)

- **`schema.py`** — Defines domain-agnostic Pydantic models: `KnowledgeGraphDomain`, `ConceptNode`, `EvaluationRubric`, and `LearningResource`. Each concept carries a 4D rubric (Correctness, Depth, Trade-off Awareness, Real-World Applicability), learning resources, prerequisites, and targeted follow-up probes.
- **`graph_loader.py`** — `KnowledgeGraphRegistry` dynamically loads JSON domain files from the `knowledge_graph/` directory at startup, enabling hot-addition of new domains without code changes.
- **`system_design.json`** — A fully populated "System Design" domain with 4 concepts (Load Balancing, Caching, DB Sharding, Scalability), each weighted (1.2–1.5) and linked with prerequisite chains.

### 2. AI / LLM Client Layer (`ai_assessment_engine/ai/`)

- **`llm_client.py`** — Centralized `LLMClient` supporting three modes:
  - **GEMINI** (primary) — Google GenAI with dynamic model discovery via `models.list()`, exponential backoff retries, and live model fallback.
  - **OPENAI** (secondary) — OpenAI Chat Completions API.
  - **MOCK** (offline fallback) — Deterministic semantic evaluator that scores answers by token overlap with rubric criteria and keyword signal detection (e.g., "latency", "tradeoff", "circuit breaker"). No API key or internet required.
- **`prompts.py`** — System prompts and templated evaluation/question generation prompts enforcing strict JSON schema output.
- **`structured_outputs.py`** — Pydantic schemas for LLM outputs: `LLMEvaluationOutput` (4D scores + strengths/weaknesses/missing concepts), `LLMQuestionOutput`, `LLMFollowUpOutput`.

### 3. Engine Layer (`ai_assessment_engine/engine/`)

- **`question_generator.py`** — `QuestionGenerator` class wraps LLM calls for initial foundational questions and dynamic follow-up probes targeting detected knowledge gaps.
- **`evaluator.py`** — `RubricEvaluator` performs hybrid evaluation: LLM provides qualitative 4D scores and gap diagnostics; Python deterministically computes the weighted composite score using the formula **`0.35×C + 0.25×D + 0.20×T + 0.20×R`** and applies a state decision tree:
  - Score ≥ 70 → **ADVANCE** to next concept
  - 45 ≤ Score < 70 → **FOLLOW_UP_PROBE** (generate targeted probe)
  - Score < 45 → **FLAG_GAP** (record critical knowledge gap)
- **`session_manager.py`** — `AssessmentSessionManager` implements the core state machine. It tracks assessment turns, maintains `concept_scores` and `flagged_gaps`, and computes weighted overall domain scores upon completion.

### 4. Analytics Layer (`ai_assessment_engine/analytics/`)

- **`profiler.py`** — `SkillProfiler` generates ASCII tree reports (matching the specified format with `← GAP` markers) and JSON reports with concept breakdowns, gap identification, and status labels (STRONG / NEEDS IMPROVEMENT / CRITICAL GAP).
- **`role_matcher.py`** — `RoleMatcher` compares student scores against a predefined job role taxonomy (Backend SWE, DevOps Engineer, Ayush QC Specialist) using weighted compatibility scoring. Also supports custom JD matching via `match_custom_jd()`.
- **`recommender.py`** — `LearningRecommender` surfaces gap-driven course recommendations (NPTEL, industry modules) for concepts scoring below 65%, classified as HIGH or MEDIUM severity.

### 5. API Layer (`ai_assessment_engine/api/`)

- **`main.py`** — FastAPI application exposing REST endpoints for all downstream consumers (P2 Backend, P3 Frontend, P4 Industry, P5 Analytics):
  - `GET /api/domains` — List available knowledge graph domains
  - `POST /api/assessment/start` — Start an adaptive session, receive first question
  - `POST /api/assessment/respond` — Submit answer, receive evaluation + next question or completion
  - `GET /api/assessment/report/{session_id}` — Generate structured skill profile
  - `POST /api/profile/match-roles` — Match against predefined roles
  - `POST /api/profile/match-jd` — Match against custom company JD
  - `GET /api/recommendations/{session_id}` — Get personalized learning paths
- **`schemas.py`** — Pydantic request/response models for API contracts.

### 6. Demo & Testing (`ai_assessment_engine/tests/`, `run_demo.py`)

- **`run_demo.py`** — Interactive CLI demo simulating a full assessment session for a sample student ("Harini") across 4 concepts, demonstrating AI question generation, 4D evaluation, composite scoring, adaptive follow-up probing, final skill profile, role matching, and recommendations.
- **`test_assessment_flow.py`** — Pytest suite with 4 tests:
  - `test_answer_differentiation_on_same_question` — Proves strong vs. weak answers to the same question produce distinct scores, decisions, and gap diagnostics.
  - `test_complete_harini_assessment_flow` — End-to-end multi-node session test with follow-up probing and gap detection.
  - `test_gemini_dynamic_model_discovery_and_candidates` — Verifies model filtering (excludes TTS/audio/embedding models, uses only `models.list()` results).
  - `test_live_gemini_integration_when_configured` — Live API test gated behind `GEMINI_API_KEY`.
- **`verify_live_ai.py`** — Standalone live AI verification script for hackathon demonstration, comparing strong vs. weak student answers with detailed output.

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **Hybrid AI + Deterministic Scoring** | LLM provides qualitative, semantic understanding; Python enforces reproducible, auditable composite scores and state transitions. |
| **Mock Backend as Default** | Enables offline development, deterministic testing, and hackathon demo reliability without API key dependency. |
| **Dynamic Gemini Model Discovery** | Eliminates hardcoded model lists; filters out non-text models (TTS, audio, embedding) via `models.list()` API. |
| **JSON-based Knowledge Graphs** | Domain-agnostic design allowing new domains (Engineering, Ayush, Healthcare) to be added via JSON without code changes. |
| **Weighted Composite Formulas** | Both concept-level scoring (0.35C + 0.25D + 0.20T + 0.20R) and domain-level scoring use weighted averages for nuanced evaluation. |
| **State Machine Assessment Flow** | `ADVANCE / FOLLOW_UP_PROBE / FLAG_GAP` decisions enable adaptive, personalized assessment paths rather than linear Q&A. |

---

## Technology Stack

- **Language**: Python 3.x
- **Framework**: FastAPI (REST API)
- **LLM Providers**: Google Gemini (default), OpenAI (optional), Mock (offline)
- **Data Validation**: Pydantic
- **Testing**: Pytest
- **Knowledge Storage**: JSON files (loaded at runtime)

---

## Current Status

- **Core engine**: Complete and tested with mock backend
- **Live AI integration**: Configured via `GEMINI_API_KEY` / `OPENAI_API_KEY` environment variables
- **Domains**: 1 populated domain ("System Design" — Engineering & IT)
- **Roles**: 3 predefined roles (Backend SWE, DevOps, Ayush QC Specialist)
- **API**: 8 REST endpoints ready for P2/P3/P4 integration
- **Testing**: 4 passing tests covering differentiation, full flow, model discovery, and live AI verification
- **Frontend/Backend**: Placeholder directories (`.gitkeep` only)

---

## Run Instructions

```bash
# Run offline demo (no API key needed)
cd ai_assessment_engine && python run_demo.py

# Run live AI demo
GEMINI_API_KEY=<your_key> python ai_assessment_engine/tests/verify_live_ai.py

# Run tests
pytest ai_assessment_engine/tests/test_assessment_flow.py

# Start API server
uvicorn ai_assessment_engine.api.main:app --reload
```
