# UI_UX_SPEC.md

## SkillLedger — SIH 2026 · PS 26044

### Design System Reference for AI Coding Agents (Dev 4, Dev 5, Dev 6)

> **Agent Instruction:** This document is the authoritative design specification. Every token, class, component pattern, and layout rule defined here is binding. Do not invent new color values, deviate from the typography scale, or introduce animation patterns not listed in Section 7. When in doubt, choose the simpler, quieter option — this is an enterprise governance platform, not a consumer product.

---

## 1. Design Philosophy

SkillLedger is infrastructure for high-stakes decisions: hiring, curriculum reform, skill certification, institutional benchmarking. The visual language must communicate that gravity. The reference aesthetic is **Microsoft Fluent 2 applied to Azure Portal and Microsoft 365 Admin Center** — not as imitation, but as a shared commitment to the same values:

- **Information over decoration.** Every pixel earns its place by communicating something.
- **Density without clutter.** Pack more data per viewport. Use tight spacing, compact type, and 1px dividers rather than whitespace as a separator.
- **Neutral surfaces, active accents.** The UI recedes so data comes forward. One blue — used sparingly — pulls the eye to what matters.
- **Engineered precision.** Sharp corners, 1px borders, no blurry shadows, no cartoonish gradients. The interface should look like it was built by people who care about correctness.
- **Calm confidence.** No bouncing, floating, or pulsing. Motion is fast, purposeful, and invisible after you've seen it once.

---

## 2. Color System

### 2.1 Design Decisions

The palette runs on a slate-anchored neutral base with a single cobalt-blue accent (`#0078D4` — Microsoft's primary blue). Status tokens use muted, desaturated tones — not the saturated success-green or warning-red of consumer apps. The dark mode is a deep enterprise slate, not OLED black.

One deliberate risk: the "SkillLedger verified" badge uses a cobalt-to-indigo diagonal — the only gradient in the system — reserved exclusively for earned skill badges. Everything else is flat.

### 2.2 Palette Definitions

```
LIGHT MODE SURFACES
  Canvas (page bg):     #FFFFFF   — pure white, primary surface
  Subtle (secondary bg): #F8F9FA  — input fills, sidebar bg, table row alt
  Muted (tertiary bg):  #F1F5F9   — code blocks, skeleton base
  Border:               #E2E8F0   — 1px dividers, card borders
  Border Strong:        #CBD5E1   — table headers, focused inputs

DARK MODE SURFACES
  Canvas:               #0F172A   — primary surface
  Subtle:               #0B1222   — sidebar, panel bg
  Muted:                #1E293B   — hover states, alt rows
  Border:               #1E293B   — 1px dividers
  Border Strong:        #334155   — focused borders

PRIMARY ACCENT
  Cobalt:               #0078D4   — CTAs, links, active nav, progress fill
  Cobalt Hover:         #106EBE   — button hover state
  Cobalt Subtle bg:     #EFF6FF   — selected row bg, badge bg for active items
  Cobalt Dark:          #2B91FF   — dark mode accent

TEXT
  Primary:              #0F172A   — body, headings (light mode)
  Secondary:            #475569   — labels, captions, helper text
  Tertiary:             #94A3B8   — placeholder, disabled, timestamps
  On-accent:            #FFFFFF   — text on cobalt buttons

STATUS TOKENS
  Success text:         #166534   bg: #F0FDF4   border: #BBF7D0
  Warning text:         #92400E   bg: #FFFBEB   border: #FDE68A
  Destructive text:     #9F1239   bg: #FFF1F2   border: #FECDD3
  Info text:            #1E40AF   bg: #EFF6FF   border: #BFDBFE

GAP SEVERITY (from SCHEMA.md)
  HIGH gap:             text #9F1239   bg #FFF1F2   — rose/crimson
  MEDIUM gap:           text #92400E   bg #FFFBEB   — amber
  LOW gap:              text #166534   bg #F0FDF4   — emerald

SKILLEDGER BADGE GRADIENT (earned badge only)
  From: #0067B8   To: #4F46E5   Direction: 135deg
  Used exclusively on: SkillBadge component when earned === true
```

### 2.3 CSS Variable Tokens (`app/globals.css`)

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Surfaces */
    --background: 0 0% 100%;
    --background-subtle: 210 20% 98%;
    --background-muted: 214 32% 96%;

    /* Foregrounds */
    --foreground: 222 47% 11%;
    --foreground-muted: 215 16% 47%;
    --foreground-subtle: 215 20% 65%;

    /* Card */
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;

    /* Border */
    --border: 214 32% 91%;
    --border-strong: 213 27% 84%;
    --input: 214 32% 91%;
    --ring: 211 100% 42%; /* cobalt focus ring */

    /* Primary (Cobalt) */
    --primary: 211 100% 42%; /* #0078D4 */
    --primary-hover: 210 83% 40%; /* #106EBE */
    --primary-subtle: 214 100% 97%; /* #EFF6FF */
    --primary-foreground: 0 0% 100%;

    /* Secondary (Slate neutral) */
    --secondary: 214 32% 91%;
    --secondary-foreground: 222 47% 11%;

    /* Muted */
    --muted: 214 32% 96%;
    --muted-foreground: 215 16% 47%;

    /* Accent */
    --accent: 214 32% 96%;
    --accent-foreground: 222 47% 11%;

    /* Status */
    --success: 140 65% 25%;
    --success-bg: 138 76% 97%;
    --success-border: 141 79% 85%;

    --warning: 27 87% 29%;
    --warning-bg: 48 100% 96%;
    --warning-border: 46 97% 77%;

    --destructive: 343 84% 35%;
    --destructive-bg: 356 100% 97%;
    --destructive-border: 352 96% 90%;

    --info: 226 71% 40%;
    --info-bg: 214 100% 97%;
    --info-border: 213 94% 88%;

    /* Popover */
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    /* Radius */
    --radius: 0.375rem; /* 6px — tight, enterprise feel */
  }

  .dark {
    --background: 222 47% 7%; /* #0F172A */
    --background-subtle: 224 53% 5%; /* #0B1222 */
    --background-muted: 217 33% 17%; /* #1E293B */

    --foreground: 210 40% 98%;
    --foreground-muted: 215 20% 65%;
    --foreground-subtle: 215 16% 47%;

    --card: 222 47% 7%;
    --card-foreground: 210 40% 98%;

    --border: 217 33% 17%;
    --border-strong: 215 25% 27%;
    --input: 217 33% 17%;
    --ring: 211 100% 60%;

    --primary: 211 100% 60%;
    --primary-hover: 210 100% 66%;
    --primary-subtle: 220 47% 14%;
    --primary-foreground: 0 0% 100%;

    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;

    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 98%;

    --popover: 222 47% 7%;
    --popover-foreground: 210 40% 98%;

    --destructive: 0 63% 31%;
    --destructive-bg: 0 47% 11%;
    --destructive-border: 0 63% 31%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-family:
      "Segoe UI",
      -apple-system,
      BlinkMacSystemFont,
      "Inter",
      system-ui,
      sans-serif;
    font-feature-settings:
      "kern" 1,
      "liga" 1,
      "calt" 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

### 2.4 Tailwind Config Token Extension (`tailwind.config.ts`)

```typescript
// Add inside theme.extend in tailwind.config.ts

extend: {
  colors: {
    // shadcn/ui tokens — do not remove
    border: 'hsl(var(--border))',
    'border-strong': 'hsl(var(--border-strong))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
    background: 'hsl(var(--background))',
    'background-subtle': 'hsl(var(--background-subtle))',
    'background-muted': 'hsl(var(--background-muted))',
    foreground: 'hsl(var(--foreground))',
    'foreground-muted': 'hsl(var(--foreground-muted))',
    'foreground-subtle': 'hsl(var(--foreground-subtle))',
    primary: {
      DEFAULT: 'hsl(var(--primary))',
      hover: 'hsl(var(--primary-hover))',
      subtle: 'hsl(var(--primary-subtle))',
      foreground: 'hsl(var(--primary-foreground))',
    },
    card: {
      DEFAULT: 'hsl(var(--card))',
      foreground: 'hsl(var(--card-foreground))',
    },
    // Status tokens
    success: {
      DEFAULT: 'hsl(var(--success))',
      bg: 'hsl(var(--success-bg))',
      border: 'hsl(var(--success-border))',
    },
    warning: {
      DEFAULT: 'hsl(var(--warning))',
      bg: 'hsl(var(--warning-bg))',
      border: 'hsl(var(--warning-border))',
    },
    destructive: {
      DEFAULT: 'hsl(var(--destructive))',
      bg: 'hsl(var(--destructive-bg))',
      border: 'hsl(var(--destructive-border))',
    },
    info: {
      DEFAULT: 'hsl(var(--info))',
      bg: 'hsl(var(--info-bg))',
      border: 'hsl(var(--info-border))',
    },
  },
  fontSize: {
    // Compact enterprise type scale
    '2xs': ['0.625rem', { lineHeight: '0.875rem' }],  // 10px — timestamps, badges
    'xs':  ['0.75rem',  { lineHeight: '1rem' }],       // 12px — captions, labels
    'sm':  ['0.8125rem',{ lineHeight: '1.125rem' }],   // 13px — table rows, secondary text
    'base':['0.875rem', { lineHeight: '1.25rem' }],    // 14px — body text (compact)
    'md':  ['0.9375rem',{ lineHeight: '1.375rem' }],   // 15px — default body
    'lg':  ['1rem',     { lineHeight: '1.5rem' }],     // 16px — section labels
    'xl':  ['1.125rem', { lineHeight: '1.625rem' }],   // 18px — card titles
    '2xl': ['1.25rem',  { lineHeight: '1.75rem' }],    // 20px — page subtitles
    '3xl': ['1.5rem',   { lineHeight: '2rem' }],       // 24px — page titles
    '4xl': ['1.875rem', { lineHeight: '2.25rem' }],    // 30px — metric displays
  },
  borderWidth: {
    DEFAULT: '1px',
  },
  boxShadow: {
    // Enterprise shadow set — no blurry consumer shadows
    'card':   '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    'card-md':'0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
    'none':   'none',
  },
  transitionDuration: {
    DEFAULT: '150ms',
  },
},
```

---

## 3. Typography Scale

### 3.1 Font Stack

```css
font-family:
  "Segoe UI",
  -apple-system,
  BlinkMacSystemFont,
  "Inter",
  system-ui,
  sans-serif;
```

Rationale: Segoe UI is the Microsoft system font — it loads natively on Windows (the majority of student and institutional machines in India). Inter as the web fallback is visually near-identical. No web font loading — zero FOUT, zero latency.

### 3.2 Type Scale Usage Map

| Role                | Size        | Weight | Class                                                               | Usage                         |
| ------------------- | ----------- | ------ | ------------------------------------------------------------------- | ----------------------------- |
| Page Title          | 24px / 3xl  | 600    | `text-3xl font-semibold tracking-tight`                             | Page H1 — one per page        |
| Page Subtitle       | 20px / 2xl  | 400    | `text-2xl font-normal text-foreground-muted`                        | Supporting page descriptor    |
| Section Header      | 16px / lg   | 600    | `text-lg font-semibold`                                             | Card titles, section labels   |
| Subsection Label    | 13px / sm   | 500    | `text-sm font-medium text-foreground-muted uppercase tracking-wide` | Column headers, group labels  |
| Body Default        | 14px / base | 400    | `text-base font-normal`                                             | Primary reading text          |
| Body Secondary      | 13px / sm   | 400    | `text-sm text-foreground-muted`                                     | Supporting copy, descriptions |
| Table Row           | 13px / sm   | 400    | `text-sm`                                                           | Dense table data              |
| Caption / Timestamp | 12px / xs   | 400    | `text-xs text-foreground-subtle`                                    | Timestamps, helper text       |
| Micro Label         | 10px / 2xs  | 500    | `text-2xs font-medium uppercase tracking-wider`                     | Badge text, indicator labels  |
| Metric Display      | 30px / 4xl  | 700    | `text-4xl font-bold tabular-nums`                                   | Dashboard KPI numbers         |
| Metric Label        | 12px / xs   | 400    | `text-xs text-foreground-muted`                                     | Below metric display          |

### 3.3 Rules

```
RULE T-01: Never use font-size below 10px.
RULE T-02: Never use font-weight 300 (light) — looks weak on enterprise dashboards.
RULE T-03: Metric numbers always use tabular-nums for column alignment.
RULE T-04: Section labels that act as column headers: uppercase, tracking-wide, text-xs, font-medium.
RULE T-05: Do not use letter-spacing on body text — only on uppercase micro-labels.
RULE T-06: Line clamp for table cells: max 1 line unless explicitly a description column.
```

---

## 4. Layout System

### 4.1 Shell Structure

```
┌─────────────────────────────────────────────────────────┐
│  TOPBAR (h-12 / 48px)  border-b border-border           │
│  Logo mark + "SkillLedger"   ·   Role pill   ·   Avatar │
└─────────────┬───────────────────────────────────────────┘
              │
┌─────────────┴───────────────────────────────────────────┐
│  SIDEBAR      │  MAIN CONTENT AREA                       │
│  w-56 fixed   │  flex-1  overflow-y-auto                 │
│  border-r     │  px-6 py-5                               │
│               │                                          │
│  Nav items    │  ┌──────────────────────────────────┐    │
│  h-9 each     │  │ PAGE HEADER                      │    │
│  text-sm      │  │ Title + breadcrumb + actions     │    │
│               │  └──────────────────────────────────┘    │
│               │                                          │
│               │  ┌──────────────────────────────────┐    │
│               │  │ CONTENT REGION                   │    │
│               │  │ max-w-7xl  mx-auto               │    │
│               │  └──────────────────────────────────┘    │
└───────────────────────────────────────────────────────── ┘
```

### 4.2 Spacing Scale

Use Tailwind's 4px base unit only. Approved values:

| Token   | px   | Use                         |
| ------- | ---- | --------------------------- |
| `p-2`   | 8px  | Badge padding, tight insets |
| `p-3`   | 12px | Table cell padding          |
| `p-4`   | 16px | Card padding (default)      |
| `p-5`   | 20px | Card padding (spacious)     |
| `p-6`   | 24px | Page section padding        |
| `gap-3` | 12px | Inline element gaps         |
| `gap-4` | 16px | Card grid gaps              |
| `gap-6` | 24px | Section gaps                |
| `mb-1`  | 4px  | Label-to-input gaps         |
| `mb-6`  | 24px | Section-to-section gaps     |

### 4.3 Grid Patterns

```typescript
// Metric cards row (dashboard)
<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

// Two-column split (detail views)
<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
  <div className="lg:col-span-2">  {/* main content */}
  <div>                            {/* sidebar panel */}

// Opportunity cards feed
<div className="flex flex-col divide-y divide-border">  {/* list style, not card grid */}
```

---

## 5. Component Specifications

### 5.1 Data Card

The fundamental surface unit. 1px border, flat, subtle hover state. No drop shadow by default.

```typescript
// Base data card — use this pattern everywhere
<div className="
  rounded-md border border-border bg-card
  transition-colors duration-150
  hover:border-border-strong
">
  <div className="border-b border-border px-4 py-3">
    <h3 className="text-lg font-semibold">Card Title</h3>
    <p className="text-sm text-foreground-muted">Supporting descriptor</p>
  </div>
  <div className="p-4">
    {/* content */}
  </div>
</div>

// Metric card (dashboard KPI)
<div className="rounded-md border border-border bg-card p-4">
  <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
    Students Assessed
  </p>
  <p className="mt-1 text-4xl font-bold tabular-nums text-foreground">247</p>
  <p className="mt-1 text-xs text-foreground-subtle">+12 this week</p>
</div>
```

**Rules:**

- `rounded-md` (6px) — never `rounded-xl` or `rounded-2xl`
- `border border-border` always — never borderless cards
- `shadow-card` only when the card needs to float above a non-white surface (e.g. a modal)
- Header section separated from body by `border-b border-border`

---

### 5.2 Navigation Sidebar

```typescript
// Sidebar nav item — two states: default and active
// Default
<Link className="
  flex items-center gap-2.5 rounded-md px-3 py-2
  text-sm text-foreground-muted
  transition-colors duration-150
  hover:bg-background-muted hover:text-foreground
">
  <Icon className="h-4 w-4 shrink-0" />
  <span>Opportunities</span>
</Link>

// Active
<Link className="
  flex items-center gap-2.5 rounded-md px-3 py-2
  text-sm font-medium text-primary bg-primary-subtle
  transition-colors duration-150
">
  <Icon className="h-4 w-4 shrink-0 text-primary" />
  <span>Opportunities</span>
</Link>

// Section label (non-clickable group header)
<p className="px-3 pb-1 pt-4 text-2xs font-medium uppercase tracking-wider text-foreground-subtle">
  Career
</p>
```

---

### 5.3 Badges & Match Indicators

```typescript
// Match percentage badge — on opportunity cards
// High match (≥ 75%)
<span className="
  inline-flex items-center rounded-sm px-2 py-0.5
  text-xs font-semibold tabular-nums
  bg-success-bg text-success border border-success-border
">
  92% Match
</span>

// Medium match (50–74%)
<span className="... bg-warning-bg text-warning border-warning-border">
  63% Match
</span>

// Low match (< 50%)
<span className="... bg-destructive-bg text-destructive border-destructive-border">
  31% Match
</span>

// Domain skill tag (non-interactive)
<span className="
  inline-flex items-center rounded-sm px-2 py-0.5
  text-2xs font-medium uppercase tracking-wide
  bg-background-muted text-foreground-muted border border-border
">
  System Design
</span>

// Application status badge
const statusStyles = {
  APPLIED:              'bg-background-muted text-foreground-muted border-border',
  UNDER_REVIEW:         'bg-info-bg text-info border-info-border',
  SHORTLISTED:          'bg-warning-bg text-warning border-warning-border',
  INTERVIEW_SCHEDULED:  'bg-primary-subtle text-primary border-primary/20',
  SELECTED:             'bg-success-bg text-success border-success-border',
  NOT_SELECTED:         'bg-destructive-bg text-destructive border-destructive-border',
}

// SkillLedger Verified Badge (ONLY use for earned === true)
<div className="
  inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1
  text-xs font-semibold text-white
  [background:linear-gradient(135deg,#0067B8,#4F46E5)]
">
  <BadgeCheck className="h-3.5 w-3.5" />
  Verified · DSA
</div>
```

---

### 5.4 High-Density Table

```typescript
// Candidate discovery / application pipeline table
<div className="rounded-md border border-border overflow-hidden">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-border bg-background-subtle">
        <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
          Candidate
        </th>
        <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
          Match
        </th>
        <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
          Top Domain
        </th>
        <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
          Sessions
        </th>
        <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
          Status
        </th>
        <th className="px-3 py-2.5" /> {/* Actions column — no header */}
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      {candidates.map((c, i) => (
        <tr
          key={c.id}
          className="
            transition-colors duration-150
            hover:bg-background-subtle
          "
        >
          <td className="px-3 py-2.5">
            <div className="font-medium text-foreground">{c.name}</div>
            <div className="text-xs text-foreground-subtle">{c.institution}</div>
          </td>
          <td className="px-3 py-2.5">
            <MatchBadge score={c.matchScore} />
          </td>
          <td className="px-3 py-2.5 text-foreground-muted">{c.topDomain}</td>
          <td className="px-3 py-2.5 tabular-nums text-foreground-muted">{c.sessionCount}</td>
          <td className="px-3 py-2.5">
            <ApplicationStatusBadge status={c.status} />
          </td>
          <td className="px-3 py-2.5 text-right">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              View
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**Rules:**

- Row height via `py-2.5` (10px top+bottom) — never taller unless a row has multiline content
- Alternating row colour: use `divide-y divide-border` — do NOT use `odd:bg-x` zebra striping on dense tables; it fights the hover state
- Inline actions: `Button variant="ghost" size="sm"` — `h-7` height, right-aligned in last column
- Never use checkboxes for selection in MVP

---

### 5.5 Assessment Terminal UI

The most critical UI component — this is the demo centrepiece. Distraction-free, focused, no chrome.

```typescript
// Assessment session page layout
<div className="mx-auto max-w-2xl px-4 py-8">

  {/* Session header */}
  <div className="mb-6">
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
          Assessment · System Design
        </p>
        <h1 className="text-2xl font-semibold text-foreground mt-0.5">
          Question {turnIndex + 1}
        </h1>
      </div>
      <span className="text-sm text-foreground-muted tabular-nums">
        {Math.round(progress)}% complete
      </span>
    </div>

    {/* Linear progress bar — cobalt, no animation on fill except the initial mount */}
    <div className="h-1 w-full rounded-full bg-border">
      <div
        className="h-1 rounded-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>

  {/* Question card */}
  <div className="rounded-md border border-border bg-card p-5 mb-4">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center
                      rounded-sm bg-primary-subtle">
        <BrainCircuit className="h-3.5 w-3.5 text-primary" />
      </div>
      <p className="text-base leading-relaxed text-foreground">
        {question}
      </p>
    </div>
  </div>

  {/* Response area */}
  <div className="rounded-md border border-border bg-card p-4">
    <Textarea
      placeholder="Type your answer here..."
      className="
        min-h-[120px] resize-none border-0 bg-transparent p-0
        text-base text-foreground placeholder:text-foreground-subtle
        focus-visible:ring-0 focus-visible:ring-offset-0
      "
    />
    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
      <p className="text-xs text-foreground-subtle">
        Explain your reasoning clearly. There are no trick questions.
      </p>
      <Button
        size="sm"
        className="h-8 gap-1.5 bg-primary text-white hover:bg-primary-hover"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Evaluating
          </>
        ) : (
          <>
            Submit
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </Button>
    </div>
  </div>

  {/* Concept node tag — shown below response area */}
  <p className="mt-3 text-xs text-foreground-subtle text-center">
    Topic: <span className="font-medium text-foreground-muted">{conceptNodeLabel}</span>
  </p>
</div>
```

**Rules:**

- `max-w-2xl` — never full-width; assessment is a focused single-task surface
- Zero sidebar during active assessment — use a minimal shell with only the progress bar
- The only animation allowed: `animate-spin` on the Loader2 icon during LLM evaluation
- Do not show score or evaluation result during the session — only the gap report after completion

---

### 5.6 Gap Report Display

```typescript
// Post-assessment gap report
<div className="mx-auto max-w-2xl space-y-4 px-4 py-8">

  {/* Score hero */}
  <div className="rounded-md border border-border bg-card p-5 text-center">
    <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle mb-1">
      Overall Score · {domain}
    </p>
    <p className="text-4xl font-bold tabular-nums text-foreground">{score}</p>
    <p className="text-sm text-foreground-muted mt-1">out of 100</p>
    {badgeEarned && (
      <div className="mt-4 flex justify-center">
        <SkillBadge domain={domain} />  {/* cobalt-to-indigo gradient badge */}
      </div>
    )}
  </div>

  {/* Strong nodes */}
  <div className="rounded-md border border-success-border bg-success-bg p-4">
    <div className="flex items-center gap-2 mb-3">
      <CheckCircle2 className="h-4 w-4 text-success" />
      <h3 className="text-sm font-semibold text-success">Strong Areas</h3>
    </div>
    <div className="flex flex-wrap gap-2">
      {strongNodes.map(node => (
        <span key={node} className="
          inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium
          bg-white/60 text-success border border-success-border
        ">{node}</span>
      ))}
    </div>
  </div>

  {/* Partial nodes */}
  <div className="rounded-md border border-warning-border bg-warning-bg p-4">
    {/* same pattern, warning palette */}
  </div>

  {/* Weak / gap nodes */}
  <div className="rounded-md border border-destructive-border bg-destructive-bg p-4">
    {/* same pattern, destructive palette */}
  </div>

  {/* Learning recommendations */}
  <div className="rounded-md border border-border bg-card">
    <div className="border-b border-border px-4 py-3">
      <h3 className="text-base font-semibold">Recommended Next Steps</h3>
    </div>
    <div className="divide-y divide-border">
      {recommendations.map(rec => (
        <div key={rec.conceptNodeId} className="px-4 py-3">
          <p className="text-sm font-medium text-foreground mb-1.5">
            {rec.conceptNodeLabel}
          </p>
          <div className="flex flex-col gap-1">
            {rec.resources.map(r => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  text-sm text-primary underline-offset-2
                  hover:underline transition-colors duration-150
                "
              >
                {r.title}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

---

### 5.7 Student Portfolio Page

```typescript
// Portfolio layout — two-column on desktop
<div className="mx-auto max-w-5xl px-6 py-6">
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

    {/* Left: identity + badges — sticky on desktop */}
    <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">

      {/* Identity card */}
      <div className="rounded-md border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 rounded-md">  {/* square avatar — enterprise feel */}
          <div>
            <h2 className="text-lg font-semibold">{name}</h2>
            <p className="text-sm text-foreground-muted">{institution}</p>
            <p className="text-xs text-foreground-subtle mt-0.5">{department}</p>
          </div>
        </div>
      </div>

      {/* Skill badges */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">Verified Skills</h3>
        <div className="space-y-2">
          {badges.map(b => b.earned && (
            <SkillBadge key={b.domain} domain={b.domain} />
          ))}
          {badges.filter(b => !b.earned).map(b => (
            <div key={b.domain} className="
              flex items-center gap-2 rounded-sm border border-dashed border-border
              px-2.5 py-1.5 text-xs text-foreground-subtle
            ">
              <Lock className="h-3 w-3" />
              {b.domain} — not yet earned
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Right: main content */}
    <div className="lg:col-span-2 space-y-4">

      {/* Skill timeline chart — Recharts */}
      <div className="rounded-md border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-base font-semibold">Skill Development</h3>
          <p className="text-xs text-foreground-subtle mt-0.5">Score across assessment sessions</p>
        </div>
        <div className="p-4">
          <SkillTimeline history={scoreHistory} />  {/* See Section 6.2 */}
        </div>
      </div>

      {/* Domain depth profile */}
      {/* Internship records */}
      {/* Projects */}
      {/* Documents */}
    </div>
  </div>
</div>
```

---

### 5.8 Opportunity Card (Student Feed)

```typescript
// List-style feed — NOT a card grid
<div className="rounded-md border border-border bg-card divide-y divide-border">
  {opportunities.map(opp => (
    <div
      key={opp.id}
      className="flex items-start gap-4 px-4 py-4 transition-colors duration-150 hover:bg-background-subtle"
    >
      {/* Company initial block */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center
                      rounded-md border border-border bg-background-muted
                      text-sm font-semibold text-foreground-muted">
        {opp.companyName.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground truncate">{opp.title}</h4>
            <p className="text-xs text-foreground-muted mt-0.5">
              {opp.companyName} · {opp.location} · {opp.duration}
            </p>
          </div>
          <MatchBadge score={opp.matchScore} />
        </div>

        {/* Skill tags */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {opp.requiredSkills.map(s => (
            <SkillTag key={s.skill} skill={s.skill} met={opp.metSkills.includes(s.skill)} />
          ))}
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-3">
          <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary-hover text-white">
            Apply
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            View details
          </Button>
          <span className="ml-auto text-xs text-foreground-subtle">
            Closes {formatDeadline(opp.deadline)}
          </span>
        </div>
      </div>
    </div>
  ))}
</div>
```

---

## 6. Chart Specifications (Recharts)

### 6.1 Palette

```typescript
// constants/chart-palette.ts
export const CHART_COLORS = {
  primary: "#0078D4", // cobalt — demand bars, primary series
  supply: "#6366F1", // indigo — supply bars
  success: "#16A34A", // emerald — strong skill line
  warning: "#D97706", // amber — partial
  destructive: "#DC2626", // rose — gap / weak
  neutral: "#94A3B8", // slate — secondary series, grid lines
  grid: "#E2E8F0", // border color for chart grid
  tick: "#94A3B8", // axis tick labels
} as const;
```

### 6.2 Skill Timeline (Line Chart)

```typescript
// components/portfolio/SkillTimeline.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// data shape: { date: string; [domain: string]: number }[]
// e.g. [{ date: "Jan '26", dsa: 62, "system-design": 55 }, ...]

<ResponsiveContainer width="100%" height={200}>
  <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
    <XAxis
      dataKey="date"
      tick={{ fontSize: 11, fill: CHART_COLORS.tick }}
      axisLine={false}
      tickLine={false}
    />
    <YAxis
      domain={[0, 100]}
      tick={{ fontSize: 11, fill: CHART_COLORS.tick }}
      axisLine={false}
      tickLine={false}
    />
    <Tooltip
      contentStyle={{
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
        fontSize: '12px',
        boxShadow: 'none',
      }}
    />
    <Legend
      wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
      iconType="circle"
      iconSize={8}
    />
    {domains.map((domain, i) => (
      <Line
        key={domain}
        type="monotone"
        dataKey={domain}
        stroke={DOMAIN_COLORS[i % DOMAIN_COLORS.length]}
        strokeWidth={2}
        dot={{ r: 3, strokeWidth: 0 }}
        activeDot={{ r: 4, strokeWidth: 1, stroke: '#fff' }}
      />
    ))}
  </LineChart>
</ResponsiveContainer>

const DOMAIN_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.supply,
  CHART_COLORS.success,
  CHART_COLORS.warning,
];
```

### 6.3 Demand vs Supply Bar Chart (Admin Dashboard)

```typescript
// components/dashboard/DemandSupplyChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';

// data shape: SkillGapDataPoint[] from types/index.ts
// { skill, demandPercent, supplyPercent, gap, severity }

<ResponsiveContainer width="100%" height={280}>
  <BarChart
    data={data}
    margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
    barCategoryGap="28%"
    barGap={2}
  >
    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
    <XAxis
      dataKey="skill"
      tick={{ fontSize: 11, fill: CHART_COLORS.tick }}
      axisLine={false}
      tickLine={false}
    />
    <YAxis
      domain={[0, 100]}
      tickFormatter={(v) => `${v}%`}
      tick={{ fontSize: 11, fill: CHART_COLORS.tick }}
      axisLine={false}
      tickLine={false}
    />
    <Tooltip
      formatter={(value: number, name: string) => [`${value}%`, name]}
      contentStyle={{
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
        fontSize: '12px',
        boxShadow: 'none',
      }}
    />
    <Legend
      wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
      iconType="square"
      iconSize={10}
    />
    <Bar dataKey="demandPercent" name="Industry Demand" fill={CHART_COLORS.primary} radius={[2, 2, 0, 0]} />
    <Bar dataKey="supplyPercent" name="Student Supply" fill={CHART_COLORS.supply} radius={[2, 2, 0, 0]} />
  </BarChart>
</ResponsiveContainer>

// Gap severity legend — below chart, not inside Recharts
<div className="mt-3 flex items-center gap-4 text-xs text-foreground-muted">
  <span className="flex items-center gap-1.5">
    <span className="h-2 w-2 rounded-full bg-destructive" />
    High gap (&gt;50%)
  </span>
  <span className="flex items-center gap-1.5">
    <span className="h-2 w-2 rounded-full bg-warning" />
    Medium (20–50%)
  </span>
  <span className="flex items-center gap-1.5">
    <span className="h-2 w-2 rounded-full bg-success" />
    Low (&lt;20%)
  </span>
</div>
```

---

## 7. Micro-interactions & Motion

### 7.1 Approved Motion Tokens

```
transition-colors duration-150 ease-in-out  — hover colour changes (all interactive elements)
transition-all duration-300 ease-out         — progress bar fill on session advance
duration-150 ease-in-out                     — border shifts, opacity fades
animate-spin                                 — LLM loading spinner (Loader2 icon only)
```

### 7.2 Forbidden Motion

```
NEVER: animate-bounce, animate-pulse on decorative elements
NEVER: framer-motion or @keyframes outside Tailwind utilities
NEVER: transition durations > 300ms on hover states
NEVER: entrance animations (fade-in-up, slide-in) on page load
NEVER: skeleton shimmer using @keyframes — use shadcn Skeleton only
```

---

## 8. Skeleton Loaders

```typescript
// Metric card skeleton
<div className="rounded-md border border-border bg-card p-4">
  <Skeleton className="h-3 w-24 mb-3" />    {/* label */}
  <Skeleton className="h-8 w-16 mb-2" />    {/* metric number */}
  <Skeleton className="h-2.5 w-20" />        {/* subtitle */}
</div>

// Table row skeleton — repeat 5×
<tr>
  <td className="px-3 py-2.5">
    <Skeleton className="h-3.5 w-32 mb-1" />
    <Skeleton className="h-2.5 w-20" />
  </td>
  <td className="px-3 py-2.5"><Skeleton className="h-5 w-16 rounded-sm" /></td>
  <td className="px-3 py-2.5"><Skeleton className="h-3.5 w-24" /></td>
  <td className="px-3 py-2.5"><Skeleton className="h-3.5 w-8" /></td>
  <td className="px-3 py-2.5"><Skeleton className="h-5 w-20 rounded-sm" /></td>
  <td className="px-3 py-2.5"><Skeleton className="h-6 w-12 ml-auto" /></td>
</tr>

// Assessment card skeleton
<div className="mx-auto max-w-2xl px-4 py-8 space-y-4">
  <Skeleton className="h-1 w-full rounded-full" />
  <div className="rounded-md border border-border bg-card p-5">
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-4/5" />
  </div>
  <div className="rounded-md border border-border bg-card p-4">
    <Skeleton className="h-24 w-full" />
  </div>
</div>
```

**Rules:**

- shadcn `Skeleton` uses `bg-muted animate-pulse` — do not override this
- Every async data surface must show a skeleton before data loads — never a blank white region
- Skeleton shapes must match the actual content geometry

---

## 9. Empty States

```typescript
// Generic empty state component
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-background-muted mb-4">
    <Icon className="h-5 w-5 text-foreground-subtle" />
  </div>
  <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
  <p className="text-sm text-foreground-muted max-w-xs mb-4">{description}</p>
  {action && (
    <Button size="sm" className="h-8 bg-primary hover:bg-primary-hover text-white">
      {action.label}
    </Button>
  )}
</div>

// Usage patterns per view:
// No opportunities found:
//   Icon: Briefcase, Title: "No opportunities yet"
//   Description: "New internships and job postings from industry will appear here."

// No assessment taken:
//   Icon: BrainCircuit, Title: "No assessments completed"
//   Description: "Take your first skill assessment to generate your SkillLedger profile."
//   Action: { label: "Start Assessment" }

// No applications:
//   Icon: FileText, Title: "No applications submitted"
//   Description: "Apply to internships or jobs to track your progress here."

// Dashboard — no data:
//   Icon: BarChart2, Title: "No data available"
//   Description: "Dashboard metrics will populate once students complete assessments."
```

---

## 10. Accessibility

```
FOCUS STATES
  All interactive elements: focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
  Do not use focus:outline-none without replacing with a visible ring.

COLOUR CONTRAST
  Primary text on white: #0F172A on #FFFFFF — 17.5:1 ✓
  Secondary text on white: #475569 on #FFFFFF — 7.0:1 ✓
  Cobalt on white: #0078D4 on #FFFFFF — 4.9:1 ✓ (WCAG AA)
  White on cobalt: #FFFFFF on #0078D4 — 4.9:1 ✓

REDUCED MOTION
  Wrap all non-essential transitions in:
  @media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }
  Add to globals.css.

ARIA
  Assessment session: aria-live="polite" on the question card — screen readers announce new questions
  Progress bar: role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}
  Status badges: aria-label="Application status: Shortlisted"
  Tables: use <th scope="col"> on all column headers

KEYBOARD
  Tab order must follow reading order — no tabIndex > 0
  Assessment submit: Enter key on textarea must not submit — use a button click only
  Modal/dialog: trap focus inside using shadcn Dialog (already implemented)
```

---

## 11. Topbar & Role Indicator

```typescript
// Shell topbar — h-12, border-b, fixed top
<header className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center
                   border-b border-border bg-background px-4 gap-3">
  {/* Logo */}
  <div className="flex items-center gap-2">
    <div className="flex h-7 w-7 items-center justify-center rounded-sm
                    [background:linear-gradient(135deg,#0067B8,#4F46E5)]">
      <BadgeCheck className="h-4 w-4 text-white" />
    </div>
    <span className="text-sm font-semibold tracking-tight">SkillLedger</span>
  </div>

  <div className="mx-3 h-4 w-px bg-border" />  {/* vertical divider */}

  {/* Role pill */}
  <span className="rounded-sm border border-border bg-background-muted
                   px-2 py-0.5 text-xs font-medium text-foreground-muted">
    {roleLabel}  {/* "Student" | "Industry" | "Academician" | "Admin" */}
  </span>

  {/* Right side */}
  <div className="ml-auto flex items-center gap-2">
    <span className="text-sm text-foreground-muted hidden sm:block">{userName}</span>
    <Avatar className="h-7 w-7 rounded-sm">
      <AvatarFallback className="rounded-sm bg-primary-subtle text-primary text-xs font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  </div>
</header>

// Content offset
<main className="pt-12 pl-56">  {/* 48px topbar + 224px sidebar */}
```

---

## 12. Button Variants Quick Reference

```typescript
// Primary CTA — blue, use sparingly (one per view)
<Button className="bg-primary hover:bg-primary-hover text-white h-9 px-4 text-sm">
  Submit Answer
</Button>

// Secondary / outline
<Button variant="outline" className="h-9 px-4 text-sm border-border hover:bg-background-muted">
  View Details
</Button>

// Ghost — inline table actions
<Button variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-background-muted">
  View
</Button>

// Destructive
<Button variant="destructive" className="h-9 px-4 text-sm">
  Reject
</Button>

// Disabled state — always use the disabled prop, never fake it with opacity
<Button disabled className="...">
  Processing
</Button>
```

---

## 13. Page-Level Layout Patterns

### Student Dashboard

```
METRIC ROW: 4 cards (Skill Score · Domains Assessed · Applications · Badges)
MAIN SPLIT: 2/3 opportunity feed  |  1/3 portfolio snapshot + recent gap report
```

### Industry Dashboard

```
METRIC ROW: 3 cards (Active Postings · Total Applicants · Avg Match Score)
MAIN: Full-width pipeline table with status filter tabs
```

### Institutional Admin Dashboard

```
METRIC ROW: 4 cards (Students Assessed · Avg Cohort Score · Placements · Active Internships)
CHART ROW: Demand vs Supply bar (2/3)  |  Gap severity summary list (1/3)
TABLE: Cohort skill readiness by department
```

### Assessment Session

```
SINGLE COLUMN: max-w-2xl centred, no sidebar, minimal topbar
Order: Progress bar → Question card → Response area → concept node label
```
