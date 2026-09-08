// components/assessment/GapReport.tsx
// Post-assessment gap report component strictly adhering to UI_UX_SPEC.md §5.6.

import React from "react";
import Link from "next/link";
import type { GapReportData } from "@/types";
import { SkillBadge } from "@/components/portfolio/SkillBadge";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface GapReportProps {
  report: GapReportData;
}

export function GapReport({ report }: GapReportProps) {
  const score = Math.round(report.overallScore);
  const badgeEarned = score >= 75;

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      {/* Score hero */}
      <div className="rounded-md border border-border bg-card p-5 text-center">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
          Assessment Report · {report.domain.toUpperCase()}
        </p>
        <p className="text-4xl font-bold tabular-nums text-foreground">
          {score}
        </p>
        <p className="mt-1 text-sm text-foreground-muted">out of 100</p>
        {badgeEarned && (
          <div className="mt-4 flex justify-center">
            <SkillBadge domain={report.domain} earned={true} />
          </div>
        )}
      </div>

      {/* Strong nodes */}
      {report.strongNodes.length > 0 && (
        <div className="rounded-md border border-success-border bg-success-bg p-4">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <h3 className="text-sm font-semibold text-success">
              Verified Conceptual Strengths
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.strongNodes.map((node) => (
              <span
                key={node}
                className="inline-flex items-center rounded-sm border border-success-border bg-white/60 px-2 py-0.5 text-xs font-medium text-success"
              >
                {node}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Partial nodes */}
      {report.partialNodes.length > 0 && (
        <div className="rounded-md border border-warning-border bg-warning-bg p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-warning">
              Partial Understanding (Needs Depth)
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.partialNodes.map((node) => (
              <span
                key={node}
                className="inline-flex items-center rounded-sm border border-warning-border bg-white/60 px-2 py-0.5 text-xs font-medium text-warning"
              >
                {node}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weak nodes */}
      {report.weakNodes.length > 0 && (
        <div className="rounded-md border border-destructive-border bg-destructive-bg p-4">
          <div className="mb-3 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-semibold text-destructive">
              Skill Gaps Identified
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.weakNodes.map((node) => (
              <span
                key={node}
                className="inline-flex items-center rounded-sm border border-destructive-border bg-white/60 px-2 py-0.5 text-xs font-medium text-destructive"
              >
                {node}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Learning Recommendations */}
      {report.learningResources.length > 0 && (
        <div className="rounded-md border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-base font-semibold text-foreground">
              Recommended Next Steps
            </h3>
            <p className="mt-0.5 text-xs text-foreground-subtle">
              Curated authoritative courseware and documentation mapped to your
              identified gaps
            </p>
          </div>
          <div className="divide-y divide-border">
            {report.learningResources.map((rec) => (
              <div key={rec.conceptNodeId} className="px-4 py-3">
                <p className="mb-1.5 text-sm font-medium text-foreground">
                  Focus Area:{" "}
                  <span className="text-primary">{rec.conceptNodeId}</span>
                </p>
                <div className="flex flex-col gap-1.5">
                  {rec.resources.map((res) => (
                    <a
                      key={res.url}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-2 hover:underline transition-colors duration-150"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span>{res.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <Link href="/student/dashboard">
          <Button
            variant="outline"
            className="h-9 px-4 text-sm border-border hover:bg-background-muted"
          >
            Back to Dashboard
          </Button>
        </Link>
        <Link href="/student/portfolio">
          <Button className="h-9 gap-1.5 bg-primary px-4 text-sm text-white hover:bg-primary-hover">
            View Live Portfolio
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
