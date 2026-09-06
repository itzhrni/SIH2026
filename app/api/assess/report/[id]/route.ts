// app/api/assess/report/[id]/route.ts
// GET — Retrieve a completed gap report by report ID.
// Returns GapReportData including learning resources per gap node.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { prisma } from "@/lib/db";
import type { GapReportData } from "@/types";
import { getResourcesForNodes } from "@/lib/learning/resources";

export async function GET(
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

    // 2. Load report — students can only see their own
    const report = await prisma.gapReport.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        userId: true,
        domain: true,
        overallScore: true,
        strongNodes: true,
        partialNodes: true,
        weakNodes: true,
      },
    });

    if (!report) {
      return NextResponse.json(apiError("NOT_FOUND", "Report not found"), {
        status: 404,
      });
    }

    // Students can only access their own reports; admins can access any
    if (session.user.role === "STUDENT" && report.userId !== session.user.id) {
      return NextResponse.json(apiError("FORBIDDEN", "Access denied"), {
        status: 403,
      });
    }

    const weakNodes = report.weakNodes as string[];
    const partialNodes = report.partialNodes as string[];
    const gapNodes = [...weakNodes, ...partialNodes];

    const learningResources = getResourcesForNodes(gapNodes);

    const result: GapReportData = {
      id: report.id,
      domain: report.domain,
      overallScore: report.overallScore,
      strongNodes: report.strongNodes as string[],
      partialNodes,
      weakNodes,
      learningResources,
    };

    return NextResponse.json(apiSuccess(result), { status: 200 });
  } catch (err) {
    console.error("[GET /api/assess/report/[id]]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong loading the report"),
      { status: 500 },
    );
  }
}
