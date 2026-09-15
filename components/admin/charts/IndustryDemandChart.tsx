"use client";

import React from "react";
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
  ReferenceLine,
} from "recharts";
import type { IndustryDemandComparison } from "@/types";

interface IndustryDemandChartProps {
  data: IndustryDemandComparison[];
}

export function IndustryDemandChart({ data }: IndustryDemandChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-md border border-blue-950/40 bg-[#0A1227]/40 text-xs text-foreground-muted">
        No demand comparison data available yet.
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: -10, bottom: 45 }}
          barGap={4}
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis
            dataKey="skill"
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            tickLine={false}
            axisLine={{ stroke: "#1E293B" }}
            angle={-30}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            tickLine={false}
            axisLine={{ stroke: "#1E293B" }}
            unit="%"
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0A1227",
              borderColor: "#1E3A8A",
              borderRadius: "6px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
              color: "#F8FAFC",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) => [
              `${value}%`,
              name === "demandPercent"
                ? "Industry Demand Rate"
                : name === "supplyPercent"
                ? "Student Supply Rate"
                : name,
            ]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: "12px", fontSize: "12px" }}
            formatter={(value) => (
              <span className="text-xs text-slate-300 font-medium">
                {value === "demandPercent"
                  ? "Industry Demand %"
                  : "Institutional Supply %"}
              </span>
            )}
          />
          <ReferenceLine y={60} stroke="#3B82F6" strokeDasharray="3 3" opacity={0.3} />
          <Bar
            dataKey="demandPercent"
            name="demandPercent"
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="supplyPercent"
            name="supplyPercent"
            fill="#06B6D4"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => {
              const color =
                entry.severity === "CRITICAL"
                  ? "#EF4444"
                  : entry.severity === "MODERATE"
                  ? "#F59E0B"
                  : "#10B981";
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
