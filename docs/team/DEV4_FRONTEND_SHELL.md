# DEV4 — STUDENT UI & ASSESSMENT TERMINAL

**Member ID:** M4  
**Write Zone:** `app/(student)/`, student UI components  
**Branch:** `feat/m4-student-ui`  
**Read Access:** `components/ui/`, `components/dashboard/`, `types/index.ts`

---

## Responsibilities

| Area                    | Details                                                                                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Student Layout**      | `app/(student)/layout.tsx` — Protected layout with navigation sidebar/topbar for student role. Middleware enforces role access.                           |
| **Assessment Terminal** | Interactive AI-driven Q&A interface. Displays questions, captures responses, shows loading states during LLM evaluation, renders scores after evaluation. |
| **Skill Portfolio**     | Visual display of student's skill profile with domain scores, badges, and skill score history timeline chart (Recharts).                                  |
| **Opportunity Feed**    | Ranked list of opportunities matched to student's skill profile. Shows match score percentage, domain tags, and apply CTA.                                |
| **Gap Report View**     | Displays gap analysis for completed assessments with actionable upskilling recommendations.                                                               |

---

## File-Level Ownership

| File                                     | Action                                                           |
| ---------------------------------------- | ---------------------------------------------------------------- |
| `app/(student)/layout.tsx`               | **Create** — Student layout with sidebar navigation              |
| `app/(student)/page.tsx`                 | **Create** — Student dashboard (overview cards, recent activity) |
| `app/(student)/assessment/page.tsx`      | **Create** — Assessment Terminal page                            |
| `app/(student)/portfolio/page.tsx`       | **Create** — Skill portfolio with charts                         |
| `app/(student)/opportunities/page.tsx`   | **Create** — Matched opportunity feed                            |
| `app/(student)/gap-report/[id]/page.tsx` | **Create** — Individual gap report view                          |
| `components/assessment/*`                | **Create** — Assessment session components                       |
| `components/portfolio/*`                 | **Create** — Portfolio display components                        |
| `components/opportunities/*`             | **Create** — Opportunity card components                         |
| `components/ui/*`                        | **READ ONLY** — shadcn/ui primitives (DO NOT EDIT)               |
| `app/globals.css`                        | **READ ONLY** — Color tokens (use CSS variables only)            |

---

## Key Constraints

1. **Server Components by default.** Add `"use client"` ONLY when:
   - React hooks (`useState`, `useEffect`, etc.) are needed
   - Event handlers (`onClick`, `onChange`, `onSubmit`) are used
   - Recharts components are rendered
   - Browser APIs are accessed
2. **All UI primitives from `@/components/ui/`.** No raw `<button>`, `<input>`, `<select>`, `<textarea>`, or `<dialog>`.
3. **All styling via Tailwind utilities.** No inline styles, no CSS modules, no styled-components.
4. **Color tokens from `globals.css`.** Use `bg-primary`, `text-foreground-muted`, `border-border` — never hardcode hex values.
5. **Charts use Recharts only.** No chart.js, d3, victory.
6. **Icons from lucide-react only.** No heroicons, react-icons.
7. **Navigation uses `next/link`.** No `<a href>` for internal routes. Images use `next/image`.
8. **Loading states use Skeleton component.** Never show blank white regions.
9. **Form state via React Hook Form + Zod resolver.** No useState for form fields.
10. **Border radius:** `rounded-md` for cards, `rounded-sm` for badges. No `rounded-xl` or `rounded-full`.
11. **Transitions limited to:** `transition-colors duration-150`, `transition-all duration-300` (progress bars), `animate-spin` (LLM spinner).

---

## UI Components to Build

### Assessment Terminal

- Question display area with domain context badge
- Textarea input for student responses
- Submit button with loading spinner during LLM evaluation
- Score card showing evaluation axes (correctness, depth, tradeoffAwareness, realWorldApplicability)
- Follow-up question display (if applicable)
- Session progress indicator (turn counter)

### Skill Portfolio

- Domain score bars (Recharts BarChart or custom div bars)
- Badge grid showing earned competencies
- Skill Score History timeline chart (Recharts AreaChart)
- Overall competency summary card

### Opportunity Feed

- Opportunity card with match score badge, domain tags, company info
- Sort/filter controls (by match score, domain, type)
- Empty state when no opportunities match
- Loading skeleton during fetch

---

## Integration Points

- **M1 (Assessment):** Assessment Terminal calls `/api/assessment/start`, `/api/assessment/submit` routes.
- **M2 (Matching):** Opportunity feed calls `/api/opportunities/feed` for matched postings.
- **M3 (DB):** Reads SkillProfile, GapReport, Opportunity via API routes.
- **M6 (Auth):** Layout protected by middleware role check.

---

## Deliverables Checklist

- [ ] `app/(student)/layout.tsx` — Student layout with sidebar
- [ ] `app/(student)/page.tsx` — Student dashboard
- [ ] Assessment Terminal page + components
- [ ] Skill Portfolio page + Recharts timeline chart
- [ ] Opportunity Feed page with match score display
- [ ] Gap Report detail page
- [ ] All components use shadcn/ui primitives
- [ ] All components use Tailwind color tokens (no hardcoded values)
- [ ] Loading states use Skeleton components
- [ ] `"use client"` on client components only
- [ ] PR passes `pnpm type-check && pnpm lint`

---

_Refer to `docs/UI_UX_SPEC.md` for component patterns, color tokens, and Tailwind class conventions. Refer to `AGENTS.md` Section 4.1 for frontend layer rules._
