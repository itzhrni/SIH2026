// app/(student)/dashboard/page.tsx
// Student dashboard home: metric cards, opportunity matches, skill snapshot, recent gap report.
// RULE FE-01: Server Component.
// RULE FE-03: Direct async/await data fetching with Prisma.
// UI_UX_SPEC.md §13: METRIC ROW: 4 cards, MAIN SPLIT: 2/3 opportunity feed | 1/3 portfolio snapshot + recent gap report.

import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { SkillBadge } from "@/components/portfolio/SkillBadge";
import { computeMatchScore } from "@/lib/matching/opportunity-match";
import { computeRoleCompatibility } from "@/lib/matching/career-guidance";
import type { RequiredSkill, DomainScore, OpportunityWithMatch } from "@/types";
import { BrainCircuit, Award, ArrowRight, Briefcase } from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await getServerSession(nextAuthConfig);
  const userId = session!.user.id;

  // 1. Fetch student's profile, applications, and latest gap report
  const [profile, applicationCount, latestGapReport, userApplications] =
    await Promise.all([
      prisma.skillProfile.findUnique({
        where: { userId },
        select: { domainScores: true, badges: true },
      }),
      prisma.application.count({
        where: { userId },
      }),
      prisma.gapReport.findFirst({
        where: { userId },
        orderBy: { generatedAt: "desc" },
      }),
      prisma.application.findMany({
        where: { userId },
        select: { opportunityId: true },
      }),
    ]);

  const domainScores = (profile?.domainScores ?? {}) as unknown as Record<
    string,
    DomainScore
  >;
  const badges = (profile?.badges ?? {}) as unknown as Record<
    string,
    { earned: boolean; earnedAt: string | null }
  >;

  const assessedDomainsCount = Object.keys(domainScores).length;
  const earnedBadgesCount = Object.values(badges).filter(
    (b) => b.earned,
  ).length;

  const scoreValues = Object.values(domainScores).map((d) => d.score);
  const avgSkillScore =
    scoreValues.length > 0
      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
      : 0;

  // 2. Fetch active opportunities and rank by match score
  const activeOpportunities = await prisma.opportunity.findMany({
    where: { isActive: true },
    take: 8,
    select: {
      id: true,
      title: true,
      type: true,
      location: true,
      duration: true,
      stipendRange: true,
      deadline: true,
      requiredSkills: true,
      postedBy: { select: { name: true, institution: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const appliedIds = new Set(userApplications.map((a) => a.opportunityId));

  const rankedOpportunities: OpportunityWithMatch[] = activeOpportunities
    .map((opp) => {
      const reqSkills = opp.requiredSkills as unknown as RequiredSkill[];
      const match = computeMatchScore(domainScores, reqSkills, opp.id);
      return {
        id: opp.id,
        title: opp.title,
        companyName: opp.postedBy.institution ?? opp.postedBy.name,
        type: opp.type,
        location: opp.location,
        duration: opp.duration,
        stipendRange: opp.stipendRange,
        deadline: opp.deadline.toISOString(),
        requiredSkills: reqSkills,
        matchScore: match.matchScore,
        metSkills: match.metSkills,
        gapSkills: match.gapSkills,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4);

  // 3. Career guidance role matches
  const roleMatches = computeRoleCompatibility(domainScores).slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Student Skill Console
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Track verified assessment scores, role compatibility, and matching
            industry opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/assess">
            <Button className="h-9 gap-1.5 bg-primary px-4 text-sm text-white hover:bg-primary-hover">
              <BrainCircuit className="h-4 w-4" />
              Start Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* METRIC ROW: 4 cards (UI_UX_SPEC §13 & §5.1) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Average Skill Score
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-foreground">
            {avgSkillScore > 0 ? avgSkillScore : "—"}
          </p>
          <p className="mt-1 text-xs text-foreground-subtle">
            {assessedDomainsCount > 0
              ? "Across assessed domains"
              : "No assessments completed"}
          </p>
        </div>

        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Domains Assessed
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-foreground">
            {assessedDomainsCount}
          </p>
          <p className="mt-1 text-xs text-foreground-subtle">
            6 pre-built domains available
          </p>
        </div>

        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Verified Badges
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-foreground">
            {earnedBadgesCount}
          </p>
          <p className="mt-1 text-xs text-foreground-subtle">
            Score ≥ 75 benchmark
          </p>
        </div>

        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Active Applications
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-foreground">
            {applicationCount}
          </p>
          <p className="mt-1 text-xs text-foreground-subtle">
            Submitted via live portfolio
          </p>
        </div>
      </div>

      {/* MAIN SPLIT: 2/3 opportunity feed | 1/3 portfolio snapshot + recent gap report */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2/3: Top Matched Opportunities */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Top Matched Opportunities
                </h3>
                <p className="text-xs text-foreground-muted">
                  Ranked by live compatibility between your verified profile and
                  required skills
                </p>
              </div>
              <Link
                href="/opportunities"
                className="text-xs font-medium text-primary hover:underline"
              >
                View All
              </Link>
            </div>

            {rankedOpportunities.length > 0 ? (
              <div className="divide-y divide-border">
                {rankedOpportunities.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    hasAppliedInitial={appliedIds.has(opp.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-foreground-muted">
                <Briefcase className="mx-auto h-8 w-8 text-foreground-subtle mb-2" />
                No active opportunities found. Check back soon.
              </div>
            )}
          </div>

          {/* Career Guidance Compatibility */}
          {roleMatches.length > 0 && (
            <div className="rounded-md border border-border bg-card p-4">
              <div className="mb-3">
                <h3 className="text-base font-semibold text-foreground">
                  Career Guidance Alignment
                </h3>
                <p className="text-xs text-foreground-muted">
                  Compatibility with standard industry role requirement profiles
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {roleMatches.map((role) => (
                  <div
                    key={role.roleId}
                    className="rounded-sm border border-border bg-background-subtle p-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">
                        {role.displayName}
                      </h4>
                      <span
                        className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold tabular-nums border ${
                          role.compatibilityPercent >= 70
                            ? "bg-success-bg text-success border-success-border"
                            : "bg-warning-bg text-warning border-warning-border"
                        }`}
                      >
                        {role.compatibilityPercent}%
                      </span>
                    </div>

                    <div className="mt-2 text-2xs text-foreground-subtle">
                      Met:{" "}
                      {role.metSkills.length > 0
                        ? role.metSkills.join(", ")
                        : "None yet"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1/3: Portfolio snapshot + recent gap report */}
        <div className="space-y-4">
          {/* Verified Badges Snapshot */}
          <div className="rounded-md border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Verified Badges
              </h3>
              <Link
                href="/portfolio"
                className="text-xs text-primary hover:underline"
              >
                Portfolio
              </Link>
            </div>

            <div className="space-y-2">
              {Object.entries(badges).length > 0 ? (
                Object.entries(badges).map(([domain, data]) => (
                  <SkillBadge
                    key={domain}
                    domain={domain}
                    earned={data.earned}
                  />
                ))
              ) : (
                <p className="text-xs text-foreground-subtle">
                  Complete an assessment scoring ≥ 75 to unlock a verified
                  SkillLedger badge.
                </p>
              )}
            </div>
          </div>

          {/* Recent Gap Report summary */}
          <div className="rounded-md border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Latest Assessment
              </h3>
              {latestGapReport && (
                <span className="text-2xs text-foreground-subtle">
                  {new Date(latestGapReport.generatedAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </span>
              )}
            </div>

            {latestGapReport ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground uppercase">
                    {latestGapReport.domain}
                  </span>
                  <span className="text-base font-bold tabular-nums text-foreground">
                    {Math.round(latestGapReport.overallScore)}/100
                  </span>
                </div>

                <div className="text-xs text-foreground-muted">
                  <span className="text-success font-medium">
                    {(latestGapReport.strongNodes as string[]).length} strong
                  </span>
                  {" · "}
                  <span className="text-warning font-medium">
                    {(latestGapReport.partialNodes as string[]).length} partial
                  </span>
                  {" · "}
                  <span className="text-destructive font-medium">
                    {(latestGapReport.weakNodes as string[]).length} gap
                  </span>
                </div>

                <Link href={`/assess?viewReport=${latestGapReport.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-7 mt-1"
                  >
                    Review Gap Analysis
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-foreground-subtle mb-3">
                  No assessments completed yet.
                </p>
                <Link href="/assess">
                  <Button
                    size="sm"
                    className="w-full text-xs h-7 bg-primary text-white hover:bg-primary-hover"
                  >
                    Take Assessment
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
