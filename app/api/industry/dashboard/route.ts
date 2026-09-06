// app/api/industry/dashboard/route.ts
// RULE API-01: Orchestration only — auth, role, call lib, respond
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

// GET /api/industry/dashboard
// Returns industry recruiter dashboard metrics
export async function GET(req: NextRequest) {
  try {
    // 1. Auth
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    // 2. Role check — only INDUSTRY
    if (session.user.role !== "INDUSTRY") {
      return NextResponse.json(apiError("FORBIDDEN", "Insufficient role"), {
        status: 403,
      });
    }

    // 3. Aggregate metrics in parallel
    const [
      activePostings,
      totalApplications,
      shortlistedCandidates,
      offersExtended,
    ] = await Promise.all([
      prisma.opportunity.count({
        where: { postedById: session.user.id, isActive: true },
      }),
      prisma.application.count({
        where: {
          opportunity: { postedById: session.user.id },
        },
      }),
      prisma.application.count({
        where: {
          opportunity: { postedById: session.user.id },
          status: "SHORTLISTED",
        },
      }),
      prisma.application.count({
        where: {
          opportunity: { postedById: session.user.id },
          status: "SELECTED",
        },
      }),
    ]);

    // Get recent postings
    const recentPostings = await prisma.opportunity.findMany({
      where: { postedById: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        type: true,
        deadline: true,
        isActive: true,
        _count: { select: { applications: true } },
      },
    });

    // Get recent applicants
    const recentApplicants = await prisma.application.findMany({
      where: {
        opportunity: { postedById: session.user.id },
      },
      orderBy: { appliedAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        matchScoreAtApply: true,
        appliedAt: true,
        user: {
          select: {
            name: true,
            email: true,
            institution: true,
            department: true,
          },
        },
        opportunity: { select: { title: true, type: true } },
      },
    });

    const dashboardData = {
      activePostingsCount: activePostings,
      totalApplicationsCount: totalApplications,
      shortlistedCandidatesCount: shortlistedCandidates,
      offersExtendedCount: offersExtended,
      recentPostings,
      recentApplicants,
    };

    return NextResponse.json(apiSuccess(dashboardData), { status: 200 });
  } catch (err) {
    console.error("[GET /api/industry/dashboard]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to load dashboard"),
      { status: 500 },
    );
  }
}
