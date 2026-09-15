// app/(student)/opportunities/page.tsx
// Personalized Opportunities Feed for students.
// RULE FE-01: Server Component.
// RULE FE-03: Direct async/await data fetching with Prisma.

import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { prisma } from "@/lib/db";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { computeMatchScore } from "@/lib/matching/opportunity-match";
import type { RequiredSkill, DomainScore, OpportunityWithMatch } from "@/types";
import type { Prisma, OpportunityType } from "@prisma/client";
import { Briefcase, Filter, Sparkles, Building2 } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams?: {
    type?: string;
  };
}

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  const currentTypeFilter = searchParams?.type;

  // 1. Fetch student's domain scores and existing applications
  const [profile, applications] = await Promise.all([
    prisma.skillProfile.findUnique({
      where: { userId },
      select: { domainScores: true },
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
  const appliedIds = new Set(applications.map((a) => a.opportunityId));

  // 2. Fetch active opportunities matching filter
  const whereClause: Prisma.OpportunityWhereInput = { isActive: true };
  if (currentTypeFilter && currentTypeFilter !== "ALL") {
    whereClause.type = currentTypeFilter as OpportunityType;
  }

  const opportunities = await prisma.opportunity.findMany({
    where: whereClause,
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

  // 3. Compute match score for each opportunity and rank descending
  const rankedOpportunities: OpportunityWithMatch[] = opportunities
    .map((opp) => {
      const skills = opp.requiredSkills as unknown as RequiredSkill[];
      const match = computeMatchScore(domainScores, skills, opp.id);
      return {
        id: opp.id,
        title: opp.title,
        companyName: opp.postedBy.institution ?? opp.postedBy.name,
        type: opp.type,
        location: opp.location,
        duration: opp.duration,
        stipendRange: opp.stipendRange,
        deadline: opp.deadline.toISOString(),
        requiredSkills: skills,
        matchScore: match.matchScore,
        metSkills: match.metSkills,
        gapSkills: match.gapSkills,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  const filterTabs = [
    { label: "All Opportunities", value: "ALL" },
    { label: "Internships", value: "INTERNSHIP" },
    { label: "Full-time Jobs", value: "JOB" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Industry Opportunities
          </h1>
          <p className="mt-0.5 text-xs text-foreground-muted">
            Ranked by live compatibility between your verified SkillLedger domain proficiencies and recruiter requirements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/applications"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-[#0E131F] px-3 py-1.5 text-xs font-semibold text-foreground-muted hover:text-white transition-colors"
          >
            <span>My Applications ({appliedIds.size})</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs Toolbar */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="h-3.5 w-3.5 text-foreground-subtle mr-1 shrink-0" />
          {filterTabs.map((tab) => {
            const isSelected =
              (!currentTypeFilter && tab.value === "ALL") ||
              currentTypeFilter === tab.value;

            return (
              <Link
                key={tab.value}
                href={
                  tab.value === "ALL"
                    ? "/opportunities"
                    : `/opportunities?type=${tab.value}`
                }
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? "bg-primary text-white font-semibold shadow-xs"
                    : "text-foreground-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <span className="text-[11px] text-foreground-subtle shrink-0 hidden sm:inline">
          {rankedOpportunities.length} {rankedOpportunities.length === 1 ? "position" : "positions"}
        </span>
      </div>

      {/* Opportunity list */}
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
        <div className="rounded-lg border border-border bg-[#0E131F] py-12 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-foreground-subtle mb-2" />
          <p className="text-xs font-semibold text-white">No active opportunities found</p>
          <p className="mt-1 text-[11px] text-foreground-muted">
            Try switching filters or take 4D assessments to increase recruiter match eligibility.
          </p>
        </div>
      )}
    </div>
  );
}
