// components/opportunities/MatchBadge.tsx
// RULE FE-01: No useState/useEffect — this is a pure render, Server Component is fine
// RULE FE-02: No raw HTML elements — uses only span (non-interactive display element per spec)

interface MatchBadgeProps {
  score: number; // 0–100
}

/**
 * Colour-coded match percentage badge following UI_UX_SPEC.md Section 5.3.
 * >= 75 → success palette
 * 50–74 → warning palette
 * < 50  → destructive palette
 */
export function MatchBadge({ score }: MatchBadgeProps) {
  const rounded = Math.round(score);

  let classes =
    "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold tabular-nums border ";

  if (rounded >= 75) {
    classes += "bg-success-bg text-success border-success-border";
  } else if (rounded >= 50) {
    classes += "bg-warning-bg text-warning border-warning-border";
  } else {
    classes += "bg-destructive-bg text-destructive border-destructive-border";
  }

  return <span className={classes}>{rounded}% Match</span>;
}
