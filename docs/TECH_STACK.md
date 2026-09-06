# TECH_STACK.md

## SkillLedger — SIH 2026 · PS 26044

### Technology Stack Reference for AI Coding Agents

> **Agent Instruction:** This document is a hard constraint file. Every version, rule, and blacklist entry is authoritative. When generating code, check the Forbidden Dependencies section before importing any package. When generating configuration, use exact versions from the Version Matrix.

---

## 1. Strict Version Matrix

| Layer           | Package               | Exact Version           | Notes                                             |
| --------------- | --------------------- | ----------------------- | ------------------------------------------------- |
| Runtime         | Node.js               | `20.18.0 LTS`           | Use `.nvmrc` pinned to this                       |
| Package Manager | pnpm                  | `9.12.0`                | Do not use npm or yarn                            |
| Framework       | Next.js               | `14.2.16`               | App Router only — no Pages Router                 |
| UI Library      | React                 | `18.3.1`                | Peer dep of Next.js 14                            |
| Language        | TypeScript            | `5.6.3`                 | Strict mode enabled                               |
| Styling         | Tailwind CSS          | `3.4.14`                | Do not upgrade to v4 — breaking changes           |
| Component Kit   | shadcn/ui             | `latest` CLI            | Components added via `pnpm dlx shadcn@latest add` |
| ORM             | Prisma                | `5.20.0`                |                                                   |
| DB              | PostgreSQL            | `15` (Supabase managed) |                                                   |
| Auth            | NextAuth.js           | `4.24.10`               | v4 — NOT v5 (beta)                                |
| AI SDK          | Anthropic SDK         | `0.30.0`                | `@anthropic-ai/sdk`                               |
| Validation      | Zod                   | `3.23.8`                |                                                   |
| Charts          | Recharts              | `2.13.0`                |                                                   |
| Icons           | Lucide React          | `0.454.0`               |                                                   |
| Forms           | React Hook Form       | `7.53.1`                |                                                   |
| Form + Zod      | @hookform/resolvers   | `3.9.1`                 |                                                   |
| HTTP Client     | Native `fetch`        | Built-in                | Do not add axios                                  |
| Date Utils      | date-fns              | `4.1.0`                 |                                                   |
| Supabase Client | @supabase/supabase-js | `2.46.1`                | Storage only; DB via Prisma                       |
| Linter          | ESLint                | `8.57.1`                | Next.js built-in config                           |
| Formatter       | Prettier              | `3.3.3`                 |                                                   |

---

## 2. Project Initialisation (Exact Commands — Run In Order)

```bash
# 1. Create Next.js project
pnpm create next-app@14.2.16 skilledger \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd skilledger

# 2. Install core dependencies
pnpm add \
  @anthropic-ai/sdk@0.30.0 \
  @prisma/client@5.20.0 \
  next-auth@4.24.10 \
  zod@3.23.8 \
  recharts@2.13.0 \
  lucide-react@0.454.0 \
  react-hook-form@7.53.1 \
  @hookform/resolvers@3.9.1 \
  date-fns@4.1.0 \
  @supabase/supabase-js@2.46.1

# 3. Install dev dependencies
pnpm add -D \
  prisma@5.20.0 \
  prettier@3.3.3 \
  @types/node@20.18.0

# 4. Initialise Prisma
pnpm prisma init --datasource-provider postgresql

# 5. Initialise shadcn/ui
pnpm dlx shadcn@latest init
# When prompted: Style = Default, Base colour = Slate, CSS variables = yes

# 6. Add required shadcn components
pnpm dlx shadcn@latest add \
  button card input label badge \
  select textarea tabs progress \
  avatar separator dialog toast \
  chart skeleton alert

# 7. Pin Node version
echo "20.18.0" > .nvmrc
```

---

## 3. Configuration Files (Exact)

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### next.config.ts

```typescript
import type { NextConfig } from "next";

const requiredEnvVars = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "ANTHROPIC_API_KEY",
];

// Validate required environment variables at build/startup
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
  images: {
    domains: ["your-supabase-project.supabase.co"],
  },
};

export default nextConfig;
```

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // shadcn/ui CSS variable tokens — do not override
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 4. Environment Variables (.env.example)

```bash
# .env.example — copy to .env.local and fill all values before running

# ─── Database ─────────────────────────────────────────────────────────────────
# Supabase connection string WITH PgBouncer (for runtime)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase direct connection WITHOUT PgBouncer (for migrations only)
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# ─── Auth ─────────────────────────────────────────────────────────────────────
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# ─── AI ───────────────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY="sk-ant-..."

# ─── Supabase Storage ─────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."  # Server-side only — never expose to client
```

---

## 5. Standard Scripts (package.json)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset --force"
  }
}
```

> **Agent Rule:** Use `db:push` during active development for fast schema iteration. Use `db:migrate` when creating a named migration checkpoint. Never edit migration files manually.

---

## 6. Agent Rules by Layer

### 6.1 Frontend Rules

```
RULE F-01: Use Next.js App Router ONLY. Do not create files under /pages/.

RULE F-02: Server Components by default. Add "use client" ONLY when the
           component uses: useState, useEffect, useContext, event handlers,
           browser APIs, or Recharts. Minimize client components.

RULE F-03: Data fetching in Server Components uses async/await directly.
           Never use useEffect for data fetching in Server Components.

RULE F-04: All UI primitives come from shadcn/ui (@/components/ui/).
           Do not write raw HTML button, input, or select elements — always
           use the shadcn counterparts.

RULE F-05: Tailwind CSS for all styling. No inline styles. No CSS modules.
           No styled-components. No emotion.

RULE F-06: All form state managed by React Hook Form + Zod resolver.
           Do not use useState for form fields.

RULE F-07: Charts use Recharts ONLY. Do not import Chart.js, D3, or Victory.

RULE F-08: Loading states: use the Skeleton component from shadcn/ui.
           Never show a blank white space while data loads.

RULE F-09: All icons from lucide-react. Do not import from @heroicons,
           react-icons, or FontAwesome.

RULE F-10: Image optimisation: use next/image for all images.
           Never use <img> tags.

RULE F-11: Navigation: use next/link for all internal links.
           Never use <a href> for internal routes.

RULE F-12: Route groups use the (groupname) convention. Layout files in a
           route group apply to all children. Do not add duplicate layouts.
```

### 6.2 Backend / API Rules

```
RULE B-01: Every API route handler (app/api/**/route.ts) must:
           (a) Check authentication with getServerSession() first
           (b) Check role authorisation second
           (c) Validate input with Zod third
           (d) Call a lib/ service function — no inline business logic
           (e) Return ApiResponse<T> envelope via apiSuccess() or apiError()

RULE B-02: Business logic lives ONLY in lib/. Route handlers orchestrate;
           they do not compute.

RULE B-03: All Anthropic API calls go through lib/assessment/llm-adapter.ts.
           No other file may import @anthropic-ai/sdk.

RULE B-04: LLM responses that are expected to be JSON must be parsed with
           try/catch. Never call JSON.parse() without a catch block.

RULE B-05: All database access goes through the Prisma client imported from
           @/lib/db.ts (a singleton). Never instantiate PrismaClient directly
           in a route handler or service.

           // lib/db.ts — exact singleton pattern:
           import { PrismaClient } from '@prisma/client';
           const globalForPrisma = globalThis as { prisma?: PrismaClient };
           export const prisma = globalForPrisma.prisma ?? new PrismaClient();
           if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

RULE B-06: Use Zod for ALL external input validation: API request bodies,
           URL search params, environment variables, LLM JSON responses.

RULE B-07: API errors must include a machine-readable code string and a
           human-readable message. Never return a raw Error object to the
           client.

RULE B-08: No secrets or environment variables in client components.
           NEXT_PUBLIC_ prefix is the ONLY exception — use it only for
           truly public values (Supabase URL and anon key).

RULE B-09: Async functions in lib/ must propagate errors up to the route
           handler. Do not swallow errors silently.

RULE B-10: Session user data shape (from NextAuth token):
           { id: string, email: string, name: string, role: Role }
           Access via session.user — never re-fetch user from DB in middleware.
```

### 6.3 Database Rules

```
RULE D-01: prisma/schema.prisma is the ONLY source of truth for DB schema.
           Never write raw SQL migrations.

RULE D-02: Use DATABASE_URL (PgBouncer) for all runtime queries.
           Use DIRECT_URL for prisma migrate commands only.
           Both must be set in .env.local.

RULE D-03: Json fields in Prisma schema store structured data.
           Always document the TypeScript type of a Json field in a comment
           above it in schema.prisma.

RULE D-04: Do not use prisma.$queryRaw or prisma.$executeRaw in new code.
           All queries must use the Prisma query builder.

RULE D-05: Always use select or include to fetch only required fields.
           Never fetch an entire model when only 2–3 fields are needed.

RULE D-06: Unique constraints are enforced in schema.prisma with @@unique.
           Do not enforce uniqueness only in application code.

RULE D-07: Cascading deletes are defined in schema.prisma with onDelete.
           Never handle cascades manually in service code.

RULE D-08: Run `pnpm db:generate` after every schema change before writing
           service code that uses the new model/field.
```

---

## 7. Forbidden Dependencies

> **Agent Rule:** Never install or import any package in this list. If you find yourself reaching for one, use the specified alternative.

| Forbidden Package                        | Why                                                                | Use Instead                                    |
| ---------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| `axios`                                  | Unnecessary — native fetch works in Next.js 14                     | Native `fetch`                                 |
| `next-auth@5.*` (beta)                   | Incompatible breaking API with v4 config                           | `next-auth@4.24.10`                            |
| `@next-auth/prisma-adapter` from v5 path | v5 adapter is incompatible                                         | `@auth/prisma-adapter@1.x` for v4              |
| `react-query` / `@tanstack/react-query`  | Unnecessary complexity for hackathon                               | Server Components + `fetch`                    |
| `swr`                                    | Same as above                                                      | Server Components + `fetch`                    |
| `styled-components`                      | Conflicts with Tailwind; no SSR config                             | Tailwind CSS                                   |
| `@emotion/react`                         | Same as styled-components                                          | Tailwind CSS                                   |
| `moment`                                 | 300KB — bloated and deprecated                                     | `date-fns@4.x`                                 |
| `lodash`                                 | Unnecessary for typed TS project                                   | Native array/object methods                    |
| `chart.js` / `react-chartjs-2`           | Conflicts with Recharts; redundant                                 | `recharts@2.x`                                 |
| `d3`                                     | Too low-level; requires manual SSR handling                        | `recharts@2.x`                                 |
| `victory`                                | Redundant charting library                                         | `recharts@2.x`                                 |
| `@heroicons/react`                       | Redundant icon library                                             | `lucide-react`                                 |
| `react-icons`                            | Same as above                                                      | `lucide-react`                                 |
| `framer-motion`                          | Adds 100KB+ for minor animation value                              | Tailwind CSS `transition` utilities            |
| `openai`                                 | Wrong AI provider                                                  | `@anthropic-ai/sdk`                            |
| `langchain`                              | Overkill for single-provider LLM calls                             | Direct `@anthropic-ai/sdk`                     |
| `tailwindcss@4.*`                        | Breaking API change — CSS-based config incompatible with shadcn/ui | `tailwindcss@3.4.14`                           |
| `@tailwindcss/forms`                     | Conflicts with shadcn/ui form styling                              | shadcn/ui Form component                       |
| `dotenv`                                 | Built into Next.js runtime                                         | Use `.env.local` — Next.js loads automatically |
| `bcrypt`                                 | Native addon — causes edge runtime issues                          | `bcryptjs` (pure JS) if needed                 |
| `jsonwebtoken`                           | Manual JWT handling conflicts with NextAuth                        | NextAuth.js handles all JWT                    |
| `multer`                                 | Node.js middleware — incompatible with Next.js App Router          | Supabase Storage client                        |
| `formidable`                             | Same as multer                                                     | Supabase Storage client                        |
| `prisma@6.*`                             | Breaking API change from v5                                        | `prisma@5.20.0`                                |
| `mongoose`                               | MongoDB ORM — wrong database                                       | `prisma@5.20.0`                                |
| `drizzle-orm`                            | Redundant ORM alongside Prisma                                     | `prisma@5.20.0`                                |
| `@vercel/postgres`                       | Bypasses Prisma; loses type safety                                 | Prisma with `DATABASE_URL`                     |

---

## 8. Prisma Client Singleton (lib/db.ts — Exact)

> **Agent Rule:** Every file needing DB access imports `prisma` from `@/lib/db`. This is the only correct import path.

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

## 9. API Response Helpers (lib/utils/api-response.ts — Exact)

```typescript
// lib/utils/api-response.ts
import type { ApiSuccess, ApiError } from "@/types";

export function apiSuccess<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function apiError(code: string, message: string): ApiError {
  return { success: false, error: { code, message } };
}
```

---

## 10. Zod Validation Patterns (Reference)

```typescript
// Pattern: Validate API request body
const CreatePostingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  type: z.enum([
    "INTERNSHIP",
    "JOB",
    "FDP",
    "FACULTY_INTERNSHIP",
    "RESEARCH_PROJECT",
    "CONSULTANCY",
    "LEARNING_PROGRAM",
  ]),
  requiredSkills: z
    .array(
      z.object({
        skill: z.string(),
        minThreshold: z.number().min(0).max(100),
      }),
    )
    .min(1),
  deadline: z.string().datetime(),
  location: z.string().optional(),
  duration: z.string().optional(),
  stipendRange: z.string().optional(),
  eligibilityCriteria: z
    .object({
      yearOfStudy: z.array(z.number()).optional(),
      minCGPA: z.number().optional(),
      institution: z.string().optional(),
    })
    .optional(),
});

// Pattern: Validate LLM JSON output
const LLMEvaluationSchema = z.object({
  evaluation: z.object({
    correctness: z.number().min(0).max(1),
    depth: z.number().min(0).max(1),
    tradeoffAwareness: z.number().min(0).max(1),
    realWorldApplicability: z.number().min(0).max(1),
    composite: z.number().min(0).max(1),
    status: z.enum(["strong", "partial", "weak"]),
  }),
  next_action: z.enum(["advance", "followup", "mark_gap_advance", "complete"]),
  followup_question: z.string().nullable(),
  reasoning: z.string(),
});

// Usage in llm-adapter.ts:
const parsed = LLMEvaluationSchema.safeParse(JSON.parse(llmResponseText));
if (!parsed.success) {
  // retry logic or safe default
}
```

---

## 11. NextAuth Configuration (lib/auth/next-auth-config.ts — Exact)

```typescript
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcryptjs from "bcryptjs";
import type { Role } from "@prisma/client";

export const nextAuthConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;
        // NOTE: Add passwordHash field to User model in schema.prisma
        // const valid = await bcryptjs.compare(credentials.password, user.passwordHash);
        // if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

---

## 12. Deployment Targets

| Service  | Purpose                       | Free Tier                     |
| -------- | ----------------------------- | ----------------------------- |
| Vercel   | Next.js frontend + API routes | Yes — auto-deploy from GitHub |
| Supabase | PostgreSQL + Storage          | Yes — 500MB DB, 1GB storage   |

### Vercel Environment Variables (set in Vercel dashboard)

```
DATABASE_URL         → Supabase PgBouncer URL
DIRECT_URL           → Supabase direct URL
NEXTAUTH_SECRET      → generated secret
NEXTAUTH_URL         → https://your-app.vercel.app
ANTHROPIC_API_KEY    → sk-ant-...
NEXT_PUBLIC_SUPABASE_URL   → Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY → Supabase anon key
SUPABASE_SERVICE_ROLE_KEY  → Supabase service role key
```

### Production Migration Command

```bash
# Run on first deploy — never run db:push in production
pnpm db:migrate:prod
```

---

## 13. Development Workflow

```bash
# Day 1 setup
git clone <repo>
cd skilledger
pnpm install
cp .env.example .env.local
# Fill .env.local with real values

pnpm db:push          # Push schema to DB (dev only)
pnpm db:generate      # Generate Prisma client
pnpm db:seed          # Seed demo data
pnpm dev              # Start dev server at localhost:3000

# After any schema change
pnpm db:push && pnpm db:generate

# Before committing
pnpm lint && pnpm type-check
```
