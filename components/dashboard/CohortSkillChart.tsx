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
} from "recharts";
import type { CohortSkillDataPoint } from "@/types";

interface CohortSkillChartProps {
  data: CohortSkillDataPoint[];
}

const DOMAIN_COLORS: Record<string, string> = {
  dsa: "#0078D4",
  "system-design": "#107C41",
  ml: "#5C2D91",
  "core-cs": "#D83B01",
  "ayurvedic-pharmacology": "#008272",
  "clinical-practice": "#A4262C",
};

const DOMAIN_LABELS: Record<string, string> = {
  dsa: "DSA",
  "system-design": "System Design",
  ml: "Machine Learning",
  "core-cs": "Core CS",
  "ayurvedic-pharmacology": "Ayurvedic Pharm.",
  "clinical-practice": "Clinical Practice",
};

export function CohortSkillChart({ data }: CohortSkillChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No cohort assessment data available yet.
      </div>
    );
  }

  // Pivot data so X axis is department and bars are domains
  const departments = Array.from(new Set(data.map((d) => d.department)));
  const domains = Array.from(new Set(data.map((d) => d.domain)));

  const chartData = departments.map((dept) => {
    const row: Record<string, string | number> = { department: dept };
    for (const item of data.filter((d) => d.department === dept)) {
      row[item.domain] = item.averageScore;
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 16, left: 0, bottom: 20 }}
        barGap={4}
        barCategoryGap="25%"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="department"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          unit="/100"
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
            `${value}/100`,
            DOMAIN_LABELS[name] ?? name,
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) => DOMAIN_LABELS[value] ?? value}
        />
        {domains.map((domain) => (
          <Bar
            key={domain}
            dataKey={domain}
            fill={DOMAIN_COLORS[domain] ?? "#0078D4"}
            radius={[2, 2, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
