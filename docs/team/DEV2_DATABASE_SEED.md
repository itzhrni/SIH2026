# DEV2 / M2 — DATABASE, SCHEMA & SEED DATA

**Member ID:** M2  
**Write Zone:** `prisma/`, `lib/internships/`, root tooling  
**Branch:** `feat/m2-infra-db`  
**Read Access:** `prisma/schema.prisma`, `lib/db.ts`

---

## Responsibilities

| Area                         | Details                                                                                                                                                                           |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prisma Schema**            | `prisma/schema.prisma` — **EXCLUSIVE WRITE ACCESS.** All MVP models, relations, Json field shapes, cascade rules. Baseline locked on Day 1.                                       |
| **Prisma Client Singleton**  | `lib/db.ts` — Single PrismaClient instance with global singleton pattern.                                                                                                         |
| **Database Connection Test** | `scripts/test-db-connection.ts` — Standalone script to verify Supabase PostgreSQL connectivity.                                                                                   |
| **Seed Script**              | `prisma/seed.ts` — Idempotent demo data: 3 student accounts with completed assessments, populated SkillProfile, 1 industry account, 1 admin account, sample opportunity postings. |
| **Knowledge Graphs**         | `data/knowledge-graphs/*.json` — 6 domain knowledge graph JSON files (DSA, System Design, ML, Core CS, Ayurvedic Pharmacology, Clinical Practice).                                |
| **Schema Coordination**      | All schema change requests from other members must route through M2. M2 merges schema changes into `feat/m2-infra-db` first.                                                      |

---

## File-Level Ownership

| File                            | Action                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| `prisma/schema.prisma`          | **EXCLUSIVE WRITE** — All models, relations, Json shapes, cascade rules                |
| `lib/db.ts`                     | **Create** — Prisma client singleton (exact pattern from AGENTS.md Section 9)          |
| `lib/utils/api-response.ts`     | **Create** — `apiSuccess<T>()`, `apiError()` envelope (exact from AGENTS.md Section 5) |
| `types/index.ts`                | **Create** — All shared TypeScript interfaces. Baseline locked. Additive only.         |
| `prisma/seed.ts`                | **Create** — Idempotent seed with upsert logic                                         |
| `scripts/test-db-connection.ts` | **Create** — Connection verification script                                            |
| `data/knowledge-graphs/*.json`  | **Create** — 6 domain knowledge graphs                                                 |

---

## Prisma Models (MVP Scope)

| Model               | Purpose                                                                        |
| ------------------- | ------------------------------------------------------------------------------ |
| `Account`           | NextAuth account (FK → User)                                                   |
| `Session`           | NextAuth session (FK → User)                                                   |
| `User`              | Core user with role enum (STUDENT, INDUSTRY, ACADEMICIAN, INSTITUTIONAL_ADMIN) |
| `VerificationToken` | NextAuth verification token                                                    |
| `AssessmentSession` | Active/completed assessment with turnIndex, status, domain                     |
| `NodeResult`        | Per-turn LLM evaluation per assessment session                                 |
| `SkillProfile`      | Aggregated skill scores per user (domainScores, badges)                        |
| `SkillScoreHistory` | Time-series of skill scores for timeline charts                                |
| `GapReport`         | Per-session gap analysis with recommendations                                  |
| `Opportunity`       | Internship/job/project posting with domain, requirements, company              |
| `MatchScore`        | Per-user per-opportunity compatibility score                                   |

---

## Key Constraints

1. **`prisma/schema.prisma` is LOCKED.** Only M2 writes to it. No other branch may modify this file.
2. **`types/index.ts` is baseline-locked.** Only additive extensions. Coordinated through M2.
3. **`package.json` is frozen.** No new packages during feature development.
4. **After every schema change:** Run `pnpm db:generate` before writing service code.
5. **`pnpm db:push` is dev-only.** Never in production context.
6. **Json fields** must have typed shapes documented in `docs/SCHEMA.md`. Validate with Zod before writing.
7. **Cascade deletes** defined in schema. Do not manually delete child records.
8. **Seed must be idempotent.** `pnpm db:seed` run twice must not create duplicates.

---

## Merge Sequence

**M2 is Step 1 in the merge order.** `feat/m2-infra-db` must be merged into `main` before any other branch. This establishes the schema foundation, Prisma client, type definitions, and DB infrastructure that all other members depend on.

---

## Deliverables Checklist

- [ ] `prisma/schema.prisma` — Complete MVP schema with all models and relations
- [ ] `lib/db.ts` — Prisma client singleton
- [ ] `lib/utils/api-response.ts` — API envelope functions
- [ ] `types/index.ts` — All shared TypeScript types
- [ ] `prisma/seed.ts` — Idempotent seed data
- [ ] `scripts/test-db-connection.ts` — Connection test script
- [ ] 6 knowledge graph JSON files in `data/knowledge-graphs/`
- [ ] `pnpm db:push` succeeds
- [ ] `pnpm db:generate` succeeds
- [ ] `pnpm db:seed` succeeds (run twice to verify idempotency)
- [ ] PR passes `pnpm type-check && pnpm lint`

---

_Refer to `docs/SCHEMA.md` for complete model definitions, Json field shapes, and cascade rules. Refer to `AGENTS.md` Section 4.4 for database layer rules._
