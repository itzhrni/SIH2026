"use client";

import React, { useState } from "react";
import type { PipelineApplicant, OpportunitySummary } from "@/types";
import {
  UserCheck,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  Briefcase,
  FileText,
  Save,
  MessageSquare,
  Building,
  GraduationCap,
} from "lucide-react";

interface PlacementPipelineProps {
  initialApplicants: PipelineApplicant[];
  opportunities: OpportunitySummary[];
}

export function PlacementPipeline({
  initialApplicants,
  opportunities,
}: PlacementPipelineProps) {
  const [applicants, setApplicants] =
    useState<PipelineApplicant[]>(initialApplicants);
  const [selectedOpportunityId, setSelectedOpportunityId] =
    useState<string>("ALL");
  const [activeStageTab, setActiveStageTab] = useState<string>("ALL");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    id: string;
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filter applicants by opportunity
  const filteredApplicants = applicants.filter((a) => {
    const matchesOpp =
      selectedOpportunityId === "ALL" ||
      a.opportunityId === selectedOpportunityId;

    if (!matchesOpp) return false;

    if (activeStageTab === "ALL") return true;
    if (activeStageTab === "APPLIED")
      return a.status === "APPLIED" && !a.placementStatus;
    if (activeStageTab === "UNDER_REVIEW")
      return a.status === "UNDER_REVIEW" || a.placementStatus === "REVIEWED";
    if (activeStageTab === "SHORTLISTED")
      return a.status === "SHORTLISTED" || a.placementStatus === "SHORTLISTED";
    if (activeStageTab === "INTERVIEW")
      return (
        a.status === "INTERVIEW_SCHEDULED" ||
        a.placementStatus === "INTERVIEW_SCHEDULED"
      );
    if (activeStageTab === "OFFER")
      return a.status === "SELECTED" || a.placementStatus === "OFFER_EXTENDED";
    if (activeStageTab === "JOINED") return a.placementStatus === "JOINED";
    if (activeStageTab === "REJECTED")
      return a.status === "NOT_SELECTED" || a.placementStatus === "REJECTED";

    return true;
  });

  const handleUpdateStatus = async (
    applicantId: string,
    updates: {
      status?: PipelineApplicant["status"];
      placementStatus?: PipelineApplicant["placementStatus"];
      notes?: string;
    },
  ) => {
    setIsUpdating(applicantId);
    try {
      const res = await fetch(`/api/applications/${applicantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const json = await res.json();
      if (json.success) {
        setApplicants((prev) =>
          prev.map((app) =>
            app.id === applicantId
              ? {
                  ...app,
                  ...(updates.status ? { status: updates.status } : {}),
                  ...(updates.placementStatus !== undefined
                    ? { placementStatus: updates.placementStatus }
                    : {}),
                  ...(updates.notes !== undefined
                    ? { notes: updates.notes }
                    : {}),
                }
              : app,
          ),
        );
        if (editingNotesId === applicantId) {
          setEditingNotesId(null);
        }
        setActionFeedback({
          id: applicantId,
          type: "success",
          message: "Candidate stage updated successfully.",
        });
        setTimeout(() => setActionFeedback(null), 3000);
      } else {
        setActionFeedback({
          id: applicantId,
          type: "error",
          message: json.error?.message || "Failed to update candidate status.",
        });
      }
    } catch (err) {
      console.error("Failed to update status", err);
      setActionFeedback({
        id: applicantId,
        type: "error",
        message: "Network error. Failed to update status.",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  // Compute stage counts scoped to the currently selected opportunity
  const oppScopedApplicants = applicants.filter((a) => {
    return (
      selectedOpportunityId === "ALL" ||
      a.opportunityId === selectedOpportunityId
    );
  });

  const stageCounts = {
    all: oppScopedApplicants.length,
    applied: oppScopedApplicants.filter(
      (a) => a.status === "APPLIED" && !a.placementStatus,
    ).length,
    underReview: oppScopedApplicants.filter(
      (a) => a.status === "UNDER_REVIEW" || a.placementStatus === "REVIEWED",
    ).length,
    shortlisted: oppScopedApplicants.filter(
      (a) => a.status === "SHORTLISTED" || a.placementStatus === "SHORTLISTED",
    ).length,
    interview: oppScopedApplicants.filter(
      (a) =>
        a.status === "INTERVIEW_SCHEDULED" ||
        a.placementStatus === "INTERVIEW_SCHEDULED",
    ).length,
    offer: oppScopedApplicants.filter(
      (a) => a.status === "SELECTED" || a.placementStatus === "OFFER_EXTENDED",
    ).length,
    joined: oppScopedApplicants.filter((a) => a.placementStatus === "JOINED").length,
    rejected: oppScopedApplicants.filter(
      (a) => a.status === "NOT_SELECTED" || a.placementStatus === "REJECTED",
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Stage Selector */}
      <div className="rounded-md border border-border bg-card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Recruitment & Placement Stages
            </h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              Review applicant portfolios, schedule interviews, and extend
              placement offers
            </p>
          </div>

          {/* Opportunity Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground-muted whitespace-nowrap">
              Posting:
            </span>
            <select
              value={selectedOpportunityId}
              onChange={(e) => setSelectedOpportunityId(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring max-w-[240px]"
            >
              <option value="ALL">
                All Active Postings ({opportunities.length})
              </option>
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.title} ({opp.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stage Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
          {[
            { id: "ALL", label: "All Candidates", count: stageCounts.all },
            { id: "APPLIED", label: "New Applied", count: stageCounts.applied },
            {
              id: "UNDER_REVIEW",
              label: "Under Review",
              count: stageCounts.underReview,
            },
            {
              id: "SHORTLISTED",
              label: "Shortlisted",
              count: stageCounts.shortlisted,
            },
            {
              id: "INTERVIEW",
              label: "Interviews",
              count: stageCounts.interview,
            },
            { id: "OFFER", label: "Offer Extended", count: stageCounts.offer },
            {
              id: "JOINED",
              label: "Joined / Placed",
              count: stageCounts.joined,
            },
            { id: "REJECTED", label: "Declined", count: stageCounts.rejected },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveStageTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors ${
                activeStageTab === tab.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-background-subtle text-foreground-muted hover:bg-background-muted hover:text-foreground border border-border"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`tabular-nums text-2xs px-1 rounded-full ${
                  activeStageTab === tab.id
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background-muted text-foreground-subtle"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Applicant Cards / List */}
      <div className="space-y-3">
        {filteredApplicants.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-md border border-dashed border-border p-6 text-center text-sm text-foreground-muted">
            <GraduationCap className="h-8 w-8 text-foreground-subtle mb-2" />
            <p className="font-medium text-foreground">
              No applicants in this stage
            </p>
            <p className="text-xs text-foreground-subtle mt-1">
              Select another recruitment stage or opportunity posting from the
              filters above.
            </p>
          </div>
        ) : (
          filteredApplicants.map((applicant) => (
            <div
              key={applicant.id}
              className="rounded-md border border-border bg-card p-4 transition-colors hover:border-border-strong space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-foreground text-sm">
                      {applicant.studentName}
                    </h4>
                    <span
                      className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-2xs font-semibold tabular-nums ${
                        applicant.matchScoreAtApply >= 75
                          ? "bg-success-bg text-success border border-success-border"
                          : applicant.matchScoreAtApply >= 50
                            ? "bg-warning-bg text-warning border border-warning-border"
                            : "bg-destructive-bg text-destructive border border-destructive-border"
                      }`}
                    >
                      {applicant.matchScoreAtApply}% Match at Apply
                    </span>
                  </div>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {applicant.studentEmail} ·{" "}
                    {applicant.institution || "University Candidate"} (
                    {applicant.department || "Computer Science"})
                  </p>
                  <p className="text-2xs text-foreground-subtle mt-0.5">
                    Applied for:{" "}
                    <strong className="text-foreground font-semibold">
                      {applicant.opportunityTitle}
                    </strong>{" "}
                    on {new Date(applicant.appliedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-semibold uppercase tracking-wide border ${
                      applicant.placementStatus === "OFFER_EXTENDED" ||
                      applicant.status === "SELECTED"
                        ? "bg-success-bg text-success border-success-border"
                        : applicant.placementStatus === "JOINED"
                          ? "bg-success-bg text-success border-success-border"
                          : applicant.status === "SHORTLISTED" ||
                              applicant.placementStatus === "SHORTLISTED"
                            ? "bg-warning-bg text-warning border-warning-border"
                            : applicant.status === "INTERVIEW_SCHEDULED" ||
                                applicant.placementStatus ===
                                  "INTERVIEW_SCHEDULED"
                              ? "bg-primary-subtle text-primary border-primary/20"
                              : applicant.status === "NOT_SELECTED" ||
                                  applicant.placementStatus === "REJECTED"
                                ? "bg-destructive-bg text-destructive border-destructive-border"
                                : "bg-background-muted text-foreground-muted border-border"
                    }`}
                  >
                    {applicant.placementStatus || applicant.status}
                  </span>
                </div>
              </div>

              {/* Recruiter Notes Section */}
              <div className="rounded-md border border-border bg-background-subtle p-2.5 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3 text-primary" /> Recruiter
                    Notes
                  </span>
                  {editingNotesId !== applicant.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNotesId(applicant.id);
                        setNotesDraft(applicant.notes || "");
                      }}
                      className="text-2xs text-primary hover:underline"
                    >
                      {applicant.notes ? "Edit Note" : "+ Add Note"}
                    </button>
                  )}
                </div>

                {editingNotesId === applicant.id ? (
                  <div className="space-y-2 mt-1">
                    <textarea
                      rows={2}
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      placeholder="Add interview feedback, technical evaluation notes, or compensation details..."
                      className="w-full rounded-md border border-input bg-card p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingNotesId(null)}
                        className="px-2 py-1 text-2xs text-foreground-muted hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(applicant.id, {
                            notes: notesDraft,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-sm bg-primary px-2.5 py-1 text-2xs font-semibold text-primary-foreground hover:bg-primary-hover"
                      >
                        <Save className="h-3 w-3" /> Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-foreground-muted italic">
                    {applicant.notes || "No notes added yet."}
                  </p>
                )}
              </div>

              {/* Action Feedback Notification */}
              {actionFeedback && actionFeedback.id === applicant.id && (
                <div
                  className={`rounded-sm px-2.5 py-1 text-xs font-medium border ${
                    actionFeedback.type === "success"
                      ? "bg-success-bg text-success border-success-border"
                      : "bg-destructive-bg text-destructive border-destructive-border"
                  }`}
                >
                  {actionFeedback.message}
                </div>
              )}

              {/* Pipeline Progression Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  disabled={isUpdating === applicant.id}
                  onClick={() =>
                    handleUpdateStatus(applicant.id, {
                      status: "UNDER_REVIEW",
                      placementStatus: "REVIEWED",
                    })
                  }
                  className="rounded-sm border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground-muted hover:bg-background-muted hover:text-foreground transition-colors disabled:opacity-50"
                >
                  Under Review
                </button>

                <button
                  type="button"
                  disabled={isUpdating === applicant.id}
                  onClick={() =>
                    handleUpdateStatus(applicant.id, {
                      status: "SHORTLISTED",
                      placementStatus: "SHORTLISTED",
                    })
                  }
                  className="rounded-sm border border-warning-border bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Shortlist
                </button>

                <button
                  type="button"
                  disabled={isUpdating === applicant.id}
                  onClick={() =>
                    handleUpdateStatus(applicant.id, {
                      status: "INTERVIEW_SCHEDULED",
                      placementStatus: "INTERVIEW_SCHEDULED",
                    })
                  }
                  className="rounded-sm border border-primary/20 bg-primary-subtle px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  Schedule Interview
                </button>

                <button
                  type="button"
                  disabled={isUpdating === applicant.id}
                  onClick={() =>
                    handleUpdateStatus(applicant.id, {
                      status: "SELECTED",
                      placementStatus: "OFFER_EXTENDED",
                    })
                  }
                  className="rounded-sm border border-success-border bg-success-bg px-2.5 py-1 text-xs font-semibold text-success hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Extend Offer
                </button>

                <button
                  type="button"
                  disabled={isUpdating === applicant.id}
                  onClick={() =>
                    handleUpdateStatus(applicant.id, {
                      placementStatus: "JOINED",
                    })
                  }
                  className="rounded-sm bg-success px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Mark Joined
                </button>

                <button
                  type="button"
                  disabled={isUpdating === applicant.id}
                  onClick={() =>
                    handleUpdateStatus(applicant.id, {
                      status: "NOT_SELECTED",
                      placementStatus: "REJECTED",
                    })
                  }
                  className="rounded-sm border border-destructive-border bg-destructive-bg px-2.5 py-1 text-xs font-medium text-destructive hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
