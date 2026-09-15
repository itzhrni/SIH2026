"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SkillHealthItem } from "@/types";

interface SkillTrendChartProps {
  data: SkillHealthItem[];
}

export function SkillTrendChart({ data }: SkillTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-foreground-muted">
        No skill health data available.
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 30, left: 50, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            unit="%"
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            tickLine={false}
            axisLine={{ stroke: "#1E293B" }}
          />
          <YAxis
            dataKey="skill"
            type="category"
            tick={{ fontSize: 11, fill: "#E2E8F0" }}
            tickLine={false}
            axisLine={{ stroke: "#1E293B" }}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0A1227",
              borderColor: "#1E3A8A",
              borderRadius: "6px",
              color: "#F8FAFC",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value}% Proficiency (${props.payload.verifiedCount} students)`,
              props.payload.category,
            ]}
          />
          <Bar dataKey="averageScore" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => {
              const color =
                entry.averageScore >= 75
                  ? "#10B981"
                  : entry.averageScore >= 55
                  ? "#3B82F6"
                  : entry.averageScore >= 40
                  ? "#F59E0B"
                  : "#EF4444";
              return <Cell key={`skill-health-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
