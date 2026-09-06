// components/portfolio/DepthProfile.tsx
import React from "react";
import type { DomainScore } from "@/types";
import { Progress } from "@/components/ui/progress";

interface DepthProfileProps {
  domainScores: Record<string, DomainScore>;
}

const DOMAIN_INFO: Record<string, { title: string; category: string }> = {
  dsa: { title: "Data Structures & Algorithms", category: "Engineering & IT" },
  "system-design": { title: "System Design", category: "Engineering & IT" },
  "machine-learning": {
    title: "Machine Learning",
    category: "Engineering & IT",
  },
  ml: {
    title: "Machine Learning & Data Science",
    category: "Engineering & IT",
  },
  "core-cs": { title: "Core Computer Science", category: "Engineering & IT" },
  "ayurvedic-pharmacology": {
    title: "Ayurvedic Pharmacology",
    category: "AYUSH",
  },
  "clinical-practice": { title: "Clinical Practice", category: "AYUSH" },
};

export function DepthProfile({ domainScores }: DepthProfileProps) {
  const entries = Object.entries(domainScores);

  if (entries.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-6 text-center">
        <p className="text-sm font-medium text-foreground-muted">
          No domain depth profiles yet
        </p>
        <p className="mt-1 text-xs text-foreground-subtle">
          Take your first adaptive assessment to establish verified topic-wise
          depth scores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(([domain, data]) => {
        const info = DOMAIN_INFO[domain] ?? {
          title: domain.toUpperCase(),
          category: "General",
        };
        const score = Math.round(data.score);
        const lastUpdated = data.lastUpdated
          ? new Date(data.lastUpdated).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Recently";

        const tier =
          score >= 75
            ? "Advanced"
            : score >= 50
              ? "Proficient"
              : "Foundational";

        return (
          <div
            key={domain}
            className="rounded-md border border-border bg-card p-4 transition-colors duration-150 hover:border-border-strong"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-2xs font-medium uppercase tracking-wider text-foreground-subtle">
                  {info.category}
                </span>
                <h4 className="text-base font-semibold text-foreground">
                  {info.title}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold tabular-nums text-foreground">
                  {score}
                </span>
                <span className="text-xs text-foreground-muted"> / 100</span>
                <div className="mt-0.5">
                  <span
                    className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-2xs font-medium ${
                      score >= 75
                        ? "bg-success-bg text-success border border-success-border"
                        : score >= 50
                          ? "bg-warning-bg text-warning border border-warning-border"
                          : "bg-info-bg text-info border border-info-border"
                    }`}
                  >
                    {tier}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <Progress value={score} className="h-1.5 w-full bg-border" />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-foreground-subtle">
              <span>Benchmark required for badge: 75</span>
              <span>Updated {lastUpdated}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
