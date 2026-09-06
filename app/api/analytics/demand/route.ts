import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import type { SkillGapDataPoint } from "@/types";

// GET /api/analytics/demand
// Returns SkillGapDataPoint[] computed from active opportunities and student skill profiles.
// Restricted to INSTITUTIONAL_ADMIN.
export async function GET(_req: NextRequest) {
  try {
    // 1. Auth
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    // 2. Role — admin only
    if (session.user.role !== "INSTITUTIONAL_ADMIN") {
      return NextResponse.json(
        apiError(
          "FORBIDDEN",
          "Only institutional admins can view demand analytics",
        ),
        { status: 403 },
      );
    }

    // 3. Compute demand from active postings
    const postings = await prisma.opportunity.findMany({
      where: { isActive: true },
      select: { requiredSkills: true },
    });

    const totalPostings = postings.length;
    if (totalPostings === 0) {
      return NextResponse.json(apiSuccess([]), { status: 200 });
    }

    // Count how many postings require each skill
    const demandCounts: Record<string, number> = {};
    for (const posting of postings) {
      const skills = posting.requiredSkills as Array<{
        skill: string;
        minThreshold: number;
      }>;
      for (const { skill } of skills) {
        demandCounts[skill] = (demandCounts[skill] ?? 0) + 1;
      }
    }

    // 4. Compute supply from student skill profiles
    const profiles = await prisma.skillProfile.findMany({
      select: { domainScores: true },
    });

    const totalStudents = profiles.length;

    // Count how many students have score >= threshold (60 default) per skill
    const supplyCounts: Record<string, number> = {};
    const SUPPLY_THRESHOLD = 60;
    for (const profile of profiles) {
      const scores = profile.domainScores as Record<
        string,
        { score: number; lastUpdated: string }
      >;
      for (const [domain, data] of Object.entries(scores)) {
        if (data.score >= SUPPLY_THRESHOLD) {
          supplyCounts[domain] = (supplyCounts[domain] ?? 0) + 1;
        }
      }
    }

    // 5. Build SkillGapDataPoint[] for all demanded skills
    const result: SkillGapDataPoint[] = Object.entries(demandCounts).map(
      ([skill, count]) => {
        const demandPercent = Math.round((count / totalPostings) * 100);
        const supplyCount = supplyCounts[skill] ?? 0;
        const supplyPercent =
          totalStudents > 0
            ? Math.round((supplyCount / totalStudents) * 100)
            : 0;
        const gap = demandPercent - supplyPercent;

        let severity: SkillGapDataPoint["severity"];
        if (gap > 50) {
          severity = "HIGH";
        } else if (gap >= 20) {
          severity = "MEDIUM";
        } else {
          severity = "LOW";
        }

        return { skill, demandPercent, supplyPercent, gap, severity };
      },
    );

    // Sort by gap descending (highest gap first)
    result.sort((a, b) => b.gap - a.gap);

    return NextResponse.json(apiSuccess(result), { status: 200 });
  } catch (err) {
    console.error("[GET /api/analytics/demand]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong"),
      { status: 500 },
    );
  }
}
