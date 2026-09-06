// app/api/profile/[userId]/route.ts
// GET — Return student profile: domain scores, badges, score history.
// Used by portfolio page and opportunity matching context.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { prisma } from "@/lib/db";
import type { StudentProfile, DomainScore, ScoreHistoryPoint } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    // 1. Auth
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    // Students can only view their own profile; industry/admin can view any student profile
    const targetUserId = params.userId;
    if (session.user.role === "STUDENT" && targetUserId !== session.user.id) {
      return NextResponse.json(apiError("FORBIDDEN", "Access denied"), {
        status: 403,
      });
    }

    // 2. Load user + skillProfile
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        institution: true,
        department: true,
        role: true,
        skillProfile: {
          select: {
            domainScores: true,
            badges: true,
            scoreHistory: {
              select: {
                domain: true,
                score: true,
                recordedAt: true,
                sessionId: true,
              },
              orderBy: { recordedAt: "asc" },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(apiError("NOT_FOUND", "User not found"), {
        status: 404,
      });
    }

    const profile = user.skillProfile;

    const result: StudentProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      institution: user.institution,
      department: user.department,
      domainScores: (profile?.domainScores ?? {}) as unknown as Record<
        string,
        DomainScore
      >,
      badges: (profile?.badges ?? {}) as unknown as Record<
        string,
        { earned: boolean; earnedAt: string | null }
      >,
      scoreHistory: (profile?.scoreHistory ?? []).map((h) => ({
        domain: h.domain,
        score: h.score,
        recordedAt: h.recordedAt.toISOString(),
        sessionId: h.sessionId,
      })) as ScoreHistoryPoint[],
    };

    return NextResponse.json(apiSuccess(result), { status: 200 });
  } catch (err) {
    console.error("[GET /api/profile/[userId]]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong loading the profile"),
      { status: 500 },
    );
  }
}
