import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import type { PlacementProgressStats } from "@/types";

// GET /api/analytics/placement
// Returns aggregated placement and application pipeline statistics.
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
          "Only institutional admins can view placement analytics",
        ),
        { status: 403 },
      );
    }

    const [
      totalApplications,
      underReview,
      shortlisted,
      interviewScheduled,
      selected,
      notSelected,
      activePostings,
      totalStudents,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: "UNDER_REVIEW" } }),
      prisma.application.count({ where: { status: "SHORTLISTED" } }),
      prisma.application.count({ where: { status: "INTERVIEW_SCHEDULED" } }),
      prisma.application.count({ where: { status: "SELECTED" } }),
      prisma.application.count({ where: { status: "NOT_SELECTED" } }),
      prisma.opportunity.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
    ]);

    const stats: PlacementProgressStats = {
      totalApplications,
      underReview,
      shortlisted,
      interviewScheduled,
      selected,
      notSelected,
      activePostings,
      totalStudents,
    };

    return NextResponse.json(apiSuccess(stats), { status: 200 });
  } catch (err) {
    console.error("[GET /api/analytics/placement]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong"),
      { status: 500 },
    );
  }
}
