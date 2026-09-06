# AGENTS.md

> Also aliased as `CLAUDE.md`. This file is loaded by every autonomous AI coding agent (Claude, Codex, Qwen) before writing or modifying any code in this repository. All directives are binding. No exceptions.

**Platform:** SkillLedger · SIH 2026 · PS 26044  
**Stack:** Next.js 14.2.16 · TypeScript 5.6.3 · PostgreSQL 15 · Prisma 5.20.0 · Anthropic SDK 0.30.0

---

## 0. First Instruction — Always Read Docs First

```
BEFORE writing any code, creating any file, or modifying any module:

1. Read /docs/ARCHITECTURE.md  — directory structure, service boundaries, data flows
2. Read /docs/TECH_STACK.md    — exact versions, agent rules, forbidden dependencies
3. Read /docs/SCHEMA.md        — Prisma schema, Json field shapes, cascade rules
4. Read /docs/UI_UX_SPEC.md    — component patterns, color tokens, Tailwind classes
5. Read /docs/MVP_Cut.md       — what is in scope; do not build deferred features

If a section of an existing file is relevant to your task, read it before writing.
Do not rely on training-data assumptions about APIs, file locations, or conventions —
the docs folder is always authoritative over your priors.
```

---

## 1. Non-Destructive Execution Policy

```
RULE ND-01: Never delete an existing file unless the task explicitly says "delete".
RULE ND-02: Never overwrite an existing file in full unless the task explicitly says
            "replace" or "rewrite". Prefer targeted edits to specific functions or sections.
RULE ND-03: Never rename a file or directory without explicit instruction.
RULE ND-04: Never remove an existing import, export, or type definition unless you
            are certain it is unused AND the task explicitly asks you to clean it up.
RULE ND-05: When adding to an existing file, append or insert — do not restructure
            surrounding code that is not part of the task.
RULE ND-06: If a task requires you to change a shared interface in @/types/index.ts,
            check all call sites before modifying. Changing a shared type is a
            breaking change — flag it explicitly in a comment before proceeding.
```

---

## 2. Allowed CLI Commands

> Run only these commands. Never run `npm`, `yarn`, `npx` (use `pnpm dlx`), or `node` directly.

```bash
# Development
pnpm dev                  # Start Next.js dev server (port 3000)

# Verification — run before marking any task complete
pnpm lint                 # ESLint — must pass with zero errors
pnpm type-check           # tsc --noEmit — must pass with zero type errors
pnpm format               # Prettier write — run after any file creation

# Database
pnpm db:push              # Push schema changes to DB — dev only, never in production
pnpm db:generate          # Regenerate Prisma client — run after every schema.prisma change
pnpm db:migrate           # Create named migration checkpoint
pnpm db:migrate:prod      # Deploy migrations in production — never run locally
pnpm db:studio            # Open Prisma Studio
pnpm db:seed              # Seed demo data for SIH live demo

# Build
pnpm build                # Production build — run to verify no build-time errors
```

```
RULE CLI-01: After every schema.prisma change, run `pnpm db:generate` before writing
             any service code that references the updated model or field.
RULE CLI-02: After completing any task, run `pnpm lint && pnpm type-check`.
             Do not mark a task complete if either command reports errors.
RULE CLI-03: Never run `pnpm db:migrate:prod` or `pnpm db:reset` in a local dev task.
RULE CLI-04: Use `pnpm dlx` for one-off package executions (e.g. shadcn component adds).
             Never use `npx`.
```

---

## 3. Repository Directory Law

> The directory structure below is fixed. Do not create new top-level directories.
> Do not create files outside the locations defined here.

```
skilledger/
├── app/                    # Next.js App Router ONLY — no /pages/ directory
│   ├── (auth)/             # Public auth pages (login, register)
│   ├── (student)/          # Student role pages + layout
│   ├── (industry)/         # Industry role pages + layout
│   ├── (admin)/            # Institutional admin pages + layout
│   ├── (acad)/             # Academician pages + layout
│   └── api/                # Route Handlers — orchestration only, no business logic
├── components/
│   ├── ui/                 # shadcn/ui base components — DO NOT EDIT
│   ├── assessment/         # Assessment session components
│   ├── portfolio/          # Portfolio display components
│   ├── opportunities/      # Opportunity feed + card components
│   └── dashboard/          # Analytics chart components
├── lib/                    # All business logic lives here
│   ├── assessment/         # AI engine, LLM adapter, graph loader, rubric evaluator
│   ├── matching/           # Opportunity match scoring, career guidance
│   ├── analytics/          # Demand pipeline, gap analysis
│   ├── auth/               # NextAuth config, role guard middleware
│   └── utils/              # api-response.ts, error-handler.ts
├── prisma/
│   ├── schema.prisma       # Single source of truth for DB schema
│   └── migrations/         # Auto-generated — NEVER manually edit
├── data/
│   └── knowledge-graphs/   # Pre-built domain JSON files — read-only at runtime
├── types/
│   └── index.ts            # ALL shared TypeScript types — single file
├── docs/                   # Architecture docs — READ BEFORE CODING
└── middleware.ts            # Role-based route protection — edit with caution
```

---

## 4. Layer Hard Boundaries

### 4.1 Frontend Layer (`app/` and `components/`)

```
RULE FE-01: Server Components by default.
            Add "use client" ONLY when the component uses one or more of:
              - useState, useEffect, useReducer, useContext, useRef
              - onClick, onChange, onSubmit, or any event handler
              - Recharts (all Recharts components require client rendering)
              - Browser APIs (window, document, localStorage)
            If none of the above apply, the component is a Server Component.
            Do not add "use client" defensively.

RULE FE-02: All UI primitives come from @/components/ui/ (shadcn/ui).
            Do not write raw <button>, <input>, <select>, <textarea>, or <dialog>
            elements. Use the shadcn Button, Input, Select, Textarea, Dialog
            counterparts from @/components/ui/.

RULE FE-03: Data fetching in Server Components uses async/await directly with
            the Prisma client or a lib/ service. Never use useEffect for data
            fetching in Server Components.

RULE FE-04: All form state is managed by React Hook Form + Zod resolver.
            Do not use useState to track form field values.

RULE FE-05: All charts use Recharts exclusively. Do not import from chart.js,
            d3, victory, or any other charting library.

RULE FE-06: All icons are from lucide-react. Do not import from @heroicons,
            react-icons, or FontAwesome.

RULE FE-07: All styling uses Tailwind CSS utility classes.
            No inline styles. No CSS modules. No styled-components. No emotion.

RULE FE-08: Internal navigation uses next/link. Never use <a href> for internal routes.
            Images use next/image. Never use <img> tags.

RULE FE-09: Loading states use the shadcn Skeleton component from @/components/ui/skeleton.
            Never show a blank white region while data loads.

RULE FE-10: Color values are CSS variable tokens from globals.css only.
            Do not hardcode hex or rgb values in Tailwind classes.
            Use bg-primary, text-foreground-muted, border-border — never bg-[#0078D4].
            Exception: Recharts stroke/fill props use constants from
            @/constants/chart-palette.ts — see UI_UX_SPEC.md Section 6.1.

RULE FE-11: Border radius is rounded-md (6px) for cards and panels.
            rounded-sm for badges and inline elements.
            Never use rounded-xl, rounded-2xl, or rounded-full on structural elements.

RULE FE-12: Transitions are limited to:
              transition-colors duration-150 ease-in-out  (hover colour shifts)
              transition-all duration-300 ease-out         (progress bar fill only)
              animate-spin                                  (LLM loading spinner only)
            Do not add bounce, pulse on decorative elements, or entrance animations.
```

### 4.2 API Route Layer (`app/api/**`)

```
RULE API-01: Route Handlers orchestrate — they do not compute.
             The only logic permitted directly in a route.ts file is:
               1. getServerSession() auth check
               2. Role authorisation check
               3. Zod input validation
               4. One or more lib/ service function calls
               5. Return ApiResponse<T> via apiSuccess() or apiError()
             Any logic beyond this belongs in lib/. Move it there.

RULE API-02: Every route handler wraps its body in try/catch.
             The catch block must log the error and return:
             NextResponse.json(apiError('INTERNAL_ERROR', 'Something went wrong'), { status: 500 })

RULE API-03: Every route handler returns the ApiResponse<T> envelope.
             Import apiSuccess and apiError from @/lib/utils/api-response.
             Never return a raw object, a raw error, or NextResponse.json({}) without the envelope.

RULE API-04: Auth check is always first — before Zod validation, before any DB call.
             A missing or invalid session returns status 401 immediately.

RULE API-05: Role check is always second — after auth, before Zod validation.
             A role mismatch returns status 403 immediately.

RULE API-06: HTTP method handlers are named exports: GET, POST, PUT, PATCH, DELETE.
             One file per route. Do not combine unrelated resources in one route file.
```

**Exact Route Handler Template — copy this verbatim:**

```typescript
// app/api/{resource}/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { z } from "zod";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

const RequestSchema = z.object({
  // define exact shape — no z.any(), no z.unknown()
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    // 2. Role (adjust role as required)
    if (session.user.role !== "STUDENT") {
      return NextResponse.json(apiError("FORBIDDEN", "Insufficient role"), {
        status: 403,
      });
    }

    // 3. Validate
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError(
          "VALIDATION_ERROR",
          parsed.error.issues[0]?.message ?? "Invalid input",
        ),
        { status: 400 },
      );
    }

    // 4. Call lib/ service
    const result = await someService(parsed.data);

    // 5. Return
    return NextResponse.json(apiSuccess(result), { status: 200 });
  } catch (err) {
    console.error("[POST /api/{resource}]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong"),
      { status: 500 },
    );
  }
}
```

### 4.3 Business Logic Layer (`lib/`)

```
RULE LIB-01: All business logic, computation, and data transformation lives in lib/.
             Service functions are plain async TypeScript functions — no framework imports.

RULE LIB-02: Service functions throw errors with descriptive messages.
             They do not return null or undefined on failure.
             The route handler's catch block handles the error.

RULE LIB-03: All Anthropic API calls are routed through lib/assessment/llm-adapter.ts.
             No other file in the codebase may import @anthropic-ai/sdk directly.
             If you need an LLM call in a new feature, add a function to llm-adapter.ts.

RULE LIB-04: LLM responses that are expected to be JSON must be parsed with
             Zod after JSON.parse(). Never use JSON.parse() without a
             try/catch and a Zod schema validation step.

RULE LIB-05: lib/ functions must not import from app/ or components/.
             Dependency flow is one-way: app/ → lib/ → prisma.
             lib/ must never import from app/.
```

### 4.4 Database Layer (`prisma/`)

```
RULE DB-01: Import the Prisma client exclusively from @/lib/db:
              import { prisma } from '@/lib/db';
            Never instantiate PrismaClient directly in any other file.

RULE DB-02: Never write raw SQL. No prisma.$queryRaw. No prisma.$executeRaw.
            All queries use the Prisma query builder exclusively.

RULE DB-03: After every schema.prisma change run `pnpm db:generate`
            before writing any code that uses the new model or field.

RULE DB-04: Use select or include to fetch only required fields.
            Never fetch an entire model when only 2–3 fields are needed.

RULE DB-05: All Json fields have typed shapes documented in SCHEMA.md Section 5.
            Read that section before reading or writing a Json field.
            Validate Json field contents with Zod before writing to DB.

RULE DB-06: Cascading deletes are defined in schema.prisma with onDelete.
            Do not manually delete child records before parent deletion.

RULE DB-07: `pnpm db:push` is for development schema iteration only.
            Never call db:push in a production context.
```

### 4.5 Types Layer (`types/index.ts`)

```
RULE TYPE-01: All shared TypeScript interfaces and types are defined in
              @/types/index.ts. This is the single types file.
              Import from @/types — never from relative paths like ../../types.

RULE TYPE-02: Do not define inline types or interfaces inside component files,
              route handlers, or lib/ service files.
              If a type is used in more than one place, it belongs in @/types/index.ts.

RULE TYPE-03: Do not use `any`. Do not use `unknown` unless you immediately
              narrow it with a type guard or Zod parse.
              TypeScript strict mode is enabled — type errors are build failures.

RULE TYPE-04: Prisma-generated types (from @prisma/client) may be imported
              directly in lib/ and app/api/ files for model types.
              Use Prisma types for DB query results; use @/types for
              application-layer data shapes passed between services and UI.
```

---

## 5. API Response Envelope — Mandatory

Every API route handler returns this shape. No exceptions.

```typescript
// @/lib/utils/api-response.ts — exact implementation

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string; // machine-readable: 'UNAUTHORIZED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR' | ...
    message: string; // human-readable: shown in UI error states
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function apiSuccess<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function apiError(code: string, message: string): ApiError {
  return { success: false, error: { code, message } };
}
```

**Client-side consumption pattern:**

```typescript
const res = await fetch("/api/assess/start", {
  method: "POST",
  body: JSON.stringify(payload),
});
const json: ApiResponse<StartSessionResult> = await res.json();

if (!json.success) {
  // json.error.code and json.error.message are always present
  setError(json.error.message);
  return;
}

// json.data is fully typed as StartSessionResult
const { sessionId, question } = json.data;
```

---

## 6. Forbidden Dependencies

> Never install or import any package in this list. If you encounter an import of a forbidden package in existing code, flag it — do not silently remove or rewrite it without an explicit task.

| Forbidden Package                       | Reason                                                | Correct Alternative                                                  |
| --------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| `axios`                                 | Unnecessary — native fetch works in Next.js 14        | Native `fetch`                                                       |
| `next-auth@5.*` (beta)                  | Breaking API incompatible with v4 config              | `next-auth@4.24.10`                                                  |
| `react-query` / `@tanstack/react-query` | Unnecessary for this architecture                     | Server Components + `fetch`                                          |
| `swr`                                   | Same as react-query                                   | Server Components + `fetch`                                          |
| `styled-components`                     | Conflicts with Tailwind; no SSR config                | Tailwind CSS utilities                                               |
| `@emotion/react`                        | Same as styled-components                             | Tailwind CSS utilities                                               |
| `framer-motion`                         | 100KB+ for minor animation — forbidden                | Tailwind `transition-*` utilities                                    |
| `moment`                                | 300KB deprecated library                              | `date-fns@4.x`                                                       |
| `lodash`                                | Unnecessary for typed TS project                      | Native array/object methods                                          |
| `chart.js` / `react-chartjs-2`          | Conflicts with Recharts                               | `recharts@2.13.0`                                                    |
| `d3`                                    | Too low-level; requires manual SSR handling           | `recharts@2.13.0`                                                    |
| `victory`                               | Redundant charting library                            | `recharts@2.13.0`                                                    |
| `@heroicons/react`                      | Redundant icon library                                | `lucide-react@0.454.0`                                               |
| `react-icons`                           | Redundant icon library                                | `lucide-react@0.454.0`                                               |
| `openai`                                | Wrong AI provider                                     | `@anthropic-ai/sdk@0.30.0`                                           |
| `langchain`                             | Overkill — adds complexity without value              | Direct `@anthropic-ai/sdk` calls via `lib/assessment/llm-adapter.ts` |
| `tailwindcss@4.*`                       | Breaking CSS-based config incompatible with shadcn/ui | `tailwindcss@3.4.14`                                                 |
| `@tailwindcss/forms`                    | Conflicts with shadcn/ui form styling                 | shadcn/ui Form component                                             |
| `dotenv`                                | Built into Next.js runtime automatically              | `.env.local` — Next.js loads it                                      |
| `bcrypt`                                | Native addon — edge runtime incompatible              | `bcryptjs` (pure JS)                                                 |
| `jsonwebtoken`                          | Manual JWT conflicts with NextAuth                    | NextAuth.js manages all JWT                                          |
| `multer` / `formidable`                 | Node.js middleware incompatible with App Router       | Supabase Storage client                                              |
| `prisma@6.*`                            | Breaking API change from v5                           | `prisma@5.20.0`                                                      |
| `mongoose`                              | MongoDB ORM — wrong database                          | `prisma@5.20.0`                                                      |
| `drizzle-orm`                           | Redundant alongside Prisma                            | `prisma@5.20.0`                                                      |
| `@vercel/postgres`                      | Bypasses Prisma — loses type safety                   | Prisma with `DATABASE_URL`                                           |
| `npm` / `yarn`                          | Wrong package manager for this repo                   | `pnpm@9.12.0`                                                        |

---

## 7. SIH Hackathon Guardrails

### 7.1 LLM Inference — Latency and Fallback

```
RULE LLM-01: All Anthropic API calls in lib/assessment/llm-adapter.ts must be wrapped
             in a Promise.race() with a 12-second timeout.

RULE LLM-02: If the LLM call times out or throws, do not crash the session.
             Apply the safe fallback:
               evaluation: { correctness: 0.5, depth: 0.5, tradeoffAwareness: 0.5,
                             realWorldApplicability: 0.5, composite: 0.5, status: "partial" }
               next_action: "advance"
               followup_question: null
             Log the timeout with console.error('[LLM_TIMEOUT]', ...) and continue.

RULE LLM-03: If the LLM response cannot be parsed as valid JSON or fails Zod validation,
             retry exactly once with the same prompt.
             If the second attempt also fails, apply the safe fallback from LLM-02.
             Never crash an assessment session due to an LLM parse failure.

RULE LLM-04: The model string for all Anthropic calls is 'claude-sonnet-4-6'.
             Do not use any other model string. Do not make the model name configurable
             at runtime.

RULE LLM-05: max_tokens for all assessment calls is 1000.
             Do not exceed this value.
```

**Timeout wrapper pattern — use this exactly in llm-adapter.ts:**

```typescript
const timeout = <T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`[LLM_TIMEOUT] ${label} exceeded ${ms}ms`)),
        ms,
      ),
    ),
  ]);

// Usage
const raw = await timeout(
  anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages,
  }),
  12_000,
  "evaluateResponse",
);
```

### 7.2 Environment Variable Validation

```
RULE ENV-01: Required environment variables are validated at startup in next.config.ts.
             The app must throw a descriptive error and refuse to start if any are missing.
             Never silently default a missing secret to an empty string.

RULE ENV-02: Required variables:
               DATABASE_URL        — Supabase PgBouncer connection string
               DIRECT_URL          — Supabase direct connection string
               NEXTAUTH_SECRET     — minimum 32-character random string
               NEXTAUTH_URL        — full URL including protocol
               ANTHROPIC_API_KEY   — must start with "sk-ant-"

RULE ENV-03: The following are NEXT_PUBLIC_ prefixed and safe to expose to the client:
               NEXT_PUBLIC_SUPABASE_URL
               NEXT_PUBLIC_SUPABASE_ANON_KEY
             All other variables are server-only. Never reference them in client components.

RULE ENV-04: SUPABASE_SERVICE_ROLE_KEY is server-only and must never appear in
             any client component, even wrapped in an environment check.
```

**Startup validation block — already in next.config.ts, do not remove:**

```typescript
const requiredEnvVars = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "ANTHROPIC_API_KEY",
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(
      `[SkillLedger] Missing required environment variable: ${key}`,
    );
  }
});
```

### 7.3 Demo Safety Rules

```
RULE DEMO-01: The seed data command `pnpm db:seed` must be idempotent.
              Running it twice must not create duplicate users or duplicate postings.
              Use upsert or pre-check existence before inserting.

RULE DEMO-02: Assessment sessions for the 3 demo student accounts must be
              pre-completed before the demo. The seed script must create:
                - Completed AssessmentSession + GapReport for each student
                - Populated SkillProfile with domainScores and badges
                - SkillScoreHistory entries to render the timeline chart

RULE DEMO-03: The institutional admin dashboard must render with populated data
              when logged in as the seed admin account. Verify this after `pnpm db:seed`.

RULE DEMO-04: No feature that is marked as "Deferred" in docs/MVP_Cut.md may
              appear in any UI, route, or service during the Internal Round prototype.
              Do not build deferred features. Do not add placeholder UI for them.
```

### 7.4 Latency Budgets

| Operation                        | Target  | Hard Limit | On Breach                           |
| -------------------------------- | ------- | ---------- | ----------------------------------- |
| LLM question generation          | < 4s    | 12s        | Timeout → safe fallback             |
| LLM response evaluation          | < 5s    | 12s        | Timeout → safe fallback             |
| Opportunity feed (match scoring) | < 1s    | 3s         | Log warning, return partial results |
| Portfolio page load              | < 800ms | 2s         | Verify with `pnpm build`            |
| Dashboard charts                 | < 1.5s  | 4s         | Pre-aggregate on seed               |

---

## 8. Concurrent Write Safety

```
RULE CW-01: Before creating a new AssessmentSession, check for an existing
            in_progress session for the same userId + domain.
            If one exists, return it — do not create a new one.

RULE CW-02: Never increment turnIndex in application code (read → +1 → write).
            Use Prisma atomic increment:
              data: { turnIndex: { increment: 1 } }

RULE CW-03: When writing nodeResults, use updateMany with turnIndex in the
            where clause to implement optimistic locking:
              where: { id: sessionId, turnIndex: expectedTurnIndex }
            If updated.count === 0, the write was rejected — the session was
            concurrently advanced. Throw a SESSION_CONCURRENT_WRITE error.

RULE CW-04: GapReport generation is idempotent. Check for an existing
            GapReport for the sessionId before creating one.
            If it exists, return it — do not create a duplicate.
```

---

## 9. Prisma Client Singleton — Exact Implementation

> This is the only correct pattern. Do not deviate.

```typescript
// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## 10. shadcn/ui Component Addition Protocol

When a new shadcn/ui component is needed:

```bash
# Add via CLI — never copy-paste from docs manually
pnpm dlx shadcn@latest add <component-name>

# Example
pnpm dlx shadcn@latest add tooltip
pnpm dlx shadcn@latest add command
```

```
RULE SHADCN-01: Never edit files inside components/ui/. They are managed by the
                shadcn CLI. Customise behaviour by wrapping in a new component
                in components/{domain}/.

RULE SHADCN-02: Do not add shadcn components that are not needed for the MVP.
                Check docs/MVP_Cut.md before installing a new component.
```

---

## 11. Knowledge Graph Files — Read-Only at Runtime

```
RULE KG-01: Files in data/knowledge-graphs/*.json are read at session start by
            lib/assessment/graph-loader.ts. They are never written to at runtime.

RULE KG-02: Every knowledge graph file must conform to the KnowledgeGraph interface
            in @/types/index.ts. Validate with Zod on load — throw at startup if
            a graph file is malformed.

RULE KG-03: The following domain files must exist before the SIH demo:
              data/knowledge-graphs/dsa.json
              data/knowledge-graphs/system-design.json
              data/knowledge-graphs/machine-learning.json
              data/knowledge-graphs/core-cs.json
              data/knowledge-graphs/ayurvedic-pharmacology.json
              data/knowledge-graphs/clinical-practice.json
            Do not remove or rename any of these files.
```

---

## 12. Role-Based Access — Enforcement Points

```
RULE RBAC-01: middleware.ts enforces route-group access at the edge.
              Do not duplicate role checks inside page components — the middleware
              guarantees role correctness for every request that reaches a page.

RULE RBAC-02: API routes enforce role checks independently (RULE API-05).
              Do not assume that passing middleware means an API route is safe —
              direct API calls bypass the page middleware.

RULE RBAC-03: The four in-scope roles for the MVP are:
                STUDENT · INDUSTRY · ACADEMICIAN · INSTITUTIONAL_ADMIN
              The POLICYMAKER role is deferred. Do not add it to any enum, form,
              or route in the Internal Round prototype.

RULE RBAC-04: Role is stored in the JWT token as session.user.role.
              Read role from the session — never re-fetch it from the database
              inside a middleware or route handler.
```

---

## 13. Task Completion Checklist

Before marking any task as complete, verify:

```
□ pnpm lint        — zero errors
□ pnpm type-check  — zero type errors
□ pnpm build       — build completes without errors (run for any route or component change)
□ No forbidden packages imported (check Section 6)
□ No deferred features built (check docs/MVP_Cut.md)
□ No raw SQL written (check Section 4.4)
□ No business logic in route handlers (check Section 4.2)
□ All new shared types added to @/types/index.ts only
□ All new API routes return ApiResponse<T> envelope
□ LLM calls go through lib/assessment/llm-adapter.ts only
□ Schema changes followed by pnpm db:generate
□ New UI components use shadcn primitives and Tailwind tokens only
```
