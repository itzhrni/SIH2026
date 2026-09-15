// app/(student)/dashboard/page.tsx
// Student dashboard home: verified skill profile, next best actions, matched opportunities, and 4D evaluation snapshots.
// RULE FE-01: Server Component.
// RULE FE-03: Direct async/await data fetching with Prisma.

import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { SkillBadge } from "@/components/portfolio/SkillBadge";
import { computeMatchScore } from "@/lib/matching/opportunity-match";
import { computeRoleCompatibility } from "@/lib/matching/career-guidance";
import type { RequiredSkill, DomainScore, OpportunityWithMatch } from "@/types";
import {
  BrainCircuit,
  Award,
  ArrowRight,
  Briefcase,
  BookOpen,
  GraduationCap,
  Sparkles,
  Zap,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  const userName = session.user.name || "Student";
  const firstName = userName.split(" ")[0] || "Student";

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
    take: 6,
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
    .slice(0, 3);

  // 3. Career guidance role matches
  const roleMatches = computeRoleCompatibility(domainScores).slice(0, 2);

  // Dynamic Next Best Action calculation
  const topRole = roleMatches[0];
  const hasGaps = latestGapReport && (latestGapReport.weakNodes as string[]).length > 0;
  const nextDomainToAssess =
    assessedDomainsCount === 0
      ? "dsa"
      : !domainScores["system-design"]
      ? "system-design"
      : !domainScores["machine-learning"]
      ? "machine-learning"
      : "core-cs";

  return (
    <div className="space-y-6">
      {/* 1. GREETING & READINESS SUMMARY */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>National Skill Ledger</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
            Good morning, {firstName}
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Your verified skill profile is evolving. {assessedDomainsCount} evaluated knowledge domains recorded.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/courses">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-border bg-[#0E131F] text-xs font-medium hover:bg-white/5"
            >
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>In-Portal Courses</span>
            </Button>
          </Link>
          <Link href="/assess">
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs"
            >
              <BrainCircuit className="h-3.5 w-3.5" />
              <span>Launch 4D Assessment</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. NEXT BEST ACTION (Prominent, purposeful guidance card) */}
      <div className="relative overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-r from-blue-950/40 via-[#0E131F] to-[#0E131F] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30">
              <Zap className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider">
                  Next Best Action
                </span>
                {topRole && (
                  <span className="text-[11px] text-foreground-muted truncate">
                    Target Role: <strong className="text-white font-medium">{topRole.displayName}</strong> ({topRole.compatibilityPercent}% match)
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-foreground-muted">
                {hasGaps
                  ? `Close verified gaps in ${latestGapReport?.domain.toUpperCase()} to unlock higher compatibility and industry recruiter discovery.`
                  : assessedDomainsCount === 0
                  ? "Start your foundational assessment to generate cryptographic skill ledger credentials."
                  : `Complete the ${nextDomainToAssess.toUpperCase()} assessment module to benchmark technical trade-off awareness.`}
              </p>
            </div>
          </div>

          <Link href={hasGaps ? `/assess?domain=${latestGapReport?.domain}` : `/assess?domain=${nextDomainToAssess}`} className="shrink-0">
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-primary px-3.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs"
            >
              <span>{hasGaps ? "Remediate Gaps" : "Start Evaluation"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. YOUR SKILL SNAPSHOT: 4 Purposeful Metric Blocks */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-lg border border-border bg-[#0E131F] p-3.5 transition-colors hover:border-primary/30">
          <div className="flex items-center justify-between text-foreground-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
              Avg Verified Score
            </span>
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tabular-nums text-white">
              {avgSkillScore > 0 ? `${avgSkillScore}%` : "—"}
            </span>
            <span className="text-[11px] text-foreground-subtle">
              {avgSkillScore >= 75 ? "Proficient" : avgSkillScore > 0 ? "Developing" : "Unassessed"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-foreground-muted">
            {assessedDomainsCount > 0 ? `Across ${assessedDomainsCount} domains` : "No assessments yet"}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-lg border border-border bg-[#0E131F] p-3.5 transition-colors hover:border-primary/30">
          <div className="flex items-center justify-between text-foreground-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
              Domains Evaluated
            </span>
            <div className="h-2 w-2 rounded-full bg-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tabular-nums text-white">
              {assessedDomainsCount}
            </span>
            <span className="text-[11px] text-foreground-subtle">of 6 domains</span>
          </div>
          <p className="mt-1 text-[11px] text-foreground-muted">
            Pre-built knowledge graphs
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-lg border border-border bg-[#0E131F] p-3.5 transition-colors hover:border-primary/30">
          <div className="flex items-center justify-between text-foreground-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
              Verified Badges
            </span>
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tabular-nums text-white">
              {earnedBadgesCount}
            </span>
            <span className="text-[11px] text-foreground-subtle">earned</span>
          </div>
          <p className="mt-1 text-[11px] text-foreground-muted">
            Score ≥ 75 benchmark
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-lg border border-border bg-[#0E131F] p-3.5 transition-colors hover:border-primary/30">
          <div className="flex items-center justify-between text-foreground-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
              Applications
            </span>
            <div className="h-2 w-2 rounded-full bg-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tabular-nums text-white">
              {applicationCount}
            </span>
            <span className="text-[11px] text-foreground-subtle">submitted</span>
          </div>
          <p className="mt-1 text-[11px] text-foreground-muted">
            Live hiring pipeline
          </p>
        </div>
      </div>

      {/* 4. MAIN SPLIT: 2/3 Opportunity Feed | 1/3 Skills & Learning Snapshot */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2/3: Opportunities & Role Matching */}
        <div className="space-y-4 lg:col-span-2">
          {/* Top Matched Opportunities */}
          <div className="rounded-lg border border-border bg-[#0B0F17] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Top Matched Opportunities
                </h2>
                <p className="text-[11px] text-foreground-muted">
                  Ranked by real-time compatibility between your verified profile and recruiter criteria
                </p>
              </div>
              <Link
                href="/opportunities"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {rankedOpportunities.length > 0 ? (
              <div className="space-y-3">
                {rankedOpportunities.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    hasAppliedInitial={appliedIds.has(opp.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-foreground-muted">
                <Briefcase className="mx-auto h-6 w-6 text-foreground-subtle mb-1.5" />
                No opportunities posted yet. Check back soon.
              </div>
            )}
          </div>

          {/* Career Guidance Compatibility */}
          {roleMatches.length > 0 && (
            <div className="rounded-lg border border-border bg-[#0B0F17] p-4 space-y-3">
              <div className="border-b border-border/80 pb-2">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Target Role Alignment
                </h2>
                <p className="text-[11px] text-foreground-muted">
                  Live compatibility against standard industry competency models
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {roleMatches.map((role) => (
                  <div
                    key={role.roleId}
                    className="rounded-lg border border-border bg-[#0E131F] p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-white">
                        {role.displayName}
                      </h3>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[10px] font-bold tabular-nums border ${
                          role.compatibilityPercent >= 70
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {role.compatibilityPercent}% Match
                      </span>
                    </div>

                    <div className="text-[11px] text-foreground-muted">
                      <span className="text-foreground-subtle">Met: </span>
                      {role.metSkills.length > 0 ? role.metSkills.join(", ") : "None yet"}
                    </div>

                    {role.gapSkills.length > 0 && (
                      <div className="text-[11px] text-amber-400/90">
                        <span className="text-foreground-subtle">Missing: </span>
                        {role.gapSkills.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1/3: Badges, Latest Assessment & In-Portal Courses */}
        <div className="space-y-4">
          {/* Verified Badges Snapshot */}
          <div className="rounded-lg border border-border bg-[#0B0F17] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
                Verified Badges
              </h2>
              <Link href="/portfolio" className="text-[11px] text-primary hover:underline">
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
                <p className="text-xs text-foreground-muted py-2">
                  Complete an assessment scoring ≥ 75 to unlock a cryptographic SkillLedger badge.
                </p>
              )}
            </div>
          </div>

          {/* Recent Gap Report Summary */}
          <div className="rounded-lg border border-border bg-[#0B0F17] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
                Latest 4D Evaluation
              </h2>
              {latestGapReport && (
                <span className="text-[10px] text-foreground-subtle">
                  {new Date(latestGapReport.generatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            {latestGapReport ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white uppercase">
                    {latestGapReport.domain}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-primary">
                    {Math.round(latestGapReport.overallScore)}/100
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-emerald-400 font-medium">
                    {(latestGapReport.strongNodes as string[]).length} strong
                  </span>
                  <span className="text-foreground-subtle">·</span>
                  <span className="text-amber-400 font-medium">
                    {(latestGapReport.partialNodes as string[]).length} partial
                  </span>
                  <span className="text-foreground-subtle">·</span>
                  <span className="text-rose-400 font-medium">
                    {(latestGapReport.weakNodes as string[]).length} gap
                  </span>
                </div>

                <Link href={`/assess?viewReport=${latestGapReport.id}`} className="block pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-7 border-border bg-[#0E131F] hover:bg-white/5"
                  >
                    Review 4D Gap Report
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="py-3 text-center space-y-2">
                <p className="text-xs text-foreground-muted">
                  No 4D evaluations recorded yet.
                </p>
                <Link href="/assess">
                  <Button
                    size="sm"
                    className="w-full text-xs h-7 bg-primary text-white hover:bg-primary-hover shadow-xs"
                  >
                    Take Assessment
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* In-Portal Courses Spotlight */}
          <div className="rounded-lg border border-border bg-[#0E131F] p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
                In-Portal Learning
              </h2>
            </div>
            <p className="text-xs text-foreground-muted">
              Interactive coursework in Distributed Systems, Advanced DSA, and AYUSH Clinical Pharmacology.
            </p>
            <Link href="/courses" className="block pt-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-7 border-primary/30 text-primary hover:bg-primary/10"
              >
                Browse Curriculum →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
