# SIH 2026 — Problem Statement 26044

## Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement

### Consolidated Solution Document

---

## 1. User Roles and Access

| Role                | Who                                    | Portal Access                                                                                          |
| ------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Student             | Enrolled college students              | Skill assessment, profile, opportunities, applications, portfolio                                      |
| Industry Partner    | Companies, recruiters, hiring managers | Opportunity posting, candidate discovery, interview tools, learning programs                           |
| Academician         | College faculty and researchers        | Faculty opportunities, FDPs, research collaboration                                                    |
| Institutional Admin | College placement cells, admin staff   | Student monitoring, cohort analytics, placement dashboards, skill demand intelligence                  |
| Policymaker         | Ministry and government bodies         | National skill trends, regional mismatch analytics, institutional benchmarking, policy recommendations |

Role-based access control ensures each user type sees only features and data relevant to their role. A student cannot access recruiter tools; an institutional admin cannot view student data they are not authorised for.

---

## 2. Core Technical Foundation

### 2.1 Domain-Agnostic Knowledge Graph

Every skill domain on the platform is represented as a structured knowledge graph. Each graph contains:

- **Topic Nodes** — the primary skill areas (e.g., System Design, Computer Networks, Ayurvedic Pharmacology)
- **Concept Nodes** — specific sub-concepts within each topic (e.g., within System Design: Load Balancing, Caching, Database Sharding)
- **Dependency Edges** — relationships between concepts defining prerequisite order
- **Evaluation Rubric** — per-concept assessment criteria defining what a correct, deep, and applied answer looks like

Knowledge graphs are configured by domain experts, not hardcoded into the system. A domain expert defines the topic taxonomy and rubric for their field using a structured configuration interface. The assessment engine then operates on whichever graph is loaded for a given assessment session.

For the SIH prototype, the following domains are pre-built:

**Engineering and IT:** Data Structures and Algorithms · System Design · DevOps and CI/CD · Security Architecture · Web Frameworks · Low Level Design · API and Backend · Machine Learning · Software Testing · Object-Oriented Design · Core CS Subjects · SQL and Data Engineering

**Domain extensibility:** The graph architecture supports adding non-engineering domains. Healthcare, Ayurveda, management, or any other field can be configured by a domain expert without changes to the underlying engine.

---

### 2.2 AYUSH-Specific Domain Taxonomy

The platform includes a pre-configured AYUSH knowledge graph taxonomy, supporting the Ministry of Ayush context of this PS. The named sub-domain taxonomy is:

- **Ayurveda:** Dravya Guna · Rasa Shastra · Ayurvedic Pharmacology · Clinical Practice
- **Yoga:** Asanas · Pranayama · Meditation · Therapeutic Yoga
- **Unani:** Humoral Theory · Herbal Formulations · Clinical Applications
- **Siddha:** Metallic Preparations · Traditional Practices · Pharmacopeia
- **Homoeopathy:** Materia Medica · Potentization · Case-taking

These sub-domains are structured as topic nodes in the knowledge graph, with concept nodes, dependency edges, and evaluation rubrics configured by AYUSH domain experts. This enables the same adaptive assessment engine to evaluate students in Ayurveda or Yoga practice as it does in Software Engineering.

---

### 2.3 Adaptive AI Assessment Engine

The assessment engine conducts skill evaluation through a dynamic, conversational assessment session rather than a fixed questionnaire. The process works as follows:

1. The student selects a domain or is assigned one as part of an opportunity application or institutional requirement.
2. The engine initialises an assessment session using the knowledge graph for that domain.
3. The engine presents an opening question targeting a foundational concept node.
4. The student's response is evaluated against the rubric for that concept node across four dimensions:
   - **Correctness** — is the core answer accurate?
   - **Depth** — does the student understand the reasoning, not just the surface answer?
   - **Trade-off Awareness** — can the student reason about alternatives and their consequences?
   - **Real-World Applicability** — can the student apply the concept to a realistic scenario?
5. Based on the evaluation scores, the engine decides:
   - If the student scores above the confidence threshold → advance to the next concept node in the graph
   - If the student's answer is vague or partial → generate a targeted follow-up question on that specific concept before moving on
   - If the student consistently fails a concept → mark it as a gap and move forward
6. The session continues until sufficient graph coverage is achieved.
7. A structured assessment report is generated at the end of the session.

This mechanism distinguishes surface familiarity from genuine understanding by design. A student who lists the right terminology without demonstrating reasoning will score low on depth and trade-off awareness, regardless of vocabulary.

---

### 2.4 Soft Skill Assessment

Soft skill evaluation is conducted through Situational Judgment Tests (SJTs). The student is presented with realistic workplace scenarios — a team conflict, a deadline situation, a communication challenge — and asked to describe how they would respond and why.

The AI engine evaluates responses on:

- Clarity and structure of communication
- Quality of reasoning and decision-making
- Awareness of others' perspectives (collaboration signal)
- Response under ambiguity

Soft skill scores are maintained separately from technical scores and are displayed as a distinct section in the student's skill profile. Both are factored into opportunity matching.

---

### 2.5 Skill Profile and Gap Report

At the end of each assessment session, the platform generates:

**Skill Profile Update:** The student's knowledge depth score for that domain is updated based on the session. Scores reflect performance across all concept nodes tested, weighted by node importance within the knowledge graph.

**Gap Report:** A structured report identifying:

- Concept nodes where the student showed strong understanding
- Concept nodes where the student showed partial understanding (with specific sub-gaps identified)
- Concept nodes where the student showed weak or no understanding

The gap report is personalised and actionable. It does not give a vague overall score — it maps the student's understanding to specific concepts within the domain and tells them precisely what to address.

The skill profile is persistent and updates with every assessment session, creating a longitudinal record of the student's skill trajectory over time.

---

## 3. Module 1 — Skill Development

### 3.1 Career Guidance and Skill Mapping

The platform maintains a predefined job role taxonomy. Each role (e.g., Backend Software Engineer, DevOps Engineer, Data Scientist, Healthcare Administrator) has a defined skill requirement profile — specifying which domains are required, at what minimum proficiency level, and with what relative weight.

When a student completes assessments, the platform computes a role compatibility score for each job role in the taxonomy by comparing the student's current skill profile against the role's requirement profile.

The compatibility score is expressed as a percentage and is computed as a weighted match across required domains.

Additionally, when an industry partner posts an opportunity with a Job Description (JD), they specify required skills and minimum proficiency thresholds. The platform overlays these JD-specific requirements on top of the predefined role taxonomy to compute an opportunity-specific match score for each student.

The student's stated interests (collected during onboarding and updatable at any time) are used to filter and prioritise which role suggestions are surfaced.

**Career Guidance Output per Student:**

- Ranked list of role matches with % compatibility
- For each role: what skills the student already meets, what skills are below the required threshold, and what the specific gap is within each skill
- Recommended study path to close the gap for the role the student wants

---

### 3.2 Personalized Learning Recommendations

When a gap is identified in the student's profile — either from the gap report or from the career guidance mapping — the platform generates learning recommendations for that specific gap.

Recommendations come from two sources:

**Curated internal resource list:** The platform maintains a structured list of learning resources per concept node — selected from reputable open platforms (NPTEL, official documentation, MOOCs). When a concept node is flagged as a gap, the associated resources are surfaced to the student.

**Company-published learning programs (see Section 6):** Industry partners can publish training programs, certification courses, and workshops on the platform. Where a company learning program addresses a concept node that is flagged as a gap for a student, it is included in that student's recommendations.

Recommendations are ranked by relevance to the student's target role and current gap severity.

---

### 3.3 Student Digital Portfolio

Each student has a persistent digital portfolio containing:

- **Verified Skill Badges:** Earned upon clearing the benchmark in a domain assessment. Badges are platform-verified and cannot be self-reported.
- **Knowledge Depth Profile:** Topic-wise proficiency scores across all assessed domains, with concept-level granularity.
- **Living Skill Development Graph:** A timeline view of the student's skill scores across domains over time — showing how proficiency has grown, plateaued, or improved after targeted study. This is an evolving record of the student's learning journey, not a static snapshot.
- **Uploaded Documents:** Resume, academic transcripts, externally earned certificates, internship completion letters.
- **Project Entries:** Students can add project descriptions, GitHub links, and associated skills. These are self-reported but can be linked to assessment performance in relevant domains.
- **Internship Records:** Completed internships are recorded in the portfolio with company name, duration, role, and mentor-issued completion status.
- **Soft Skill Scores:** Displayed as a separate section alongside technical skills.

The portfolio is the student's public-facing proof of capability. It can be shared with companies as a profile link or made discoverable to industry partners on the platform.

---

## 4. Module 2 — Internship Management

### 4.1 Industry Internship Posting

Industry partners can post internship opportunities through their portal. Each posting includes:

- Role title, department, and description
- Duration and location (on-site / hybrid / remote)
- Required skills — mapped to the platform's domain taxonomy
- Minimum proficiency threshold per required skill (set by the company)
- Stipend range and eligibility criteria (year of study, CGPA, institution)
- Application deadline

Required skills are selected from the platform's domain taxonomy, ensuring they map directly to assessable skills. This enables automated matching against student profiles.

---

### 4.2 Student Opportunity Discovery and Application

Students see a personalised Opportunities Feed showing internships and job postings. Opportunities are surfaced based on:

- The student's skill profile vs. the opportunity's required skills
- Whether the student's proficiency meets the company's minimum threshold per skill
- The student's stated career interests

Each opportunity card shows:

- Role title and company
- % match of the student's profile with the role's skill requirements
- Which required skills the student already meets
- Which required skills are below the threshold and by how much

Students apply directly through the platform using their live portfolio as the primary application document.

---

### 4.3 Application Tracking

Students can track the status of all applications in a centralised tracker:

`Applied → Under Review → Shortlisted → Interview Scheduled → Selected / Not Selected`

Companies manage and move candidates through these stages within their recruiter portal. Students receive notifications at each stage change.

---

### 4.4 Internship Progress Tracking and Mentor Feedback

Once a student is confirmed for an internship, an Internship Tracker is activated for that engagement. The tracker records:

- Start date, end date, and company details
- Weekly progress logs submitted by the student
- Structured feedback submitted by the assigned industry mentor at defined intervals (mid-point and end)
- Milestone completion records
- Final internship completion certificate issued by the mentor within the platform

All of this is automatically added to the student's digital portfolio upon completion, with the mentor's verification status attached.

---

### 4.5 Academician Internship and FDP Portal

Academicians have a dedicated section within their portal that mirrors the student opportunity system, adapted for faculty needs. Industry partners can post:

- Faculty internships and industrial training opportunities
- Faculty Development Programs (FDPs)
- Consultancy opportunities
- Collaborative research projects

Academicians browse, apply, and track these opportunities through the same application workflow used by students. They apply using their academic credentials and areas of expertise filled in during onboarding.

---

## 5. Module 3 — Placement Management

### 5.1 Industry Job Posting

Industry partners post full-time job opportunities with the same structured format as internships — required skills mapped to the domain taxonomy, minimum proficiency thresholds, eligibility criteria, and application deadlines.

---

### 5.2 Skill-Based Candidate Discovery

Industry partners can proactively discover candidates without waiting for applications. They enter the skill requirements for a role and the platform returns a ranked list of students whose profiles match those requirements, ordered by % match.

Additionally, industry partners can privately flag specific skill domains or concept nodes that are important for their hiring. The platform then surfaces candidates who have demonstrated consistent performance in those areas across their assessment history — not just their current score. This longitudinal signal is more reliable than any single interview or test.

Candidates do not know which specific domains were flagged by a company. This ensures the assessment data reflects genuine capability, not targeted preparation for a specific company's preferences.

---

### 5.3 Candidate Shortlisting and Application Management

Companies shortlist candidates and manage the hiring pipeline within their portal. The recruitment pipeline stages are:

`Applied → Reviewed → Shortlisted → Interview Scheduled → Offer Extended → Joined`

Companies can move candidates through stages, add notes, and collaborate with team members within the portal.

---

### 5.4 AI Interview Co-Pilot

During live campus recruitment interviews conducted through or tracked via the portal, the AI Interview Co-Pilot provides real-time assistance to the interviewer.

The co-pilot:

- Displays the candidate's skill profile and knowledge depth on the interviewer's screen for reference
- Suggests targeted follow-up questions based on what the candidate has just said — probing for depth on areas where the profile shows partial knowledge
- Tracks how well the candidate's live responses align with their assessed profile, flagging significant deviations for the interviewer's attention
- Records the interview session summary and generates a structured post-interview report

**Post-Interview Report includes:**

- Candidate performance across dimensions assessed during the interview
- Comparison with profile — whether live performance is consistent with assessed history
- Role-fit recommendation
- Side-by-side ranking of all candidates interviewed for the same role

This feature enables companies conducting hiring drives across multiple campuses with different interview panels to maintain a single, consistent evaluation standard — regardless of who conducted the interview on which day.

---

## 6. Module 4 — Industry Learning Programs

Industry partners can publish learning content within the platform. These are listings created and managed by the company. Each listing includes:

- Program title and description
- Format — training course, certification, workshop, mentorship cohort
- Duration and mode (online / on-site)
- Skills addressed — mapped to the domain taxonomy
- Eligibility and application process
- External link or platform-hosted enrollment

These listings are surfaced to students in their learning recommendations when the skills covered by the program match a gap in the student's profile.

Third-party platforms such as Coursera, NPTEL, and certification providers can be integrated via API where available, to allow enrollment tracking and certificate verification directly within the portal.

---

## 7. Module 5 — Skill Demand Intelligence

This is a standalone analytical system that extracts, aggregates, and analyses skill demand from industry, and surfaces actionable intelligence to institutions and administrators.

### 7.1 Data Pipeline

Job postings from industry partners on the platform are processed through the following pipeline:

**Job Postings → NLP-based Skill Extraction → Skill Entity Linking → Skill Taxonomy Mapping → Demand Aggregation**

**Scale target:** 1,000+ companies → 50,000+ job/internship requirements → compared against supply from 500 institutions, 200,000+ students.

---

### 7.2 Demand vs. Supply Gap Analysis

For each skill in the taxonomy, the system computes:

**Gap = (Demand % − Supply %)**

Where:

- **Demand %** = proportion of job postings requiring that skill
- **Supply %** = proportion of students with assessed proficiency in that skill above threshold

**Gap severity categorisation:**

- 🔴 **HIGH** (gap > 50%) — urgent curriculum changes needed
- 🟡 **MEDIUM** (gap 20–50%) — plan changes over 1–2 semesters
- 🟢 **LOW** (gap < 20%) — monitor and address incrementally

---

### 7.3 Time Series Analysis

Skill demand is tracked over time, producing per-skill trend signals:

- **Trending Up** — growing demand, below-average supply
- **Trending Down** — declining demand
- **Stable** — consistent demand pattern

This enables institutions to act on emerging skills before gaps become critical.

---

### 7.4 Visual Demand–Supply Dashboard

The skill demand intelligence dashboard displays a side-by-side bar comparison of industry demand vs. student supply per skill — making the gap immediately visible to institutional administrators.

---

## 8. Module 6 — Regional and Sectoral Analytics

A dedicated analytical slicing engine that operates across five dimensions simultaneously, enabling granular intelligence beyond institution-level averages.

### 8.1 Analytical Dimensions

- **Region** — e.g. Tamil Nadu vs. Bangalore skill gaps
- **Institution** — which college's students fill regional demand
- **Sector** — FinTech vs. Healthcare vs. E-commerce demand comparison
- **Domain** — deep-dive into specific skill areas (AI/ML, DevOps, Backend)
- **Role Type** — senior vs. entry-level demand patterns

Any combination of these dimensions can be applied simultaneously to slice the data.

---

### 8.2 Worked Example — Tamil Nadu Healthcare AI Sector

| Skill          | Industry Demand | Student Supply | Gap             |
| -------------- | --------------- | -------------- | --------------- |
| Medical AI     | 78%             | 12%            | 🔴 HIGH (66%)   |
| Data Analytics | 65%             | 28%            | 🔴 HIGH (37%)   |
| NLP            | 52%             | 15%            | 🔴 HIGH (37%)   |
| Cloud Skills   | 48%             | 31%            | 🟡 MEDIUM (17%) |

This view enables an institution in Tamil Nadu to understand not just national trends but the specific demand profile of local healthcare-sector employers.

---

## 9. Module 7 — Institutional Decision-Support Recommendation Engine

Goes beyond reporting skill gaps — the platform auto-generates structured, actionable institutional recommendations across four categories, directly derived from the skill demand gap analysis.

### 9.1 Curriculum Recommendations

Specific new electives or course modifications to launch, with credit weight and focus level.

_Example:_ "Healthcare AI Fundamentals — 2 credits, foundational"

---

### 9.2 Industry Partnership Suggestions

Named companies to connect with, and what each offers.

_Example format:_

- Company A — 20 internships/year, guest lectures, live projects
- Company B — curriculum co-design, certification partnerships

---

### 9.3 Faculty Development Priorities

Recommended number of faculty to send to Faculty Development Programs (FDPs), and which focus areas to prioritise based on identified skill gaps.

---

### 9.4 Student Engagement Strategies

Recommended number and topics of workshops per semester, aligned with demand gaps in the student cohort.

---

## 10. Module 8 — Institutional Expertise Graph

A structured, queryable graph of each institution's faculty expertise, lab infrastructure, and research track record — enabling targeted industry-academia research collaboration.

### 10.1 Faculty Expertise Entries

Each faculty member has a structured profile:

- Specialisation domain
- Publication count
- Research focus areas
- Years of track record
- Availability for: consulting / research collaboration / guest lectures

---

### 10.2 Labs and Infrastructure Entries

Each lab has a structured entry:

- Hardware specifications (e.g. GPU count, RAM)
- Software stack
- Dataset holdings
- Compliance status (e.g. IRB/HIPAA)
- Available for: industry research / student projects / external collaborations

---

### 10.3 Past Projects Registry

Each past project is structured as:

- Funding source and amount
- Outcomes (papers / patents)
- Active or completed status
- Collaborating organisations

---

### 10.4 Query Use Case

An industry partner enters a combined query — e.g., "AI + Ayurveda + Drug Discovery" — and the platform matches them to the institution(s), faculty members, labs, and past projects relevant to that combined query. This is a structured graph query, not a keyword search over a faculty directory. The result gives the industry partner a complete, verified picture of available expertise before initiating outreach.

---

## 11. Module 9 — Institutional Admin Dashboard

Institutional Administrators access a dedicated dashboard providing:

- **Individual Student View:** Full skill profile, assessment history, application status, internship participation, and placement outcome for each student
- **Cohort View:** Aggregated skill readiness by department, year, and specialisation
- **Internship Monitoring:** Which students are currently in internships, at which companies, and what their mentor feedback scores are
- **Placement Progress:** Real-time tracking of the current placement season — applications submitted, shortlists received, offers extended
- **Skill Demand Trends:** Demand vs. supply gap analysis per skill (from Module 5), with gap severity indicators, surfacing which domains require urgent curriculum action
- **Exportable Reports:** For internal review and accreditation submissions

The institutional license covers all students enrolled under that institution. The placement cell manages the institutional account and can grant limited access to individual department coordinators.

---

## 12. Module 10 — Policymaker Analytics Dashboard

A ministry-level dashboard providing four components, accessible to government and policy bodies.

### 12.1 National Skill Demand Trends

- Skills trending upward nationally
- Emerging skills new to the demand landscape
- Skills becoming obsolete (declining demand)

---

### 12.2 Regional Supply-Demand Mismatch

- Which regions have critical skill gaps (🔴 HIGH severity)
- Sector-wise gaps broken down by geography
- Cross-regional talent mobility patterns

---

### 12.3 Institutional Performance Benchmarking

- Which institutions are best-aligned with regional industry demand
- Placement outcomes vs. skill readiness correlation
- Peer comparison between colleges in the same region or sector

---

### 12.4 Strategic Recommendations for Policy

- Curriculum reform priorities by region and sector
- Resource allocation guidance for ministry investment
- Industry-academia partnership opportunities at a systemic level

---

## 13. Feedback Loop System

The platform is designed as a closed-loop system where every component feeds data back into every other, compounding in value as adoption grows.

```
Industry Demand
      ↓
Skill Intelligence (demand graph, gap computation)
      ↓
Academia Response (curriculum changes, partnership decisions)
      ↓
Student Development (assessments, recommended learning paths)
      ↓
Opportunity (internship/job matching against improved profiles)
      ↓
Outcome (hiring data, placement records, role outcomes)
      ↓
Feedback → back into Skill Intelligence → updates demand analysis
```

**Loop description:**

1. **Industry Demand** — Aggregate job postings and role requirements from companies
2. **Skill Intelligence** — Extract skill requirements, build a demand graph showing prevalence of each skill
3. **Academia Response** — Institutions receive recommendations (new courses, industry partnerships, FDP priorities)
4. **Student Development** — Students complete assessments, pursue recommended learning paths
5. **Opportunity** — Students discover internships/jobs aligned with improved skills
6. **Outcome** — Hiring data collected; placement success and role outcomes recorded
7. **Feedback** — Outcome data feeds back into demand analysis, showing which skills actually lead to placement

**Business impact:** The platform becomes more valuable as more institutions and companies use it, since the loop compounds with accumulated outcome data. Which skills were demanded, which were trained, and which actually led to placement — all three signals reinforce each other over time.

---

## 14. Platform-Wide Features

### 14.1 Role-Based Access Control

| Feature                             | Student | Industry | Academician | Inst. Admin | Policymaker |
| ----------------------------------- | ------- | -------- | ----------- | ----------- | ----------- |
| Take assessments                    | ✓       | —        | —           | —           | —           |
| View own profile                    | ✓       | —        | ✓           | —           | —           |
| View candidate profiles             | —       | ✓        | —           | ✓           | —           |
| Post opportunities                  | —       | ✓        | —           | —           | —           |
| Apply to opportunities              | ✓       | —        | ✓           | —           | —           |
| View institutional analytics        | —       | —        | —           | ✓           | —           |
| View national/regional analytics    | —       | —        | —           | —           | ✓           |
| Publish learning programs           | —       | ✓        | —           | —           | —           |
| Conduct interviews via co-pilot     | —       | ✓        | —           | —           | —           |
| Query institutional expertise graph | —       | ✓        | —           | —           | —           |

---

### 14.2 Document Management

Each student has a secure document store within their profile. Supported documents:

- Resume (PDF)
- Academic transcripts
- Externally earned certificates (AWS, Google, Coursera, etc.) — uploaded as PDF; marked as self-reported unless verified via API
- Internship offer letters and completion certificates
- Project reports

Documents can be set to:

- **Public** — visible to any industry partner who views the student's profile
- **Restricted** — shared only when the student applies to a specific opportunity
- **Private** — visible only to the student

Document storage is encrypted at rest. Access logs are maintained for any document viewed by an external party.

---

### 14.3 Third-Party Integrations

| Integration Type         | Platforms                    | Purpose                                                   |
| ------------------------ | ---------------------------- | --------------------------------------------------------- |
| Learning platforms       | Coursera, NPTEL, edX         | Enrollment tracking, certificate verification             |
| Cloud certification APIs | AWS, Google Cloud, Microsoft | Certificate verification                                  |
| Institutional databases  | University ERP systems       | Student enrollment verification, academic record sync     |
| Communication            | Email, SMS                   | Notifications for application status, interview schedules |

Integrations are API-based. Where a provider does not offer a public API, certificates are accepted as self-reported uploads with a clear labelling distinction on the student profile.

---

### 14.4 Collaboration Features

The platform includes a lightweight collaboration board for industry-academia interaction:

- **Events Listing:** Companies post workshops, guest lectures, and hackathons. Students and academicians can register through the platform.
- **Live Project Board:** Companies post short-term project briefs open for student or faculty collaboration. Interested parties apply with their profile.
- **Mentorship Matching:** Companies can offer structured mentorship slots. Students request mentorship in specific domains. Matching is done by domain relevance.

These features are positioned as Phase 2 additions, with the core modules taking priority in the initial prototype.

---

## 15. Novelty

The platform's most distinctive novelty — directly aligned with and most relevant to PS 26044 — is the **Closed-Loop Skill Intelligence System connecting Industry Demand, Institutional Action, and Placement Outcomes**.

Most existing academia-industry platforms stop at one of three places: they either collect job data, or they assess students, or they track placement outcomes. No existing platform closes the loop between all three and uses it as a compounding intelligence engine.

**What makes this novel in the context of PS 26044:**

The PS asks for skill mapping, internships, and placement in a single platform — but its deeper need, especially given the Ministry of Ayush context, is alignment: ensuring that what institutions teach produces graduates that industry actually hires. The novelty here is that the platform makes this alignment measurable, automatic, and self-improving:

1. **NLP-driven Skill Demand Intelligence from live job postings** — not survey-based or manually curated skill lists, but a real-time demand signal from 1,000+ companies and 50,000+ job requirements, mapped to a structured skill taxonomy. This is quantified as a gap score (Demand % − Supply %) per skill, with automated severity classification (🔴/🟡/🟢), giving institutions an objective, always-current picture of what they need to change.

2. **Outcome-feedback into demand analysis** — after placement, the platform records which skills actually correlated with successful hiring. This closes the loop: a skill in high demand that does not actually lead to placement gets corrected in the demand signal over time. This is a capability no static curriculum advisory system can provide.

3. **AYUSH-domain knowledge graph with named sub-domain taxonomy** — the platform is the first to apply adaptive AI-driven skill assessment to AYUSH sub-domains (Dravya Guna, Rasa Shastra, Potentization, Therapeutic Yoga, etc.) using the same engine that powers IT domain assessments. This is structurally novel: it allows All India Institute of Ayurveda and Ministry of Ayush to do for Ayurvedic skill gaps what IITs do for engineering placement — with quantified demand vs. supply data.

4. **Institutional Expertise Graph for structured research matchmaking** — rather than a faculty directory, the platform exposes a queryable graph of faculty expertise, lab capabilities, and research history. An industry partner searching "AI + Ayurveda + Drug Discovery" gets matched to specific faculty, specific labs, and specific past projects — not a list of names. This directly serves AIIA's research collaboration mandate.

5. **Pedigree-Free, Longitudinal Skill Evaluation** — the platform evaluates students on demonstrated reasoning performance across multiple sessions over time, not on institution reputation or CGPA. This is directly aligned with the PS's equity intent — enabling students from less prominent institutions to compete on demonstrated capability.

Taken together, the novelty is not any single feature but the **system design**: a compounding, self-improving intelligence loop that connects what industry needs, what institutions train, what students demonstrate, and what leads to actual placement — unified in a single platform that becomes more accurate as it grows.

---

_Solution document — SIH 2026 · PS 26044 · Ministry of Ayush / All India Institute of Ayurveda_
