"use client";

// components/portfolio/SkillTimeline.tsx
// Renders longitudinal skill score progression over time across assessment sessions.
// Adheres strictly to UI_UX_SPEC.md §6.2.

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS, DOMAIN_COLORS } from "@/constants/chart-palette";
import type { ScoreHistoryPoint } from "@/types";

interface SkillTimelineProps {
  history: ScoreHistoryPoint[];
}

export function SkillTimeline({ history }: SkillTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-md border border-dashed border-border p-6 text-center">
        <p className="text-sm font-medium text-foreground-muted">
          No assessment history recorded yet
        </p>
        <p className="mt-1 text-xs text-foreground-subtle">
          Complete assessment sessions to visualize your verified skill
          development timeline.
        </p>
      </div>
    );
  }

  // Group history records chronologically
  // Each data point has: { date: "formatted", [domain]: score }
  const domainSet = new Set<string>();
  const dateMap = new Map<string, Record<string, number | string>>();

  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );

  for (const item of sortedHistory) {
    domainSet.add(item.domain);
    const dateLabel = new Date(item.recordedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const currentEntry = dateMap.get(dateLabel) ?? { date: dateLabel };
    currentEntry[item.domain] = Math.round(item.score);
    dateMap.set(dateLabel, currentEntry);
  }

  const chartData = Array.from(dateMap.values());
  const domains = Array.from(domainSet);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 12, bottom: 0, left: -20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_COLORS.grid}
            vertical={false}
          />
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
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              fontSize: "12px",
              boxShadow: "none",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            iconType="circle"
            iconSize={8}
          />
          {domains.map((domain, i) => (
            <Line
              key={domain}
              type="monotone"
              dataKey={domain}
              name={domain.toUpperCase()}
              stroke={DOMAIN_COLORS[i % DOMAIN_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 4, strokeWidth: 1, stroke: "#fff" }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
