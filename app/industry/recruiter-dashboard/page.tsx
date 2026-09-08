// app/(industry)/dashboard/page.tsx
// RULE FE-01: Server Component — async data fetch, no hooks
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Briefcase, Users, Clock, CheckCircle } from "lucide-react";

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
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          Welcome back, {session.user.name}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Active Postings
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-foreground">
            {activePostings}
          </p>
          <Briefcase className="mt-2 h-4 w-4 text-foreground-subtle" />
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Total Applicants
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-foreground">
            {totalApplications}
          </p>
          <Users className="mt-2 h-4 w-4 text-foreground-subtle" />
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Pending Review
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-foreground">
            {pendingReview}
          </p>
          <Clock className="mt-2 h-4 w-4 text-foreground-subtle" />
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Reviewed
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-foreground">
            {totalApplications - pendingReview}
          </p>
          <CheckCircle className="mt-2 h-4 w-4 text-foreground-subtle" />
        </div>
      </div>

      {/* Active postings table */}
      <div className="rounded-md border border-border bg-card">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Active Postings
          </h2>
          <div className="flex items-center gap-2">
            <Link
              href="/industry/post/internship"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover transition-colors duration-150"
            >
              + Post Internship
            </Link>
            <Link
              href="/industry/post/job"
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground-muted hover:bg-background-muted transition-colors duration-150"
            >
              + Post Job
            </Link>
          </div>
        </div>
        {postings.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-foreground-muted">
              No active postings yet.
            </p>
            <Link
              href="/industry/post/internship"
              className="mt-3 inline-block text-sm text-primary hover:underline"
            >
              Create your first internship posting →
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-subtle">
                  <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Role
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Type
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Applicants
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Deadline
                  </th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {postings.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors duration-150 hover:bg-background-subtle"
                  >
                    <td className="px-3 py-2.5 font-medium text-foreground">
                      {p.title}
                    </td>
                    <td className="px-3 py-2.5 text-foreground-muted">
                      {p.type}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-foreground-muted">
                      {p._count.applications}
                    </td>
                    <td className="px-3 py-2.5 text-foreground-muted">
                      {new Date(p.deadline).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Link
                        href={`/industry/pipeline/${p.id}`}
                        className="rounded-md border border-border px-2.5 py-1 text-xs text-foreground-muted hover:bg-background-muted transition-colors duration-150"
                      >
                        Pipeline
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
