"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SkillGapDataPoint } from "@/types";

interface DemandSupplyChartProps {
  data: SkillGapDataPoint[];
}

const SEVERITY_COLOR: Record<string, string> = {
  HIGH: "#9F1239",
  MEDIUM: "#92400E",
  LOW: "#166534",
};

export function DemandSupplyChart({ data }: DemandSupplyChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No demand data available yet. Post opportunities to generate analytics.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 16, left: 0, bottom: 40 }}
        barGap={2}
        barCategoryGap="30%"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="skill"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          unit="%"
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
            fontSize: 12,
            backgroundColor: "hsl(var(--card))",
            color: "hsl(var(--foreground))",
          }}
          formatter={(value: number, name: string) => [
            `${value}%`,
            name === "demandPercent" ? "Industry Demand" : "Student Supply",
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          formatter={(value) =>
            value === "demandPercent" ? "Industry Demand %" : "Student Supply %"
          }
        />
        <Bar
          dataKey="demandPercent"
          fill="#0078D4"
          radius={[2, 2, 0, 0]}
          name="demandPercent"
        >
          {data.map((entry, index) => (
            <Cell key={`demand-${index}`} fill="#0078D4" />
          ))}
        </Bar>
        <Bar
          dataKey="supplyPercent"
          fill="#94A3B8"
          radius={[2, 2, 0, 0]}
          name="supplyPercent"
        >
          {data.map((entry, index) => (
            <Cell
              key={`supply-${index}`}
              fill={SEVERITY_COLOR[entry.severity] ?? "#94A3B8"}
              fillOpacity={0.6}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
