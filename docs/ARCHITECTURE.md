# ARCHITECTURE.md

## SkillLedger — SIH 2026 · PS 26044

### Single-Source-of-Truth Architecture Document for AI Coding Agents

> **Agent Instruction:** Read this document fully before generating any file. Every directory path, boundary, and naming convention defined here is authoritative. Do not invent new directories, service names, or API shapes. When a section says "exact", treat it as a hard constraint.

---

## 1. System Objectives

SkillLedger is a full-stack web application solving PS 26044: an Academia–Industry Collaboration Portal for Skill Mapping, Internships, and Placement. The platform enables:

- **Students** — AI-driven adaptive skill assessment, gap reports, digital portfolio, opportunity discovery, and application tracking
- **Industry Partners** — Internship/job posting, skill-based candidate discovery, and recruitment pipeline management
- **Academicians** — FDP and faculty opportunity browsing and application
- **Institutional Admins** — Cohort analytics, placement tracking, and skill demand vs. supply dashboard

The flagship novelty is **SkillLedger**: a longitudinal, pedigree-free, verified skill identity built from repeated adaptive AI assessment sessions.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│          Next.js 14 App Router · React 18 · TypeScript          │
│   /app/(student) · /app/(industry) · /app/(admin) · /app/(acad) │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS · JSON
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API ROUTE LAYER                               │
│              Next.js Route Handlers · /app/api/**               │
│    Auth via NextAuth.js · Zod validation · Role middleware       │
└────┬──────────────┬───────────────┬────────────────┬────────────┘
     │              │               │                │
     ▼              ▼               ▼                ▼
┌─────────┐  ┌──────────┐  ┌─────────────┐  ┌────────────────┐
│ Auth    │  │ Core     │  │ Assessment  │  │ Analytics      │
│ Service │  │ Platform │  │ AI Service  │  │ Service        │
│         │  │ Services │  │             │  │                │
│NextAuth │  │(Opps,    │  │Knowledge    │  │Demand/Supply   │
│JWT/JWE  │  │ Apps,    │  │Graph Engine │  │Gap Computation │
│Sessions │  │ Portfolio│  │LLM Adapter  │  │Match Scoring   │
│         │  │ Users)   │  │Rubric Eval  │  │Career Guidance │
└────┬────┘  └────┬─────┘  └──────┬──────┘  └──────┬─────────┘
     │            │               │                 │
     └────────────┴───────────────┴─────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                             │
│              Prisma ORM · Connection Pool (PgBouncer)            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                             │
│        PostgreSQL 15 (Supabase) · Supabase Storage (files)      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Repository Structure (Exact — Do Not Deviate)

```
skilledger/
├── app/                          # Next.js App Router root
│   ├── (auth)/                   # Route group: public auth pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (student)/                # Route group: student-only pages
│   │   ├── layout.tsx            # Student shell with sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── assess/
│   │   │   ├── page.tsx          # Domain selection
│   │   │   └── [sessionId]/
│   │   │       └── page.tsx      # Live assessment session UI
│   │   ├── portfolio/page.tsx
│   │   ├── opportunities/page.tsx
│   │   └── applications/page.tsx
│   ├── (industry)/               # Route group: industry-only pages
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── post/
│   │   │   ├── internship/page.tsx
│   │   │   └── job/page.tsx
│   │   ├── discover/page.tsx     # Candidate discovery
│   │   └── pipeline/
│   │       └── [postingId]/page.tsx
│   ├── (admin)/                  # Route group: institutional admin
│   │   ├── layout.tsx
│   │   └── dashboard/page.tsx
│   ├── (acad)/                   # Route group: academician
│   │   ├── layout.tsx
│   │   └── opportunities/page.tsx
│   └── api/                      # All API Route Handlers
│       ├── auth/
│       │   └── [...nextauth]/route.ts
│       ├── assess/
│       │   ├── start/route.ts    # POST: create session
│       │   ├── respond/route.ts  # POST: submit answer, get next Q
│       │   └── report/[id]/route.ts # GET: gap report
│       ├── profile/
│       │   └── [userId]/route.ts
│       ├── opportunities/
│       │   ├── route.ts          # GET: feed, POST: create posting
│       │   └── [id]/
│       │       └── apply/route.ts
│       ├── applications/
│       │   └── [id]/
│       │       └── status/route.ts
│       ├── candidates/
│       │   └── discover/route.ts
│       ├── analytics/
│       │   └── demand/route.ts
│       └── internships/
│           └── [id]/
│               ├── tracker/route.ts
│               └── feedback/route.ts
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn/ui base components (do not edit)
│   ├── assessment/               # Assessment session components
│   │   ├── QuestionCard.tsx
│   │   ├── ResponseInput.tsx
│   │   └── GapReport.tsx
│   ├── portfolio/
│   │   ├── SkillBadge.tsx
│   │   ├── SkillTimeline.tsx     # Recharts line chart
│   │   └── DepthProfile.tsx
│   ├── opportunities/
│   │   ├── OpportunityCard.tsx
│   │   └── MatchBadge.tsx
│   └── dashboard/
│       ├── DemandSupplyChart.tsx # Recharts bar chart
│       └── CohortStats.tsx
├── lib/                          # Business logic and service layer
│   ├── assessment/
│   │   ├── engine.ts             # Assessment session state machine
│   │   ├── llm-adapter.ts        # Anthropic SDK wrapper
│   │   ├── rubric-evaluator.ts   # Rubric scoring logic
│   │   └── graph-loader.ts       # Load knowledge graph from JSON
│   ├── matching/
│   │   ├── opportunity-match.ts  # Profile vs. JD match scoring
│   │   └── career-guidance.ts    # Role taxonomy compatibility scoring
│   ├── analytics/
│   │   ├── demand-pipeline.ts    # Skill extraction from JD text
│   │   └── gap-analysis.ts       # Demand% vs Supply% computation
│   ├── auth/
│   │   ├── next-auth-config.ts   # NextAuth configuration
│   │   └── role-guard.ts         # Role-based access middleware
│   └── utils/
│       ├── api-response.ts       # Standardised API response helpers
│       └── error-handler.ts      # Centralised error handling
├── prisma/
│   ├── schema.prisma             # Single source of truth for DB schema
│   └── migrations/               # Auto-generated — do not manually edit
├── data/
│   └── knowledge-graphs/         # Pre-built domain graph JSON files
│       ├── dsa.json
│       ├── system-design.json
│       ├── machine-learning.json
│       ├── core-cs.json
│       ├── ayurvedic-pharmacology.json
│       └── clinical-practice.json
├── types/
│   └── index.ts                  # ALL shared TypeScript types — single file
├── docs/
│   ├── ARCHITECTURE.md           # This file
│   └── TECH_STACK.md
├── middleware.ts                 # Next.js middleware for route protection
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local                    # Never commit — see .env.example
```

---

## 4. Data Flow — Assessment Session (Critical Path)

This is the most important flow in the system. Every agent working on assessment-related code must follow this exact lifecycle.

```
STUDENT BROWSER                API LAYER                  SERVICE LAYER              DB + LLM
      │                             │                           │                       │
      │  POST /api/assess/start     │                           │                       │
      │  { userId, domain }         │                           │                       │
      ├────────────────────────────►│                           │                       │
      │                             │  1. Zod validate input    │                       │
      │                             │  2. Check auth session    │                       │
      │                             │  3. Call engine.start()   │                       │
      │                             ├──────────────────────────►│                       │
      │                             │                           │  4. graph-loader.ts   │
      │                             │                           │     reads domain JSON │
      │                             │                           │  5. Create Session    │
      │                             │                           │     row in DB         │
      │                             │                           ├──────────────────────►│
      │                             │                           │◄──────────────────────┤
      │                             │                           │     sessionId         │
      │                             │                           │  6. Pick opening      │
      │                             │                           │     concept node      │
      │                             │                           │  7. llm-adapter.ts:  │
      │                             │                           │     generate Q from  │
      │                             │                           │     node + rubric     │
      │                             │                           ├──────────────────────►│
      │                             │                           │  [Anthropic API call] │
      │                             │                           │◄──────────────────────┤
      │  { sessionId, question,     │                           │     question text     │
      │    conceptNode, turnIndex } │◄──────────────────────────┤                       │
      │◄────────────────────────────┤                           │                       │
      │                             │                           │                       │
      │  [Student types answer]     │                           │                       │
      │                             │                           │                       │
      │  POST /api/assess/respond   │                           │                       │
      │  { sessionId, answer,       │                           │                       │
      │    conceptNode, turnIndex } │                           │                       │
      ├────────────────────────────►│                           │                       │
      │                             │  1. Zod validate          │                       │
      │                             │  2. Load session from DB  │                       │
      │                             │  3. Call engine.evaluate()│                       │
      │                             ├──────────────────────────►│                       │
      │                             │                           │  8. llm-adapter.ts:  │
      │                             │                           │     evaluate answer   │
      │                             │                           │     against rubric    │
      │                             │                           ├──────────────────────►│
      │                             │                           │  [Anthropic API call] │
      │                             │                           │◄──────────────────────┤
      │                             │                           │  { correctness,       │
      │                             │                           │    depth, tradeoff,   │
      │                             │                           │    applicability,     │
      │                             │                           │    next_action,       │
      │                             │                           │    followup_q }       │
      │                             │                           │  9. Persist score     │
      │                             │                           │     for concept node  │
      │                             │                           ├──────────────────────►│
      │                             │                           │  10. Decision logic:  │
      │                             │                           │   score≥threshold →   │
      │                             │                           │     advance node      │
      │                             │                           │   partial → followup  │
      │                             │                           │   fail → mark gap,    │
      │                             │                           │     advance           │
      │                             │                           │  11. Coverage check:  │
      │                             │                           │   sufficient? →       │
      │                             │                           │   generate report     │
      │                             │                           │   else → next Q       │
      │  { question | null,         │◄──────────────────────────┤                       │
      │    isComplete, reportId }   │                           │                       │
      │◄────────────────────────────┤                           │                       │
      │                             │                           │                       │
      │  [If isComplete === true]   │                           │                       │
      │  GET /api/assess/           │                           │                       │
      │      report/{reportId}      │                           │                       │
      ├────────────────────────────►│                           │                       │
      │  { gapReport,               │  Load report from DB      │                       │
      │    profileUpdate,           │  Update SkillProfile      │                       │
      │    badges }                 │  Append to timeline       │                       │
      │◄────────────────────────────┤                           │                       │
```

---

## 5. Data Flow — Opportunity Matching (Supporting Path)

```
STUDENT                     API                    MATCHING SERVICE              DB
   │                          │                          │                        │
   │  GET /api/opportunities  │                          │                        │
   │  ?role=internship        │                          │                        │
   ├─────────────────────────►│                          │                        │
   │                          │  Load student profile    │                        │
   │                          ├─────────────────────────►│                        │
   │                          │                          │  Fetch all active      │
   │                          │                          │  postings from DB      │
   │                          │                          ├───────────────────────►│
   │                          │                          │  For each posting:     │
   │                          │                          │  matchScore =          │
   │                          │                          │  weightedAvg(          │
   │                          │                          │    studentScore[skill] │
   │                          │                          │    / threshold[skill]  │
   │                          │                          │  ) capped at 100%      │
   │                          │                          │  Sort desc by score    │
   │  [{ posting, matchScore, │◄─────────────────────────┤                        │
   │    metSkills,            │                          │                        │
   │    gapSkills }]          │                          │                        │
   │◄─────────────────────────┤                          │                        │
```

---

## 6. Database Schema (Prisma — Authoritative)

> **Agent Rule:** The Prisma schema below is the single source of truth. Do not access the database directly with raw SQL. Use `prisma` client exclusively.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // For Supabase: bypasses PgBouncer for migrations
}

enum Role {
  STUDENT
  INDUSTRY
  ACADEMICIAN
  INSTITUTIONAL_ADMIN
}

enum ApplicationStatus {
  APPLIED
  UNDER_REVIEW
  SHORTLISTED
  INTERVIEW_SCHEDULED
  SELECTED
  NOT_SELECTED
}

enum PlacementStatus {
  APPLIED
  REVIEWED
  SHORTLISTED
  INTERVIEW_SCHEDULED
  OFFER_EXTENDED
  JOINED
  REJECTED
}

enum OpportunityType {
  INTERNSHIP
  JOB
  FDP
  FACULTY_INTERNSHIP
  RESEARCH_PROJECT
  CONSULTANCY
  LEARNING_PROGRAM
}

enum GapSeverity {
  HIGH    // gap > 50%
  MEDIUM  // gap 20-50%
  LOW     // gap < 20%
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  role          Role
  institution   String?
  department    String?
  expertise     String?   // Academician: free-text areas of expertise
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  skillProfile        SkillProfile?
  assessmentSessions  AssessmentSession[]
  applications        Application[]
  postings            Opportunity[]       @relation("PostedBy")
  internshipRecords   InternshipRecord[]  @relation("StudentInternships")
  mentoredInternships InternshipRecord[]  @relation("MentorInternships")
  accounts            Account[]
  sessions            Session[]

  @@map("users")
}

model SkillProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  domainScores Json    // { [domain: string]: { score: number, lastUpdated: string } }
  badges      Json     // { [domain: string]: { earned: boolean, earnedAt: string | null } }
  softSkillScore Float? // Deferred — nullable for MVP
  updatedAt   DateTime @updatedAt

  scoreHistory SkillScoreHistory[]

  @@map("skill_profiles")
}

model SkillScoreHistory {
  id           String       @id @default(cuid())
  profileId    String
  profile      SkillProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  domain       String
  score        Float
  sessionId    String
  recordedAt   DateTime     @default(now())

  @@map("skill_score_history")
}

model AssessmentSession {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  domain        String   // e.g. "dsa", "system-design", "ayurvedic-pharmacology"
  status        String   // "in_progress" | "completed"
  currentNodeId String?  // concept node currently being assessed
  turnIndex     Int      @default(0)
  graphSnapshot Json     // snapshot of the loaded knowledge graph for this session
  nodeResults   Json     // { [conceptNodeId]: { correctness, depth, tradeoff, applicability, status } }
  createdAt     DateTime @default(now())
  completedAt   DateTime?

  gapReport GapReport?

  @@map("assessment_sessions")
}

model GapReport {
  id        String            @id @default(cuid())
  sessionId String            @unique
  session   AssessmentSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  userId    String
  domain    String
  strongNodes   Json  // string[]
  partialNodes  Json  // string[]
  weakNodes     Json  // string[]
  overallScore  Float
  generatedAt   DateTime @default(now())

  @@map("gap_reports")
}

model Opportunity {
  id               String          @id @default(cuid())
  postedById       String
  postedBy         User            @relation("PostedBy", fields: [postedById], references: [id])
  type             OpportunityType
  title            String
  description      String          @db.Text
  requiredSkills   Json            // { skill: string, minThreshold: number }[]
  eligibilityCriteria Json         // { yearOfStudy?: number[], minCGPA?: number, institution?: string }
  location         String?
  duration         String?
  stipendRange     String?
  deadline         DateTime
  skillsExtracted  Json?           // Populated by demand pipeline NLP extraction
  isActive         Boolean         @default(true)
  createdAt        DateTime        @default(now())

  applications Application[]

  @@map("opportunities")
}

model Application {
  id            String            @id @default(cuid())
  userId        String
  user          User              @relation(fields: [userId], references: [id])
  opportunityId String
  opportunity   Opportunity       @relation(fields: [opportunityId], references: [id])
  status        ApplicationStatus @default(APPLIED)
  placementStatus PlacementStatus?  // Used for job applications only
  matchScoreAtApply Float         // Snapshot of match% at time of application
  notes         String?           @db.Text  // Recruiter notes
  appliedAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  @@unique([userId, opportunityId])
  @@map("applications")
}

model InternshipRecord {
  id          String    @id @default(cuid())
  studentId   String
  student     User      @relation("StudentInternships", fields: [studentId], references: [id])
  mentorId    String?
  mentor      User?     @relation("MentorInternships", fields: [mentorId], references: [id])
  companyName String
  role        String
  startDate   DateTime
  endDate     DateTime?
  progressLogs Json     @default("[]")  // { week: number, log: string, submittedAt: string }[]
  mentorFeedback Json?  // { rating: number, comments: string, submittedAt: string }
  isComplete  Boolean   @default(false)
  createdAt   DateTime  @default(now())

  @@map("internship_records")
}

// NextAuth required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

---

## 7. Shared TypeScript Types (types/index.ts — Authoritative)

> **Agent Rule:** Import types exclusively from `@/types`. Do not define inline types in component or service files. All additions go into `types/index.ts`.

```typescript
// types/index.ts

// ─── Knowledge Graph ──────────────────────────────────────────────────────────

export interface ConceptNode {
  id: string; // e.g. "load-balancing"
  label: string; // e.g. "Load Balancing"
  topicId: string; // e.g. "system-design"
  dependencies: string[]; // concept node ids that must come before this
  rubric: {
    correctness: string; // what a correct answer looks like
    depth: string; // what a deep answer demonstrates
    tradeoffAwareness: string;
    realWorldApplicability: string;
  };
  importance: number; // 0.0–1.0 weight for profile score computation
}

export interface KnowledgeGraph {
  domain: string; // e.g. "system-design"
  displayName: string; // e.g. "System Design"
  version: string;
  nodes: ConceptNode[];
}

// ─── Assessment Session ───────────────────────────────────────────────────────

export type NodeStatus = "strong" | "partial" | "weak" | "untested";
export type NextAction =
  | "advance"
  | "followup"
  | "mark_gap_advance"
  | "complete";

export interface NodeEvaluation {
  correctness: number; // 0.0–1.0
  depth: number; // 0.0–1.0
  tradeoffAwareness: number; // 0.0–1.0
  realWorldApplicability: number; // 0.0–1.0
  composite: number; // weighted average
  status: NodeStatus;
}

export interface LLMEvaluationResponse {
  evaluation: NodeEvaluation;
  next_action: NextAction;
  followup_question: string | null;
  reasoning: string; // brief internal reasoning — not shown to user
}

export interface AssessmentTurn {
  questionText: string;
  conceptNodeId: string;
  turnIndex: number;
  isFollowup: boolean;
}

export interface GapReportData {
  id: string;
  domain: string;
  overallScore: number; // 0–100
  strongNodes: string[];
  partialNodes: string[];
  weakNodes: string[];
  learningResources: {
    conceptNodeId: string;
    resources: { title: string; url: string }[];
  }[];
}

// ─── Skill Profile ────────────────────────────────────────────────────────────

export interface DomainScore {
  score: number; // 0–100
  lastUpdated: string; // ISO date
}

export interface SkillBadge {
  domain: string;
  earned: boolean;
  earnedAt: string | null;
}

export interface ScoreHistoryPoint {
  domain: string;
  score: number;
  recordedAt: string;
  sessionId: string;
}

// ─── Opportunity & Matching ───────────────────────────────────────────────────

export interface RequiredSkill {
  skill: string; // domain name matching KnowledgeGraph.domain
  minThreshold: number; // 0–100 minimum proficiency required
}

export interface OpportunityMatchResult {
  opportunityId: string;
  matchScore: number; // 0–100
  metSkills: string[];
  gapSkills: { skill: string; studentScore: number; required: number }[];
}

// ─── Demand Analytics ─────────────────────────────────────────────────────────

export type GapSeverity = "HIGH" | "MEDIUM" | "LOW";

export interface SkillGapDataPoint {
  skill: string;
  demandPercent: number; // % of postings requiring this skill
  supplyPercent: number; // % of students meeting threshold
  gap: number; // demandPercent - supplyPercent
  severity: GapSeverity;
}

// ─── API Response Envelope ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

---

## 8. Knowledge Graph JSON Schema

> **Agent Rule:** Every file in `data/knowledge-graphs/` must conform exactly to this shape. The assessment engine will throw at runtime if the schema is violated.

```json
{
  "domain": "system-design",
  "displayName": "System Design",
  "version": "1.0.0",
  "nodes": [
    {
      "id": "load-balancing",
      "label": "Load Balancing",
      "topicId": "system-design",
      "dependencies": [],
      "rubric": {
        "correctness": "Correctly identifies load balancing as distributing traffic across multiple servers to avoid overload",
        "depth": "Explains Round Robin vs Least Connections vs IP Hash with trade-offs; mentions health checks",
        "tradeoffAwareness": "Discusses sticky sessions, stateful vs stateless design, and L4 vs L7 balancing",
        "realWorldApplicability": "Applies to a concrete scenario (e.g. a high-traffic API with read-heavy workloads)"
      },
      "importance": 0.8
    }
  ]
}
```

---

## 9. LLM Adapter Contract

> **Agent Rule:** All Anthropic API calls are routed through `lib/assessment/llm-adapter.ts`. No component or route handler may import the Anthropic SDK directly.

```typescript
// lib/assessment/llm-adapter.ts — interface contract

// GENERATE QUESTION: called with a concept node to produce an assessment question
export async function generateQuestion(
  node: ConceptNode,
  isFollowup: boolean,
  priorAnswer?: string,
): Promise<string>;

// EVALUATE RESPONSE: called with student answer + node rubric
export async function evaluateResponse(
  node: ConceptNode,
  question: string,
  answer: string,
): Promise<LLMEvaluationResponse>;

// GENERATE REPORT: called at session end with all node results
export async function generateGapNarrative(
  domain: string,
  nodeResults: Record<string, NodeEvaluation>,
): Promise<string>;
```

**LLM Evaluation System Prompt Contract:**

```
You are a technical interviewer evaluating a student's response in an adaptive skill assessment.
Domain: {domain}
Concept: {node.label}

Rubric:
- Correctness: {node.rubric.correctness}
- Depth: {node.rubric.depth}
- Trade-off Awareness: {node.rubric.tradeoffAwareness}
- Real-World Applicability: {node.rubric.realWorldApplicability}

Question asked: {question}
Student answer: {answer}

Respond ONLY with a valid JSON object. No markdown. No preamble. Schema:
{
  "evaluation": {
    "correctness": <0.0–1.0>,
    "depth": <0.0–1.0>,
    "tradeoffAwareness": <0.0–1.0>,
    "realWorldApplicability": <0.0–1.0>,
    "composite": <weighted average>,
    "status": <"strong"|"partial"|"weak">
  },
  "next_action": <"advance"|"followup"|"mark_gap_advance"|"complete">,
  "followup_question": <string or null>,
  "reasoning": <one sentence>
}

Thresholds: composite ≥ 0.75 → strong/advance. 0.45–0.74 → partial/followup. < 0.45 → weak/mark_gap_advance.
```

---

## 10. API Route Conventions

> **Agent Rule:** Every API route handler must follow this exact pattern. No exceptions.

```typescript
// Template: app/api/{resource}/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { z } from "zod";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

const RequestSchema = z.object({
  // define exact shape
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await getServerSession(nextAuthConfig);
    if (!session)
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });

    // 2. Role check (if required)
    if (session.user.role !== "STUDENT") {
      return NextResponse.json(apiError("FORBIDDEN", "Insufficient role"), {
        status: 403,
      });
    }

    // 3. Input validation
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError("VALIDATION_ERROR", parsed.error.message),
        { status: 400 },
      );
    }

    // 4. Business logic (call lib/ service — never inline business logic here)
    const result = await someService(parsed.data);

    // 5. Return
    return NextResponse.json(apiSuccess(result), { status: 200 });
  } catch (err) {
    console.error("[API_ERROR]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong"),
      { status: 500 },
    );
  }
}
```

---

## 11. External Integrations

| Integration                         | Purpose                                                | MVP Approach                                  | Fallback                                                               |
| ----------------------------------- | ------------------------------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------- |
| Anthropic API (`claude-sonnet-4-6`) | Assessment question generation and response evaluation | Live API call — required for demo             | If `ANTHROPIC_API_KEY` is missing, throw at startup with clear message |
| Supabase PostgreSQL                 | Primary database                                       | Live — required                               | None; app will not start without `DATABASE_URL`                        |
| Supabase Storage                    | Student file uploads (resume, certificates)            | Live — use Supabase client                    | Mock file URL if storage bucket unavailable                            |
| NextAuth.js (Credentials)           | Email + password auth                                  | Live — no OAuth provider required for MVP     | N/A                                                                    |
| NPTEL / course links                | Learning recommendations per concept node              | Static hardcoded URLs in knowledge graph JSON | N/A — static by design                                                 |

---

## 12. Fault Tolerance and Hackathon Guardrails

### Latency Budgets (for judges' live demo)

| Operation                            | Target  | Hard Limit       |
| ------------------------------------ | ------- | ---------------- |
| Assessment question generation (LLM) | < 4s    | 10s with timeout |
| Assessment response evaluation (LLM) | < 5s    | 12s with timeout |
| Opportunity feed (match scoring)     | < 1s    | 3s               |
| Portfolio page load                  | < 800ms | 2s               |
| Dashboard charts                     | < 1.5s  | 4s               |

### Error Handling Rules

1. **LLM timeout:** If Anthropic API does not respond within 12s, return `{ error: "ASSESSMENT_TIMEOUT" }` with a user-friendly message: "The assessment is taking longer than expected. Your progress is saved — click Continue to resume."
2. **LLM malformed JSON:** If the LLM response cannot be parsed as valid `LLMEvaluationResponse`, retry once with the same prompt. On second failure, log error and assign `composite: 0.5, next_action: "advance"` (safe default — do not crash the session).
3. **DB connection failure:** All Prisma calls are wrapped in try/catch. Return `apiError('DB_ERROR', ...)` with status 503.
4. **Missing environment variable:** On app startup (`next.config.ts`), validate presence of `DATABASE_URL`, `NEXTAUTH_SECRET`, and `ANTHROPIC_API_KEY`. Throw with a descriptive message if any are missing.

### Demo Safety Seed Data

> Before the demo, run `pnpm db:seed` to populate:
>
> - 3 student accounts with completed assessment sessions and populated profiles
> - 2 industry accounts with posted internships and jobs
> - 1 academician account
> - 1 institutional admin account
> - Pre-computed demand vs. supply gap data

---

## 13. Role-Based Route Protection (middleware.ts)

```typescript
// middleware.ts — exact implementation
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    const roleMap: Record<string, string> = {
      STUDENT: "/student",
      INDUSTRY: "/industry",
      ACADEMICIAN: "/acad",
      INSTITUTIONAL_ADMIN: "/admin",
    };

    // Redirect to correct role dashboard if accessing root
    if (path === "/dashboard" && role) {
      return NextResponse.redirect(
        new URL(`${roleMap[role]}/dashboard`, req.url),
      );
    }

    // Block cross-role access
    for (const [r, prefix] of Object.entries(roleMap)) {
      if (path.startsWith(prefix) && role !== r) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    "/student/:path*",
    "/industry/:path*",
    "/admin/:path*",
    "/acad/:path*",
    "/api/((?!auth).*)",
  ],
};
```
