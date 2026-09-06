# CONTRIBUTING.md — SkillLedger · SIH 2026 · PS 26044

> **All team members and autonomous coding agents MUST read this file before committing, pushing, or merging.**

---

## 0. Repository Layout

| Item              | Location                 | Notes                                            |
| ----------------- | ------------------------ | ------------------------------------------------ |
| Architecture docs | `docs/ARCHITECTURE.md`   | Directory structure, service boundaries          |
| Tech stack        | `docs/TECH_STACK.md`     | Exact versions, forbidden dependencies           |
| UI/UX spec        | `docs/UI_UX_SPEC.md`     | Tailwind classes, color tokens, components       |
| DB schema         | `docs/SCHEMA.md`         | Prisma schema, JSON field shapes                 |
| Team guides       | `docs/team/`             | Individual dev action plans                      |
| Root config       | `AGENTS.md`, `CLAUDE.md` | Agent directives — loaded before any code change |

---

## 1. Branch Naming Convention

```
feat/<member-id>/<feature-name>

Examples:
  feat/m1-assessment
  feat/m4-student-dashboard
  feat/m6-auth-pages
```

- **`feat/`** prefix for all feature branches.
- **`<member-id>`** is `m1` through `m6` (see ownership matrix below).
- **`<feature-name>`** is kebab-case, 1–3 words, descriptive.

**Hotfixes** use `hotfix/<description>` and must be merged into `main` then immediately cherry-picked into the originating feature branch.

---

## 2. Strict File-Ownership Locks (Single-Writer Rule)

These rules prevent merge conflicts between parallel branches. **Every developer and every agent must enforce these.**

### 2.1 Locked Files

| File                   | Locked To             | Rule                                                                                             |
| ---------------------- | --------------------- | ------------------------------------------------------------------------------------------------ |
| `prisma/schema.prisma` | **M3 only**           | No other member or agent may alter this file. Schema change requests must go through M3.         |
| `types/index.ts`       | **Baseline on Day 1** | Only additive extensions allowed. Coordinated through M3. No deletions, no signature changes.    |
| `package.json`         | **Frozen**            | No new packages during feature development. Use only the pinned stack from `docs/TECH_STACK.md`. |

### 2.2 Isolated Workspaces

Each member has an exclusive write zone. **Reading is allowed everywhere; writing is restricted as follows:**

| Member                      | Exclusive Write Paths                                         | Shared Read Paths                                              |
| --------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| **M1** (Assessment/LLM)     | `lib/assessment/`, `data/knowledge-graphs/`                   | `lib/db.ts`, `types/index.ts`, `lib/assessment/llm-adapter.ts` |
| **M2** (Matching/Analytics) | `lib/matching/`, `lib/analytics/`                             | `lib/db.ts`, `types/index.ts`, `lib/matching/`                 |
| **M3** (Database/Infra)     | `prisma/`, `lib/internships/`, root tooling                   | `prisma/schema.prisma`, `lib/db.ts`                            |
| **M4** (Student UI)         | `app/(student)/`, student UI components                       | `components/ui/`, `components/dashboard/`                      |
| **M5** (Industry UI)        | `app/(industry)/`, industry UI components                     | `components/ui/`, `components/opportunities/`                  |
| **M6** (Auth/Admin)         | `middleware.ts`, `app/(auth)/`, `app/(admin)/`, `app/(acad)/` | `lib/auth/`, `types/index.ts`                                  |

**Violations:** If a PR touches a locked file outside the designated owner's branch, **reject it immediately** with a comment referencing this section.

---

## 3. Staged AI Merge Order (Automated Integration Protocol)

When integrating 6 parallel branches into `main`, the merge agent (human or AI) **MUST** follow this exact sequence:

| Step  | Action                                                                                                                                                               |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | Merge `feat/m3-infra-db` — establishes schema, data types, and DB infrastructure                                                                                     |
| **2** | Merge `feat/m1-assessment` & `feat/m2-matching` — injects backend algorithms (parallel merge OK)                                                                     |
| **3** | Merge `feat/m6-auth-admin` — enables route protection and admin screens                                                                                              |
| **4** | Merge `feat/m4-student-ui` & `feat/m5-industry-ui` — attaches UI layouts (parallel merge OK)                                                                         |
| **5** | **Post-merge verification gate:** Run `pnpm type-check && pnpm lint`. Both **must** pass. If either fails, the merge is **rejected** and must be fixed before retry. |

**Why this order?** Each step introduces dependencies for the next. M3's schema must exist before M1/M2's algorithms can query it. Auth must be in place before UI routes can be protected.

---

## 4. Pre-Merge Checklist

Every PR must pass:

```
□ pnpm type-check   — zero type errors
□ pnpm lint         — zero ESLint errors
□ pnpm build        — production build succeeds
□ No locked file touched outside owner's branch
□ No forbidden packages imported (see docs/TECH_STACK.md §6)
□ No deferred features built (see docs/MVP_Cut.md)
```

---

## 5. Commit Message Convention

Use conventional commits:

```
feat(m1): add LLM response evaluation with timeout fallback
fix(m3): correct Prisma relation on AssessmentSession
docs(team): add DEV4 frontend shell action plan
chore: update .nvmrc to 20.18.0
```

Format: `<type>(<scope>): <description>`

- **types:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `hotfix`
- **scope:** member id (e.g., `m1`) or `infra`, `db`, `ui`, `team`

---

## 6. Conflict Resolution Protocol

If a merge conflict occurs:

1. **Stop** — do not auto-merge.
2. **Identify** which ownership rule was violated.
3. **Route** the conflicting file to its designated owner.
4. **Owner** resolves the conflict, commits with `merge(<owner>): resolve conflict in <file>`.
5. **Retry** the merge.

If both owners claim a file (edge case), escalate to the team lead for arbitration.

---

## 7. Environment Setup

```bash
# 1. Node version
nvm use   # reads .nvmrc → 20.18.0

# 2. Install dependencies
pnpm install

# 3. Copy and configure environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase and Anthropic credentials

# 4. Push DB schema
pnpm db:push

# 5. Generate Prisma client
pnpm db:generate

# 6. Seed demo data (optional, for local testing)
pnpm db:seed

# 7. Start dev server (port 3001 to avoid collisions)
pnpm dev
```

---

## 8. Quick Reference

| Command            | Purpose                       |
| ------------------ | ----------------------------- |
| `pnpm dev`         | Start dev server on port 3001 |
| `pnpm lint`        | ESLint check                  |
| `pnpm type-check`  | TypeScript type check         |
| `pnpm build`       | Production build              |
| `pnpm db:push`     | Push schema to DB (dev)       |
| `pnpm db:generate` | Regenerate Prisma client      |
| `pnpm db:seed`     | Seed demo data                |

---

_Last updated: SIH 2026 Internal Round — All rules are binding. No exceptions._
