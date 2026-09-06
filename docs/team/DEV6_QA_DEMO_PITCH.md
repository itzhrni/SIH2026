# DEV6 — QA & DEMO PITCH

**Member ID:** M6  
**Write Zone:** `middleware.ts`, `app/(auth)/`, `app/(admin)/`, `app/(acad)/`  
**Branch:** `feat/m6-auth-admin`  
**Read Access:** `lib/auth/`, `types/index.ts`, all other branches for integration testing

---

## Responsibilities

| Area                      | Details                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Authentication**        | `app/(auth)/login/page.tsx`, `register/page.tsx` — NextAuth.js login/register pages. Role-based redirect after authentication. |
| **Route Middleware**      | `middleware.ts` — Enforces route-group access. Guards `(student)`, `(industry)`, `(admin)`, `(acad)` groups by role.           |
| **Admin Dashboard**       | `app/(admin)/` — Institutional admin overview, user management, analytics drill-down.                                          |
| **Academician Dashboard** | `app/(acad)/` — Academician view of student outcomes and curriculum alignment.                                                 |
| **QA Testing**            | End-to-end happy path testing across all 4 roles. Offline fallback testing. Edge case validation.                              |
| **Demo Pitch**            | Live demo runbook, pitch deck, rehearsed flow for SIH judges.                                                                  |

---

## File-Level Ownership

| File                                  | Action                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `middleware.ts`                       | **Create/Edit** — Route group guards, role-based access                  |
| `lib/auth/next-auth-config.ts`        | **Create** — NextAuth.js configuration, provider setup, session strategy |
| `app/(auth)/login/page.tsx`           | **Create** — Login page                                                  |
| `app/(auth)/register/page.tsx`        | **Create** — Registration page (if in scope)                             |
| `app/(auth)/callback/route.ts`        | **Create** — OAuth callback handler                                      |
| `app/(admin)/page.tsx`                | **Create** — Institutional admin dashboard                               |
| `app/(admin)/analytics/page.tsx`      | **Create** — Admin analytics (coordinate with M5 on chart components)    |
| `app/(acad)/page.tsx`                 | **Create** — Academician dashboard                                       |
| `app/api/auth/[...nextauth]/route.ts` | **Create** — NextAuth API route                                          |

---

## Key Constraints

1. **Middleware enforces route-group access.** Do not duplicate role checks in page components (AGENTS.md RBAC-01).
2. **API routes enforce role checks independently.** Direct API calls bypass page middleware (RBAC-02).
3. **Four in-scope roles only:** STUDENT, INDUSTRY, ACADEMICIAN, INSTITUTIONAL_ADMIN. POLICYMAKER is deferred.
4. **Role read from session JWT.** Never re-fetch from database in middleware or route handlers (RBAC-04).
5. **Auth check first in API routes** — before Zod validation, before DB calls (AGENTS.md API-04).
6. **Role check second in API routes** — after auth, before Zod validation (AGENTS.md API-05).
7. **All API routes return ApiResponse<T> envelope.** Use `apiSuccess()` / `apiError()` from `lib/utils/api-response.ts`.

---

## QA Test Plan — Happy Paths

### Student Flow

1. Login as student → Redirect to `/student` dashboard
2. Start assessment → Select domain → Answer 3+ questions → Session completes
3. View portfolio → See skill scores, badges, timeline chart
4. View opportunities → See ranked matched postings
5. View gap report → See recommendations

### Industry Flow

1. Login as industry → Redirect to `/industry` dashboard
2. Create opportunity posting → Validate form → Posting appears
3. View candidates → See matched students with scores
4. View candidate detail → See full skill profile

### Academician Flow

1. Login as academician → Redirect to `/acad` dashboard
2. View student outcomes → See aggregate skill data
3. View curriculum alignment → See domain coverage analysis

### Admin Flow

1. Login as admin → Redirect to `/admin` dashboard
2. View analytics → See demand pipeline, gap trends charts
3. View user list → See all registered users
4. View institution overview → See key metrics

### Edge Cases

1. Unauthenticated access to protected route → Redirect to login
2. Wrong role access (e.g., student to `/industry`) → 403 / redirect
3. LLM timeout during assessment → Safe fallback scores displayed
4. LLM parse failure → Retry once, then fallback
5. Empty opportunity feed → Show empty state message
6. Database connection failure → Show error page with retry option

---

## Demo Pitch Runbook

### Pre-Demo Setup

```bash
pnpm db:seed          # Ensure demo data is loaded
pnpm dev              # Start on port 3001
# Verify all 3 demo student accounts have completed assessments
# Verify admin dashboard renders with populated data
```

### Pitch Sequence (10 minutes)

1. **Intro (1 min):** Problem statement — academia-industry skill gap
2. **Student Demo (3 min):**
   - Login as demo student
   - Start assessment → show AI question generation
   - Answer question → show LLM evaluation → show score
   - View portfolio → show skill chart
   - View opportunities → show match scores
3. **Industry Demo (2 min):**
   - Login as industry account
   - Show opportunity posting flow
   - Show candidate discovery with match scores
4. **Admin Analytics (2 min):**
   - Login as admin
   - Show demand pipeline chart
   - Show gap analysis visualization
5. **Tech Deep-Dive (1 min):** Knowledge graphs, LLM fallback, concurrent write safety
6. **Q&A (1 min):** Prepared answers for judges

### Backup Plans

- **LLM API down:** Pre-record screen capture of assessment flow as fallback.
- **Database down:** Pre-render static demo pages with hardcoded data as fallback.
- **Demo account locked:** Pre-create backup accounts in seed script.

---

## Integration Points

- **M1 (Assessment):** QA tests assessment flow end-to-end. Validates fallback behavior.
- **M2 (Matching):** QA tests match scoring accuracy and feed ranking.
- **M3 (DB):** Coordinates with M3 on seed data for all 4 demo accounts.
- **M4 (Student UI):** QA tests student pages and components.
- **M5 (Industry/UI):** QA tests industry pages, admin dashboard, and analytics charts.

---

## Deliverables Checklist

- [ ] `middleware.ts` — Role-based route guards
- [ ] `lib/auth/next-auth-config.ts` — NextAuth configuration
- [ ] `app/(auth)/login/page.tsx` — Login page
- [ ] `app/api/auth/[...nextauth]/route.ts` — NextAuth API route
- [ ] `app/(admin)/page.tsx` — Admin dashboard
- [ ] `app/(acad)/page.tsx` — Academician dashboard
- [ ] QA test plan executed — all happy paths passing
- [ ] Edge case validation complete
- [ ] Demo pitch runbook written and rehearsed
- [ ] Backup plans prepared (offline mocks, pre-rendered pages)
- [ ] `pnpm db:seed` verified — all demo accounts ready
- [ ] PR passes `pnpm type-check && pnpm lint`

---

_Refer to `AGENTS.md` Section 12 for role-based access enforcement rules. Refer to `AGENTS.md` Section 7.3 for demo safety rules._
