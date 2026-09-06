# Work Split — SIH Internal Round Prototype

## PS 26044 · 6-Member Team · Based on MVP_Cut.md

> All ownership is based strictly on the MVP Cut. The Solution Document V2 remains the specification reference for every assigned feature.

---

## Team Overview

| Member | Year     | Track      | Primary Ownership                                                         |
| ------ | -------- | ---------- | ------------------------------------------------------------------------- |
| M1     | 3rd Year | ML / AI    | Adaptive AI Assessment Engine + Skill Profile + Gap Report                |
| M2     | 3rd Year | ML / Data  | Career Guidance Engine + Skill Demand Intelligence + Opportunity Matching |
| M3     | 2nd Year | Full Stack | Repo Setup + Coding Agent `.md` files + Internship Management Module      |
| M4     | 2nd Year | Full Stack | Student Portal (Assessment UI + Portfolio + Learning Recommendations)     |
| M5     | 2nd Year | Full Stack | Industry Portal (Posting + Candidate Discovery + Placement Pipeline)      |
| M6     | 2nd Year | Full Stack | Auth + Institutional Admin Dashboard + Academician Portal                 |

---

## M1 — 3rd Year · AI/ML

### Adaptive AI Assessment Engine + Skill Profile System

**Assigned MVP Scope:**

- `2.1` Knowledge Graph schema design and pre-built graph loader (IT: DSA, System Design, ML, Core CS · AYUSH: Ayurvedic Pharmacology, Clinical Practice)
- `2.3` Adaptive AI Assessment Engine — full implementation:
  - Session initialisation from loaded knowledge graph
  - Opening question generation targeting foundational concept node
  - LLM response evaluation on all four rubric dimensions (Correctness, Depth, Trade-off Awareness, Real-World Applicability)
  - Engine decision logic: advance / follow-up / mark-gap-and-move-forward
  - Session termination on graph coverage
  - Structured assessment report generation
- `2.5` Skill Profile update logic post-session: domain proficiency score computation, weighted by node importance
- `2.5` Gap Report generation: classify each tested concept node as Strong / Partial / Weak
- `2.5` Longitudinal skill score storage: persist and update profile across multiple sessions (time-series of scores per domain)
- Living Skill Development Graph data — produce the per-domain score timeline data consumed by M4's portfolio UI

**Key Responsibilities:**

- Own the LLM prompting strategy end-to-end: system prompt, rubric injection, structured JSON output schema
- Define the confidence threshold values for advance/follow-up/skip decisions
- Produce the knowledge graph JSON config files for all 6 pre-built domains
- Expose REST API endpoints consumed by M4 (start session, submit response, get next question, get report, get profile)
- Ensure assessment sessions produce deterministic, non-trivially-gameable questions — validate with test runs

**Interfaces with:**

- **M2** — produces the skill profile data structure that M2 consumes for matching and career guidance; must agree on schema on Day 1
- **M3** — knowledge graph JSON config format must be documented in M3's spec files
- **M4** — exposes API endpoints for assessment session flow and profile/gap report retrieval

**Deliverables:**

- Working assessment session runnable via API with a real LLM call
- Gap report JSON output per completed session
- Persistent skill profile per student updated after each session
- Longitudinal score timeline data accessible via API
- 6 pre-built domain knowledge graph config files (JSON)

---

## M2 — 3rd Year · ML / Data Analytics

### Career Guidance Engine + Skill Demand Intelligence + Opportunity Matching

**Assigned MVP Scope:**

- `3.1` Career Guidance and Skill Mapping:
  - Pre-defined role taxonomy (6–8 roles) with structured skill requirement profiles
  - Role compatibility % computation: student profile vs. role requirements (weighted match)
  - Output: ranked role list with per-role gap breakdown and recommended study path
- `4.2` / `5.2` Opportunity Matching Engine:
  - Student profile vs. opportunity skill requirements → % match score per opportunity
  - Matched opportunities feed: ranked, showing met skills and gap skills
  - Longitudinal signal for candidate discovery: surface students with consistent performance across sessions (for industry candidate discovery, `5.2`)
- `7.1` Skill Demand Intelligence — platform-internal data pipeline:
  - NLP-based skill extraction from job/internship posting JD text
  - Map extracted skills to platform taxonomy
  - Aggregate demand counts per skill across all postings
- `7.2` Demand vs. Supply Gap Analysis:
  - Demand % and Supply % computation per skill
  - Gap score = Demand % − Supply %
  - Severity classification: 🔴 HIGH / 🟡 MEDIUM / 🟢 LOW
- Produce structured data for the demand–supply bar chart rendered in M6's Institutional Admin Dashboard

**Key Responsibilities:**

- Define the role taxonomy JSON (role name, required skills, proficiency thresholds, weights) — share with M3 for documentation
- Own the match scoring formula and validate it produces meaningful rankings with seed data
- Own the NLP skill extraction pipeline for JD text (can be LLM-based extraction or regex/keyword matching — choose based on time)
- Produce the demand vs. supply aggregated dataset consumed by M6's dashboard
- Seed the system with realistic mock data (3–4 companies posting 5–8 opportunities) to ensure match scoring is demonstrable

**Interfaces with:**

- **M1** — consumes skill profile data (must agree on schema Day 1)
- **M5** — opportunity postings data (JD text and required skills) feeds M2's demand pipeline and matching engine; coordinate on posting data schema
- **M6** — provides gap severity data for Institutional Admin Dashboard charts

**Deliverables:**

- Career guidance output: ranked role compatibility list per student, accessible via API
- Opportunity feed: ranked internship/job list per student with match % and skill breakdown
- Candidate discovery: ranked student list for a given skill query
- Demand vs. supply gap dataset per skill (consumed by dashboard)
- Role taxonomy and skill requirement profile JSON files

---

## M3 — 2nd Year · Full Stack

### Repo Setup + Coding Agent Spec Files + Internship Management Module

**Assigned MVP Scope:**

- **Repository and project setup** — complete ownership:
  - Initialise monorepo structure (frontend / backend / ML services / config)
  - Set up shared environment configuration, `.env` templates, and dependency management
  - Configure linting, formatting, and basic CI (optional but recommended)
  - Define and document folder conventions, API response formats, and naming standards
- **Coding Agent `.md` specification files** — create and maintain:
  - `PROJECT_OVERVIEW.md` — repo structure, tech stack, module ownership map
  - `API_SPEC.md` — all REST endpoint contracts (request/response schema) for every module, maintained as the single source of truth for cross-member API contracts
  - `DB_SCHEMA.md` — full database schema with table definitions, relationships, and field types
  - `SETUP.md` — local dev environment setup instructions end-to-end
  - `CONVENTIONS.md` — code style, file naming, API response format, error handling patterns
  - Update these files throughout the build as contracts evolve
- `4.1` Industry Internship Posting — backend + frontend:
  - Internship posting form (role title, description, duration, location, required skills from taxonomy, proficiency threshold, eligibility, deadline)
  - Posting stored and retrievable
- `4.3` Application Tracking — backend + frontend:
  - Pipeline: `Applied → Under Review → Shortlisted → Interview Scheduled → Selected / Not Selected`
  - Industry moves candidates through stages; student sees live status
- `4.4` Internship Progress Tracker (Minimal):
  - Tracker activated on internship confirmation
  - Student submits weekly progress log
  - Mentor submits end-of-internship feedback form
  - Completion record created and sent to M4 for portfolio update

**Key Responsibilities:**

- Unblock every other team member on Day 1 by delivering the repo, folder structure, env setup, and initial DB schema before others write any code
- Maintain `API_SPEC.md` as the live contract document — every time an endpoint changes, this must be updated same day
- Own the internship management feature end-to-end including both recruiter-side (M5 dependency) and student-side (M4 dependency) interactions
- Coordinate with all members to collect their endpoint contracts and add to `API_SPEC.md`

**Interfaces with:**

- **All members** — repo setup and spec files are shared dependencies; must be delivered first
- **M4** — student-facing application tracking status and internship completion records feed portfolio
- **M5** — internship posting data is consumed by M2's matching engine and M5's recruiter pipeline

**Deliverables:**

- Fully initialised repository with documented structure
- Complete set of Coding Agent `.md` files (updated throughout)
- Working internship posting, application pipeline, and internship tracker (minimal) with both industry and student views

---

## M4 — 2nd Year · Full Stack

### Student Portal — Assessment UI + Portfolio + Learning Recommendations

**Assigned MVP Scope:**

- Assessment session UI:
  - Domain selection screen
  - Conversational assessment interface — renders one question at a time, collects text response, submits to M1's API, renders next question or follow-up
  - Assessment completion screen with gap report display (Strong / Partial / Weak per concept node)
- Student Portfolio page (`3.3`):
  - Verified skill badges section
  - Knowledge depth profile: topic-wise proficiency scores with concept-level breakdown
  - Living Skill Development Graph: line chart of domain scores across sessions over time (data from M1)
  - Uploaded documents section: resume and certificate upload, self-reported label
  - Project entries: title, description, GitHub link, associated skills
  - Internship records: populated from M3's completion records
  - Shareable portfolio link (public URL or token-based)
- Learning Recommendations UI (`3.2`):
  - Display gap report alongside 2–3 static learning resources per flagged concept node
  - Recommendations shown within the student's profile/gap report view
- Student Opportunity Feed (`4.2`):
  - Ranked internship and job listing cards (data from M2)
  - Each card: role, company, % match, met skills, gap skills
  - Apply button → triggers application creation
- Student application tracker (`4.3`):
  - List of all applications with live status (consumed from M3's pipeline)

**Key Responsibilities:**

- Own all student-facing UI end-to-end
- The assessment session UI is the most critical UI in the entire prototype — it is the demo centrepiece. Prioritise its quality and responsiveness above all other UI work
- Coordinate with M1 on API contract for session flow before building UI
- Coordinate with M2 on opportunity feed data format before building feed UI
- Coordinate with M3 on application status data and internship record format

**Interfaces with:**

- **M1** — assessment session API, gap report data, longitudinal score data
- **M2** — opportunity feed data (ranked opportunities with match scores)
- **M3** — application status pipeline, internship completion records
- **M6** — auth session / protected routes

**Deliverables:**

- Functional assessment session UI with live LLM-backed questions
- Gap report display post-assessment
- Student portfolio page with all MVP sections populated from real data
- Learning recommendations display
- Opportunities feed with apply action
- Application status tracker

---

## M5 — 2nd Year · Full Stack

### Industry Portal — Job/Internship Posting + Candidate Discovery + Placement Pipeline

**Assigned MVP Scope:**

- Industry onboarding and dashboard
- Job posting form (`5.1`): same structure as internship (required skills from taxonomy, thresholds, eligibility, deadline)
- Candidate Discovery UI (`5.2`):
  - Skill requirement input → submit to M2's matching API
  - Render ranked candidate list with % match
  - Candidate profile preview (link to student portfolio)
  - Longitudinal signal display: highlight candidates with consistent performance across sessions
- Placement pipeline management (`5.3`):
  - Recruiter view of all applicants per posting
  - Move candidates through: `Applied → Reviewed → Shortlisted → Interview Scheduled → Offer Extended → Joined`
  - Notes per candidate
- Industry Learning Program listing form (`Module 4`):
  - Form: title, format, skills addressed (from taxonomy), duration, enrollment link
  - Listing stored and surfaced to students

**Key Responsibilities:**

- Own all industry-facing UI end-to-end
- Coordinate with M2 on candidate discovery API contract and the data format for the longitudinal signal display
- Coordinate with M3 on internship posting data (M5's job posting form shares schema with M3's internship posting — reuse the component)
- Ensure the candidate discovery + longitudinal signal UI is demo-ready — this is a key judge-facing novelty touchpoint

**Interfaces with:**

- **M2** — candidate discovery and match scoring API; posting JD text fed to demand pipeline
- **M3** — internship posting schema (shared); application pipeline status updates
- **M6** — auth session / protected routes

**Deliverables:**

- Industry dashboard with posting management
- Job posting form (working, stores to DB)
- Candidate discovery UI with match ranking and longitudinal performance display
- Placement pipeline management UI
- Industry learning program listing form

---

## M6 — 2nd Year · Full Stack

### Auth System + Institutional Admin Dashboard + Academician Portal

**Assigned MVP Scope:**

- Auth system — full ownership:
  - Signup / login for all 4 in-scope roles (Student, Industry, Academician, Institutional Admin)
  - JWT-based session management
  - Role-based route protection (middleware)
  - Role-specific dashboard redirect on login
- Institutional Admin Dashboard (`Module 9`):
  - Cohort View: aggregated skill readiness by department/year (data from M1 profiles via API)
  - Placement Progress: applications submitted, shortlists, offers extended — real-time (data from M3 and M5 pipelines)
  - Skill Demand vs. Supply Chart: bar chart of gap severity per skill (data from M2's demand pipeline)
- Academician Portal (`4.5`):
  - Academician onboarding: name, department, areas of expertise (free text)
  - Browse FDPs, faculty internships, consultancy, and research collaboration postings (posted by industry via M5's portal)
  - Apply to a posting using academic credentials profile
  - Application status tracking (same pipeline as student, different role)

**Key Responsibilities:**

- Auth must be the first feature completed — all other members' protected routes depend on it. Deliver auth middleware before Day 2
- Institutional Admin Dashboard is the primary analytics touchpoint for judges — the demand vs. supply gap chart and cohort skill chart must be visually clear and populated with seeded data
- Coordinate with M2 for demand gap data and cohort skill aggregation data
- Coordinate with M3 for placement progress data
- Coordinate with M5 for academician posting source data (industry posts FDPs/faculty internships through industry portal)

**Interfaces with:**

- **All members** — auth middleware is a shared dependency; deliver early
- **M2** — demand vs. supply gap dataset and cohort skill readiness data for dashboard charts
- **M3** — placement progress data for dashboard
- **M5** — academician-facing opportunity postings originate from industry portal

**Deliverables:**

- Fully working auth system for all 4 roles with protected routes
- Institutional Admin Dashboard with: cohort skill chart, placement progress stats, demand vs. supply gap chart
- Academician portal: browse, apply, track applications

---

## Dependency and Sequencing Map

```
Day 1 — Unblock Everything
  M3: Repo setup + DB schema + API_SPEC.md skeleton → shared with all
  M6: Auth system (signup/login/JWT/middleware) → all others need this
  M1 + M2: Agree on Skill Profile data schema → shared contract

Day 2–3 — Core Engines
  M1: Assessment engine API (session start, evaluate, next question, report)
  M2: Role taxonomy + match scoring + demand pipeline (internal data)
  M3: Internship posting + application pipeline backend

Day 3–4 — UI + Integration
  M4: Assessment session UI (connects to M1 API)
  M4: Student portfolio + opportunities feed (connects to M1, M2, M3)
  M5: Industry posting + candidate discovery UI (connects to M2, M3)
  M6: Institutional dashboard (connects to M2 demand data, M3 placement data)

Day 5–6 — Close Loops
  M3: Internship tracker + mentor feedback
  M4: Application tracker, learning recommendations
  M5: Placement pipeline management, longitudinal signal display
  M6: Academician portal

Day 7 — Seed Data + Demo Prep
  All: Populate with demo data (3 students, 2 companies, 1 academician, 1 admin)
  M1: Run assessment sessions for all 3 demo students to populate profiles
  M2: Verify match scoring and demand chart with seeded data
  M4: Validate portfolio page with real assessment data
  Demo walkthrough: end-to-end role-switching demo flow
```

---

## Workload Balance Summary

| Member | Track      | Complexity Drivers                                                                                           |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------------ |
| M1     | ML/AI      | LLM integration, rubric design, graph schema, session state management — highest AI complexity               |
| M2     | ML/Data    | Matching algorithm, NLP extraction, career guidance scoring, demand analytics — high data complexity         |
| M3     | Full Stack | Repo setup + all spec files + internship module — high coordination overhead, moderate feature complexity    |
| M4     | Full Stack | Most UI surfaces (assessment, portfolio, feed, tracker) — highest frontend volume                            |
| M5     | Full Stack | Industry portal end-to-end + candidate discovery UI — moderate-high, two major flows                         |
| M6     | Full Stack | Auth (critical dependency) + dashboard (data integration) + academician portal — moderate, high coordination |
