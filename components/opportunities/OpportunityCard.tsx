"use client";

// components/opportunities/OpportunityCard.tsx
// Renders an individual opportunity item in the student feed following UI_UX_SPEC.md §5.8.

import React, { useState } from "react";
import type { OpportunityWithMatch } from "@/types";
import { MatchBadge } from "@/components/opportunities/MatchBadge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2, Building2, MapPin, Calendar, Clock, ArrowRight } from "lucide-react";

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
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-[#0E131F] p-4 transition-all duration-150 hover:border-primary/40 hover:bg-[#121827]">
      {/* Top row: Company, Title, Meta, Match Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-white/[0.04] text-xs font-bold text-white">
            {opportunity.companyName?.charAt(0)?.toUpperCase() ?? "O"}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-white truncate leading-snug">
              {opportunity.title}
            </h4>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-foreground-muted">
              <span className="font-medium text-foreground-muted">
                {opportunity.companyName}
              </span>
              {opportunity.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-foreground-subtle" />
                    {opportunity.location}
                  </span>
                </>
              )}
              {opportunity.duration && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-foreground-subtle" />
                    {opportunity.duration}
                  </span>
                </>
              )}
              {opportunity.stipendRange && (
                <>
                  <span>·</span>
                  <span className="text-emerald-400 font-medium">
                    {opportunity.stipendRange}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <MatchBadge score={opportunity.matchScore} />
        </div>
      </div>

      {/* WHY THIS MATCHES YOU: Skill Breakdown */}
      <div className="rounded-md border border-border/60 bg-black/20 p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-foreground-subtle uppercase tracking-wider text-[10px]">
            Skill Compatibility Alignment
          </span>
          <span className="text-foreground-muted">
            {opportunity.metSkills.length} of {opportunity.requiredSkills.length} criteria met
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {opportunity.requiredSkills.map((req) => {
            const isMet = opportunity.metSkills.includes(req.skill);
            return (
              <span
                key={req.skill}
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium border ${
                  isMet
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                }`}
              >
                {isMet ? (
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-2.5 w-2.5 text-amber-400" />
                )}
                <span>{req.skill}</span>
                <span className="text-foreground-subtle tabular-nums">
                  ({req.minThreshold}%)
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <p className="text-xs text-destructive">{errorMsg}</p>
      )}

      {/* Actions Row */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <span className="text-[11px] text-foreground-subtle flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Closes {deadlineFormatted}
        </span>

        {hasApplied ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Applied via SkillLedger
          </span>
        ) : (
          <Button
            size="sm"
            className="h-7 text-xs bg-primary hover:bg-primary-hover text-white font-medium px-3 gap-1 shadow-xs"
            disabled={isApplying}
            onClick={handleApply}
          >
            {isApplying ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                Apply with Profile
                <ArrowRight className="h-3 w-3 ml-0.5" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
