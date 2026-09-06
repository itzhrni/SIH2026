import { prisma } from "@/lib/db";
import { computeOpportunityMatch } from "@/lib/opportunities/opportunity-service";
import type {
  CandidateDiscoveryQuery,
  CandidateMatch,
  DomainScore,
  SkillBadge,
  LongitudinalSignal,
  LongitudinalTrajectory,
  RequiredSkill,
} from "@/types";

/**
 * Searches and ranks student candidates based on skill criteria,
 * domain competency, and longitudinal performance history.
 */
export async function searchCandidates(
  query: CandidateDiscoveryQuery = {},
): Promise<CandidateMatch[]> {
  const { skills = [], minScore = 0, domain, department, institution } = query;

  // Query students matching basic filters
  const studentWhere: {
    role: "STUDENT";
    department?: string;
    institution?: string;
  } = {
    role: "STUDENT",
  };

  if (department) studentWhere.department = department;
  if (institution) studentWhere.institution = institution;

  const students = await prisma.user.findMany({
    where: studentWhere,
    select: {
      id: true,
      name: true,
      email: true,
      institution: true,
      department: true,
      skillProfile: {
        select: {
          id: true,
          domainScores: true,
          badges: true,
          scoreHistory: {
            orderBy: { recordedAt: "asc" },
            select: {
              domain: true,
              score: true,
              recordedAt: true,
              sessionId: true,
            },
          },
        },
      },
      assessmentSessions: {
        where: { status: "COMPLETED" },
        select: {
          id: true,
          domain: true,
          createdAt: true,
        },
      },
    },
  });

  const candidateMatches: CandidateMatch[] = [];

  for (const student of students) {
    const rawDomainScores = student.skillProfile?.domainScores as unknown;
    const rawBadges = student.skillProfile?.badges as unknown;
    const scoreHistory = student.skillProfile?.scoreHistory ?? [];
    const completedSessions = student.assessmentSessions ?? [];

    const domainScores: Record<string, number> = {};

    if (rawDomainScores && typeof rawDomainScores === "object") {
      for (const [key, val] of Object.entries(rawDomainScores)) {
        if (val && typeof val === "object" && "score" in val) {
          const score = (val as DomainScore).score;
          if (typeof score === "number") domainScores[key] = score;
        } else if (typeof val === "number") {
          domainScores[key] = val;
        }
      }
    }

    // Extract earned badges
    const badges: string[] = [];
    if (rawBadges && typeof rawBadges === "object") {
      if (Array.isArray(rawBadges)) {
        for (const b of rawBadges as SkillBadge[]) {
          if (b && b.earned) badges.push(b.domain);
        }
      } else {
        for (const [badgeDomain, val] of Object.entries(rawBadges)) {
          if (
            val &&
            typeof val === "object" &&
            "earned" in val &&
            (val as SkillBadge).earned
          ) {
            badges.push(badgeDomain);
          }
        }
      }
    }

    // Determine top domain & score
    let topDomain = "General";
    let topDomainScore = 0;
    for (const [d, s] of Object.entries(domainScores)) {
      if (s > topDomainScore) {
        topDomain = d;
        topDomainScore = s;
      }
    }

    // Compute Longitudinal Signal
    const sessionCount =
      completedSessions.length ||
      scoreHistory.length ||
      (Object.keys(domainScores).length > 0 ? 1 : 0);
    const longitudinalSignal = computeLongitudinalSignal(
      scoreHistory,
      sessionCount,
      topDomainScore,
    );

    // Compute Match Score
    const metSkills: string[] = [];
    const gapSkills: {
      skill: string;
      studentScore: number;
      required: number;
    }[] = [];
    let matchScore = 0;

    const requiredSkillsList: RequiredSkill[] = skills.map((s) => ({
      skill: s,
      minThreshold: 60, // default target
    }));

    if (domain) {
      requiredSkillsList.push({ skill: domain, minThreshold: 60 });
    }

    if (requiredSkillsList.length > 0) {
      let totalRequired = 0;
      let totalObtained = 0;

      for (const req of requiredSkillsList) {
        totalRequired += req.minThreshold;
        // Find best matching domain score (case-insensitive)
        const studentScore = findMatchingDomainScore(domainScores, req.skill);

        if (studentScore >= req.minThreshold) {
          metSkills.push(req.skill);
          totalObtained += req.minThreshold;
        } else {
          totalObtained += studentScore;
          gapSkills.push({
            skill: req.skill,
            studentScore,
            required: req.minThreshold,
          });
        }
      }

      matchScore =
        totalRequired > 0
          ? Math.round((totalObtained / totalRequired) * 100)
          : 0;
    } else {
      // Default match score based on average domain scores if no query skills given
      const scoreValues = Object.values(domainScores);
      matchScore =
        scoreValues.length > 0
          ? Math.round(
              scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length,
            )
          : topDomainScore;
    }

    // Cap match score between 0 and 100
    matchScore = Math.min(100, Math.max(0, matchScore));

    if (matchScore >= minScore) {
      candidateMatches.push({
        id: student.id,
        name: student.name,
        email: student.email,
        institution: student.institution,
        department: student.department,
        matchScore,
        topDomain,
        topDomainScore,
        metSkills,
        gapSkills,
        domainScores,
        sessionCount,
        badges,
        longitudinalSignal,
      });
    }
  }

  // Sort descending by match score, then by session count
  return candidateMatches.sort(
    (a, b) => b.matchScore - a.matchScore || b.sessionCount - a.sessionCount,
  );
}

function findMatchingDomainScore(
  domainScores: Record<string, number>,
  targetSkill: string,
): number {
  const norm = targetSkill.toLowerCase().trim();
  for (const [key, score] of Object.entries(domainScores)) {
    if (
      key.toLowerCase().trim() === norm ||
      key.toLowerCase().includes(norm) ||
      norm.includes(key.toLowerCase())
    ) {
      return score;
    }
  }
  return 0;
}

export function computeLongitudinalSignal(
  history: { domain: string; score: number; recordedAt: Date }[],
  sessionCount: number,
  currentTopScore: number,
): LongitudinalSignal {
  if (history.length >= 2) {
    const firstScore = history[0].score;
    const lastScore = history[history.length - 1].score;
    const delta = Math.round(lastScore - firstScore);

    if (delta >= 15) {
      return {
        trajectory: "IMPROVING",
        label: `Rapid Improver (+${delta}%)`,
        sessionCount,
        deltaScore: delta,
        stabilityScore: 92,
      };
    } else if (delta > 5) {
      return {
        trajectory: "GROWTH_DETECTED",
        label: `Positive Growth (+${delta}%)`,
        sessionCount,
        deltaScore: delta,
        stabilityScore: 85,
      };
    } else if (lastScore >= 70) {
      return {
        trajectory: "STABLE_HIGH",
        label: "Consistent High Performer",
        sessionCount,
        deltaScore: delta,
        stabilityScore: 95,
      };
    }
  }

  if (sessionCount >= 2 && currentTopScore >= 70) {
    return {
      trajectory: "STABLE_HIGH",
      label: "Consistent High Performer",
      sessionCount,
      stabilityScore: 90,
    };
  }

  return {
    trajectory: "BASELINE",
    label: sessionCount > 0 ? "Verified Competency" : "Assessment Pending",
    sessionCount,
    stabilityScore: 75,
  };
}
