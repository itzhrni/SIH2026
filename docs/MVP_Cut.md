# MVP Cut — SIH Internal Round Prototype

## PS 26044 · Portal for Academia–Industry Collaboration

> **Source of Truth:** `Solution_Document_V2.md` remains authoritative for all functionality. This document defines the subset to be built for the SIH Internal Round prototype. Everything not listed here is deferred — not dropped — and retains its full specification in the Solution Document.

---

## Roles in Scope

| Role                | MVP Status                                                    |
| ------------------- | ------------------------------------------------------------- |
| Student             | ✅ In MVP                                                     |
| Industry Partner    | ✅ In MVP                                                     |
| Academician         | ✅ In MVP — limited to opportunity browsing and application   |
| Institutional Admin | ✅ In MVP — dashboard with real assessment and placement data |
| Policymaker         | ❌ Deferred — Module 10 entirely out of MVP                   |

---

## Core Technical Foundation — In MVP

### 2.1 Domain-Agnostic Knowledge Graph

**In MVP:** Pre-built static knowledge graphs for the following domains:

- **Engineering/IT (pick 3–4 for prototype):** Data Structures and Algorithms · System Design · Machine Learning · Core CS Subjects
- **AYUSH (pick 2):** Ayurvedic Pharmacology · Clinical Practice

Each graph node must include: topic node, concept nodes, dependency edges, and evaluation rubric per concept.

**Deferred:** Configuration UI for domain experts to build graphs through the platform. For MVP, graphs are pre-loaded via JSON config files.

---

### 2.2 AYUSH-Specific Domain Taxonomy

**In MVP:** Two AYUSH sub-domains configured as knowledge graph nodes — Ayurvedic Pharmacology and Clinical Practice — with topic nodes, concept nodes, and rubrics. Remaining AYUSH sub-domains (Yoga, Unani, Siddha, Homoeopathy) are deferred.

---

### 2.3 Adaptive AI Assessment Engine

**In MVP — Full feature, non-negotiable (flagship novelty):**

- Student selects domain → session initialised from knowledge graph
- Opening question generated targeting a foundational concept node
- Response evaluated on all four rubric dimensions: Correctness, Depth, Trade-off Awareness, Real-World Applicability
- Engine decision logic: advance / follow-up / mark-gap-and-move-forward based on score vs. confidence threshold
- Session runs to sufficient graph coverage
- Structured assessment report generated at session end

**Implementation constraint:** LLM call must be live (not mocked) for the demo. This is the demo centrepiece.

---

### 2.4 Soft Skill Assessment (SJT)

**Deferred.** Out of MVP. Soft skill scores will not appear in the prototype profile. The assessment engine and profile focus on technical skills only for the Internal Round.

---

### 2.5 Skill Profile and Gap Report

**In MVP — Full feature:**

- Post-session: domain proficiency score computed and stored
- Gap report generated: concept nodes classified as Strong / Partial / Weak
- Profile persists and updates across sessions (longitudinal record starts from first session)
- Living Skill Development Graph (timeline of scores across sessions) — **in MVP** as this is core to the SkillLedger novelty

---

## Module 1 — Skill Development

### Feature 3.1 — Career Guidance and Skill Mapping

**In MVP — Simplified:**

- Pre-defined role taxonomy with 6–8 roles (e.g. Backend Engineer, Data Scientist, ML Engineer, Ayurvedic Practitioner, Healthcare Administrator)
- Each role has a defined skill requirement profile against the domain taxonomy
- Role compatibility % computed from student's assessed skill profile vs. role requirements
- Output: ranked role matches with per-role gap breakdown

**Deferred:** JD-specific match score overlay (opportunity-specific compatibility from individual job postings). JD matching is handled separately in Modules 2 and 3.

**Deferred:** Student interest collection during onboarding used for filtering role suggestions. Interests can be a simple onboarding field; the filtering logic is deferred.

---

### Feature 3.2 — Personalized Learning Recommendations

**In MVP — Static resource mapping only:**

- For each concept node flagged as a gap: surface 2–3 pre-mapped learning resources (NPTEL / documentation links hardcoded per node)
- Displayed in the student's gap report and profile

**Deferred:** Company-published learning program recommendations surfaced in student gap reports (requires Module 4 data to be populated). This link is deferred; company learning programs are visible separately in Module 4.

---

### Feature 3.3 — Student Digital Portfolio

**In MVP — Full feature:**

- Verified Skill Badges: issued by platform upon clearing benchmark in a domain assessment
- Knowledge Depth Profile: topic-wise proficiency scores with concept-level granularity
- Living Skill Development Graph: timeline of scores across sessions
- Uploaded Documents: Resume, certificates (self-reported, clearly labelled)
- Project Entries: self-reported with GitHub link and associated skills
- Internship Records: added on internship completion (populated by Module 2 tracker)

**Deferred:** Soft Skill Score section (no SJT in MVP). External certificate verification via API.

---

## Module 2 — Internship Management

### Feature 4.1 — Industry Internship Posting

**In MVP — Full feature:**

- Industry posts internship with: role title, description, duration, location, required skills (mapped to domain taxonomy), minimum proficiency threshold per skill, eligibility criteria, application deadline

---

### Feature 4.2 — Student Opportunity Discovery and Application

**In MVP — Full feature:**

- Personalised opportunities feed showing internships ranked by % skill match
- Opportunity card shows: match %, skills met, skills below threshold
- Student applies using live portfolio as application document

---

### Feature 4.3 — Application Tracking

**In MVP — Full feature:**

- Pipeline: `Applied → Under Review → Shortlisted → Interview Scheduled → Selected / Not Selected`
- Industry moves candidates through stages
- Student sees live status

---

### Feature 4.4 — Internship Progress Tracking and Mentor Feedback

**In MVP — Minimal:**

- Internship tracker activated on confirmation: start/end date, company
- Student submits weekly progress logs
- Mentor submits end-of-internship feedback (single structured form — mid-point feedback deferred)
- Completion record automatically added to student portfolio

**Deferred:** Mid-point structured mentor feedback. Milestone completion records.

---

### Feature 4.5 — Academician Internship and FDP Portal

**In MVP — Browsing and application only:**

- Academician dashboard shows industry-posted FDPs, faculty internships, consultancy opportunities, collaborative research projects
- Academician applies using academic credential profile
- Application tracked with same status pipeline as students

**Deferred:** Dedicated academician onboarding with structured expertise profile for matching. For MVP, academicians fill a basic profile (name, department, areas of expertise as free text).

---

## Module 3 — Placement Management

### Feature 5.1 — Industry Job Posting

**In MVP — Full feature:**

- Same structured format as internship posting: required skills mapped to taxonomy, proficiency thresholds, eligibility, deadline

---

### Feature 5.2 — Skill-Based Candidate Discovery

**In MVP — Basic version:**

- Industry enters skill requirements → platform returns ranked list of students by % match
- Longitudinal signal surfacing (candidates with consistent performance across sessions) — **in MVP**, as this is part of the SkillLedger novelty and directly demoed to judges

**Deferred:** Private domain flagging by companies (concept-node-level private signals). Deferred to post-MVP.

---

### Feature 5.3 — Candidate Shortlisting and Application Management

**In MVP — Full feature:**

- Pipeline: `Applied → Reviewed → Shortlisted → Interview Scheduled → Offer Extended → Joined`
- Company moves candidates, adds notes

---

### Feature 5.4 — AI Interview Co-Pilot

**Deferred.** Out of MVP. Included in stretch features only if Modules 1–3 are stable.

---

## Module 4 — Industry Learning Programs

**In MVP — Listing only:**

- Industry partner creates a learning program listing (title, format, skills addressed mapped to taxonomy, duration, enrollment link)
- Listed under a dedicated "Learning Programs" section on the platform
- Surfaced in student learning recommendations where skills addressed match a gap — **only if** static resource mapping (Feature 3.2) is done and there is time to link the two

**Deferred:** Third-party API enrollment tracking. Certificate verification. Company-managed cohort management.

---

## Module 5 — Skill Demand Intelligence

### Feature 7.1 — Data Pipeline

**In MVP — Simplified, platform-internal data only:**

- Skill demand is computed from job/internship postings entered by industry partners on the platform (not from external job portals)
- NLP-based skill extraction from JD text mapped to taxonomy — **in MVP**, using the platform's own postings as input
- No external data sources in MVP

**Deferred:** 50,000+ job posting scale, external job portal integration, entity linking to external ontologies.

---

### Feature 7.2 — Demand vs. Supply Gap Analysis

**In MVP — Full feature:**

- Gap = Demand % − Supply % per skill in taxonomy
- Gap severity classification: 🔴 HIGH / 🟡 MEDIUM / 🟢 LOW
- Displayed in Institutional Admin Dashboard (Module 9)

---

### Feature 7.3 — Time Series Analysis

**Deferred.** Trend signals (Trending Up / Down / Stable) require multiple time periods of data. Not meaningful for a prototype with limited seed data. Deferred.

---

### Feature 7.4 — Visual Demand–Supply Dashboard

**In MVP:** Side-by-side bar chart of demand vs. supply per skill — displayed in the Institutional Admin Dashboard.

---

## Module 6 — Regional and Sectoral Analytics

**Deferred entirely.** Requires data at a scale the prototype cannot provide. All of Section 8 is out of MVP.

---

## Module 7 — Institutional Decision-Support Recommendation Engine

**Deferred.** All of Section 9 (curriculum recommendations, partnership suggestions, FDP priorities, student engagement strategies) is out of MVP.

---

## Module 8 — Institutional Expertise Graph

**Deferred entirely.** All of Section 10 is out of MVP.

---

## Module 9 — Institutional Admin Dashboard

**In MVP — Core view only:**

- **Cohort View:** Aggregated skill readiness by department/year — derived from assessment data
- **Placement Progress:** Applications submitted, shortlists, offers extended — real-time
- **Skill Demand vs. Supply Chart:** Gap analysis per skill (from Module 5 Feature 7.2)

**Deferred:** Individual student view with full history drill-down. Internship monitoring per student with mentor scores. Exportable reports.

---

## Module 10 — Policymaker Analytics Dashboard

**Deferred entirely.** All of Section 12 is out of MVP. Policymaker role is not in prototype scope.

---

## Platform-Wide Features

### 14.1 Role-Based Access Control

**In MVP:** All four in-scope roles (Student, Industry, Academician, Institutional Admin) with correct access boundaries enforced. Policymaker role excluded.

### 14.2 Document Management

**In MVP — Basic version:** Student can upload Resume and certificates as PDF. Files marked as self-reported. Access control (Public / Restricted / Private) — deferred; all documents default to Restricted (shared on application). Encryption at rest — implement if time permits; otherwise use standard secure storage.

### 14.3 Third-Party Integrations

**Deferred entirely.** No live third-party API integrations in MVP. All external resources are static links or self-reported uploads.

### 14.4 Collaboration Features

**Deferred.** Section 14.4 (events, live project board, mentorship matching) is Phase 2 as stated in the Solution Document.

---

## MVP Scope Summary

| Module                                       | In MVP                               | Deferred                             |
| -------------------------------------------- | ------------------------------------ | ------------------------------------ |
| Core Tech: Knowledge Graph                   | ✅ Pre-built (IT + AYUSH subset)     | Config UI                            |
| Core Tech: AI Assessment Engine              | ✅ Full, live LLM                    | —                                    |
| Core Tech: Soft Skill SJT                    | ❌                                   | Full deferral                        |
| Core Tech: Skill Profile + Gap Report        | ✅ Full                              | —                                    |
| Module 1: Career Guidance                    | ✅ Simplified role taxonomy          | JD-specific overlay                  |
| Module 1: Learning Recommendations           | ✅ Static mapping                    | Company program links                |
| Module 1: Student Portfolio                  | ✅ Full                              | Soft skill scores, cert verification |
| Module 2: Internship Posting + Matching      | ✅ Full                              | —                                    |
| Module 2: Application Tracking               | ✅ Full                              | —                                    |
| Module 2: Progress Tracker + Mentor Feedback | ✅ Minimal (end-of-internship only)  | Mid-point feedback                   |
| Module 2: Academician Portal                 | ✅ Browse + apply only               | Structured expertise profile         |
| Module 3: Job Posting + Candidate Discovery  | ✅ Full incl. longitudinal signal    | Private domain flagging              |
| Module 3: Placement Pipeline                 | ✅ Full                              | —                                    |
| Module 3: AI Interview Co-Pilot              | ❌                                   | Stretch only                         |
| Module 4: Industry Learning Programs         | ✅ Listings only                     | API enrollment tracking              |
| Module 5: Skill Demand Intelligence          | ✅ Platform-internal data, gap chart | External pipelines, time series      |
| Module 6: Regional Analytics                 | ❌                                   | Full deferral                        |
| Module 7: Decision-Support Engine            | ❌                                   | Full deferral                        |
| Module 8: Expertise Graph                    | ❌                                   | Full deferral                        |
| Module 9: Institutional Admin Dashboard      | ✅ Cohort + placement + demand chart | Individual drill-down, export        |
| Module 10: Policymaker Dashboard             | ❌                                   | Full deferral                        |
