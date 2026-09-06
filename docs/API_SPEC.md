# API Specification — SkillLedger

> **Owner:** Member 3 (M3) · **Last Updated:** 2026-09-06  
> **Source of Truth:** This document. Every endpoint below mirrors the exact implementation in `app/api/`.  
> **Governing Docs:** `Work_Split.md` (§ M3 Key Responsibilities), `ARCHITECTURE.md` §5, `SCHEMA.md` §5.  
> **Scope:** All 15 endpoints across M3 (Internship Tracker), M5 (Industry + Candidate Discovery), M6 (Auth + Admin + Analytics).

---

## Table of Contents

- [Global Conventions](#global-conventions)
- [M3 Module: Internship Management](#m3-module-internship-management)
  - [POST /api/opportunities — Create Opportunity](#post-apioportunities--create-opportunity)
  - [GET /api/opportunities — List Active Opportunities](#get-apioportunities--list-active-opportunities)
  - [POST /api/opportunities/[id]/apply — Apply to Opportunity](#post-apioportunitiesidapply--apply-to-opportunity)
  - [PATCH /api/applications/[id]/status — Update Application Status](#patch-apiapplicationsidstatus--update-application-status)
  - [GET /api/internships/[id]/tracker — Fetch Internship Record](#get-apiinternshipsidtracker--fetch-internship-record)
  - [POST /api/internships/[id]/tracker — Submit Weekly Progress Log](#post-apiinternshipsidtracker--submit-weekly-progress-log)
  - [POST /api/internships/[id]/feedback — Submit Mentor Feedback](#post-apiinternshipsidfeedback--submit-mentor-feedback)
- [M6 Module: Auth & User Profile](#m6-module-auth--user-profile)
  - [POST /api/auth/[...nextauth] — NextAuth Session Handler](#post-apiauthnextauth--nextauth-session-handler)
  - [POST /api/register — User Registration](#post-apiregister--user-registration)
  - [GET /api/user/profile — Fetch User Profile](#get-apiuserprofile--fetch-user-profile)
  - [PATCH /api/user/profile — Update User Profile](#patch-apiuserprofile--update-user-profile)
- [M6 Module: Applications](#m6-module-applications)
  - [GET /api/applications — List User Applications](#get-apiapplications--list-user-applications)
- [M5 Module: Candidate Discovery](#m5-module-candidate-discovery)
  - [GET /api/candidates — Search Students by Skill Criteria](#get-apicandidates--search-students-by-skill-criteria)
- [M6 Module: Analytics](#m6-module-analytics)
  - [GET /api/analytics/cohort — Cohort Skill Readiness](#get-apianalyticscohort--cohort-skill-readiness)
  - [GET /api/analytics/demand — Demand vs Supply Gap](#get-apianalyticsdemand--demand-vs-supply-gap)
  - [GET /api/analytics/placement — Placement Pipeline Stats](#get-apianalyticsplacement--placement-pipeline-stats)
- [Type Reference](#type-reference)

---

## Global Conventions

### HTTP Status Codes

| Code | Meaning                                |
| ---- | -------------------------------------- |
| 200  | Success (GET, PATCH)                   |
| 201  | Created (POST create)                  |
| 400  | Validation Error                       |
| 401  | Unauthorized — no valid session        |
| 403  | Forbidden — role or ownership mismatch |
| 404  | Not Found                              |
| 409  | Conflict — duplicate or terminal state |
| 410  | Gone — opportunity expired or inactive |
| 500  | Internal Server Error                  |

### Authentication & RBAC

All routes require a valid NextAuth session via `getServerSession(nextAuthConfig)`.  
Missing session → `401 UNAUTHORIZED`.  
Role gate → `403 FORBIDDEN` (role per route documented below).

### Response Envelope

Every response uses the standard `ApiResponse<T>` envelope from `@/lib/utils/api-response.ts`:

```typescript
interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: {
    code: string; // e.g. "UNAUTHORIZED", "VALIDATION_ERROR", "CONFLICT"
    message: string; // human-readable, shown in UI error states
  };
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

**Example successful response:**

```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "status": "APPLIED",
    "matchScoreAtApply": 78,
    "appliedAt": "2026-09-05T12:00:00Z"
  }
}
```

**Example error response:**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "You have already applied to this opportunity"
  }
}
```

---

## M3 Module: Internship Management

---

### POST /api/opportunities — Create Opportunity

**Description:** Creates a new active internship/job/FDP posting.

| Property       | Value                     |
| -------------- | ------------------------- |
| **Auth**       | Required                  |
| **Role**       | `INDUSTRY` only           |
| **Rate Limit** | None enforced (prototype) |

#### Request

```
POST /api/opportunities
Content-Type: application/json
```

**Body (Zod schema: `PostOpportunitySchema`):**

| Field                 | Type                  | Required | Validation                                                                                                            |
| --------------------- | --------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `type`                | `enum`                | Yes      | `"INTERNSHIP" \| "JOB" \| "FDP" \| "FACULTY_INTERNSHIP" \| "RESEARCH_PROJECT" \| "CONSULTANCY" \| "LEARNING_PROGRAM"` |
| `title`               | `string`              | Yes      | `min(1), max(200)`                                                                                                    |
| `description`         | `string`              | Yes      | `min(1)`                                                                                                              |
| `requiredSkills`      | `RequiredSkill[]`     | Yes      | Array with at least 1 item                                                                                            |
| `eligibilityCriteria` | `EligibilityCriteria` | No       | Defaults to `{}`                                                                                                      |
| `location`            | `string`              | No       | —                                                                                                                     |
| `duration`            | `string`              | No       | —                                                                                                                     |
| `stipendRange`        | `string`              | No       | —                                                                                                                     |
| `deadline`            | `string (ISO 8601)`   | Yes      | Valid datetime                                                                                                        |

**`requiredSkills` item (`RequiredSkillSchema`):**

| Field          | Type     | Validation         |
| -------------- | -------- | ------------------ |
| `skill`        | `string` | `min(1)`           |
| `minThreshold` | `number` | `min(0), max(100)` |

**`eligibilityCriteria` (`EligibilitySchema`):**

| Field         | Type       | Validation        |
| ------------- | ---------- | ----------------- |
| `yearOfStudy` | `number[]` | Integers `1–6`    |
| `minCGPA`     | `number`   | `min(0), max(10)` |
| `institution` | `string`   | —                 |

**Example Request:**

```json
{
  "type": "INTERNSHIP",
  "title": "Backend Developer Intern",
  "description": "Work on microservices architecture...",
  "requiredSkills": [
    { "skill": "TypeScript", "minThreshold": 60 },
    { "skill": "PostgreSQL", "minThreshold": 50 }
  ],
  "eligibilityCriteria": {
    "yearOfStudy": [3, 4],
    "minCGPA": 7.0
  },
  "location": "Bangalore",
  "duration": "3 months",
  "deadline": "2026-10-01T00:00:00Z"
}
```

#### Response

**Success `201`:**

```json
{
  "success": true,
  "data": {
    "id": "opt_abc123",
    "type": "INTERNSHIP",
    "title": "Backend Developer Intern",
    "description": "Work on microservices architecture...",
    "requiredSkills": [
      { "skill": "TypeScript", "minThreshold": 60 },
      { "skill": "PostgreSQL", "minThreshold": 50 }
    ],
    "eligibilityCriteria": { "yearOfStudy": [3, 4], "minCGPA": 7.0 },
    "location": "Bangalore",
    "duration": "3 months",
    "stipendRange": null,
    "deadline": "2026-10-01T00:00:00Z",
    "isActive": true,
    "createdAt": "2026-09-05T12:00:00Z"
  }
}
```

**Error `401` — UNAUTHORIZED:**

```json
{
  "success": false,
  "error": { "code": "UNAUTHORIZED", "message": "Not authenticated" }
}
```

**Error `403` — FORBIDDEN:**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Only industry partners can post opportunities"
  }
}
```

**Error `400` — VALIDATION_ERROR:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "<first Zod issue message>"
  }
}
```

---

### GET /api/opportunities — List Active Opportunities

**Description:** Returns all active, non-expired opportunities.  
**Role-Open:** Available to all authenticated roles (`STUDENT`, `INDUSTRY`, `INSTITUTIONAL_ADMIN`, `ACADEMICIAN`).  
**STUDENT enrichment:** For `STUDENT` callers, each opportunity is enriched with a server-computed `matchScore`, `metSkills`, and `gapSkills` derived from the student's live `SkillProfile.domainScores`. Results are sorted descending by `matchScore`. Non-student callers receive the raw listing without match data.

| Property         | Value                                       |
| ---------------- | ------------------------------------------- |
| **Auth**         | Required                                    |
| **Role**         | All (no gate)                               |
| **Query Params** | `?type=<OpportunityType>` (optional filter) |

#### Request

```
GET /api/opportunities?type=INTERNSHIP
```

**Query Parameters:**

| Parameter | Type   | Required | Description                                                                                                                                                     |
| --------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`    | `enum` | No       | Filter by opportunity type. Valid values: `"INTERNSHIP" \| "JOB" \| "FDP" \| "FACULTY_INTERNSHIP" \| "RESEARCH_PROJECT" \| "CONSULTANCY" \| "LEARNING_PROGRAM"` |

**Filtering Logic:** Only opportunities where `isActive === true` AND `deadline >= now` are returned.

#### Response

**For STUDENT callers — `200` (enriched):**

```json
{
  "success": true,
  "data": [
    {
      "id": "opt_abc123",
      "type": "INTERNSHIP",
      "title": "Backend Developer Intern",
      "description": "Work on microservices architecture...",
      "requiredSkills": [
        { "skill": "TypeScript", "minThreshold": 60 },
        { "skill": "PostgreSQL", "minThreshold": 50 }
      ],
      "location": "Bangalore",
      "duration": "3 months",
      "stipendRange": null,
      "deadline": "2026-10-01T00:00:00Z",
      "createdAt": "2026-09-05T12:00:00Z",
      "postedBy": {
        "id": "usr_ind1",
        "name": "Acme Corp",
        "institution": null
      },
      "matchScore": 75,
      "metSkills": ["TypeScript", "PostgreSQL"],
      "gapSkills": []
    }
  ]
}
```

> **Match Score Formula** (per `ARCHITECTURE.md` §5):  
> `matchScore = round((Σ min(studentScore[skill] / minThreshold[skill], 1)) / n) × 100`  
> Each skill is weighted equally (uniform weighting). Ratio is capped at 1.0 so exceeding a threshold never inflates the score beyond 100%.

**For non-STUDENT callers — `200` (raw listing, no match fields):**

```json
{
  "success": true,
  "data": [
    {
      "id": "opt_abc123",
      "type": "INTERNSHIP",
      "title": "Backend Developer Intern",
      "description": "Work on microservices architecture...",
      "requiredSkills": [
        { "skill": "TypeScript", "minThreshold": 60 },
        { "skill": "PostgreSQL", "minThreshold": 50 }
      ],
      "eligibilityCriteria": { "yearOfStudy": [3, 4], "minCGPA": 7.0 },
      "location": "Bangalore",
      "duration": "3 months",
      "stipendRange": null,
      "deadline": "2026-10-01T00:00:00Z",
      "createdAt": "2026-09-05T12:00:00Z",
      "postedBy": { "id": "usr_ind1", "name": "Acme Corp", "institution": null }
    }
  ]
}
```

---

### POST /api/opportunities/[id]/apply — Apply to Opportunity

**Description:** Creates an application for the specified opportunity.  
**Server-computed match:** The `matchScoreAtApply` snapshot is derived server-side from the student's live `SkillProfile.domainScores`. No client-supplied `matchScore` is accepted — the request body is intentionally empty. This prevents score inflation.

| Property | Value                      |
| -------- | -------------------------- |
| **Auth** | Required                   |
| **Role** | `STUDENT` only             |
| **Body** | None (intentionally empty) |

#### Request

```
POST /api/opportunities/opt_abc123/apply
```

**Path Parameters:**

| Parameter | Type     | Description    |
| --------- | -------- | -------------- |
| `id`      | `string` | Opportunity ID |

**Body:** Empty (request body is consumed but not parsed — `await req.text()`).

#### Validation Gates (in order)

1. **Opportunity must exist** → `404 NOT_FOUND`
2. **Opportunity must be active and not expired** → `410 GONE` if `!isActive || deadline < now`
3. **No duplicate application** (unique constraint on `userId_opportunityId`) → `409 CONFLICT`
4. **matchScore computed** from student's `SkillProfile.domainScores` via `computeOpportunityMatch()` service

#### Response

**Success `201`:**

```json
{
  "success": true,
  "data": {
    "id": "app_xyz789",
    "status": "APPLIED",
    "matchScoreAtApply": 75,
    "appliedAt": "2026-09-05T12:00:00Z"
  }
}
```

**Error `404` — NOT_FOUND:**

```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Opportunity not found" }
}
```

**Error `410` — GONE:**

```json
{
  "success": false,
  "error": {
    "code": "GONE",
    "message": "This opportunity is no longer accepting applications"
  }
}
```

**Error `409` — CONFLICT:**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "You have already applied to this opportunity"
  }
}
```

---

### PATCH /api/applications/[id]/status — Update Application Status

**Description:** Moves a candidate through the application pipeline.  
**Ownership guard:** The requesting industry user must be the owner of the posting (verified via `application.opportunity.postedById === session.user.id`).

| Property | Value           |
| -------- | --------------- |
| **Auth** | Required        |
| **Role** | `INDUSTRY` only |

#### Request

```
PATCH /api/applications/app_xyz789/status
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type     | Description    |
| --------- | -------- | -------------- |
| `id`      | `string` | Application ID |

**Body (Zod schema: `UpdateStatusSchema`):**

| Field             | Type     | Required                                                         | Validation                                                                                                        |
| ----------------- | -------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `status`          | `enum`   | At least one of `status`, `placementStatus`, or `notes` required | `"APPLIED" \| "UNDER_REVIEW" \| "SHORTLISTED" \| "INTERVIEW_SCHEDULED" \| "SELECTED" \| "NOT_SELECTED"`           |
| `placementStatus` | `enum`   | See above                                                        | `"APPLIED" \| "REVIEWED" \| "SHORTLISTED" \| "INTERVIEW_SCHEDULED" \| "OFFER_EXTENDED" \| "JOINED" \| "REJECTED"` |
| `notes`           | `string` | See above                                                        | `max(2000)`                                                                                                       |

> **Two pipelines coexist on the Application model:**
>
> - `status` — application tracking (`Applied → Under Review → Shortlisted → Interview Scheduled → Selected / Not Selected`)
> - `placementStatus` — placement pipeline (`Applied → Reviewed → Shortlisted → Interview Scheduled → Offer Extended → Joined / Rejected`)

**Example Request:**

```json
{
  "placementStatus": "SHORTLISTED",
  "notes": "Strong TypeScript background, good culture fit"
}
```

#### Response

**Success `200`:**

```json
{
  "success": true,
  "data": {
    "id": "app_xyz789",
    "status": "UNDER_REVIEW",
    "placementStatus": "SHORTLISTED",
    "notes": "Strong TypeScript background, good culture fit",
    "updatedAt": "2026-09-06T10:00:00Z"
  }
}
```

**Error `400` — VALIDATION_ERROR (no fields provided):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "At least one of status, placementStatus, or notes is required"
  }
}
```

**Error `403` — FORBIDDEN (ownership mismatch):**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not own the posting for this application"
  }
}
```

---

### GET /api/internships/[id]/tracker — Fetch Internship Record

**Description:** Retrieves an internship record including progress logs and mentor feedback.

| Property | Value                                                                              |
| -------- | ---------------------------------------------------------------------------------- |
| **Auth** | Required                                                                           |
| **Role** | `STUDENT` (self), `INDUSTRY` (assigned mentor), `INSTITUTIONAL_ADMIN` (any record) |

#### Request

```
GET /api/internships/rec_intern123/tracker
```

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `id`      | `string` | Internship Record ID |

#### Response

**Success `200`:**

```json
{
  "success": true,
  "data": {
    "id": "rec_intern123",
    "studentId": "usr_stu1",
    "mentorId": "usr_ind1",
    "companyName": "Acme Corp",
    "role": "Backend Developer Intern",
    "startDate": "2026-09-01T00:00:00Z",
    "endDate": null,
    "isComplete": false,
    "progressLogs": [
      {
        "week": 1,
        "log": "Set up development environment and reviewed existing codebase...",
        "submittedAt": "2026-09-08T14:00:00Z"
      }
    ],
    "mentorFeedback": null,
    "createdAt": "2026-09-01T00:00:00Z",
    "student": {
      "id": "usr_stu1",
      "name": "Rohan Sharma",
      "institution": "IIT Delhi",
      "department": "Computer Science"
    },
    "mentor": {
      "id": "usr_ind1",
      "name": "Priya Patel"
    }
  }
}
```

**Error `403` — FORBIDDEN (access denied):**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have access to this internship record"
  }
}
```

---

### POST /api/internships/[id]/tracker — Submit Weekly Progress Log

**Description:** Student submits a weekly progress log.  
**Append-only:** Each week number is unique per record — duplicate submissions are rejected.  
**Blocked when complete:** If `isComplete === true`, no further logs are accepted.

| Property | Value                                                                        |
| -------- | ---------------------------------------------------------------------------- |
| **Auth** | Required                                                                     |
| **Role** | `STUDENT` only (self only — verifies `record.studentId === session.user.id`) |

#### Request

```
POST /api/internships/rec_intern123/tracker
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `id`      | `string` | Internship Record ID |

**Body (Zod schema: `ProgressLogSchema`):**

| Field  | Type     | Required | Validation                      |
| ------ | -------- | -------- | ------------------------------- |
| `week` | `number` | Yes      | Integer `min(1), max(52)`       |
| `log`  | `string` | Yes      | `min(10), max(2000)` characters |

**Example Request:**

```json
{
  "week": 2,
  "log": "Implemented REST endpoints for user management. Set up Docker containers for local database."
}
```

#### Validation Gates (in order)

1. **Internship record must exist** → `404 NOT_FOUND`
2. **Caller must be the student** → `403 FORBIDDEN`
3. **Record must not be complete** → `409 CONFLICT`
4. **Week must not already have a log** → `409 CONFLICT`

#### Response

**Success `200`:**

```json
{
  "success": true,
  "data": {
    "id": "rec_intern123",
    "progressLogs": [
      { "week": 1, "log": "...", "submittedAt": "2026-09-08T14:00:00Z" },
      {
        "week": 2,
        "log": "Implemented REST endpoints...",
        "submittedAt": "2026-09-15T10:30:00Z"
      }
    ],
    "updatedAt": "2026-09-15T10:30:00Z"
  }
}
```

**Error `409` — CONFLICT (duplicate week):**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "A log for week 2 has already been submitted"
  }
}
```

**Error `409` — CONFLICT (internship complete):**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "This internship is already marked as complete"
  }
}
```

---

### POST /api/internships/[id]/feedback — Submit Mentor Feedback

**Description:** Industry mentor submits end-of-internship feedback.  
**Idempotency guard:** Once `mentorFeedback` exists and `isComplete === true`, a second submission is rejected with `409 CONFLICT`.  
**Effect:** Setting feedback marks the record as complete (`isComplete: true`, `endDate: today`).

| Property | Value                                                                       |
| -------- | --------------------------------------------------------------------------- |
| **Auth** | Required                                                                    |
| **Role** | `INDUSTRY` only (ownership verified: `record.mentorId === session.user.id`) |

#### Request

```
POST /api/internships/rec_intern123/feedback
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `id`      | `string` | Internship Record ID |

**Body (Zod schema: `FeedbackSchema`):**

| Field                | Type     | Required | Validation                                |
| -------------------- | -------- | -------- | ----------------------------------------- |
| `rating`             | `number` | Yes      | Integer `min(1), max(5)` — overall rating |
| `technicalScore`     | `number` | Yes      | Integer `min(1), max(5)`                  |
| `communicationScore` | `number` | Yes      | Integer `min(1), max(5)`                  |
| `comments`           | `string` | Yes      | `min(10), max(3000)` characters           |

**Example Request:**

```json
{
  "rating": 4,
  "technicalScore": 5,
  "communicationScore": 3,
  "comments": "Excellent technical skills, demonstrated strong problem-solving. Could improve presentation of progress updates."
}
```

#### Validation Gates (in order)

1. **Internship record must exist** → `404 NOT_FOUND`
2. **Caller must be the assigned mentor** → `403 FORBIDDEN`
3. **No duplicate feedback** (idempotency: `isComplete && mentorFeedback` exist) → `409 CONFLICT`

#### Response

**Success `200`:**

```json
{
  "success": true,
  "data": {
    "id": "rec_intern123",
    "isComplete": true,
    "mentorFeedback": {
      "rating": 4,
      "technicalScore": 5,
      "communicationScore": 3,
      "comments": "Excellent technical skills...",
      "submittedAt": "2026-10-15T16:00:00Z"
    },
    "endDate": "2026-10-15T00:00:00Z",
    "updatedAt": "2026-10-15T16:00:00Z"
  }
}
```

---

## M6 Module: Auth & User Profile

### POST /api/auth/[...nextauth] — NextAuth Session Handler

Public endpoint. Delegates to NextAuth.js with the configured JWT strategy and credential provider.

**Request:** N/A (handled by NextAuth.js via `credentials` login, `callbacks` on session/jwt)

**Response:** Sets session cookie. Consumed by all protected routes via `getServerSession(nextAuthConfig)`.

---

### POST /api/register — User Registration

Public endpoint. Creates a new user with the specified role. Idempotent by email.

**Request Body:**

```json
{
  "name": "string", // min 2 characters
  "email": "string", // valid email (stored lowercase)
  "password": "string", // min 8 characters
  "role": "STUDENT|INDUSTRY|ACADEMICIAN|INSTITUTIONAL_ADMIN",
  "institution": "string", // optional
  "department": "string", // optional
  "expertise": "string" // optional (academician field)
}
```

**Validation Gates:**

1. All required fields present
2. Email format valid
3. Password min 8 chars
4. Role is one of the 4 in-scope values
5. Email not already registered → `409 CONFLICT`

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "id": "usr_xxx",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "STUDENT"
  }
}
```

---

### GET /api/user/profile — Fetch User Profile

Authenticated. Returns the current user's profile data.

**Auth:** All roles

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "usr_xxx",
    "name": "John Doe",
    "email": "student@example.com",
    "role": "STUDENT",
    "institution": "MIT",
    "department": "CS",
    "expertise": null
  }
}
```

---

### PATCH /api/user/profile — Update User Profile

Authenticated. Updates any combination of name, institution, department, expertise.

**Auth:** All roles

**Request Body:**

```json
{
  "name": "string", // optional, min 2
  "institution": "string", // optional, nullable
  "department": "string", // optional, nullable
  "expertise": "string" // optional, nullable
}
```

**Response `200`:** Same shape as GET /api/user/profile (full user object).

---

## M6 Module: Applications

### GET /api/applications — List User Applications

Authenticated. Returns all applications submitted by the logged-in user (Student or Academician), ordered by `appliedAt` descending.

**Auth:** `STUDENT`, `ACADEMICIAN`

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "app_xxx",
      "status": "APPLIED",
      "placementStatus": null,
      "matchScoreAtApply": 78,
      "appliedAt": "2026-09-01T12:00:00Z",
      "opportunity": {
        "id": "opp_xxx",
        "title": "Backend Engineer Intern",
        "type": "INTERNSHIP",
        "location": "Remote",
        "duration": "3 months",
        "stipendRange": "$500-$800",
        "deadline": "2026-09-30T00:00:00Z",
        "postedBy": {
          "id": "usr_rec1",
          "name": "Vikram",
          "institution": "TechCorp"
        }
      }
    }
  ]
}
```

---

## M5 Module: Candidate Discovery

### GET /api/candidates — Search Students by Skill Criteria

Gated to Industry and Institutional Admin roles. Returns ranked students based on skill match, domain, department, or institution filters. Uses `searchCandidates()` from `lib/matching/candidate-discovery.ts`.

**Auth:** `INDUSTRY`, `INSTITUTIONAL_ADMIN`

**Query Parameters:**

| Param         | Type   | Required | Description                                                    |
| ------------- | ------ | -------- | -------------------------------------------------------------- |
| `skills`      | string | No       | Comma-separated skill names (e.g., `python,django,postgresql`) |
| `minScore`    | int    | No       | Minimum match score (0–100), default 0                         |
| `domain`      | string | No       | Domain filter (e.g., `dsa`, `system-design`)                   |
| `department`  | string | No       | Department filter                                              |
| `institution` | string | No       | Institution filter                                             |

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "usr_student1",
      "name": "Aarav",
      "email": "aarav@skillledger.dev",
      "institution": "MIT",
      "department": "CS",
      "matchScore": 85,
      "topDomain": "dsa",
      "topDomainScore": 92,
      "metSkills": ["python", "postgresql"],
      "gapSkills": [{ "skill": "django", "studentScore": 45, "required": 70 }],
      "domainScores": { "dsa": 92, "system-design": 78 },
      "sessionCount": 4,
      "badges": ["dsa-expert", "python-pro"],
      "longitudinalSignal": {
        "trajectory": "IMPROVING",
        "label": "Consistent growth across 4 sessions",
        "sessionCount": 4,
        "deltaScore": 12,
        "stabilityScore": 0.85
      }
    }
  ]
}
```

---

## M6 Module: Analytics

### GET /api/analytics/cohort — Cohort Skill Readiness

Computes average skill score per domain grouped by student department.

**Auth:** `INSTITUTIONAL_ADMIN`

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "department": "CS",
      "domain": "dsa",
      "averageScore": 78,
      "studentCount": 12
    },
    {
      "department": "CS",
      "domain": "system-design",
      "averageScore": 65,
      "studentCount": 12
    },
    {
      "department": "EE",
      "domain": "dsa",
      "averageScore": 71,
      "studentCount": 8
    }
  ]
}
```

**Logic:**

- Fetches all students with non-null `skillProfile`
- Groups by `department || 'General'` and domain
- Computes `averageScore = Math.round(totalScore / count)`

---

### GET /api/analytics/demand — Demand vs Supply Gap

Computes skill demand (from active postings) vs supply (from student profiles with score ≥ 60). Returns gap severity per skill.

**Auth:** `INSTITUTIONAL_ADMIN`

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "skill": "system-design",
      "demandPercent": 75,
      "supplyPercent": 30,
      "gap": 45,
      "severity": "MEDIUM"
    },
    {
      "skill": "dsa",
      "demandPercent": 90,
      "supplyPercent": 25,
      "gap": 65,
      "severity": "HIGH"
    }
  ]
}
```

**Logic:**

- `demandPercent = Math.round((postingsThatRequireSkill / totalPostings) * 100)`
- `supplyPercent = Math.round((studentsWithScore>=60 / totalStudents) * 100)`
- `gap = demandPercent - supplyPercent`
- Severity: `HIGH` if gap > 50, `MEDIUM` if gap >= 20, `LOW` otherwise
- Results sorted by gap descending

---

### GET /api/analytics/placement — Placement Pipeline Stats

Returns aggregated placement and application pipeline statistics.

**Auth:** `INSTITUTIONAL_ADMIN`

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "totalApplications": 156,
    "underReview": 42,
    "shortlisted": 28,
    "interviewScheduled": 15,
    "selected": 12,
    "notSelected": 8,
    "activePostings": 14,
    "totalStudents": 200
  }
}
```

---

## Type Reference

### Request/Response Types (from `@/types/index.ts`)

#### `RequiredSkill`

```typescript
interface RequiredSkill {
  skill: string;
  minThreshold: number; // 0–100
}
```

#### `OpportunityMatchResult` (internal — returned by `computeOpportunityMatch()`)

```typescript
interface OpportunityMatchResult {
  opportunityId: string;
  matchScore: number; // 0–100
  metSkills: string[];
  gapSkills: { skill: string; studentScore: number; required: number }[];
}
```

#### `EnrichedOpportunity` (student GET response)

```typescript
interface EnrichedOpportunity {
  id: string;
  type: string;
  title: string;
  description: string;
  requiredSkills: RequiredSkill[];
  location: string | null;
  duration: string | null;
  stipendRange: string | null;
  deadline: string; // ISO 8601
  createdAt: string; // ISO 8601
  postedBy: { id: string; name: string; institution: string | null };
  matchScore: number;
  metSkills: string[];
  gapSkills: { skill: string; studentScore: number; required: number }[];
}
```

#### `InternshipProgressLog`

```typescript
interface InternshipProgressLog {
  week: number; // 1-indexed
  log: string; // 10–2000 characters
  submittedAt: string; // ISO 8601
}
```

#### `MentorFeedback`

```typescript
interface MentorFeedback {
  rating: number; // 1–5
  technicalScore: number; // 1–5
  communicationScore: number; // 1–5
  comments: string; // 10–3000 characters
  submittedAt: string; // ISO 8601
}
```

#### `EligibilityCriteria`

```typescript
interface EligibilityCriteria {
  yearOfStudy?: number[]; // e.g. [2, 3, 4]
  minCGPA?: number; // e.g. 7.5
  institution?: string; // null = open
}
```

#### `ApiResponse<T>` (envelope)

```typescript
interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: { code: string; message: string };
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

---

## Endpoint Summary Matrix

| #   | Method  | Route                            | Role                              | Owner | Purpose                                          |
| --- | ------- | -------------------------------- | --------------------------------- | ----- | ------------------------------------------------ |
| 1   | `POST`  | `/api/auth/[...nextauth]`        | Public                            | M6    | NextAuth session handler                         |
| 2   | `POST`  | `/api/register`                  | Public                            | M6    | User registration with role                      |
| 3   | `GET`   | `/api/opportunities`             | All (role-open)                   | M3+M5 | List active opportunities (enriched for STUDENT) |
| 4   | `POST`  | `/api/opportunities`             | `INDUSTRY`                        | M5    | Create new opportunity posting                   |
| 5   | `POST`  | `/api/opportunities/[id]/apply`  | `STUDENT`                         | M3    | Apply to opportunity (server-computed match)     |
| 6   | `PATCH` | `/api/applications/[id]/status`  | `INDUSTRY`                        | M6    | Update application/placement status              |
| 7   | `GET`   | `/api/applications`              | `STUDENT`, `ACADEMICIAN`          | M6    | List user's applications                         |
| 8   | `GET`   | `/api/internships/[id]/tracker`  | Student (self) / Mentor / Admin   | M3    | Fetch internship record with progress logs       |
| 9   | `POST`  | `/api/internships/[id]/tracker`  | `STUDENT`                         | M3    | Submit weekly progress log                       |
| 10  | `POST`  | `/api/internships/[id]/feedback` | `INDUSTRY` (mentor)               | M3    | Submit end-of-internship feedback                |
| 11  | `GET`   | `/api/user/profile`              | All                               | M6    | Fetch current user profile                       |
| 12  | `PATCH` | `/api/user/profile`              | All                               | M6    | Update current user profile                      |
| 13  | `GET`   | `/api/candidates`                | `INDUSTRY`, `INSTITUTIONAL_ADMIN` | M5    | Search students by skill criteria                |
| 14  | `GET`   | `/api/analytics/cohort`          | `INSTITUTIONAL_ADMIN`             | M6    | Cohort skill readiness by department             |
| 15  | `GET`   | `/api/analytics/demand`          | `INSTITUTIONAL_ADMIN`             | M6    | Demand vs supply gap per skill                   |
| 16  | `GET`   | `/api/analytics/placement`       | `INSTITUTIONAL_ADMIN`             | M6    | Placement pipeline statistics                    |
