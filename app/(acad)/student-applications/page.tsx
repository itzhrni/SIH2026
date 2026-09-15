"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Building,
  Calendar,
  MapPin,
  Clock,
  IndianRupee,
} from "lucide-react";
import type { ApiResponse } from "@/types";

interface ApplicationItem {
  id: string;
  status: string;
  placementStatus: string | null;
  matchScoreAtApply: number;
  appliedAt: string;
  opportunity: {
    id: string;
    title: string;
    type: string;
    location: string | null;
    duration: string | null;
    stipendRange: string | null;
    deadline: string;
    postedBy: {
      id: string;
      name: string;
      institution: string | null;
    };
  };
}

const STATUS_VARIANTS: Record<string, { label: string; className: string }> = {
  APPLIED: {
    label: "Applied",
    className: "bg-muted text-muted-foreground border-border",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-secondary text-secondary-foreground border-secondary",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    className: "bg-primary/20 text-primary border-primary/30",
  },
  INTERVIEW_SCHEDULED: {
    label: "Interview Scheduled",
    className: "bg-accent text-accent-foreground border-accent",
  },
  SELECTED: {
    label: "Selected / Offer Extended",
    className: "bg-success/20 text-success border-success/30",
  },
  NOT_SELECTED: {
    label: "Not Selected",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
};

export default function AcadApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await fetch("/api/applications");
        const json: ApiResponse<ApplicationItem[]> = await res.json();
        if (json.success) {
          setApplications(json.data);
        }
      } catch (err) {
        console.error("[AcadApplications] Failed to load:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-blue-950/60 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <FileText className="h-3.5 w-3.5" />
            <span>Academician Portal · Status Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            My Applications Tracker
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Track real-time status of your faculty applications for FDP, consultancy assignments, and research programs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
            <FileText className="h-3.5 w-3.5" />
            {applications.length} Submitted Applications
          </span>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-blue-900/30 bg-[#0C1427] p-5 space-y-3"
            >
              <Skeleton className="h-5 w-1/3 bg-white/5" />
              <Skeleton className="mt-2 h-4 w-1/4 bg-white/5" />
              <Skeleton className="mt-3 h-10 w-full bg-white/5" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-blue-900/40 bg-[#0A1227] p-6 text-center">
          <FileText className="h-8 w-8 text-foreground-subtle mb-2" />
          <p className="text-sm font-semibold text-white">
            No applications submitted yet
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            Explore active faculty opportunities and submit your credentials.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const statusConfig = STATUS_VARIANTS[app.status] || {
              label: app.status,
              className: "bg-muted text-muted-foreground",
            };

            return (
              <div
                key={app.id}
                className="rounded-lg border border-blue-900/30 bg-[#0C1427] p-5 transition-all duration-150 hover:border-blue-500/40 hover:shadow-md space-y-3"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="text-base font-bold text-white">
                      {app.opportunity.title}
                    </h2>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-foreground-muted">
                      <Building className="h-3.5 w-3.5 text-primary" />
                      <span className="text-white font-medium">
                        {app.opportunity.postedBy.institution ||
                          app.opportunity.postedBy.name}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-blue-950/60 text-xs text-foreground-muted">
                  {app.opportunity.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span>{app.opportunity.location}</span>
                    </div>
                  )}
                  {app.opportunity.duration && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{app.opportunity.duration}</span>
                    </div>
                  )}
                  {app.opportunity.stipendRange && (
                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{app.opportunity.stipendRange}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 ml-auto" suppressHydrationWarning>
                    <Calendar className="h-3.5 w-3.5 text-amber-400" />
                    <span>
                      Applied: {new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
