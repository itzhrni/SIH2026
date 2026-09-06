# SCHEMA.md

## SkillLedger — SIH 2026 · PS 26044

### Authoritative Database Schema Reference for Coding Agents (Dev 2, Dev 3, Dev 6)

> **Agent Instruction:** This document is the single source of truth for all database concerns.
>
> - Import Prisma client **only** from `@/lib/db` — never instantiate `PrismaClient` directly.
> - Never write raw SQL outside of Prisma migration files.
> - All `Json` field shapes are explicitly typed in comments — honour them exactly; malformed Json inserts will break runtime parsing.
> - Run `pnpm db:generate` after every schema change before writing any service code.

---

## 1. Authoritative Prisma Schema

```prisma
// prisma/schema.prisma
// ─────────────────────────────────────────────────────────────────────────────
// SKILLEDGER · SIH 2026 · PS 26044
// Single source of truth for all database models.
// DO NOT edit migration files manually. Use `pnpm db:push` (dev) or
// `pnpm db:migrate` (checkpoint). Never run db:push in production.
// ─────────────────────────────────────────────────────────────────────────────

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // PgBouncer URL — used by runtime
  directUrl = env("DIRECT_URL")     // Direct URL — used by migrations only
}

// ─── Enums ───────────────────────────────────────────────────────────────────

enum Role {
  STUDENT
  INDUSTRY
  ACADEMICIAN
  INSTITUTIONAL_ADMIN
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

enum GapSeverity {
  HIGH    // gap > 50 percentage points
  MEDIUM  // gap 20–50 percentage points
  LOW     // gap < 20 percentage points
}

// ─── Core User Model ─────────────────────────────────────────────────────────

model User {
  id          String  @id @default(cuid())
  email       String  @unique
  name        String
  passwordHash String  // bcryptjs hash — never store plaintext
  role        Role
  institution String? // Institution name (students, academicians, admins)
  department  String? // Department name (students, academicians)
  expertise   String? // Free-text areas of expertise (ACADEMICIAN only)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  skillProfile        SkillProfile?
  assessmentSessions  AssessmentSession[]
  applications        Application[]
  postings            Opportunity[]        @relation("PostedBy")
  studentInternships  InternshipRecord[]   @relation("StudentInternships")
  mentorInternships   InternshipRecord[]   @relation("MentorInternships")

  // NextAuth relations
  accounts  Account[]
  sessions  Session[]

  @@index([role])
  @@index([email])
  @@map("users")
}

// ─── Skill Profile ────────────────────────────────────────────────────────────

model SkillProfile {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Json shape:
  // Record<string, { score: number; lastUpdated: string }>
  // Key   = domain string matching KnowledgeGraph.domain (e.g. "dsa", "system-design")
  // score = 0–100 weighted composite across all assessed nodes in that domain
  // lastUpdated = ISO 8601 date string
  // Example: { "dsa": { "score": 72, "lastUpdated": "2026-01-15T10:30:00Z" } }
  domainScores Json @default("{}")

  // Json shape:
  // Record<string, { earned: boolean; earnedAt: string | null }>
  // Key     = domain string
  // earned  = true when student's domain score >= 75 in any completed session
  // earnedAt = ISO 8601 date string or null if not yet earned
  // Example: { "dsa": { "earned": true, "earnedAt": "2026-01-15T10:30:00Z" } }
  badges Json @default("{}")

  // Deferred for MVP — nullable. Will hold SJT composite score (0–100) post-MVP.
  softSkillScore Float?

  updatedAt DateTime @updatedAt

  // Relations
  scoreHistory SkillScoreHistory[]

  @@map("skill_profiles")
}

// ─── Skill Score History (Longitudinal Tracking — Core Novelty) ──────────────

model SkillScoreHistory {
  id        String       @id @default(cuid())
  profileId String
  profile   SkillProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  domain    String       // matches KnowledgeGraph.domain
  score     Float        // 0–100 domain score at the time of this session
  sessionId String       // references AssessmentSession.id (not a FK to allow orphan-safe reads)
  recordedAt DateTime    @default(now())

  @@index([profileId, domain])
  @@index([profileId, recordedAt])
  @@map("skill_score_history")
}

// ─── Assessment Session ───────────────────────────────────────────────────────

model AssessmentSession {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  domain  String // matches KnowledgeGraph.domain — e.g. "dsa", "ayurvedic-pharmacology"
  status  String // "in_progress" | "completed" — not an enum to allow future states without migration

  // Active concept node being assessed. Null when session is complete.
  currentNodeId String?

  // Monotonic counter incremented on every question turn within the session.
  turnIndex Int @default(0)

  // Json shape: KnowledgeGraph (full object snapshot)
  // Snapshot of the domain knowledge graph at session start.
  // Stored here so that graph changes do not affect in-flight or historical sessions.
  // See types/index.ts KnowledgeGraph interface for full shape.
  graphSnapshot Json

  // Json shape:
  // Record<string, {
  //   correctness: number;        // 0.0–1.0
  //   depth: number;              // 0.0–1.0
  //   tradeoffAwareness: number;  // 0.0–1.0
  //   realWorldApplicability: number; // 0.0–1.0
  //   composite: number;          // weighted average
  //   status: "strong" | "partial" | "weak" | "untested";
  //   questionAsked: string;
  //   answerGiven: string;
  // }>
  // Key = concept node id (e.g. "load-balancing")
  // Partial during session — grows as nodes are assessed.
  nodeResults Json @default("{}")

  createdAt   DateTime  @default(now())
  completedAt DateTime? // Set when status transitions to "completed"

  gapReport GapReport?

  @@index([userId, status])
  @@index([userId, domain])
  @@map("assessment_sessions")
}

// ─── Gap Report ───────────────────────────────────────────────────────────────

model GapReport {
  id        String            @id @default(cuid())
  sessionId String            @unique
  session   AssessmentSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  userId    String
  domain    String

  // Json shape: string[]
  // Array of concept node ids where composite score >= 0.75
  strongNodes Json @default("[]")

  // Json shape: string[]
  // Array of concept node ids where composite score 0.45–0.74
  partialNodes Json @default("[]")

  // Json shape: string[]
  // Array of concept node ids where composite score < 0.45
  weakNodes Json @default("[]")

  overallScore Float   // 0–100 weighted domain score for this session
  generatedAt  DateTime @default(now())

  @@index([userId])
  @@index([userId, domain])
  @@map("gap_reports")
}

// ─── Opportunity ──────────────────────────────────────────────────────────────

model Opportunity {
  id         String          @id @default(cuid())
  postedById String
  postedBy   User            @relation("PostedBy", fields: [postedById], references: [id], onDelete: Cascade)
  type       OpportunityType
  title      String
  description String         @db.Text

  // Json shape:
  // Array<{ skill: string; minThreshold: number }>
  // skill        = domain string matching KnowledgeGraph.domain
  // minThreshold = minimum student domain score (0–100) required to "meet" this skill
  // Example: [{ "skill": "dsa", "minThreshold": 60 }, { "skill": "system-design", "minThreshold": 50 }]
  requiredSkills Json @default("[]")

  // Json shape:
  // {
  //   yearOfStudy?: number[];   // e.g. [2, 3, 4] — 2nd, 3rd, 4th year students
  //   minCGPA?: number;         // e.g. 6.5
  //   institution?: string;     // restrict to a named institution or null for open
  // }
  eligibilityCriteria Json @default("{}")

  location     String?
  duration     String?  // Human-readable e.g. "2 months", "6 weeks"
  stipendRange String?  // Human-readable e.g. "₹10,000–₹15,000/month"
  deadline     DateTime
  isActive     Boolean  @default(true)

  // Json shape: string[]
  // Populated by demand pipeline NLP extraction from description text.
  // Array of domain strings extracted. Null until pipeline runs.
  skillsExtracted Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  applications Application[]

  @@index([type, isActive])
  @@index([postedById])
  @@index([deadline])
  @@map("opportunities")
}

// ─── Application ──────────────────────────────────────────────────────────────

model Application {
  id            String            @id @default(cuid())
  userId        String
  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  opportunityId String
  opportunity   Opportunity       @relation(fields: [opportunityId], references: [id], onDelete: Cascade)

  // Used for INTERNSHIP, FDP, FACULTY_INTERNSHIP, RESEARCH_PROJECT, CONSULTANCY, LEARNING_PROGRAM
  status        ApplicationStatus @default(APPLIED)

  // Used for JOB type opportunities only — null for all other types
  placementStatus PlacementStatus?

  // Snapshot of the student's match percentage at the moment of application.
  // Stored so historical match is preserved even if profile changes post-apply.
  matchScoreAtApply Float

  notes     String?  @db.Text // Recruiter/admin notes — not visible to applicant
  appliedAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, opportunityId]) // One application per student per opportunity
  @@index([opportunityId, status])
  @@index([userId, status])
  @@map("applications")
}

// ─── Internship Record ────────────────────────────────────────────────────────

model InternshipRecord {
  id          String  @id @default(cuid())
  studentId   String
  student     User    @relation("StudentInternships", fields: [studentId], references: [id], onDelete: Cascade)
  mentorId    String?
  mentor      User?   @relation("MentorInternships", fields: [mentorId], references: [id], onDelete: SetNull)

  companyName String
  role        String
  startDate   DateTime
  endDate     DateTime?
  isComplete  Boolean   @default(false)

  // Json shape:
  // Array<{
  //   week: number;          // 1-indexed week number
  //   log: string;           // student's weekly progress text
  //   submittedAt: string;   // ISO 8601 date string
  // }>
  progressLogs Json @default("[]")

  // Json shape (nullable — set on internship completion only):
  // {
  //   rating: number;        // 1–5 integer
  //   technicalScore: number; // 1–5 integer
  //   communicationScore: number; // 1–5 integer
  //   comments: string;
  //   submittedAt: string;   // ISO 8601 date string
  // }
  mentorFeedback Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([studentId])
  @@index([mentorId])
  @@map("internship_records")
}

// ─── NextAuth Required Models ─────────────────────────────────────────────────

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

## 2. Entity-Relationship Diagram (ASCII)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         SKILLEDGER — ER OVERVIEW                             │
│                   Cardinality: 1:1  1:N  N:M (via junction)                  │
└──────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │     User     │
                              │  (users)     │
                              └──────┬───────┘
                 ┌───────────────────┼──────────────────────┐
                 │ 1:1               │ 1:N                  │ 1:N
                 ▼                  ▼                       ▼
        ┌──────────────┐   ┌──────────────────┐   ┌─────────────────┐
        │ SkillProfile │   │AssessmentSession │   │   Opportunity   │
        │(skill_profiles│   │(assessment_      │   │ (opportunities) │
        │             )│   │  sessions)       │   │                 │
        └──────┬───────┘   └────────┬─────────┘   └────────┬────────┘
               │ 1:N               │ 1:1                   │ 1:N
               ▼                  ▼                        ▼
     ┌──────────────────┐  ┌────────────┐         ┌───────────────┐
     │SkillScoreHistory │  │  GapReport │         │  Application  │
     │(skill_score_     │  │(gap_reports│         │(applications) │
     │  history)        │  │           )│         │               │
     └──────────────────┘  └────────────┘         └───────────────┘
                                                         ▲
                                                         │ N:1
                                                         │
                                              ┌──────────┴──────┐
                                              │      User       │
                                              │  (applicant)    │
                                              └─────────────────┘

           User ──── 1:N ───► InternshipRecord ◄─── N:1 ──── User
          (student)                                          (mentor)

           User ──── 1:N ───► Account      [NextAuth]
           User ──── 1:N ───► Session      [NextAuth]


CARDINALITY SUMMARY
───────────────────────────────────────────────────────────
User          →  SkillProfile          1 : 0..1  (one student has one profile)
User          →  AssessmentSession     1 : N     (many sessions over time)
AssessmentSession → GapReport          1 : 0..1  (one report per completed session)
SkillProfile  →  SkillScoreHistory     1 : N     (one entry per completed session per domain)
User          →  Opportunity           1 : N     (industry user posts many opportunities)
User          →  Application           1 : N     (student applies to many opportunities)
Opportunity   →  Application           1 : N     (many students apply to one opportunity)
User (student)→  InternshipRecord      1 : N     (student can have multiple internship records)
User (mentor) →  InternshipRecord      1 : N     (mentor can supervise multiple interns)
───────────────────────────────────────────────────────────
```

---

## 3. Model & Field Data Dictionary

> Columns: **Field** · **Prisma Type** · **Nullable** · **Default** · **Description** · **Indexed**

### 3.1 User

| Field        | Prisma Type   | Nullable | Default   | Description                                  | Indexed |
| ------------ | ------------- | -------- | --------- | -------------------------------------------- | ------- |
| id           | String (cuid) | No       | cuid()    | Primary key                                  | PK      |
| email        | String        | No       | —         | Unique login email                           | UNIQUE  |
| name         | String        | No       | —         | Full display name                            | —       |
| passwordHash | String        | No       | —         | bcryptjs hash of password                    | —       |
| role         | Role (enum)   | No       | —         | Platform role                                | INDEX   |
| institution  | String        | Yes      | —         | Institution name                             | —       |
| department   | String        | Yes      | —         | Department name                              | —       |
| expertise    | String        | Yes      | —         | ACADEMICIAN only — free-text expertise areas | —       |
| createdAt    | DateTime      | No       | now()     | Row creation timestamp                       | —       |
| updatedAt    | DateTime      | No       | updatedAt | Auto-updated on every write                  | —       |

### 3.2 SkillProfile

| Field          | Prisma Type   | Nullable | Default   | Description                                                        | Indexed |
| -------------- | ------------- | -------- | --------- | ------------------------------------------------------------------ | ------- |
| id             | String (cuid) | No       | cuid()    | Primary key                                                        | PK      |
| userId         | String        | No       | —         | FK → users.id (CASCADE DELETE)                                     | UNIQUE  |
| domainScores   | Json          | No       | `{}`      | Map of domain → score + lastUpdated. See schema comment for shape. | —       |
| badges         | Json          | No       | `{}`      | Map of domain → badge status. See schema comment for shape.        | —       |
| softSkillScore | Float         | Yes      | —         | SJT composite score — deferred, nullable in MVP                    | —       |
| updatedAt      | DateTime      | No       | updatedAt | Auto-updated                                                       | —       |

### 3.3 SkillScoreHistory

| Field      | Prisma Type   | Nullable | Default | Description                                           | Indexed                                                |
| ---------- | ------------- | -------- | ------- | ----------------------------------------------------- | ------------------------------------------------------ |
| id         | String (cuid) | No       | cuid()  | Primary key                                           | PK                                                     |
| profileId  | String        | No       | —       | FK → skill_profiles.id (CASCADE DELETE)               | INDEX(profileId, domain), INDEX(profileId, recordedAt) |
| domain     | String        | No       | —       | Domain key matching KnowledgeGraph.domain             | —                                                      |
| score      | Float         | No       | —       | Domain score (0–100) at this session                  | —                                                      |
| sessionId  | String        | No       | —       | References AssessmentSession.id — soft reference only | —                                                      |
| recordedAt | DateTime      | No       | now()   | When this score snapshot was recorded                 | —                                                      |

### 3.4 AssessmentSession

| Field         | Prisma Type   | Nullable | Default | Description                                      | Indexed                                      |
| ------------- | ------------- | -------- | ------- | ------------------------------------------------ | -------------------------------------------- |
| id            | String (cuid) | No       | cuid()  | Primary key                                      | PK                                           |
| userId        | String        | No       | —       | FK → users.id (CASCADE DELETE)                   | INDEX(userId, status), INDEX(userId, domain) |
| domain        | String        | No       | —       | Domain being assessed                            | —                                            |
| status        | String        | No       | —       | `"in_progress"` or `"completed"`                 | —                                            |
| currentNodeId | String        | Yes      | —       | Active concept node id; null when complete       | —                                            |
| turnIndex     | Int           | No       | 0       | Monotonic question counter within session        | —                                            |
| graphSnapshot | Json          | No       | —       | Full KnowledgeGraph snapshot at session start    | —                                            |
| nodeResults   | Json          | No       | `{}`    | Per-node evaluation results. See schema comment. | —                                            |
| createdAt     | DateTime      | No       | now()   | Session start timestamp                          | —                                            |
| completedAt   | DateTime      | Yes      | —       | Set when status → "completed"                    | —                                            |

### 3.5 GapReport

| Field        | Prisma Type   | Nullable | Default | Description                                          | Indexed                      |
| ------------ | ------------- | -------- | ------- | ---------------------------------------------------- | ---------------------------- |
| id           | String (cuid) | No       | cuid()  | Primary key                                          | PK                           |
| sessionId    | String        | No       | —       | FK → assessment_sessions.id (CASCADE DELETE, UNIQUE) | UNIQUE                       |
| userId       | String        | No       | —       | Denormalised for fast student-scoped queries         | INDEX, INDEX(userId, domain) |
| domain       | String        | No       | —       | Domain of the completed session                      | —                            |
| strongNodes  | Json          | No       | `[]`    | string[] of concept node ids scoring ≥ 0.75          | —                            |
| partialNodes | Json          | No       | `[]`    | string[] of concept node ids scoring 0.45–0.74       | —                            |
| weakNodes    | Json          | No       | `[]`    | string[] of concept node ids scoring < 0.45          | —                            |
| overallScore | Float         | No       | —       | Weighted domain score for this session (0–100)       | —                            |
| generatedAt  | DateTime      | No       | now()   | Report generation timestamp                          | —                            |

### 3.6 Opportunity

| Field               | Prisma Type     | Nullable | Default   | Description                                             | Indexed               |
| ------------------- | --------------- | -------- | --------- | ------------------------------------------------------- | --------------------- |
| id                  | String (cuid)   | No       | cuid()    | Primary key                                             | PK                    |
| postedById          | String          | No       | —         | FK → users.id (CASCADE DELETE)                          | INDEX                 |
| type                | OpportunityType | No       | —         | Opportunity category                                    | INDEX(type, isActive) |
| title               | String          | No       | —         | Role/opportunity title                                  | —                     |
| description         | String (Text)   | No       | —         | Full description — NLP extraction runs on this          | —                     |
| requiredSkills      | Json            | No       | `[]`      | Array of `{ skill, minThreshold }`. See schema comment. | —                     |
| eligibilityCriteria | Json            | No       | `{}`      | Year/CGPA/institution filters. See schema comment.      | —                     |
| location            | String          | Yes      | —         | City or "Remote"                                        | —                     |
| duration            | String          | Yes      | —         | Human-readable duration                                 | —                     |
| stipendRange        | String          | Yes      | —         | Human-readable stipend                                  | —                     |
| deadline            | DateTime        | No       | —         | Application deadline                                    | INDEX                 |
| isActive            | Boolean         | No       | true      | Soft-delete flag                                        | —                     |
| skillsExtracted     | Json            | Yes      | —         | NLP-extracted domain strings from description           | —                     |
| createdAt           | DateTime        | No       | now()     | Creation timestamp                                      | —                     |
| updatedAt           | DateTime        | No       | updatedAt | Auto-updated                                            | —                     |

### 3.7 Application

| Field             | Prisma Type             | Nullable | Default   | Description                                  | Indexed                      |
| ----------------- | ----------------------- | -------- | --------- | -------------------------------------------- | ---------------------------- |
| id                | String (cuid)           | No       | cuid()    | Primary key                                  | PK                           |
| userId            | String                  | No       | —         | FK → users.id (CASCADE DELETE)               | INDEX(userId, status)        |
| opportunityId     | String                  | No       | —         | FK → opportunities.id (CASCADE DELETE)       | INDEX(opportunityId, status) |
| status            | ApplicationStatus       | No       | APPLIED   | Status for non-job opportunities             | —                            |
| placementStatus   | PlacementStatus         | Yes      | —         | Status for JOB type only; null otherwise     | —                            |
| matchScoreAtApply | Float                   | No       | —         | Match % snapshot at application time (0–100) | —                            |
| notes             | String (Text)           | Yes      | —         | Recruiter notes — not exposed to student     | —                            |
| appliedAt         | DateTime                | No       | now()     | Application submission timestamp             | —                            |
| updatedAt         | DateTime                | No       | updatedAt | Auto-updated on status change                | —                            |
| @@unique          | [userId, opportunityId] | —        | —         | Prevents duplicate applications              | UNIQUE CONSTRAINT            |

### 3.8 InternshipRecord

| Field          | Prisma Type   | Nullable | Default   | Description                                                | Indexed |
| -------------- | ------------- | -------- | --------- | ---------------------------------------------------------- | ------- |
| id             | String (cuid) | No       | cuid()    | Primary key                                                | PK      |
| studentId      | String        | No       | —         | FK → users.id (CASCADE DELETE)                             | INDEX   |
| mentorId       | String        | Yes      | —         | FK → users.id (SET NULL on mentor delete)                  | INDEX   |
| companyName    | String        | No       | —         | Company hosting the internship                             | —       |
| role           | String        | No       | —         | Internship role title                                      | —       |
| startDate      | DateTime      | No       | —         | Internship start date                                      | —       |
| endDate        | DateTime      | Yes      | —         | Internship end date — null if ongoing                      | —       |
| isComplete     | Boolean       | No       | false     | Set true when mentor submits final feedback                | —       |
| progressLogs   | Json          | No       | `[]`      | Array of weekly log entries. See schema comment.           | —       |
| mentorFeedback | Json          | Yes      | —         | End-of-internship structured feedback. See schema comment. | —       |
| createdAt      | DateTime      | No       | now()     | Record creation timestamp                                  | —       |
| updatedAt      | DateTime      | No       | updatedAt | Auto-updated                                               | —       |

### 3.9 NextAuth Models (Account, Session, VerificationToken)

> These models are managed entirely by NextAuth.js. Do not write to them directly in application code.

| Model             | Key Fields                                       | Purpose                                                    |
| ----------------- | ------------------------------------------------ | ---------------------------------------------------------- |
| Account           | userId (FK→User), provider, providerAccountId    | OAuth provider accounts (unused in MVP — credentials only) |
| Session           | sessionToken (unique), userId (FK→User), expires | NextAuth DB sessions (unused in MVP — JWT strategy)        |
| VerificationToken | identifier, token, expires                       | Email verification tokens (unused in MVP)                  |

> **MVP Note:** NextAuth is configured with `strategy: "jwt"` — the Session model will not be written to. Account and VerificationToken are also unused in Credentials-only MVP. These models are required in schema to satisfy the NextAuth Prisma adapter contract.

---

## 4. Cascade Behavior Reference

| Parent Deleted    | Affected Child                | Behavior                                                |
| ----------------- | ----------------------------- | ------------------------------------------------------- |
| User              | SkillProfile                  | CASCADE — profile deleted with user                     |
| User              | AssessmentSession             | CASCADE — all sessions deleted                          |
| User              | Application (as applicant)    | CASCADE — all applications deleted                      |
| User              | Opportunity (as poster)       | CASCADE — all posted opportunities deleted              |
| User              | InternshipRecord (as student) | CASCADE — record deleted                                |
| User (mentor)     | InternshipRecord (as mentor)  | SET NULL — record preserved, mentorId becomes null      |
| User              | Account, Session              | CASCADE — NextAuth records deleted                      |
| SkillProfile      | SkillScoreHistory             | CASCADE — history deleted with profile                  |
| AssessmentSession | GapReport                     | CASCADE — report deleted with session                   |
| Opportunity       | Application                   | CASCADE — applications deleted when opportunity deleted |

> **Agent Rule:** Never manually delete child records before parent deletion — cascades handle cleanup. Deleting a User is the only destructive operation that fans out. Confirm role and intent before issuing `prisma.user.delete()`.

---

## 5. Json Field Quick Reference

| Model.Field                       | TypeScript Shape                                                                                                | Notes                                          |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `SkillProfile.domainScores`       | `Record<string, { score: number; lastUpdated: string }>`                                                        | Updated after every session completion         |
| `SkillProfile.badges`             | `Record<string, { earned: boolean; earnedAt: string \| null }>`                                                 | `earned = true` when domain score ≥ 75         |
| `AssessmentSession.graphSnapshot` | `KnowledgeGraph` (see `types/index.ts`)                                                                         | Immutable after session start                  |
| `AssessmentSession.nodeResults`   | `Record<string, NodeEvaluation & { questionAsked: string; answerGiven: string; status: NodeStatus }>`           | Grows incrementally during session             |
| `GapReport.strongNodes`           | `string[]` (concept node ids)                                                                                   | Composite ≥ 0.75                               |
| `GapReport.partialNodes`          | `string[]` (concept node ids)                                                                                   | Composite 0.45–0.74                            |
| `GapReport.weakNodes`             | `string[]` (concept node ids)                                                                                   | Composite < 0.45                               |
| `Opportunity.requiredSkills`      | `Array<{ skill: string; minThreshold: number }>`                                                                | `skill` must match a `KnowledgeGraph.domain`   |
| `Opportunity.eligibilityCriteria` | `{ yearOfStudy?: number[]; minCGPA?: number; institution?: string }`                                            | All fields optional                            |
| `Opportunity.skillsExtracted`     | `string[]`                                                                                                      | Domain strings from NLP pipeline — may be null |
| `InternshipRecord.progressLogs`   | `Array<{ week: number; log: string; submittedAt: string }>`                                                     | Append-only — never overwrite existing entries |
| `InternshipRecord.mentorFeedback` | `{ rating: number; technicalScore: number; communicationScore: number; comments: string; submittedAt: string }` | Set once on completion                         |

---

## 6. Seed Strategy — SIH Demo Data

### 6.1 Required Demo Accounts

```typescript
// prisma/seed.ts — required demo profiles for SIH live demo

const DEMO_SEED = {
  students: [
    {
      // Student A — High performer: strong profile, portfolio badge earned
      email: "arjun.mehta@demo.skilledger.in",
      name: "Arjun Mehta",
      role: "STUDENT",
      institution: "IIT Madras",
      department: "Computer Science",
      // Has 3 completed assessment sessions (DSA, System Design, ML)
      // DSA score: 82 — badge earned
      // System Design score: 74 — partial
      // ML score: 61 — gap in deep learning nodes
    },
    {
      // Student B — Mid performer: 1 domain assessed, visible gaps
      email: "priya.nair@demo.skilledger.in",
      name: "Priya Nair",
      role: "STUDENT",
      institution: "PSG College of Technology",
      department: "Information Technology",
      // Has 1 completed session (DSA score: 58 — no badge)
      // Demonstrates pedigree-free comparison: Tier-3 vs IIT student
    },
    {
      // Student C — AYUSH domain: for Ministry of Ayush PS alignment demo
      email: "kavya.krishnan@demo.skilledger.in",
      name: "Kavya Krishnan",
      role: "STUDENT",
      institution: "All India Institute of Ayurveda",
      department: "Ayurvedic Medicine",
      // Has 1 completed session (Ayurvedic Pharmacology score: 78 — badge earned)
    },
  ],

  industry: [
    {
      // Industry A — Tech company: posts IT internships + jobs
      email: "talent@techcorp.demo.skilledger.in",
      name: "TechCorp Talent Team",
      role: "INDUSTRY",
      institution: "TechCorp India Pvt. Ltd.",
      // Posts: 1 DSA internship, 1 ML internship, 1 Backend Engineer job
    },
    {
      // Industry B — AYUSH/Healthcare: posts AYUSH-specific opportunities
      email: "hr@ayushclinic.demo.skilledger.in",
      name: "AyushCare Clinic HR",
      role: "INDUSTRY",
      institution: "AyushCare Wellness Pvt. Ltd.",
      // Posts: 1 clinical internship requiring Ayurvedic Pharmacology, 1 FDP
    },
  ],

  academician: {
    email: "dr.sharma@aiia.demo.skilledger.in",
    name: "Dr. Priya Sharma",
    role: "ACADEMICIAN",
    institution: "All India Institute of Ayurveda",
    department: "Dravyaguna",
    expertise:
      "Ayurvedic Pharmacology, Medicinal Plant Research, Clinical Ayurveda",
    // Browses and applies to FDP posted by AyushCare
  },

  admin: {
    email: "admin@aiia.demo.skilledger.in",
    name: "AIIA Placement Cell",
    role: "INSTITUTIONAL_ADMIN",
    institution: "All India Institute of Ayurveda",
    // Views dashboard: cohort skill distribution, placement stats, demand gap chart
  },
};
```

### 6.2 Demo Data Checklist (run before every judging session)

```bash
pnpm db:reset   # Wipe and re-migrate (dev only)
pnpm db:seed    # Load all demo data fresh
```

| Required data point                                | Source                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------- |
| 3 students with completed assessment sessions      | Seed inserts AssessmentSession + GapReport + SkillScoreHistory    |
| Student A — 3 domain scores, 1 badge earned        | domainScores + badges populated in SkillProfile                   |
| Student B — 1 domain score, no badge               | Demonstrates gap; pedigree contrast                               |
| Student C — AYUSH domain assessed                  | Validates PS/Ministry domain scope                                |
| 2 industry accounts with 5+ postings               | Mix of INTERNSHIP, JOB, FDP types                                 |
| Applications: Student A applied to 2 opportunities | status: APPLIED and SHORTLISTED                                   |
| 1 active InternshipRecord for Student B            | With 2 progress logs submitted                                    |
| Admin dashboard shows populated charts             | Demand gap + cohort data derive from seeded postings and profiles |

---

## 7. Concurrent Session Guardrails

### 7.1 The Core Risk

A student may open the assessment UI in two browser tabs simultaneously. This creates concurrent writes to `AssessmentSession.nodeResults` and `AssessmentSession.turnIndex`, causing race conditions and data corruption.

### 7.2 Prevention Rules

**Rule C-01 — One Active Session Per User Per Domain**

Before creating a new session, check and enforce at the service layer:

```typescript
// lib/assessment/engine.ts
const existing = await prisma.assessmentSession.findFirst({
  where: { userId, domain, status: "in_progress" },
  select: { id: true },
});
if (existing) {
  // Return existing session — do not create a new one
  return { sessionId: existing.id, resumed: true };
}
```

**Rule C-02 — Atomic turnIndex Increment**

Never read `turnIndex`, increment in application code, then write back. Use Prisma's atomic increment:

```typescript
await prisma.assessmentSession.update({
  where: { id: sessionId },
  data: {
    turnIndex: { increment: 1 },
    currentNodeId: nextNodeId,
    nodeResults: updatedNodeResults, // full Json object replace
  },
});
```

**Rule C-03 — Optimistic Locking on nodeResults**

When writing node evaluation results, include `turnIndex` in the where clause to reject stale writes:

```typescript
const updated = await prisma.assessmentSession.updateMany({
  where: {
    id: sessionId,
    turnIndex: expectedTurnIndex, // reject if another write already advanced this
  },
  data: { nodeResults: newResults, turnIndex: { increment: 1 } },
});
if (updated.count === 0) {
  throw new Error("SESSION_CONCURRENT_WRITE — stale turn rejected");
}
```

**Rule C-04 — Session Completion is Idempotent**

The session completion handler (generating GapReport + updating SkillProfile) must be idempotent. Use `upsert` or check for existing GapReport before writing:

```typescript
const existing = await prisma.gapReport.findUnique({ where: { sessionId } });
if (existing) return existing; // Already completed — return cached report
```

**Rule C-05 — No Deadlock from Cascade Chains**

User deletion cascades through: SkillProfile → SkillScoreHistory and AssessmentSession → GapReport in parallel. Prisma handles cascade order internally. Do not wrap user deletion in a transaction that also touches child models — let the DB cascade handle it.

---

## 8. Indexes Summary

| Table               | Index                   | Type   | Purpose                          |
| ------------------- | ----------------------- | ------ | -------------------------------- |
| users               | email                   | UNIQUE | Login lookup                     |
| users               | role                    | INDEX  | Role-scoped queries              |
| skill_score_history | (profileId, domain)     | INDEX  | Timeline fetch per domain        |
| skill_score_history | (profileId, recordedAt) | INDEX  | Chronological chart queries      |
| assessment_sessions | (userId, status)        | INDEX  | Active session lookup            |
| assessment_sessions | (userId, domain)        | INDEX  | Domain history queries           |
| gap_reports         | userId                  | INDEX  | Student gap report listing       |
| gap_reports         | (userId, domain)        | INDEX  | Domain-specific report fetch     |
| opportunities       | (type, isActive)        | INDEX  | Filtered opportunity feed        |
| opportunities       | deadline                | INDEX  | Deadline-sorted listing          |
| opportunities       | postedById              | INDEX  | Industry's own postings          |
| applications        | (opportunityId, status) | INDEX  | Recruiter pipeline view          |
| applications        | (userId, status)        | INDEX  | Student application tracker      |
| applications        | (userId, opportunityId) | UNIQUE | Duplicate application prevention |
| internship_records  | studentId               | INDEX  | Student's internship history     |
| internship_records  | mentorId                | INDEX  | Mentor's supervised interns      |
