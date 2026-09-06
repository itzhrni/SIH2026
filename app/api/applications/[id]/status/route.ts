// app/api/applications/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { z } from "zod";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { prisma } from "@/lib/db";

const UpdateStatusSchema = z.object({
  status: z
    .enum([
      "APPLIED",
      "UNDER_REVIEW",
      "SHORTLISTED",
      "INTERVIEW_SCHEDULED",
      "SELECTED",
      "NOT_SELECTED",
    ])
    .optional(),
  placementStatus: z
    .enum([
      "APPLIED",
      "REVIEWED",
      "SHORTLISTED",
      "INTERVIEW_SCHEDULED",
      "OFFER_EXTENDED",
      "JOINED",
      "REJECTED",
    ])
    .optional(),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    if (session.user.role !== "INDUSTRY") {
      return NextResponse.json(
        apiError(
          "FORBIDDEN",
          "Only industry partners can update application status",
        ),
        { status: 403 },
      );
    }

    const body = await req.json();
    const parsed = UpdateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError(
          "VALIDATION_ERROR",
          parsed.error.issues[0]?.message ?? "Invalid input",
        ),
        { status: 400 },
      );
    }

    if (
      !parsed.data.status &&
      !parsed.data.placementStatus &&
      parsed.data.notes === undefined
    ) {
      return NextResponse.json(
        apiError(
          "VALIDATION_ERROR",
          "At least one of status, placementStatus, or notes is required",
        ),
        { status: 400 },
      );
    }

    const applicationId = params.id;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        opportunity: {
          select: { postedById: true },
        },
      },
    });

    if (!application) {
      return NextResponse.json(apiError("NOT_FOUND", "Application not found"), {
        status: 404,
      });
    }

    if (application.opportunity.postedById !== session.user.id) {
      return NextResponse.json(
        apiError(
          "FORBIDDEN",
          "You do not own the posting for this application",
        ),
        { status: 403 },
      );
    }

    const { status, placementStatus, notes } = parsed.data;

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        ...(status ? { status } : {}),
        ...(placementStatus ? { placementStatus } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      select: {
        id: true,
        status: true,
        placementStatus: true,
        notes: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (err) {
    console.error("[PATCH /api/applications/[id]/status]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong"),
      { status: 500 },
    );
  }
}
