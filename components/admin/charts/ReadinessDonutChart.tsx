"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { ReadinessTierBreakdown } from "@/types";

interface ReadinessDonutChartProps {
  data: ReadinessTierBreakdown[];
}

const TIER_COLORS: Record<string, string> = {
  "Tier 1 (High Readiness 80%+)": "#10B981",
  "Tier 2 (Moderate Readiness 60-79%)": "#3B82F6",
  "Tier 3 (Emerging Readiness 40-59%)": "#F59E0B",
  "Tier 4 (Critical Need <40%)": "#EF4444",
};

export function ReadinessDonutChart({ data }: ReadinessDonutChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-foreground-muted">
        No cohort distribution data.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.tier || "Cohort",
    value: item.studentCount || 0,
    percentage: item.percentage || 0,
    color: item.color || TIER_COLORS[item.tier || ""] || "#64748B",
  }));


  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`donut-cell-${index}`} fill={entry.color} stroke="#080E1C" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#0A1227",
              borderColor: "#1E3A8A",
              borderRadius: "6px",
              color: "#F8FAFC",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) => [
              `${value} students (${chartData.find((d) => d.name === name)?.percentage ?? 0}%)`,
              name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: "12px", fontSize: "11px" }}
            formatter={(value) => (
              <span className="text-xs text-slate-300 font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
