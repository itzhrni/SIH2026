// app/api/internships/[id]/tracker/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { z } from "zod";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { prisma } from "@/lib/db";
import type { InternshipProgressLog } from "@/types";

const ProgressLogSchema = z.object({
  week: z.number().int().min(1).max(52),
  log: z
    .string()
    .min(10, "Progress log must be at least 10 characters")
    .max(2000),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    const internshipId = params.id;

    const record = await prisma.internshipRecord.findUnique({
      where: { id: internshipId },
      select: {
        id: true,
        studentId: true,
        mentorId: true,
        companyName: true,
        role: true,
        startDate: true,
        endDate: true,
        isComplete: true,
        progressLogs: true,
        mentorFeedback: true,
        createdAt: true,
        student: {
          select: { id: true, name: true, institution: true, department: true },
        },
        mentor: { select: { id: true, name: true } },
      },
    });

    if (!record) {
      return NextResponse.json(
        apiError("NOT_FOUND", "Internship record not found"),
        { status: 404 },
      );
    }

    const isStudent = record.studentId === session.user.id;
    const isMentor = record.mentorId === session.user.id;
    const isAdmin = session.user.role === "INSTITUTIONAL_ADMIN";

    if (!isStudent && !isMentor && !isAdmin) {
      return NextResponse.json(
        apiError(
          "FORBIDDEN",
          "You do not have access to this internship record",
        ),
        { status: 403 },
      );
    }

    return NextResponse.json(apiSuccess(record), { status: 200 });
  } catch (err) {
    console.error("[GET /api/internships/[id]/tracker]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong"),
      { status: 500 },
    );
  }
}

export async function POST(
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

    if (session.user.role !== "STUDENT") {
      return NextResponse.json(
        apiError("FORBIDDEN", "Only students can submit progress logs"),
        { status: 403 },
      );
    }

    const body = await req.json();
    const parsed = ProgressLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError(
          "VALIDATION_ERROR",
          parsed.error.issues[0]?.message ?? "Invalid input",
        ),
        { status: 400 },
      );
    }

    const internshipId = params.id;
    const { week, log } = parsed.data;

    const record = await prisma.internshipRecord.findUnique({
      where: { id: internshipId },
      select: { studentId: true, isComplete: true, progressLogs: true },
    });

    if (!record) {
      return NextResponse.json(
        apiError("NOT_FOUND", "Internship record not found"),
        { status: 404 },
      );
    }

    if (record.studentId !== session.user.id) {
      return NextResponse.json(
        apiError("FORBIDDEN", "You are not the student for this internship"),
        { status: 403 },
      );
    }

    if (record.isComplete) {
      return NextResponse.json(
        apiError("CONFLICT", "This internship is already marked as complete"),
        { status: 409 },
      );
    }

    // Cast through unknown to bridge Prisma JsonValue → our typed interface (SCHEMA.md §5)
    const existingLogs =
      (record.progressLogs as unknown as InternshipProgressLog[]) ?? [];

    const weekAlreadySubmitted = existingLogs.some((l) => l.week === week);
    if (weekAlreadySubmitted) {
      return NextResponse.json(
        apiError(
          "CONFLICT",
          `A log for week ${week} has already been submitted`,
        ),
        { status: 409 },
      );
    }

    const newLog: InternshipProgressLog = {
      week,
      log,
      submittedAt: new Date().toISOString(),
    };

    // Cast back to unknown so Prisma accepts our typed array as InputJsonValue
    const updatedLogs = [...existingLogs, newLog] as unknown as Parameters<
      typeof prisma.internshipRecord.update
    >[0]["data"]["progressLogs"];

    const updated = await prisma.internshipRecord.update({
      where: { id: internshipId },
      data: {
        progressLogs: updatedLogs,
      },
      select: {
        id: true,
        progressLogs: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (err) {
    console.error("[POST /api/internships/[id]/tracker]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong"),
      { status: 500 },
    );
  }
}
