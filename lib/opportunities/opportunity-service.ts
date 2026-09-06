import { prisma } from "@/lib/db";
import type {
  OpportunityFormData,
  OpportunitySummary,
  PipelineApplicant,
  IndustryDashboardMetrics,
  RequiredSkill,
  OpportunityMatchResult,
  DomainScore,
} from "@/types";
import type {
  ApplicationStatus,
  PlacementStatus,
  OpportunityType,
} from "@prisma/client";

/**
 * Computes the match between a student's skill profile and a single opportunity's
 * required skills.
 *
 *   matchScore = weightedAvg(min(studentScore[skill] / threshold[skill], 1)) * 100
 */
export function computeOpportunityMatch(
  domainScores: Record<string, DomainScore>,
  requiredSkills: RequiredSkill[],
  opportunityId: string,
): OpportunityMatchResult {
  if (requiredSkills.length === 0) {
    return { opportunityId, matchScore: 100, metSkills: [], gapSkills: [] };
  }

  let totalRatio = 0;
  const metSkills: string[] = [];
  const gapSkills: OpportunityMatchResult["gapSkills"] = [];

  for (const { skill, minThreshold } of requiredSkills) {
    const studentScore = domainScores[skill]?.score ?? 0;

    if (minThreshold === 0) {
      totalRatio += 1;
      metSkills.push(skill);
      continue;
    }

    const ratio = Math.min(studentScore / minThreshold, 1);
    totalRatio += ratio;

    if (studentScore >= minThreshold) {
      metSkills.push(skill);
    } else {
      gapSkills.push({ skill, studentScore, required: minThreshold });
    }
  }

  const matchScore = Math.round((totalRatio / requiredSkills.length) * 100);

  return { opportunityId, matchScore, metSkills, gapSkills };
}

/**
 * Retrieves full dashboard analytics for an industry recruiter.
 */
export async function getIndustryDashboardMetrics(
  recruiterId: string,
): Promise<IndustryDashboardMetrics> {
  const [opportunities, applications] = await Promise.all([
    getRecruiterOpportunities(recruiterId),
    getPipelineApplicants(recruiterId),
  ]);

  const activePostingsCount = opportunities.filter((o) => o.isActive).length;
  const totalApplicationsCount = applications.length;

  const shortlistedCandidatesCount = applications.filter(
    (a) =>
      a.status === "SHORTLISTED" ||
      a.status === "INTERVIEW_SCHEDULED" ||
      a.placementStatus === "SHORTLISTED" ||
      a.placementStatus === "INTERVIEW_SCHEDULED",
  ).length;

  const offersExtendedCount = applications.filter(
    (a) =>
      a.status === "SELECTED" ||
      a.placementStatus === "OFFER_EXTENDED" ||
      a.placementStatus === "JOINED",
  ).length;

  return {
    activePostingsCount,
    totalApplicationsCount,
    shortlistedCandidatesCount,
    offersExtendedCount,
    recentPostings: opportunities.slice(0, 5),
    recentApplicants: applications.slice(0, 8),
  };
}

/**
 * Retrieves all opportunity postings created by the recruiter.
 */
export async function getRecruiterOpportunities(
  recruiterId: string,
): Promise<OpportunitySummary[]> {
  const postings = await prisma.opportunity.findMany({
    where: { postedById: recruiterId },
    orderBy: { createdAt: "desc" },
    include: {
      applications: {
        select: {
          status: true,
          placementStatus: true,
        },
      },
    },
  });

  return postings.map((p) => {
    const reqSkills: RequiredSkill[] = Array.isArray(p.requiredSkills)
      ? (p.requiredSkills as unknown as RequiredSkill[])
      : [];

    const applicantCount = p.applications.length;
    const shortlistedCount = p.applications.filter(
      (a) =>
        a.status === "SHORTLISTED" ||
        a.status === "INTERVIEW_SCHEDULED" ||
        a.placementStatus === "SHORTLISTED" ||
        a.placementStatus === "INTERVIEW_SCHEDULED",
    ).length;

    const offersCount = p.applications.filter(
      (a) =>
        a.status === "SELECTED" ||
        a.placementStatus === "OFFER_EXTENDED" ||
        a.placementStatus === "JOINED",
    ).length;

    return {
      id: p.id,
      title: p.title,
      type: p.type,
      location: p.location,
      duration: p.duration,
      stipendRange: p.stipendRange,
      deadline: p.deadline.toISOString(),
      isActive: p.isActive,
      requiredSkills: reqSkills,
      applicantCount,
      shortlistedCount,
      offersCount,
      createdAt: p.createdAt.toISOString(),
    };
  });
}

/**
 * Creates a new opportunity posting.
 */
export async function createOpportunity(
  recruiterId: string,
  data: OpportunityFormData,
) {
  const {
    type,
    title,
    description,
    requiredSkills,
    eligibilityCriteria = {},
    location,
    duration,
    stipendRange,
    deadline,
  } = data;

  const skillsExtracted = requiredSkills.map((r) => r.skill);

  const opportunity = await prisma.opportunity.create({
    data: {
      postedById: recruiterId,
      type: type as OpportunityType,
      title,
      description,
      requiredSkills: requiredSkills as unknown as object,
      eligibilityCriteria: eligibilityCriteria as object,
      location,
      duration,
      stipendRange,
      deadline: new Date(deadline),
      skillsExtracted: skillsExtracted as object,
      isActive: true,
    },
  });

  return opportunity;
}

/**
 * Retrieves all applicants for opportunities posted by the recruiter.
 */
export async function getPipelineApplicants(
  recruiterId: string,
  opportunityId?: string,
): Promise<PipelineApplicant[]> {
  const whereClause: {
    opportunity: { postedById: string; id?: string };
  } = {
    opportunity: {
      postedById: recruiterId,
      ...(opportunityId ? { id: opportunityId } : {}),
    },
  };

  const applications = await prisma.application.findMany({
    where: whereClause,
    orderBy: { appliedAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          institution: true,
          department: true,
        },
      },
      opportunity: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return applications.map((app) => ({
    id: app.id,
    userId: app.user.id,
    studentName: app.user.name,
    studentEmail: app.user.email,
    institution: app.user.institution,
    department: app.user.department,
    matchScoreAtApply: app.matchScoreAtApply,
    status: app.status as PipelineApplicant["status"],
    placementStatus:
      app.placementStatus as PipelineApplicant["placementStatus"],
    notes: app.notes,
    appliedAt: app.appliedAt.toISOString(),
    opportunityId: app.opportunity.id,
    opportunityTitle: app.opportunity.title,
  }));
}

/**
 * Updates an applicant's stage and notes.
 */
export async function updateApplicationStatus(
  recruiterId: string,
  applicationId: string,
  updates: {
    status?: ApplicationStatus;
    placementStatus?: PlacementStatus;
    notes?: string;
  },
) {
  // Verify application belongs to an opportunity posted by this recruiter
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { opportunity: true },
  });

  if (!app) {
    throw new Error("Application not found");
  }

  if (app.opportunity.postedById !== recruiterId) {
    throw new Error("Unauthorized to update this application");
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: {
      ...(updates.status ? { status: updates.status } : {}),
      ...(updates.placementStatus !== undefined
        ? { placementStatus: updates.placementStatus }
        : {}),
      ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
    },
  });

  return updated;
}
