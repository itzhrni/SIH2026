// constants/chart-palette.ts
// Chart colour constants — used exclusively in Recharts components.
// RULE FE-10: Do not hardcode hex values in Tailwind classes; use these constants for Recharts props only.

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

export const DOMAIN_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.supply,
  CHART_COLORS.success,
  CHART_COLORS.warning,
] as const;
