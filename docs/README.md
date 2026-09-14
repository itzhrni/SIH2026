# SkillLedger

**SIH 2026 · Problem Statement: PS 26044**

AI-driven skill verification, dynamic knowledge graph assessment, and verifiable talent ledger connecting students, academia, and industry.

---

## Features

✅ **AI Assessment Engine** - 4D rubric scoring (Correctness, Depth, Trade-offs, Real-World)
✅ **Skill Demand Intelligence** - Real-time job market analysis via NLP
✅ **Adaptive Learning Paths** - Personalized recommendations based on gaps
✅ **Placement Matching** - Precision internship & job recommendations
✅ **Curriculum Feedback** - Institution dashboards with real-time insights
✅ **Faculty FDP Portal** - Track professional development & upskilling
✅ **AYUSH Integration** - Digital credentialing for traditional medicine
✅ **Pedigree-Free Assessment** - Tier-2/3 students compete on verified capability

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
| Backend API     | Node.js Express (deployed separately)      |
| Charts          | Recharts 2.13.0                            |
| Validation      | Zod 3.23.8 + React Hook Form 7.53.1        |
| Package Manager | pnpm 9.12.0                                |

---

## Project Structure

```
SIH2026/
├── app/                          # Next.js App Router (Frontend)
│   ├── (auth)/                   # Login / Register pages
│   ├── (student)/                # Student role pages
│   │   ├── dashboard/            # Student dashboard
│   │   ├── assess/               # Assessment session
│   │   ├── portfolio/            # Skill portfolio
│   │   ├── opportunities/        # Job/internship feed
│   │   └── applications/         # Application tracking
│   ├── (industry)/               # Industry recruiter pages
│   │   ├── recruiter-dashboard/  # Analytics dashboard
│   │   ├── candidates/           # Candidate search
│   │   ├── post/job/             # Post job posting
│   │   ├── post/internship/      # Post internship
│   │   └── my-postings/          # Manage postings
│   ├── (admin)/                  # Institutional admin pages
│   ├── (acad)/                   # Academician pages
│   ├── api/                      # API route handlers
│   ├── globals.css               # Tailwind + CSS tokens
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                   # React Components
│   ├── ui/                       # shadcn/ui primitives (DO NOT EDIT)
│   ├── assessment/               # Assessment session components
│   ├── portfolio/                # Portfolio display components
│   ├── opportunities/            # Opportunity feed cards
│   └── dashboard/                # Analytics chart components
│
├── lib/                          # Business Logic
│   ├── assessment/               # LLM adapter, graph loader, rubric evaluator
│   ├── matching/                 # Opportunity scoring, career guidance
│   ├── analytics/                # Demand pipeline, gap analysis
│   ├── auth/                     # NextAuth config, password hashing
│   └── utils/                    # api-response.ts, cn utility
│
├── ai_assessment_engine/         # Python Assessment Engine (Reference)
│   ├── ai/                       # LLM integration
│   ├── analytics/                # Analytics pipelines
│   ├── api/                      # API handlers
│   ├── engine/                   # Core assessment logic
│   ├── knowledge_graph/          # Knowledge graph traversal
│   ├── tests/                    # Unit tests
│   └── run_demo.py               # Demo runner
│
├── prisma/                       # Database ORM
│   ├── schema.prisma             # Database schema (source of truth)
│   └── seed.ts                   # Demo data seeder
│
├── data/                         # Knowledge Graphs
│   └── knowledge-graphs/         # Domain JSON files (read-only)
│       ├── dsa.json
│       ├── system-design.json
│       ├── ml.json
│       ├── core-cs.json
│       ├── ayurvedic-pharmacology.json
│       └── clinical-practice.json
│
├── types/                        # TypeScript Interfaces
│   ├── index.ts                  # Shared TypeScript interfaces
│   └── next-auth.d.ts            # NextAuth module augmentation
│
├── backend/                      # Node.js Express Backend (Separate Deployment)
│   ├── src/
│   │   ├── routes/               # API route handlers
│   │   ├── middleware/           # Auth & RBAC middleware
│   │   ├── services/             # Business logic
│   │   ├── config/               # Database & JWT config
│   │   └── server.js             # Entry point
│   ├── package.json
│   └── vercel.json               # Vercel config (moved to root)
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # System architecture
│   ├── TECH_STACK.md             # Technology specifications
│   ├── SCHEMA.md                 # Database schema docs
│   ├── UI_UX_SPEC.md             # Design system & Tailwind tokens
│   ├── MVP_Cut.md                # In-scope feature list
│   └── team/                     # Developer guides
│       ├── TEAM_OVERVIEW.md
│       ├── DEV1_LEAD_INFRA.md
│       ├── DEV2_DATABASE_SEED.md
│       ├── DEV3_API_INTEGRATIONS.md
│       ├── DEV4_FRONTEND_SHELL.md
│       ├── DEV5_CORE_UI_PAGES.md
│       └── DEV6_QA_DEMO_PITCH.md
│
├── middleware.ts                 # Role-based route protection
├── vercel.json                   # Vercel deployment config (MOVED FROM /backend)
├── package.json                  # Frontend + monorepo dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind design tokens
├── next.config.js                # Next.js config
├── .nvmrc                        # Node 20.18.0
├── .env.local                    # Environment variables (NOT committed)
├── AGENTS.md                     # Development rules & guardrails
├── CONTRIBUTING.md               # Contribution guidelines
├── Work_Split.md                 # Team work allocation
└── README.md                     # This file
```

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
git clone https://github.com/itzhrni/SIH2026.git
cd SIH2026

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase, Anthropic, and Backend API URL

# 4. Generate Prisma Client
pnpm prisma generate

# 5. Push Prisma schema to database
pnpm db:push

# 6. Seed the database with demo data
pnpm db:seed

# 7. Start the development server
pnpm dev
```

The frontend will be available at **http://localhost:3000**.

---

## Environment Variables

Create `.env.local` with:

```env
# Supabase PostgreSQL
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
DIRECT_URL=postgresql://user:password@db.supabase.co:5432/postgres

# Supabase Client
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-min-32-chars

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-your-api-key

# Backend API (if running separately)
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Demo User Accounts

All demo accounts share password: **`Demo@1234`**

| Name                  | Role                     | Email                           |
| --------------------- | ------------------------ | ------------------------------- |
| **Aarav Sharma**      | Student (High Performer) | `student.aarav@skillledger.dev` |
| **Priya Patel**       | Student (Balanced)       | `student.priya@skillledger.dev` |
| **Rohan Verma**       | Student (Foundational)   | `student.rohan@skillledger.dev` |
| **Vikram Malhotra**   | Industry Recruiter       | `recruiter.vikram@techcorp.dev` |
| **Dr. Ananya Sharma** | Academician/Faculty      | `prof.sharma@aims.edu`          |
| **SWAN Admin**        | Institutional Admin      | `admin@swan.gov.in`             |

---

## Available Commands

| Command            | Description                                   |
| ------------------ | --------------------------------------------- |
| `pnpm dev`         | Start dev server (frontend on 3000)           |
| `pnpm build`       | Production build                              |
| `pnpm lint`        | ESLint check                                  |
| `pnpm type-check`  | TypeScript compiler check                     |
| `pnpm format`      | Prettier formatting                           |
| `pnpm prisma generate` | Regenerate Prisma client                  |
| `pnpm db:push`     | Push schema to database (dev)                 |
| `pnpm db:migrate`  | Create named migration                        |
| `pnpm db:seed`     | Populate demo data                            |
| `pnpm db:studio`   | Open Prisma Studio UI                         |

---

## Backend Setup

The backend is a separate Node.js Express application deployed independently.

### Backend Deployment

**Local Development:**
```bash
cd backend
npm install
npm run dev  # Runs on http://localhost:5000
```

**Production Deployment (Vercel):**
- Backend is deployed to Vercel separately
- Frontend calls backend APIs via `NEXT_PUBLIC_API_URL`
- Both can be deployed together as a monorepo

See `/backend/README.md` for detailed backend setup.

---

## Deployment

### Deploy to Vercel

The monorepo (frontend + backend) is configured for Vercel deployment.

**Steps:**
1. Push to GitHub main branch
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Vercel auto-deploys on every push

**Frontend URL:** `https://your-app.vercel.app`
**Backend API:** `https://your-app.vercel.app/api`

---

## Team Workflow

### Branch Convention

Each developer works on a dedicated branch:

| Member   | Branch                   | Responsibility                              |
| -------- | ------------------------ | ------------------------------------------- |
| **DEV1** | `dev1/assessment-engine` | LLM adapter, knowledge graphs               |
| **DEV2** | `dev2/database-seed`     | Database schema, demo data                  |
| **DEV3** | `dev3/api-routes`        | API handlers, matching engine               |
| **DEV4** | `dev4/student-ui`        | Student dashboard, assessment UI            |
| **DEV5** | `dev5/industry-admin-ui` | Industry dashboard, analytics               |
| **DEV6** | `dev6/auth-qa-demo`      | Auth, testing, demo prep                    |

### Pre-Commit Checklist

Before pushing, run:

```bash
pnpm type-check && pnpm lint
```

Both must pass with **zero errors**.

---

## Documentation

Before starting development, read:

1. `docs/ARCHITECTURE.md` — System architecture
2. `docs/TECH_STACK.md` — Technology versions
3. `docs/SCHEMA.md` — Database schema
4. `docs/UI_UX_SPEC.md` — Design system
5. `AGENTS.md` — Development rules

---

## Troubleshooting

### Prisma Client Not Found
```bash
pnpm prisma generate
```

### Database Connection Error
- Check `.env.local` has correct Supabase credentials
- Verify Supabase database is running
- Check `DATABASE_URL` and `DIRECT_URL`

### Port 3000 Already in Use
```bash
pnpm dev -p 3001
```

### Build Errors
```bash
rm -rf .next node_modules
pnpm install
pnpm build
```

---

## Support & Contribution

- See `CONTRIBUTING.md` for contribution guidelines
- See `AGENTS.md` for development rules
- See `Work_Split.md` for team allocation

---

**Built for SIH 2026 · Team Uptown Func()**