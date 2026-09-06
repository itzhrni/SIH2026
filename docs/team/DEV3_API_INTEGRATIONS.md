# DEV3 / M3 — API INTEGRATIONS & MATCHING SERVICE

**Member ID:** M3  
**Write Zone:** `app/api/**`, `lib/assessment/llm-adapter.ts`, `lib/matching/`  
**Branch:** `feat/m3-api-integrations`  
**Read Access:** `lib/db.ts`, `types/index.ts`, `lib/assessment/`, `lib/analytics/`

---

## Responsibilities

| Area                        | Details                                                                                                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Route Handlers**          | `app/api/**` — All API endpoints follow the orchestration pattern: auth → role check → Zod validation → lib/ service call → `ApiResponse<T>`. No business logic in routes.               |
| **LLM Adapter**             | `lib/assessment/llm-adapter.ts` — **The only file** in the codebase that imports `@anthropic-ai/sdk`. Wraps all Anthropic calls with 12s timeout, retry-on-parse-failure, safe fallback. |
| **Matching Service**        | `lib/matching/match-scoring.ts` — Domain overlap calculation, relevance weighting, opportunity ranking for student feed.                                                                 |
| **API Contract Compliance** | All routes return `ApiResponse<T>` envelope via `apiSuccess()` / `apiError()` from `lib/utils/api-response.ts`.                                                                          |
| **Input Validation**        | All POST/PUT/PATCH routes validate request body with Zod schemas. No `z.any()` or `z.unknown()`.                                                                                         |

---

## File-Level Ownership

| File                                       | Action                                                    |
| ------------------------------------------ | --------------------------------------------------------- |
| `app/api/assessment/start/route.ts`        | **Create** — Start new assessment session                 |
| `app/api/assessment/submit/route.ts`       | **Create** — Submit response, trigger LLM evaluation      |
| `app/api/assessment/session/[id]/route.ts` | **Create** — Get session status/details                   |
| `app/api/opportunities/feed/route.ts`      | **Create** — Get matched opportunities for student        |
| `app/api/opportunities/post/route.ts`      | **Create** — Industry creates opportunity posting         |
| `app/api/matching/scores/route.ts`         | **Create** — Get match scores for candidate discovery     |
| `app/api/auth/[...nextauth]/route.ts`      | **Coordinate** with M6 on NextAuth route                  |
| `lib/assessment/llm-adapter.ts`            | **Create** — Anthropic SDK wrapper (SOLE OWNER)           |
| `lib/matching/match-scoring.ts`            | **Create** — Domain overlap + relevance scoring           |
| `types/index.ts`                           | **Read-only** — Use shared types, add matching types only |
| `lib/db.ts`                                | **Read-only** — Import singleton, never re-instantiate    |

---

## Route Handler Template (Mandatory)

Every route handler follows this exact pattern (see AGENTS.md Section 4.2):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { z } from "zod";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

const RequestSchema = z.object({
  /* exact shape */
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check (first)
    const session = await getServerSession(nextAuthConfig);
    if (!session)
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });

    // 2. Role check (second)
    if (session.user.role !== "STUDENT")
      return NextResponse.json(apiError("FORBIDDEN", "Insufficient role"), {
        status: 403,
      });

    // 3. Zod validation
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        apiError("VALIDATION_ERROR", parsed.error.issues[0]?.message),
        { status: 400 },
      );

    // 4. Call lib/ service
    const result = await someService(parsed.data);

    // 5. Return ApiResponse<T>
    return NextResponse.json(apiSuccess(result), { status: 200 });
  } catch (err) {
    console.error("[POST /api/resource]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong"),
      { status: 500 },
    );
  }
}
```

---

## LLM Adapter Rules (Strict)

1. **Sole owner of `@anthropic-ai/sdk` import.** No other file may import it.
2. **Model string is fixed:** `claude-sonnet-4-6`. `max_tokens: 1000`.
3. **12s timeout** via `Promise.race()`. See AGENTS.md Section 7.1.
4. **Retry once** on JSON parse failure. Then apply safe fallback.
5. **Safe fallback on timeout/parse failure:**
   ```json
   {
     "evaluation": {
       "correctness": 0.5,
       "depth": 0.5,
       "tradeoffAwareness": 0.5,
       "realWorldApplicability": 0.5,
       "composite": 0.5,
       "status": "partial"
     },
     "next_action": "advance",
     "followup_question": null
   }
   ```

---

## Key Constraints

1. **No business logic in route handlers.** Only: auth, role check, Zod validation, service call, return.
2. **All API routes wrap body in try/catch.** Catch returns `apiError('INTERNAL_ERROR')`.
3. **Auth check is always first** — before validation, before DB calls.
4. **Role check is always second** — after auth, before validation.
5. **One file per route resource.** No combining unrelated resources.
6. **No raw SQL.** Prisma query builder only.
7. **No forbidden packages.** Native `fetch` for client-side calls.

---

## Integration Points

- **M1 (Assessment):** M1 provides question generation and rubric evaluation logic in `lib/assessment/`. M3 builds the API routes that call M1's services.
- **M2 (Analytics):** M2 provides gap analysis and demand pipeline logic. M3 builds routes for `/api/analytics/*`.
- **M3 (Self):** LLM adapter is the bridge between route handlers and M1's assessment engine.
- **M4/M5 (UI):** All UI pages consume data through M3's API routes.
- **M6 (Auth):** M3 routes use M6's NextAuth session for authentication.

---

## Deliverables Checklist

- [ ] `lib/assessment/llm-adapter.ts` — Anthropic wrapper with timeout + retry + fallback
- [ ] `lib/matching/match-scoring.ts` — Domain overlap + relevance scoring
- [ ] All `app/api/**` route handlers following mandatory template
- [ ] Zod schemas for all POST/PUT/PATCH inputs (no z.any/z.unknown)
- [ ] All routes return `ApiResponse<T>` envelope
- [ ] All routes have try/catch with INTERNAL_ERROR fallback
- [ ] Auth check first, role check second in every route
- [ ] `pnpm type-check && pnpm lint` passes
- [ ] `pnpm build` succeeds

---

_Refer to `AGENTS.md` Section 4.2 for route handler rules. Refer to `AGENTS.md` Section 7.1 for LLM guardrails. Refer to `docs/SCHEMA.md` for model field definitions._
