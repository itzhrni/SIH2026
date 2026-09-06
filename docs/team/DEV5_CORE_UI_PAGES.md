# DEV5 — INDUSTRY UI & ANALYTICS DASHBOARDS

**Member ID:** M5  
**Write Zone:** `app/(industry)/`, industry UI components  
**Branch:** `feat/m5-industry-ui`  
**Read Access:** `components/ui/`, `components/opportunities/`, `types/index.ts`

---

## Responsibilities

| Area                     | Details                                                                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Industry Layout**      | `app/(industry)/layout.tsx` — Protected layout with navigation for industry role.                                                                               |
| **Opportunity Posting**  | Multi-step form for creating/editing opportunity postings. Includes domain selection, skill requirements, role type (internship/jobs/project), and description. |
| **Candidate Discovery**  | Table view of students matched to posted opportunities. Sortable columns, filter by domain/match score, view individual skill profiles.                         |
| **Industry Dashboard**   | Overview of posted opportunities, application counts, top matched candidates, hiring pipeline stats.                                                            |
| **Analytics Dashboards** | Recharts-powered charts for institutional admin: demand pipeline by skill domain, gap trend line charts, skill distribution bar charts.                         |

---

## File-Level Ownership

| File                                         | Action                                                 |
| -------------------------------------------- | ------------------------------------------------------ |
| `app/(industry)/layout.tsx`                  | **Create** — Industry layout with sidebar              |
| `app/(industry)/page.tsx`                    | **Create** — Industry dashboard overview               |
| `app/(industry)/postings/new/page.tsx`       | **Create** — Opportunity posting form                  |
| `app/(industry)/postings/[id]/edit/page.tsx` | **Create** — Edit opportunity posting                  |
| `app/(industry)/candidates/page.tsx`         | **Create** — Candidate discovery table                 |
| `app/(admin)/page.tsx`                       | **Create** — Institutional admin dashboard             |
| `app/(admin)/analytics/page.tsx`             | **Create** — Analytics dashboard with Recharts         |
| `app/(acad)/page.tsx`                        | **Create** — Academician dashboard                     |
| `components/opportunities/*`                 | **Create** — Opportunity card, posting form components |
| `components/dashboard/*`                     | **Create** — Analytics chart components                |
| `components/ui/*`                            | **READ ONLY** — shadcn/ui primitives                   |

---

## Key Constraints

1. **Same UI rules as M4** — Server Components by default, shadcn/ui primitives, Tailwind only, lucide-react icons, Recharts for charts.
2. **Tables use shadcn DataTable pattern** — sortable headers, row actions, pagination.
3. **Forms use React Hook Form + Zod resolver.** No useState for form fields.
4. **Charts use Recharts.** Color constants from `@/constants/chart-palette.ts`.
5. **Admin dashboard must render with populated data** after seed (Demo Rule DEMO-03).

---

## UI Components to Build

### Opportunity Posting Form

- Domain selector (combobox from knowledge graph domains)
- Role type selector (internship / full-time / project)
- Required skills multi-input (tag input)
- Description textarea
- Deadline date picker
- Submit with validation feedback

### Candidate Discovery Table

- Sortable columns: Name, Domain, Match Score, Assessment Status
- Filter dropdown by domain
- Row action: View Skill Profile (dialog or link)
- Match score badge (color-coded by range)
- Loading skeleton during fetch

### Analytics Dashboard Charts

- **Demand Pipeline** — Bar chart showing industry demand by skill domain
- **Gap Trends** — Line chart showing skill gaps over time (semester/quarter)
- **Skill Distribution** — Horizontal bar chart showing student skill score distribution
- **Hiring Pipeline** — Stacked bar showing candidates at each stage

---

## Integration Points

- **M1 (Assessment):** Candidate discovery reads completed assessment data.
- **M2 (Matching):** Candidate discovery reads match scores from `/api/matching/scores`.
- **M3 (DB):** Creates/updates Opportunity model via API routes.
- **M6 (Auth):** Industry and Admin layouts protected by middleware.

---

## Deliverables Checklist

- [ ] `app/(industry)/layout.tsx` — Industry layout
- [ ] Opportunity posting form + edit page
- [ ] Candidate discovery table with match scores
- [ ] `app/(admin)/page.tsx` — Admin dashboard
- [ ] `app/(admin)/analytics/page.tsx` — Recharts analytics charts
- [ ] `app/(acad)/page.tsx` — Academician dashboard
- [ ] All charts use Recharts with chart-palette constants
- [ ] All forms use RHF + Zod
- [ ] Admin dashboard renders with seed data
- [ ] PR passes `pnpm type-check && pnpm lint`

---

_Refer to `docs/UI_UX_SPEC.md` Section 6.1 for chart color palette. Refer to `AGENTS.md` Section 4.1 for frontend rules._
