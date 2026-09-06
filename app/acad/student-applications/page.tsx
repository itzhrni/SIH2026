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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Applications Tracker
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Track the live review status of your applications for Faculty
          Development Programs, consultancy, and collaborative research.
        </p>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-md border border-border bg-card p-5"
            >
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="mt-2 h-4 w-1/4" />
              <Skeleton className="mt-3 h-10 w-full" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-md border border-dashed border-border bg-card p-6 text-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-semibold text-foreground">
            No applications submitted yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Explore active opportunities and submit your academic profile.
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
                className="rounded-md border border-border bg-card p-5 shadow-sm transition-colors duration-150 ease-in-out"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      {app.opportunity.title}
                    </h2>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building className="h-3.5 w-3.5" />
                      <span>
                        {app.opportunity.postedBy.institution ||
                          app.opportunity.postedBy.name}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-sm border px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  {app.opportunity.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{app.opportunity.location}</span>
                    </div>
                  )}
                  {app.opportunity.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{app.opportunity.duration}</span>
                    </div>
                  )}
                  {app.opportunity.stipendRange && (
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3.5 w-3.5" />
                      <span>{app.opportunity.stipendRange}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Applied on: {new Date(app.appliedAt).toLocaleDateString()}
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
