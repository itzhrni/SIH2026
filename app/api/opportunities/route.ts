// app/api/opportunities/route.ts
// GET  — Return personalised opportunity feed ranked by match score (STUDENT)
// POST — Create a new opportunity posting (INDUSTRY)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { z } from "zod";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { prisma } from "@/lib/db";
import { computeMatchScore } from "@/lib/matching/opportunity-match";
import type { RequiredSkill, OpportunityWithMatch, DomainScore } from "@/types";
import type { Prisma, OpportunityType } from "@prisma/client";

export const dynamic = "force-dynamic";

// POST schema for industry creating a posting
const CreateOpportunitySchema = z.object({
  type: z.enum([
    "INTERNSHIP",
    "JOB",
    "FDP",
    "FACULTY_INTERNSHIP",
    "RESEARCH_PROJECT",
    "CONSULTANCY",
    "LEARNING_PROGRAM",
  ]),
  title: z.string().min(2),
  description: z.string().min(10),
  requiredSkills: z.array(
    z.object({
      skill: z.string().min(1),
      minThreshold: z.number().int().min(0).max(100),
    }),
  ),
  eligibilityCriteria: z
    .object({
      yearOfStudy: z.array(z.number().int()).optional(),
      minCGPA: z.number().optional(),
      institution: z.string().optional(),
    })
    .optional(),
  location: z.string().optional(),
  duration: z.string().optional(),
  stipendRange: z.string().optional(),
  deadline: z.string().datetime(),
});

export async function GET(req: NextRequest) {
  try {
    // 1. Auth
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get("type"); // optional: INTERNSHIP | JOB | etc.

    // Students get personalised feed; industry/admin get full list
    if (session.user.role === "STUDENT") {
      const userId = session.user.id;

      // Load student's domain scores
      const profile = await prisma.skillProfile.findUnique({
        where: { userId },
        select: { domainScores: true },
      });
      const domainScores = (profile?.domainScores ?? {}) as unknown as Record<
        string,
        DomainScore
      >;

      // Load active opportunities
      const where: Prisma.OpportunityWhereInput = { isActive: true };
      if (typeFilter) where.type = typeFilter as OpportunityType;

      const opportunities = await prisma.opportunity.findMany({
        where,
        select: {
          id: true,
          title: true,
          type: true,
          location: true,
          duration: true,
          stipendRange: true,
          deadline: true,
          requiredSkills: true,
          postedBy: { select: { name: true, institution: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      // Compute match scores and sort
      const results: OpportunityWithMatch[] = opportunities
        .map((opp) => {
          const skills = opp.requiredSkills as unknown as RequiredSkill[];
          const match = computeMatchScore(domainScores, skills, opp.id);
          return {
            id: opp.id,
            title: opp.title,
            companyName: opp.postedBy.institution ?? opp.postedBy.name,
            type: opp.type,
            location: opp.location,
            duration: opp.duration,
            stipendRange: opp.stipendRange,
            deadline: opp.deadline.toISOString(),
            requiredSkills: skills,
            matchScore: match.matchScore,
            metSkills: match.metSkills,
            gapSkills: match.gapSkills,
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore);

      return NextResponse.json(apiSuccess(results), { status: 200 });
    }

    // Non-student: return all postings without personalisation
    const where: Prisma.OpportunityWhereInput = { isActive: true };
    if (session.user.role === "INDUSTRY") {
      where.postedById = session.user.id;
    }
    if (typeFilter) where.type = typeFilter as OpportunityType;

    const opportunities = await prisma.opportunity.findMany({
      where,
      select: {
        id: true,
        title: true,
        type: true,
        location: true,
        duration: true,
        stipendRange: true,
        deadline: true,
        requiredSkills: true,
        isActive: true,
        createdAt: true,
        postedBy: { select: { name: true, institution: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(apiSuccess(opportunities), { status: 200 });
  } catch (err) {
    console.error("[GET /api/opportunities]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to load opportunities"),
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    // 2. Role check — only INDUSTRY can post
    if (session.user.role !== "INDUSTRY") {
      return NextResponse.json(
        apiError("FORBIDDEN", "Only industry users can post opportunities"),
        { status: 403 },
      );
    }

    // 3. Validate
    const body = await req.json();
    const parsed = CreateOpportunitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError(
          "VALIDATION_ERROR",
          parsed.error.issues[0]?.message ?? "Invalid input",
        ),
        { status: 400 },
      );
    }

    const data = parsed.data;

    // 4. Create posting
    const opportunity = await prisma.opportunity.create({
      data: {
        postedById: session.user.id,
        type: data.type,
        title: data.title,
        description: data.description,
        requiredSkills: data.requiredSkills as object[],
        eligibilityCriteria: (data.eligibilityCriteria ?? {}) as object,
        location: data.location,
        duration: data.duration,
        stipendRange: data.stipendRange,
        deadline: new Date(data.deadline),
      },
      select: { id: true, title: true, type: true, deadline: true },
    });

    return NextResponse.json(apiSuccess(opportunity), { status: 201 });
  } catch (err) {
    console.error("[POST /api/opportunities]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to create opportunity"),
      { status: 500 },
    );
  }
}
