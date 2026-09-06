import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import type { CohortSkillDataPoint } from "@/types";

// GET /api/analytics/cohort
// Computes average skill score per domain grouped by student department.
// Restricted to INSTITUTIONAL_ADMIN.
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    if (session.user.role !== "INSTITUTIONAL_ADMIN") {
      return NextResponse.json(
        apiError(
          "FORBIDDEN",
          "Only institutional admins can view cohort analytics",
        ),
        { status: 403 },
      );
    }

    // Fetch all students with their skill profiles
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        skillProfile: { isNot: null },
      },
      select: {
        department: true,
        skillProfile: {
          select: {
            domainScores: true,
          },
        },
      },
    });

    // Aggregate by department and domain
    // Structure: { [department]: { [domain]: { totalScore: number, count: number } } }
    const agg: Record<
      string,
      Record<string, { totalScore: number; count: number }>
    > = {};

    for (const student of students) {
      const dept = student.department || "General";
      if (!agg[dept]) {
        agg[dept] = {};
      }

      const domainScores = (student.skillProfile?.domainScores || {}) as Record<
        string,
        { score: number; lastUpdated: string }
      >;

      for (const [domain, data] of Object.entries(domainScores)) {
        if (typeof data?.score === "number") {
          if (!agg[dept][domain]) {
            agg[dept][domain] = { totalScore: 0, count: 0 };
          }
          agg[dept][domain].totalScore += data.score;
          agg[dept][domain].count += 1;
        }
      }
    }

    const result: CohortSkillDataPoint[] = [];

    for (const [department, domains] of Object.entries(agg)) {
      for (const [domain, stats] of Object.entries(domains)) {
        result.push({
          department,
          domain,
          averageScore: Math.round(stats.totalScore / stats.count),
          studentCount: stats.count,
        });
      }
    }

    return NextResponse.json(apiSuccess(result), { status: 200 });
  } catch (err) {
    console.error("[GET /api/analytics/cohort]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong"),
      { status: 500 },
    );
  }
}
