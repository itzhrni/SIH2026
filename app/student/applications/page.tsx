// app/(student)/applications/page.tsx
// Centralized application status tracking page for students.
// RULE FE-01: Server Component.
// RULE FE-03: Direct async/await data fetching with Prisma.
// MVP Feature 4.3: Applied -> Under Review -> Shortlisted -> Interview Scheduled -> Selected / Not Selected pipeline.

import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { prisma } from "@/lib/db";
import { FileText, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  APPLIED: {
    label: "Applied",
    className: "bg-background-muted text-foreground-muted border-border",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-info-bg text-info border-info-border",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    className: "bg-warning-bg text-warning border-warning-border",
  },
  INTERVIEW_SCHEDULED: {
    label: "Interview Scheduled",
    className: "bg-primary-subtle text-primary border-primary/20",
  },
  SELECTED: {
    label: "Selected",
    className: "bg-success-bg text-success border-success-border",
  },
  NOT_SELECTED: {
    label: "Not Selected",
    className: "bg-destructive-bg text-destructive border-destructive-border",
  },
};

export default async function ApplicationsPage() {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // 1. Fetch student's submitted applications with opportunity details
  const applications = await prisma.application.findMany({
    where: { userId },
    include: {
      opportunity: {
        select: {
          id: true,
          title: true,
          type: true,
          location: true,
          postedBy: { select: { name: true, institution: true } },
        },
      },
    },
    orderBy: { appliedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Application Status Tracker
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Track real-time candidate stage transitions across internships and
            full-time hiring pipelines.
          </p>
        </div>

        <Link href="/opportunities">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs border-border hover:bg-background-muted"
          >
            <span>Browse More Opportunities</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Applications High-Density Table (UI_UX_SPEC §5.4) */}
      <div className="rounded-md border border-border bg-card overflow-hidden">
        {applications.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background-subtle">
                <th
                  scope="col"
                  className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted"
                >
                  Position & Type
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted"
                >
                  Organization
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted"
                >
                  Applied Date
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted"
                >
                  Match at Apply
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted"
                >
                  Pipeline Stage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.map((app) => {
                const statusMeta = STATUS_LABELS[app.status] ?? {
                  label: app.status,
                  className:
                    "bg-background-muted text-foreground-muted border-border",
                };
                const companyName =
                  app.opportunity.postedBy.institution ??
                  app.opportunity.postedBy.name;

                const appliedDate = new Date(app.appliedAt).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  },
                );

                return (
                  <tr
                    key={app.id}
                    className="transition-colors duration-150 hover:bg-background-subtle"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {app.opportunity.title}
                      </div>
                      <div className="text-2xs text-foreground-subtle uppercase tracking-wider mt-0.5">
                        {app.opportunity.type.replace("_", " ")}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-foreground-muted">
                      <div>{companyName}</div>
                      {app.opportunity.location && (
                        <div className="text-2xs text-foreground-subtle">
                          {app.opportunity.location}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs text-foreground-muted tabular-nums">
                      {appliedDate}
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold tabular-nums bg-primary-subtle text-primary border border-primary/20">
                        {Math.round(app.matchScoreAtApply)}%
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium ${statusMeta.className}`}
                        aria-label={`Application status: ${statusMeta.label}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center">
            <FileText className="mx-auto h-10 w-10 text-foreground-subtle mb-3" />
            <h3 className="text-base font-semibold text-foreground">
              No applications submitted yet
            </h3>
            <p className="mt-1 text-xs text-foreground-muted max-w-sm mx-auto">
              Explore internships and full-time positions in the opportunities
              feed to apply using your verified live portfolio.
            </p>
            <div className="mt-4">
              <Link href="/opportunities">
                <Button
                  size="sm"
                  className="h-8 text-xs bg-primary hover:bg-primary-hover text-white"
                >
                  Discover Opportunities
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
