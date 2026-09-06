import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

const FeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  technicalScore: z.number().int().min(1).max(5),
  communicationScore: z.number().int().min(1).max(5),
  comments: z.string().min(10, "Comments must be at least 10 characters"),
});

export async function POST(
  req: NextRequest,
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

    // 2. Role — only INDUSTRY can submit mentor feedback
    if (session.user.role !== "INDUSTRY") {
      return NextResponse.json(
        apiError("FORBIDDEN", "Only industry mentors can submit feedback"),
        { status: 403 },
      );
    }

    // 3. Validate
    const body = await req.json();
    const parsed = FeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError(
          "VALIDATION_ERROR",
          parsed.error.issues[0]?.message ?? "Invalid input",
        ),
        { status: 400 },
      );
    }

    // 4. Verify record exists and mentor owns this internship
    const record = await prisma.internshipRecord.findUnique({
      where: { id: params.id },
      select: { id: true, mentorId: true, isComplete: true },
    });

    if (!record) {
      return NextResponse.json(
        apiError("NOT_FOUND", "Internship record not found"),
        { status: 404 },
      );
    }

    if (record.mentorId !== session.user.id) {
      return NextResponse.json(
        apiError("FORBIDDEN", "You are not the mentor for this internship"),
        { status: 403 },
      );
    }

    if (record.isComplete) {
      return NextResponse.json(
        apiError(
          "CONFLICT",
          "Feedback has already been submitted for this internship",
        ),
        { status: 409 },
      );
    }

    // 5. Set feedback and mark internship complete
    const feedbackPayload = {
      rating: parsed.data.rating,
      technicalScore: parsed.data.technicalScore,
      communicationScore: parsed.data.communicationScore,
      comments: parsed.data.comments,
      submittedAt: new Date().toISOString(),
    };

    const updated = await prisma.internshipRecord.update({
      where: { id: params.id },
      data: {
        mentorFeedback: feedbackPayload,
        isComplete: true,
        endDate: new Date(),
      },
      select: { id: true, isComplete: true, endDate: true },
    });

    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (err) {
    console.error("[POST /api/internships/[id]/feedback]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong"),
      { status: 500 },
    );
  }
}
