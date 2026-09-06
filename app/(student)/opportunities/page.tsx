// app/(student)/opportunities/page.tsx
// Personalized Opportunities Feed for students.
// RULE FE-01: Server Component.
// RULE FE-03: Direct async/await data fetching with Prisma.
// MVP Feature 4.2: Ranked opportunity feed with match scores, met skills, gap skills, and apply action.

import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { prisma } from "@/lib/db";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { computeMatchScore } from "@/lib/matching/opportunity-match";
import type { RequiredSkill, DomainScore, OpportunityWithMatch } from "@/types";
import type { Prisma, OpportunityType } from "@prisma/client";
import { Briefcase, Filter } from "lucide-react";
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
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Industry Opportunities Feed
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Positions algorithmically matched and ranked against your verified
          SkillLedger domain proficiency scores.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-foreground-subtle mr-1" />
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
                className={`rounded-sm px-3 py-1 text-xs font-medium transition-colors duration-150 ${
                  isSelected
                    ? "bg-primary text-white font-semibold"
                    : "bg-background-subtle text-foreground-muted hover:bg-background-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <span className="text-xs text-foreground-subtle">
          Showing {rankedOpportunities.length} opportunities
        </span>
      </div>

      {/* Opportunity list (UI_UX_SPEC §5.8: list style, NOT card grid) */}
      <div className="rounded-md border border-border bg-card divide-y divide-border">
        {rankedOpportunities.length > 0 ? (
          rankedOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              hasAppliedInitial={appliedIds.has(opp.id)}
            />
          ))
        ) : (
          <div className="py-16 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-foreground-subtle mb-3" />
            <h3 className="text-base font-semibold text-foreground">
              No opportunities found
            </h3>
            <p className="mt-1 text-xs text-foreground-muted">
              Try changing your filter or check back as industry partners
              publish new postings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
