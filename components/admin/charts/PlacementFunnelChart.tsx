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

interface FunnelStage {
  stage: string;
  count: number;
  conversion: string;
}

interface PlacementFunnelChartProps {
  stages: FunnelStage[];
}

const STAGE_COLORS = ["#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#10B981"];

export function PlacementFunnelChart({ stages }: PlacementFunnelChartProps) {
  if (!stages || stages.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-foreground-muted">
        No placement funnel data available.
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={stages}
          margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            tickLine={false}
            axisLine={{ stroke: "#1E293B" }}
          />
          <YAxis
            dataKey="stage"
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
              `${value} Candidates (Conv: ${props.payload.conversion})`,
              "Volume",
            ]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {stages.map((_, index) => (
              <Cell
                key={`funnel-cell-${index}`}
                fill={STAGE_COLORS[index % STAGE_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
