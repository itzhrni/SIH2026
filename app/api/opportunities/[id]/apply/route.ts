// app/api/opportunities/[id]/apply/route.ts
// POST — Student applies to an opportunity.
// Computes match score snapshot at time of application.
// Returns 409 if already applied (enforced by DB unique constraint).

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { prisma } from "@/lib/db";
import { computeMatchScore } from "@/lib/matching/opportunity-match";
import type { RequiredSkill, DomainScore } from "@/types";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // 1. Auth
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    // 2. Role check — students and academicians can apply
    if (
      session.user.role !== "STUDENT" &&
      session.user.role !== "ACADEMICIAN"
    ) {
      return NextResponse.json(
        apiError("FORBIDDEN", "Only students and academicians can apply"),
        { status: 403 },
      );
    }

    const opportunityId = params.id;
    const userId = session.user.id;

    // 3. Load opportunity
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId, isActive: true },
      select: { id: true, requiredSkills: true, deadline: true },
    });

    if (!opportunity) {
      return NextResponse.json(
        apiError("NOT_FOUND", "Opportunity not found or no longer active"),
        { status: 404 },
      );
    }

    if (new Date(opportunity.deadline) < new Date()) {
      return NextResponse.json(
        apiError(
          "VALIDATION_ERROR",
          "This opportunity has passed its application deadline",
        ),
        { status: 400 },
      );
    }

    // 4. Compute match score snapshot
    const profile = await prisma.skillProfile.findUnique({
      where: { userId },
      select: { domainScores: true },
    });
    const domainScores = (profile?.domainScores ?? {}) as unknown as Record<
      string,
      DomainScore
    >;
    const skills = opportunity.requiredSkills as unknown as RequiredSkill[];
    const { matchScore } = computeMatchScore(
      domainScores,
      skills,
      opportunityId,
    );

    // 5. Create application (DB unique constraint prevents duplicates)
    try {
      const application = await prisma.application.create({
        data: {
          userId,
          opportunityId,
          matchScoreAtApply: matchScore,
        },
        select: {
          id: true,
          status: true,
          matchScoreAtApply: true,
          appliedAt: true,
        },
      });

      return NextResponse.json(apiSuccess(application), { status: 201 });
    } catch {
      // Unique constraint violation — already applied
      return NextResponse.json(
        apiError("CONFLICT", "You have already applied to this opportunity"),
        { status: 409 },
      );
    }
  } catch (err) {
    console.error("[POST /api/opportunities/[id]/apply]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to submit application"),
      { status: 500 },
    );
  }
}
