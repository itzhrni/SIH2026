import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { searchCandidates } from "@/lib/matching/candidate-discovery";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session || !session.user) {
      return NextResponse.json(
        apiError("UNAUTHORIZED", "Authentication required"),
        { status: 401 },
      );
    }

    // Gated to Industry and Institutional Admin roles
    if (
      session.user.role !== "INDUSTRY" &&
      session.user.role !== "INSTITUTIONAL_ADMIN"
    ) {
      return NextResponse.json(
        apiError(
          "FORBIDDEN",
          "Access restricted to recruiters and administrators",
        ),
        { status: 403 },
      );
    }

    const { searchParams } = req.nextUrl;
    const skillsParam = searchParams.get("skills");
    const minScoreParam = searchParams.get("minScore");
    const domain = searchParams.get("domain") ?? undefined;
    const department = searchParams.get("department") ?? undefined;
    const institution = searchParams.get("institution") ?? undefined;

    const skills = skillsParam
      ? skillsParam
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];

    const minScore = minScoreParam ? parseInt(minScoreParam, 10) || 0 : 0;

    const candidates = await searchCandidates({
      skills,
      minScore,
      domain,
      department,
      institution,
    });

    return NextResponse.json(apiSuccess(candidates), { status: 200 });
  } catch (err) {
    console.error("[GET /api/candidates]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to search candidate talent pool"),
      { status: 500 },
    );
  }
}
