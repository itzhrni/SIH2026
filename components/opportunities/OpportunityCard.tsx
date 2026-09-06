"use client";

// components/opportunities/OpportunityCard.tsx
// Renders an individual opportunity item in the student feed following UI_UX_SPEC.md §5.8.

import React, { useState } from "react";
import type { OpportunityWithMatch } from "@/types";
import { MatchBadge } from "@/components/opportunities/MatchBadge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface OpportunityCardProps {
  opportunity: OpportunityWithMatch;
  hasAppliedInitial?: boolean;
  onApplySuccess?: (id: string) => void;
}

export function OpportunityCard({
  opportunity,
  hasAppliedInitial = false,
  onApplySuccess,
}: OpportunityCardProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(hasAppliedInitial);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApply = async () => {
    setIsApplying(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/opportunities/${opportunity.id}/apply`, {
        method: "POST",
      });
      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error?.message ?? "Application failed");
        if (data.error?.code === "CONFLICT") {
          setHasApplied(true);
        }
      } else {
        setHasApplied(true);
        onApplySuccess?.(opportunity.id);
      }
    } catch {
      setErrorMsg("Failed to connect to application service");
    } finally {
      setIsApplying(false);
    }
  };

  const deadlineFormatted = new Date(opportunity.deadline).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <div className="flex items-start gap-4 px-4 py-4 transition-colors duration-150 hover:bg-background-subtle">
      {/* Company initial icon block */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background-muted text-sm font-semibold text-foreground-muted">
        {opportunity.companyName?.charAt(0)?.toUpperCase() ?? "O"}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              {opportunity.title}
            </h4>
            <p className="mt-0.5 text-xs text-foreground-muted">
              {opportunity.companyName}
              {opportunity.location ? ` · ${opportunity.location}` : ""}
              {opportunity.duration ? ` · ${opportunity.duration}` : ""}
              {opportunity.stipendRange ? ` · ${opportunity.stipendRange}` : ""}
            </p>
          </div>
          <MatchBadge score={opportunity.matchScore} />
        </div>

        {/* Skill tags */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {opportunity.requiredSkills.map((req) => {
            const isMet = opportunity.metSkills.includes(req.skill);
            return (
              <span
                key={req.skill}
                className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-2xs font-medium uppercase tracking-wide border ${
                  isMet
                    ? "bg-success-bg text-success border-success-border"
                    : "bg-background-muted text-foreground-muted border-border"
                }`}
              >
                {isMet ? (
                  <CheckCircle2 className="h-2.5 w-2.5 text-success" />
                ) : (
                  <AlertCircle className="h-2.5 w-2.5 text-foreground-subtle" />
                )}
                <span>{req.skill}</span>
                <span className="text-foreground-subtle tabular-nums">
                  ({req.minThreshold}%)
                </span>
              </span>
            );
          })}
        </div>

        {errorMsg && (
          <p className="mt-2 text-xs text-destructive">{errorMsg}</p>
        )}

        {/* Actions row */}
        <div className="mt-3 flex items-center gap-3">
          {hasApplied ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Applied with SkillLedger Profile
            </span>
          ) : (
            <Button
              size="sm"
              className="h-7 text-xs bg-primary hover:bg-primary-hover text-white"
              disabled={isApplying}
              onClick={handleApply}
            >
              {isApplying ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply with Live Portfolio"
              )}
            </Button>
          )}

          <span className="ml-auto text-xs text-foreground-subtle">
            Closes {deadlineFormatted}
          </span>
        </div>
      </div>
    </div>
  );
}
