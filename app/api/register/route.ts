import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["STUDENT", "INDUSTRY", "ACADEMICIAN", "INSTITUTIONAL_ADMIN"]),
  institution: z.string().optional(),
  department: z.string().optional(),
  expertise: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError(
          "VALIDATION_ERROR",
          parsed.error.issues[0]?.message ?? "Invalid input",
        ),
        { status: 400 },
      );
    }

    const { name, email, password, role, institution, department, expertise } =
      parsed.data;

    // Check for existing user
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        apiError("CONFLICT", "An account with this email already exists"),
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        institution: institution ?? null,
        department: department ?? null,
        expertise: expertise ?? null,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json(apiSuccess(user), { status: 201 });
  } catch (err) {
    console.error("[POST /api/register]", err);
    if (err instanceof Error) {
      console.error("[REGISTER STACK]", err.stack);
    }
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong"),
      { status: 500 },
    );
  }
}
