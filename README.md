<div align="center">

# ⚡ SkillLedger
### Continuous Competency Mapping, Adaptive AI Assessment & Academia–Industry Matchmaking Ecosystem

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026%20Finalist-orange?style=for-the-badge&logo=target)](https://sih.gov.in)
[![Problem Statement](https://img.shields.io/badge/PS%20ID-SIH26044-blue?style=for-the-badge)](https://sih.gov.in)
[![Theme](https://img.shields.io/badge/Theme-Smart%20Automation-purple?style=for-the-badge)]()
[![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Anthropic Claude](https://img.shields.io/badge/AI%20Core-Claude%203.5%20Sonnet-d97706?style=for-the-badge&logo=anthropic)](https://anthropic.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015-336791?style=for-the-badge&logo=postgresql)](https://supabase.com)

**SIH 2026 Problem Statement 26044:** *Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement*  
**Team:** **Uptown func()** · **Category:** Software · **Organization:** Ministry of Ayush / AICTE

[Architecture & Docs](./ARCHITECTURE.md) · [Tech Stack](./TECH_STACK.md) · [Schema](./SCHEMA.md) · [UI/UX Spec](./UI_UX_SPEC.md)

</div>

---

## 📌 1. Executive Summary & Problem Vision

According to the **India Skills Report 2025**, over **48.75% of Indian engineering and professional graduates are not readily employable** upon graduation. The root cause is a fundamental disconnect:
1. **Colleges** teach static, theoretical syllabi with minimal real-time visibility into shifting market demands.
2. **Students** rely on memorization and lack individualized diagnostics on their conceptual weaknesses.
3. **Employers** filter thousands of applicants based on blunt proxies (CGPA and college pedigree) rather than verified technical competencies.
4. **Traditional Medicine (AYUSH)** faculties and clinical research remain siloed from mainstream digital health commercialization.

**SkillLedger** eliminates this divide by replacing static resumes with an **AI-driven, verifiable competency ledger** connecting **Students**, **Industry Recruiters**, **Academic Faculty**, and **Institutional Administrators** in a real-time feedback loop.

---

## 🌟 2. Four Unified Stakeholder Portals

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         SKILLEDGER UNIFIED ECOSYSTEM                             │
├─────────────────────────┬────────────────────────────┬───────────────────────────┤
│    👩‍🎓 STUDENT PORTAL     │   🏢 INDUSTRY RECRUITER    │   🏛️ INSTITUTION (SWAN)    │
│  • Adaptive AI Assessment│  • Skill-First Matchmaking │  • Demand vs Supply Matrix│
│  • 4D Rubric Gap Engine  │  • Verified Talent Pipeline│  • Cohort Readiness Tiers │
│  • Living Skill Portfolio│  • Live Interview Co-Pilot │  • BOS Syllabus Audits    │
│  • Targeted Remediation  │  • Learning Program Pub    │  • NBA/NAAC Accredit Dox  │
├─────────────────────────┴────────────────────────────┴───────────────────────────┤
│                             👨‍🏫 ACADEMICIAN PORTAL                                │
│          • Faculty Development Programs (FDPs) · Industrial Consultancy          │
│          • Joint Research Projects · AYUSH Clinical Knowledge Mapping            │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1. 🎓 Student Continuous Competency Portal
* **Adaptive Socratic AI Evaluation:** Multi-turn conversational assessments using **Claude 3.5 Sonnet** across 4 dimensions: *Correctness, Depth, Trade-offs, and Real-World Applicability*.
* **Granular Concept Diagnostics:** Identifies exact sub-concept gaps (e.g., *Database Sharding*, *Redis Cache Invalidation*) rather than generic percentages.
* **Persistent Living Portfolio:** Features tamper-proof, verified skill badges, longitudinal growth trajectories, and one-click remediation course enrollment.

### 2. 🏢 Industry Partner & Recruiter Portal
* **Competency-Based Discovery:** Ranks candidates by true algorithmic skill compatibility score (%) against custom Job Description (JD) thresholds.
* **Pedigree-Free Shortlisting:** Surfaces top-tier talent from Tier-2 and Tier-3 institutions based on verified proof of capability.
* **Hiring Pipeline Tracker:** Complete lifecycle management (`Applied → Shortlisted → Interview Scheduled → Offered`).

### 3. 🏛️ Institution & College Analytics Portal (SWAN)
* **Industry Demand vs. Student Supply Matrix:** Real-time mathematical gap formulation:
  $$\text{Net Deficit} = \text{Industry Demand \%} - \text{Student Supply \%}$$
* **Cohort Readiness Breakdown:** Classifies students into **Tier 1 (Ready 80%+)** down to **Tier 4 (Critical Need <40%)**.
* **Curriculum Intelligence & BOS Dossiers:** Recommends targeted course interventions and generates **NBA (Criterion 2 & 4)** and **NAAC** compliance reports.

### 4. 👨‍🏫 Academician & Faculty Portal
* **Industry FDPs & Consultancy:** Connects professors to corporate industrial training, sponsored consultancies, and funded research.
* **AYUSH Traditional Medicine Integration:** Pre-built knowledge graphs for Ayurveda, Yoga, Unani, Siddha, and Homoeopathy.

---

## 🏗️ 3. System Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FRONTEND: Next.js 14 App Router                      │
│     (Student Portal · Industry Portal · Acad Portal · Admin SWAN)      │
│      Tailwind CSS 3.4 (Midnight Navy #060A14) · shadcn/ui · Recharts   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (JSON + Zod Schemas)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   API LAYER: Serverless Route Handlers                 │
│         NextAuth.js (Multi-Role RBAC) · Zod Input/Output Parsing       │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
        Domain Logic & Assessment             Prisma ORM 5.20
                    │                                │
┌───────────────────▼─────────────────┐   ┌──────────▼───────────────────┐
│     AI & ASSESSMENT ENGINE (lib/)   │   │      POSTGRESQL DATABASE     │
│   • Claude 3.5 Sonnet (Anthropic)   │   │  • Users, Roles & Credentials│
│   • Domain-Agnostic Knowledge Graphs│   │  • Postings & Applications   │
│   • 4D Rubric Evaluator             │   │  • Living Portfolios & Badges│
│   • Cosine Skill-to-JD Matcher      │   │  • Institutional Gap Matrices│
└─────────────────────────────────────┘   └──────────────────────────────┘
```

---

## 💻 4. Technology Stack Matrix

| Domain | Technology / Library | Version | Purpose in SkillLedger |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js (App Router)** | `14.2.16` | Fullstack SSR, Server Components, and unified Route Handlers |
| **Language** | **TypeScript** | `5.6.3` | Strict type safety across Client, API, and Database |
| **UI & Styling** | **Tailwind CSS + shadcn/ui** | `3.4.14` | Enterprise Dark Navy theme tokens (`#060A14`) & Radix UI primitives |
| **Data Viz** | **Recharts** | `2.13.0` | Gap heatmaps, recruitment funnels, and radial readiness donuts |
| **AI / NLP Core** | **Anthropic SDK (Claude 3.5)** | `0.30.0` | Socratic conversational assessment & multi-turn rubric evaluation |
| **Knowledge Engine** | **DAG Knowledge Graphs** | `Custom` | Prerequisite skill ontology across Engineering & AYUSH domains |
| **Database & ORM**| **PostgreSQL 15 + Prisma** | `5.20.0` | Relational models, verified badge storage, and JSON skill matrices |
| **Auth & Security**| **NextAuth.js** | `4.24.10` | Role-Based Access Control (RBAC) with JWT session cookies |
| **Validation** | **Zod** | `3.23.8` | Strict contract validation for API payloads and LLM outputs |
| **Cloud Storage** | **Supabase Storage** | `2.46.1` | Cloud hosting for resumes, transcripts, and NBA audit dossiers |

---

## ⚡ 5. Quickstart & Local Setup

### Prerequisites
* **Node.js**: `v20.18.0 LTS` (or managed via `.nvmrc`)
* **Package Manager**: `pnpm` (or `npm`)
* **Database**: PostgreSQL 15 instance (local or via Supabase)
* **API Key**: Anthropic API Key (`sk-ant-...`) or Google Gemini API Key

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/itzhrni/SIH2026.git
cd SIH2026

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, and ANTHROPIC_API_KEY in .env.local

# 4. Generate Prisma Client & push schema
pnpm db:generate
pnpm db:push

# 5. Seed live demo data
pnpm db:seed

# 6. Start the development server
pnpm dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 🔑 6. Pre-Configured Demo Credentials

All test accounts use password: **`Demo@1234`** *(or click the 1-Click Demo Login buttons on `/login`)*:

| Role | Name | Email | Default Dashboard URL |
| :--- | :--- | :--- | :--- |
| **Student (High Performer)** | Aarav Sharma | `student.aarav@skillledger.dev` | `/dashboard` · `/profile` |
| **Student (Balanced)** | Priya Patel | `student.priya@skillledger.dev` | `/dashboard` · `/portfolio` |
| **Student (Foundational)** | Rohan Verma | `student.rohan@skillledger.dev` | `/dashboard` · `/assess` |
| **Industry Recruiter** | Vikram Malhotra | `recruiter.vikram@techcorp.dev` | `/recruiter-dashboard` · `/pipeline` |
| **Academician / Faculty** | Dr. Ananya Sharma | `prof.sharma@aims.edu` | `/opportunity-feed` · `/acad-profile` |
| **Institutional Admin** | SWAN Admin | `admin@swan.gov.in` | `/admin/swan-dashboard` · `/admin/industry-demand` |

---

## 🇮🇳 7. National Policy & Accreditation Alignment

* **National Education Policy (NEP 2020):** Aligns with NEP mandates for continuous competency-based assessments and mandatory industry internship tracking.
* **NITI Aayog (Viksit Bharat@2047):** Implements digital capability records connecting academic institutions with regional labor market demands.
* **Ministry of Ayush (Ayush Grid):** Pre-loaded knowledge graph taxonomies for Ayurveda, Yoga, Unani, Siddha, and Homoeopathy.
* **NBA & NAAC Accreditation:** Automated generation of Criterion 2 & 4 institutional audit dossiers for Boards of Studies.

---

## 👥 8. Team Uptown func() — SIH 2026

* **Problem Statement ID:** `SIH26044`
* **Theme:** Smart Automation (Software)
* **Team:** Uptown func()

---

<div align="center">
<b>SkillLedger · Smart India Hackathon 2026 · Transforming Education to Employment</b>
</div>