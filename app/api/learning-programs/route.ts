// app/api/learning-programs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { z } from "zod";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { prisma } from "@/lib/db";

const CourseSchema = z.object({
  title: z.string().min(3, "Course title must be at least 3 characters"),
  format: z.string().min(1, "Format is required"),
  skills: z.array(z.string()).min(1, "At least one skill required"),
  duration: z.string().min(1, "Duration is required"),
  enrollmentLink: z.string().url("Must be a valid URL"),
});

// Simulated external course sources for MVP demo
const COURSE_SOURCES = [
  {
    provider: "Coursera",
    programs: [
      {
        title: "Python for Data Science and AI",
        format: "Online Course",
        skills: ["python", "machine-learning", "numpy"],
        duration: "6 weeks",
        enrollmentLink: "https://www.coursera.org/python-data-science",
      },
      {
        title: "Deep Learning Specialization",
        format: "Online Course",
        skills: ["deep-learning", "tensorflow", "python"],
        duration: "5 months",
        enrollmentLink: "https://www.coursera.org/deep-learning",
      },
      {
        title: "Machine Learning by Stanford",
        format: "Online Course",
        skills: ["machine-learning", "statistics", "python"],
        duration: "10 weeks",
        enrollmentLink: "https://www.coursera.org/ml-stanford",
      },
    ],
  },
  {
    provider: "GeeksforGeeks",
    programs: [
      {
        title: "Placement 100 Course",
        format: "Self-paced Bootcamp",
        skills: ["dsa", "cpp", "system-design"],
        duration: "12 months",
        enrollmentLink: "https://www.geeksforgeeks.org/placement-100",
      },
      {
        title: "Web Development Complete Course",
        format: "Self-paced Bootcamp",
        skills: ["html", "css", "javascript", "react", "nodejs"],
        duration: "8 months",
        enrollmentLink: "https://www.geeksforgeeks.org/web-dev-complete",
      },
      {
        title: "System Design Masterclass",
        format: "Online Course",
        skills: ["system-design", "database", "api-design"],
        duration: "4 weeks",
        enrollmentLink: "https://www.geeksforgeeks.org/system-design",
      },
    ],
  },
];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    const { searchParams } = req.nextUrl;
    const provider = searchParams.get("provider");
    const skills = searchParams.get("skills");

    // Fetch user-created learning programs
    const dbPrograms =
      session.user.role === "INDUSTRY"
        ? await prisma.learningProgram.findMany({
            where: { postedById: session.user.id, isActive: true },
            select: {
              id: true,
              title: true,
              format: true,
              skills: true,
              duration: true,
              enrollmentLink: true,
              createdAt: true,
            },
          })
        : await prisma.learningProgram.findMany({
            where: { isActive: true },
            select: {
              id: true,
              title: true,
              format: true,
              skills: true,
              duration: true,
              enrollmentLink: true,
              postedBy: { select: { name: true } },
              createdAt: true,
            },
          });

    // Simulate external courses (Coursera + GfG)
    const externalPrograms = COURSE_SOURCES.filter(
      (s) => !provider || provider === s.provider || provider === "all",
    ).flatMap((source) =>
      source.programs
        .filter((p) => {
          if (!skills) return true;
          const skillFilter = skills.split(",").map((s) => s.trim());
          return skillFilter.some((filterSkill) =>
            p.skills.some((ps) => ps.includes(filterSkill.toLowerCase())),
          );
        })
        .map((p) => ({
          ...p,
          id: `ext_${source.provider.toLowerCase()}_${p.title.toLowerCase().replace(/\s+/g, "-")}`,
          source: source.provider,
          isExternal: true,
        })),
    );

    const allPrograms = [...dbPrograms, ...externalPrograms];

    return NextResponse.json(apiSuccess(allPrograms), { status: 200 });
  } catch (err) {
    console.error("[GET /api/learning-programs]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong"),
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session || session.user.role !== "INDUSTRY") {
      return NextResponse.json(
        apiError(
          "FORBIDDEN",
          "Only industry partners can create learning programs",
        ),
        { status: 403 },
      );
    }

    const body = await req.json();
    const parsed = CourseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError(
          "VALIDATION_ERROR",
          parsed.error.issues[0]?.message ?? "Invalid input",
        ),
        { status: 400 },
      );
    }

    const program = await prisma.learningProgram.create({
      data: {
        postedById: session.user.id,
        ...parsed.data,
      },
    });

    return NextResponse.json(apiSuccess(program), { status: 201 });
  } catch (err) {
    console.error("[POST /api/learning-programs]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong"),
      { status: 500 },
    );
  }
}
