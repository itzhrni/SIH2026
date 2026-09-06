"use client";

import type { PlacementProgressStats } from "@/types";

interface PlacementPipelineCardProps {
  stats: PlacementProgressStats;
}

export function PlacementPipelineCard({ stats }: PlacementPipelineCardProps) {
  const pipelineStages = [
    { label: "Applied", count: stats.totalApplications, color: "bg-primary" },
    { label: "Under Review", count: stats.underReview, color: "bg-secondary" },
    { label: "Shortlisted", count: stats.shortlisted, color: "bg-accent" },
    {
      label: "Interview Scheduled",
      count: stats.interviewScheduled,
      color: "bg-primary",
    },
    { label: "Offers / Selected", count: stats.selected, color: "bg-success" },
    {
      label: "Not Selected",
      count: stats.notSelected,
      color: "bg-destructive",
    },
  ];

  const selectionRate =
    stats.totalApplications > 0
      ? Math.round((stats.selected / stats.totalApplications) * 100)
      : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {pipelineStages.map((stage) => (
          <div
            key={stage.label}
            className="rounded-md border border-border bg-card p-3 shadow-sm transition-colors duration-150 ease-in-out"
          >
            <p className="text-xs font-medium text-muted-foreground">
              {stage.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {stage.count}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Pipeline Conversion Overview</span>
          <span>{selectionRate}% Selected</span>
        </div>
        <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-sm bg-muted">
          {pipelineStages.map((stage) => {
            const widthPct =
              stats.totalApplications > 0
                ? (stage.count / stats.totalApplications) * 100
                : 0;
            if (widthPct === 0) return null;
            return (
              <div
                key={stage.label}
                style={{ width: `${widthPct}%` }}
                title={`${stage.label}: ${stage.count}`}
                className={`${stage.color} opacity-80 transition-all duration-300 ease-out`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
