// app/(industry)/recruiter-dashboard/page.tsx
// Recruiter Dashboard: hiring pipeline metrics, active opportunity postings, applicant review queues.
// RULE FE-01: Server Component.

import React from "react";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function IndustryDashboardPage() {
  const session = await getServerSession(nextAuthConfig);
  if (!session || session.user.role !== "INDUSTRY") redirect("/login");

  // Fetch KPIs — select only required fields (RULE DB-04)
  const [activePostings, totalApplications, pendingReview, postings] =
    await Promise.all([
      prisma.opportunity.count({
        where: { postedById: session.user.id, isActive: true },
      }),
      prisma.application.count({
        where: { opportunity: { postedById: session.user.id } },
      }),
      prisma.application.count({
        where: {
          opportunity: { postedById: session.user.id },
          status: "APPLIED",
        },
      }),
      prisma.opportunity.findMany({
        where: { postedById: session.user.id, isActive: true },
        select: {
          id: true,
          type: true,
          title: true,
          deadline: true,
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Recruiter Console</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
            Industry Dashboard
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Welcome back, {session.user.name}. Track hiring pipelines and verified candidate discoveries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/industry/post/internship">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-border bg-[#0E131F] text-xs font-medium text-foreground hover:text-white hover:bg-white/5"
            >
              <PlusCircle className="h-3.5 w-3.5 text-indigo-400" />
              <span>Post Internship</span>
            </Button>
          </Link>
          <Link href="/industry/post/job">
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs"
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Post Job</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-[#0E131F] p-3.5 transition-colors hover:border-indigo-500/40">
          <div className="flex items-center justify-between text-foreground-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
              Active Postings
            </span>
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-white">
            {activePostings}
          </p>
          <p className="mt-1 text-[11px] text-foreground-muted">
            Live recruitment listings
          </p>
        </div>

        <div className="rounded-lg border border-border bg-[#0E131F] p-3.5 transition-colors hover:border-indigo-500/40">
          <div className="flex items-center justify-between text-foreground-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
              Total Applicants
            </span>
            <div className="h-2 w-2 rounded-full bg-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-white">
            {totalApplications}
          </p>
          <p className="mt-1 text-[11px] text-foreground-muted">
            Verified candidate submissions
          </p>
        </div>

        <div className="rounded-lg border border-border bg-[#0E131F] p-3.5 transition-colors hover:border-indigo-500/40">
          <div className="flex items-center justify-between text-foreground-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
              Pending Review
            </span>
            <div className="h-2 w-2 rounded-full bg-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-white">
            {pendingReview}
          </p>
          <p className="mt-1 text-[11px] text-foreground-muted">
            Stage: Applied
          </p>
        </div>

        <div className="rounded-lg border border-border bg-[#0E131F] p-3.5 transition-colors hover:border-indigo-500/40">
          <div className="flex items-center justify-between text-foreground-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
              In Pipeline
            </span>
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-white">
            {totalApplications - pendingReview}
          </p>
          <p className="mt-1 text-[11px] text-foreground-muted">
            Shortlisted & Interviewed
          </p>
        </div>
      </div>

      {/* Active Postings High-Density Table */}
      <div className="rounded-lg border border-border bg-[#0B0F17] overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/80 bg-[#0E131F] px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Active Opportunity Postings
            </h2>
            <p className="text-[11px] text-foreground-muted">
              Applicant volume and pipeline management for published roles
            </p>
          </div>
          <Link
            href="/industry/my-postings"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All Postings</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {postings.length === 0 ? (
          <div className="py-12 text-center text-xs text-foreground-muted">
            <Briefcase className="mx-auto h-8 w-8 text-foreground-subtle mb-2" />
            <p className="font-semibold text-white">No active postings found</p>
            <p className="mt-1 text-foreground-muted">
              Create your first internship or job opportunity to begin receiving verified applicants.
            </p>
            <Link href="/industry/post/internship" className="inline-block mt-3">
              <Button size="sm" className="h-7 text-xs bg-primary text-white hover:bg-primary-hover">
                Create First Posting
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/60 bg-[#0E131F]/50 text-foreground-subtle text-[11px] uppercase tracking-wider font-semibold">
                  <th scope="col" className="px-4 py-3">
                    Role Title & Type
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Deadline
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Applicants
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {postings.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">{p.title}</div>
                      <span className="rounded bg-white/[0.04] px-1.5 py-0.2 text-[10px] text-foreground-muted border border-border/40 mt-1 inline-block">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-foreground-muted tabular-nums" suppressHydrationWarning>
                      {new Date(p.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-white tabular-nums">
                        {p._count.applications}
                      </span>
                      <span className="text-foreground-subtle ml-1">candidates</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/industry/pipeline`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-border bg-white/[0.03] text-foreground hover:text-white hover:bg-white/10"
                        >
                          <span>Manage</span>
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
