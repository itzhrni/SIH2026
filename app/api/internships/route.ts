// app/api/internships/route.ts
// RULE API-01: Orchestration only — auth, role, validate, call lib, respond
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

// GET /api/internships
// Returns internship records for the authenticated user (STUDENT or ACADEMICIAN)
export async function GET(req: NextRequest) {
  try {
    // 1. Auth
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    // 2. Role check — students and academicians can view their own internships
    if (
      session.user.role !== "STUDENT" &&
      session.user.role !== "ACADEMICIAN"
    ) {
      return NextResponse.json(apiError("FORBIDDEN", "Insufficient role"), {
        status: 403,
      });
    }

    // 3. Load internships — field is `studentId` per prisma/schema.prisma
    const internships = await prisma.internshipRecord.findMany({
      where: {
        studentId: session.user.id,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        companyName: true,
        role: true,
        startDate: true,
        endDate: true,
        isComplete: true,
        progressLogs: true,
        mentorFeedback: true,
        createdAt: true,
        mentor: {
          select: { name: true, institution: true },
        },
      },
    });

    return NextResponse.json(apiSuccess(internships), { status: 200 });
  } catch (err) {
    console.error("[GET /api/internships]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to load internships"),
      { status: 500 },
    );
  }
}
