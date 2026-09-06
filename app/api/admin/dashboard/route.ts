// app/api/admin/dashboard/route.ts
// RULE API-01: Orchestration only — auth, role, call lib, respond
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

// GET /api/admin/dashboard
// Returns SWAN admin dashboard summary metrics
export async function GET(req: NextRequest) {
  try {
    // 1. Auth
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    // 2. Role check — only INSTITUTIONAL_ADMIN
    if (session.user.role !== "INSTITUTIONAL_ADMIN") {
      return NextResponse.json(apiError("FORBIDDEN", "Insufficient role"), {
        status: 403,
      });
    }

    // 3. Aggregate metrics in parallel
    const [totalUsers, totalStudents, totalOpportunities, totalApplications] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.opportunity.count(),
        prisma.application.count(),
      ]);

    // Count distinct institutions via groupBy
    const institutionGroups = await prisma.user.groupBy({
      by: ["institution"],
      where: { institution: { not: null } },
    });

    const dashboardData = {
      totalUsers,
      totalStudents,
      totalOpportunities,
      totalApplications,
      totalInstitutions: institutionGroups.length,
    };

    return NextResponse.json(apiSuccess(dashboardData), { status: 200 });
  } catch (err) {
    console.error("[GET /api/admin/dashboard]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to load dashboard"),
      { status: 500 },
    );
  }
}
