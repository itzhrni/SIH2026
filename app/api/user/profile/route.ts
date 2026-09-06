import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  institution: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  expertise: z.string().optional().nullable(),
});

// GET /api/user/profile
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        institution: true,
        department: true,
        expertise: true,
      },
    });

    if (!user) {
      return NextResponse.json(apiError("NOT_FOUND", "User not found"), {
        status: 404,
      });
    }

    return NextResponse.json(apiSuccess(user), { status: 200 });
  } catch (err) {
    console.error("[GET /api/user/profile]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong"),
      { status: 500 },
    );
  }
}

// PATCH /api/user/profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    const body = await req.json();
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError(
          "VALIDATION_ERROR",
          parsed.error.issues[0]?.message ?? "Invalid input",
        ),
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.institution !== undefined && {
          institution: parsed.data.institution,
        }),
        ...(parsed.data.department !== undefined && {
          department: parsed.data.department,
        }),
        ...(parsed.data.expertise !== undefined && {
          expertise: parsed.data.expertise,
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        institution: true,
        department: true,
        expertise: true,
      },
    });

    return NextResponse.json(apiSuccess(updatedUser), { status: 200 });
  } catch (err) {
    console.error("[PATCH /api/user/profile]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong"),
      { status: 500 },
    );
  }
}
