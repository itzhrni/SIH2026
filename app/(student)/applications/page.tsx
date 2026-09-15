// app/(student)/applications/page.tsx
// Centralized application status tracking page for students.
// RULE FE-01: Server Component.
// RULE FE-03: Direct async/await data fetching with Prisma.

import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { prisma } from "@/lib/db";
import { FileText, ArrowRight, ExternalLink, Building2, CheckCircle2, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  APPLIED: {
    label: "Applied",
    className: "bg-white/[0.04] text-foreground-muted border-border/80",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    className: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  INTERVIEW_SCHEDULED: {
    label: "Interview Scheduled",
    className: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  SELECTED: {
    label: "Selected",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  NOT_SELECTED: {
    label: "Not Selected",
    className: "bg-rose-500/10 text-rose-400 border-rose-500/30",
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
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Applications Tracker
          </h1>
          <p className="mt-0.5 text-xs text-foreground-muted">
            Track real-time candidate stage transitions across internships and industry pipelines.
          </p>
        </div>

        <Link href="/opportunities">
          <Button
            size="sm"
            className="h-8 gap-1.5 bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Applications High-Density Table */}
      <div className="rounded-lg border border-border bg-[#0B0F17] overflow-hidden">
        {applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/80 bg-[#0E131F] text-foreground-subtle text-[11px] uppercase tracking-wider font-semibold">
                  <th scope="col" className="px-4 py-3">
                    Position & Type
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Organization
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Applied Date
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Match at Apply
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Pipeline Stage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {applications.map((app) => {
                  const statusMeta = STATUS_LABELS[app.status] ?? {
                    label: app.status,
                    className: "bg-white/[0.04] text-foreground-muted border-border/80",
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
                      timeZone: "UTC",
                    },
                  );

                  return (
                    <tr
                      key={app.id}
                      className="border-b border-border/40 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white">
                          {app.opportunity.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-foreground-subtle">
                          <span className="rounded bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 font-bold uppercase tracking-wider text-[9px]">
                            {app.opportunity.type}
                          </span>
                          {app.opportunity.location && (
                            <>
                              <span>·</span>
                              <span>{app.opportunity.location}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-foreground font-medium">
                        {companyName}
                      </td>
                      <td className="px-4 py-3.5 text-foreground-muted tabular-nums" suppressHydrationWarning>
                        {appliedDate}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-primary tabular-nums">
                          {app.matchScoreAtApply ? `${Math.round(app.matchScoreAtApply)}%` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${statusMeta.className}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-foreground-muted">
            <FileText className="mx-auto h-8 w-8 text-foreground-subtle mb-2" />
            <p className="font-semibold text-white">No applications submitted yet</p>
            <p className="mt-1 text-foreground-muted">
              Browse matched opportunities and apply using your live verified SkillLedger portfolio.
            </p>
            <Link href="/opportunities" className="inline-block mt-4">
              <Button size="sm" className="h-7 text-xs bg-primary text-white hover:bg-primary-hover">
                Find Matched Opportunities
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
