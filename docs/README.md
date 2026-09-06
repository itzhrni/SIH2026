# SkillLedger

**SIH 2026 · Problem Statement: PS 26044**

AI-driven skill verification, dynamic knowledge graph assessment, and verifiable talent ledger connecting students, academia, and industry.

---

## Tech Stack

| Layer           | Technology                                 |
| --------------- | ------------------------------------------ |
| Framework       | Next.js 14.2.16 (App Router)               |
| Language        | TypeScript 5.6.3                           |
| Database        | Supabase PostgreSQL 17 + Prisma ORM 5.20.0 |
| Authentication  | NextAuth v4.24.10 (JWT + Credentials)      |
| Styling         | Tailwind CSS 3.4.14 + shadcn/ui            |
| AI Engine       | Anthropic Claude (SDK 0.30.0)              |
| Charts          | Recharts 2.13.0                            |
| Validation      | Zod 3.23.8 + React Hook Form 7.53.1        |
| Package Manager | pnpm 9.12.0                                |

---

## Quickstart & Setup

### Prerequisites

- **Node.js 20.18.0** (enforced by `.nvmrc`)
- **pnpm** (install via `npm install -g pnpm`)
- **Supabase** project with PostgreSQL database
- **Anthropic API Key** (`sk-ant-...`)

### Setup Commands

```bash
# 1. Clone the repository
git clone https://github.com/Wolfrahh-Wolf/SIH-2026.git
cd SIH-2026

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and Anthropic credentials

# 4. Push Prisma schema to database
pnpm db:push

# 5. Seed the database with demo data
pnpm db:seed

# 6. Start the development server
pnpm dev
```

The application will be available at **http://localhost:3001**.

---

## Demo User Accounts

All demo accounts share the same password for convenience:

**Password:** `Demo@1234`

| Name                  | Role                     | Email                           |
| --------------------- | ------------------------ | ------------------------------- |
| **Aarav Sharma**      | Student (High Performer) | `student.aarav@skillledger.dev` |
| **Priya Patel**       | Student (Balanced)       | `student.priya@skillledger.dev` |
| **Rohan Verma**       | Student (Foundational)   | `student.rohan@skillledger.dev` |
| **Vikram Malhotra**   | Industry Recruiter       | `recruiter.vikram@techcorp.dev` |
| **Dr. Ananya Sharma** | Academician              | `prof.sharma@aims.edu`          |
| **SWAN Admin**        | Institutional Admin      | `admin@swan.gov.in`             |

---

## Team Workflow & Branch Allocation

### Branch Naming Convention

Each team member works on a dedicated branch:

| Member   | Branch                   | Responsibility                                      |
| -------- | ------------------------ | --------------------------------------------------- |
| **DEV1** | `dev1/assessment-engine` | LLM adapter, knowledge graphs, assessment engine    |
| **DEV2** | `dev2/database-seed`     | Database seeding, schema migrations, demo data      |
| **DEV3** | `dev3/api-routes`        | API route handlers, matching engine, analytics      |
| **DEV4** | `dev4/student-ui`        | Student dashboard, assessment pages, portfolio      |
| **DEV5** | `dev5/industry-admin-ui` | Industry pages, admin dashboard, Recharts analytics |
| **DEV6** | `dev6/auth-qa-demo`      | Auth pages, middleware, end-to-end QA, demo prep    |

### Staged Merge Order

```
Phase 1 → DEV1 + DEV2  (parallel)
Phase 2 → DEV3         (after Phase 1 merge)
Phase 3 → DEV4 + DEV5  (parallel, after Phase 2)
Phase 4 → DEV6         (after Phase 3)
```

### Pre-Commit Checklist

**Every developer must run this before committing:**

```bash
pnpm type-check && pnpm lint
```

Both commands must pass with **zero errors** before pushing.

### Branch Creation

```bash
git pull origin main
git checkout -b <your-branch>
```

### Merge Hygiene

- **Single-writer lock:** No two developers modify the same file. If a conflict arises, the earlier merge wins and the later developer rebases on top.
- See `CONTRIBUTING.md` for full merge protocol.

---

## Project Structure

```
skilledger/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Login / Register pages
│   ├── (student)/                # Student role pages
│   ├── (industry)/               # Industry role pages
│   ├── (admin)/                  # Institutional admin pages
│   ├── (acad)/                   # Academician pages
│   ├── api/                      # API route handlers
│   ├── globals.css               # Tailwind + CSS tokens
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # shadcn/ui primitives (DO NOT EDIT)
│   ├── assessment/               # Assessment session components
│   ├── portfolio/                # Portfolio display components
│   ├── opportunities/            # Opportunity feed cards
│   └── dashboard/                # Analytics chart components
├── lib/                          # All business logic
│   ├── assessment/               # LLM adapter, graph loader, rubric evaluator
│   ├── matching/                 # Opportunity scoring, career guidance
│   ├── analytics/                # Demand pipeline, gap analysis
│   ├── auth/                     # NextAuth config, password hashing
│   └── utils/                    # api-response.ts, cn utility
├── prisma/
│   ├── schema.prisma             # Database schema (source of truth)
│   └── seed.ts                   # Demo data seeder
├── data/
│   └── knowledge-graphs/         # Domain JSON files (read-only)
│       ├── dsa.json
│       ├── system-design.json
│       ├── ml.json
│       ├── core-cs.json
│       ├── ayurvedic-pharmacology.json
│       └── clinical-practice.json
├── types/
│   ├── index.ts                  # Shared TypeScript interfaces
│   └── next-auth.d.ts            # NextAuth module augmentation
├── docs/
│   ├── ARCHITECTURE.md           # System architecture
│   ├── TECH_STACK.md             # Technology specifications
│   ├── SCHEMA.md                 # Database schema docs
│   ├── UI_UX_SPEC.md             # Design system & Tailwind tokens
│   ├── MVP_Cut.md                # In-scope feature list
│   ├── REPO_READINESS_REPORT.md  # Repository audit report
│   └── team/                     # Developer guides
│       ├── TEAM_OVERVIEW.md
│       ├── DEV1_LEAD_INFRA.md
│       ├── DEV2_DATABASE_SEED.md
│       ├── DEV3_API_INTEGRATIONS.md
│       ├── DEV4_FRONTEND_SHELL.md
│       ├── DEV5_CORE_UI_PAGES.md
│       └── DEV6_QA_DEMO_PITCH.md
├── middleware.ts                 # Role-based route protection
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .nvmrc                        # Node 20.18.0
└── .env.local                    # Environment variables (NOT committed)
```

---

## Available Commands

| Command            | Description                   |
| ------------------ | ----------------------------- |
| `pnpm dev`         | Start dev server on port 3001 |
| `pnpm build`       | Production build              |
| `pnpm lint`        | ESLint check                  |
| `pnpm type-check`  | TypeScript compiler check     |
| `pnpm format`      | Prettier formatting           |
| `pnpm db:generate` | Regenerate Prisma client      |
| `pnpm db:push`     | Push schema to database (dev) |
| `pnpm db:migrate`  | Create named migration        |
| `pnpm db:seed`     | Populate demo data            |
| `pnpm db:studio`   | Open Prisma Studio            |

---

## Environment Variables

Required variables (see `.env.local`):

| Variable                        | Description                          |
| ------------------------------- | ------------------------------------ |
| `DATABASE_URL`                  | Supabase PgBouncer connection string |
| `DIRECT_URL`                    | Supabase direct connection string    |
| `NEXTAUTH_SECRET`               | NextAuth secret (min 32 chars)       |
| `NEXTAUTH_URL`                  | Full URL including protocol          |
| `ANTHROPIC_API_KEY`             | Anthropic API key (`sk-ant-...`)     |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key               |

---

## Documentation

Before starting any development task, read these files:

1. `docs/ARCHITECTURE.md` — System architecture and service boundaries
2. `docs/TECH_STACK.md` — Technology versions and forbidden dependencies
3. `docs/SCHEMA.md` — Database schema and JSON field shapes
4. `docs/UI_UX_SPEC.md` — Design tokens, Tailwind classes, component patterns
5. `docs/MVP_Cut.md` — In-scope vs deferred features
6. `AGENTS.md` — Development rules and guardrails

---

**Built for SIH 2026 · SkillLedger Team**
