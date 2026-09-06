# TEAM OVERVIEW — SkillLedger · SIH 2026 · PS 26044

> One-page reference for all 6 developers. Read before starting any task.

---

## Platform Summary

**SkillLedger** is an Academia-Industry Collaboration Portal that bridges the gap between student learning outcomes and industry expectations. It uses AI-driven assessments to evaluate student competencies, maps those skills to real-world opportunities (internships, jobs, projects), and generates personalized gap reports with actionable upskilling recommendations.

### High-Level Data Flow

```
Student → Assessment Terminal (AI Q&A) → LLM Evaluation → Skill Profile
                                    ↘
Industry → Opportunity Posting → Match Scoring → Student Feed
                                    ↘
Admin    → Analytics Dashboard → Demand Pipeline → Policy Insights
```

1. **Assessment Engine** generates domain-specific questions via Anthropic Claude, evaluates responses against rubrics, and scores competencies.
2. **Matching Service** compares skill profiles against opportunity postings using domain overlap and relevance scoring.
3. **Analytics Dashboard** aggregates demand signals, gap trends, and skill distribution across the institution.

---

## Tech Stack (Pinned)

| Layer           | Technology                               |
| --------------- | ---------------------------------------- |
| Framework       | Next.js 14.2.16 (App Router)             |
| Language        | TypeScript 5.6.3 (strict mode)           |
| Database        | PostgreSQL 15 via Prisma 5.20.0          |
| AI Engine       | Anthropic SDK 0.30.0 (claude-sonnet-4-6) |
| Auth            | NextAuth.js 4.24.10                      |
| Styling         | Tailwind CSS 3.4.14 + shadcn/ui          |
| Charts          | Recharts 2.13.0                          |
| Icons           | lucide-react 0.454.0                     |
| Package Manager | pnpm 9.12.0                              |

---

## SIH Hackathon Guardrails

- **LLM timeout:** All Anthropic calls wrapped in 12s timeout → safe fallback on breach.
- **No deferred features:** Only build what's in `docs/MVP_Cut.md`.
- **Demo data:** Seed script must be idempotent; 3 demo student accounts have pre-completed assessments.
- **Environment validation:** App refuses to start if `DATABASE_URL`, `NEXTAUTH_SECRET`, `ANTHROPIC_API_KEY`, or other required vars are missing.
- **Single package manager:** `pnpm` only. Never `npm`, `yarn`, or `npx`.

---

## Branch Naming & Merge Order

### Branch naming

```
feat/<member-id>/<feature-name>
Examples: feat/m1-assessment, feat/m4-student-dashboard
```

### Mandatory merge sequence

1. `feat/m3-infra-db` (schema + types)
2. `feat/m1-assessment` + `feat/m2-matching` (backend algorithms)
3. `feat/m6-auth-admin` (route protection)
4. `feat/m4-student-ui` + `feat/m5-industry-ui` (UI layers)
5. Gate: `pnpm type-check && pnpm lint` — **must pass**

See `CONTRIBUTING.md` Section 2 for file-ownership locks and `CONTRIBUTING.md` Section 3 for the full merge protocol.

---

## Team Members & Ownership

| #   | Role               | Write Zone                                                    | Key Deliverables                                               |
| --- | ------------------ | ------------------------------------------------------------- | -------------------------------------------------------------- |
| M1  | Assessment/LLM     | `lib/assessment/`, `data/knowledge-graphs/`                   | Question generation, response evaluation, knowledge graphs     |
| M2  | Matching/Analytics | `lib/matching/`, `lib/analytics/`                             | Match scoring, gap analysis, demand pipeline                   |
| M3  | Database/Infra     | `prisma/`, `lib/internships/`, root tooling                   | Schema, seed script, Prisma client, DB connection              |
| M4  | Student UI         | `app/(student)/`, student components                          | Assessment terminal, skill portfolio, opportunity feed         |
| M5  | Industry UI        | `app/(industry)/`, industry components                        | Opportunity posting, candidate discovery, approval workflows   |
| M6  | Auth/Admin         | `middleware.ts`, `app/(auth)/`, `app/(admin)/`, `app/(acad)/` | NextAuth setup, route guards, admin dashboard, analytics pages |

---

## Command Quick Reference

| Command            | Purpose                       |
| ------------------ | ----------------------------- |
| `pnpm dev`         | Start dev server (port 3001)  |
| `pnpm lint`        | ESLint check                  |
| `pnpm type-check`  | TypeScript type check         |
| `pnpm build`       | Production build verification |
| `pnpm db:push`     | Push schema to DB             |
| `pnpm db:generate` | Regenerate Prisma client      |
| `pnpm db:seed`     | Seed demo data                |

---

_Read `docs/ARCHITECTURE.md`, `docs/TECH_STACK.md`, `docs/UI_UX_SPEC.md`, `docs/SCHEMA.md`, and `CONTRIBUTING.md` before writing any code._
