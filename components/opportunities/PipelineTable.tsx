// components/opportunities/PipelineTable.tsx
// RULE FE-01: "use client" — onClick handlers, useState for optimistic updates
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MatchBadge } from "@/components/opportunities/MatchBadge";
import type { ApplicantForPipeline } from "@/types";
import type { ApplicationStatus, PlacementStatus } from "@prisma/client";

const APPLICATION_STATUSES: ApplicationStatus[] = [
  "APPLIED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW_SCHEDULED",
  "SELECTED",
  "NOT_SELECTED",
];

const PLACEMENT_STATUSES: PlacementStatus[] = [
  "APPLIED",
  "REVIEWED",
  "SHORTLISTED",
  "INTERVIEW_SCHEDULED",
  "OFFER_EXTENDED",
  "JOINED",
  "REJECTED",
];

const STATUS_CLASSES: Record<string, string> = {
  APPLIED: "bg-background-muted text-foreground-muted border-border",
  UNDER_REVIEW: "bg-info-bg text-info border-info-border",
  SHORTLISTED: "bg-warning-bg text-warning border-warning-border",
  INTERVIEW_SCHEDULED: "bg-primary-subtle text-primary border-primary/20",
  SELECTED: "bg-success-bg text-success border-success-border",
  NOT_SELECTED: "bg-destructive-bg text-destructive border-destructive-border",
  REVIEWED: "bg-info-bg text-info border-info-border",
  OFFER_EXTENDED: "bg-success-bg text-success border-success-border",
  JOINED: "bg-success-bg text-success border-success-border",
  REJECTED: "bg-destructive-bg text-destructive border-destructive-border",
};

function StatusBadge({ status }: { status: string }) {
  const cls =
    STATUS_CLASSES[status] ??
    "bg-background-muted text-foreground-muted border-border";
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium border ${cls}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

interface PipelineTableProps {
  applicants: ApplicantForPipeline[];
  isJobPosting: boolean;
  postingId: string;
}

export function PipelineTable({
  applicants,
  isJobPosting,
  postingId,
}: PipelineTableProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (
    applicationId: string,
    patch: Partial<{ status: string; placementStatus: string }>,
  ) => {
    setUpdating(applicationId);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error.message);
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setUpdating(null);
    }
  };

  if (applicants.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card px-4 py-12 text-center">
        <p className="text-sm text-foreground-muted">
          No applications yet for this posting.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md border border-destructive-border bg-destructive-bg px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background-subtle">
              <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                Candidate
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                Match
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                Current Status
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                Move To
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                Applied
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {applicants.map((app) => {
              const isUpdating = updating === app.applicationId;
              const currentStatus = isJobPosting
                ? (app.placementStatus ?? app.status)
                : app.status;

              return (
                <tr
                  key={app.applicationId}
                  className="transition-colors duration-150 hover:bg-background-subtle"
                >
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-foreground">
                      {app.studentName}
                    </div>
                    {app.studentInstitution && (
                      <div className="text-xs text-foreground-subtle">
                        {app.studentInstitution}
                      </div>
                    )}
                    {app.studentDepartment && (
                      <div className="text-xs text-foreground-subtle">
                        {app.studentDepartment}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <MatchBadge score={app.matchScoreAtApply} />
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={currentStatus} />
                  </td>
                  <td className="px-3 py-2.5">
                    <Select
                      disabled={isUpdating}
                      onValueChange={(val) => {
                        if (isJobPosting) {
                          updateStatus(app.applicationId, {
                            placementStatus: val,
                          });
                        } else {
                          updateStatus(app.applicationId, { status: val });
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 w-48 text-xs">
                        <SelectValue
                          placeholder={
                            isUpdating ? "Updating…" : "Change status…"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {(isJobPosting
                          ? PLACEMENT_STATUSES
                          : APPLICATION_STATUSES
                        ).map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-foreground-subtle tabular-nums">
                    {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
