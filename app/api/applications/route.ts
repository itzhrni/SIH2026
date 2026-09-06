import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

// GET /api/applications
// Returns applications submitted by the currently logged in user (Student or Academician).
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    if (
      session.user.role !== "STUDENT" &&
      session.user.role !== "ACADEMICIAN"
    ) {
      return NextResponse.json(apiError("FORBIDDEN", "Insufficient role"), {
        status: 403,
      });
    }

    const applications = await prisma.application.findMany({
      where: { userId: session.user.id },
      orderBy: { appliedAt: "desc" },
      select: {
        id: true,
        status: true,
        placementStatus: true,
        matchScoreAtApply: true,
        appliedAt: true,
        opportunity: {
          select: {
            id: true,
            title: true,
            type: true,
            location: true,
            duration: true,
            stipendRange: true,
            deadline: true,
            postedBy: {
              select: {
                id: true,
                name: true,
                institution: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(apiSuccess(applications), { status: 200 });
  } catch (err) {
    console.error("[GET /api/applications]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong"),
      { status: 500 },
    );
  }
}
