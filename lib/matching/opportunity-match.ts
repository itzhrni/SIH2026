/**
 * lib/matching/opportunity-match.ts
 * Computes a student's % match score against an opportunity's required skills.
 *
 * Algorithm (ARCHITECTURE.md §5):
 *   matchScore = weightedAvg(studentScore[skill] / threshold[skill]) capped at 100%
 *   Unmet skills contribute 0 to the average.
 *   Skills the student hasn't been assessed in count as 0.
 *
 * RULE LIB-01: Pure business logic — no framework imports.
 */

import type { RequiredSkill, OpportunityMatchResult } from "@/types";

/**
 * Compute match score for a single student vs a single opportunity.
 *
 * @param domainScores - Student's current domain score map { [domain]: { score } }
 * @param requiredSkills - Opportunity's required skills array
 * @param opportunityId - The opportunity ID (for result shape)
 * @returns OpportunityMatchResult with matchScore 0–100, metSkills, gapSkills
 */
export function computeMatchScore(
  domainScores: Record<string, { score: number; lastUpdated: string }>,
  requiredSkills: RequiredSkill[],
  opportunityId: string,
): OpportunityMatchResult {
  if (requiredSkills.length === 0) {
    return {
      opportunityId,
      matchScore: 100,
      metSkills: [],
      gapSkills: [],
    };
  }

  const metSkills: string[] = [];
  const gapSkills: { skill: string; studentScore: number; required: number }[] =
    [];
  let totalRatio = 0;

  for (const req of requiredSkills) {
    const studentEntry = domainScores[req.skill];
    const studentScore = studentEntry?.score ?? 0;
    const ratio =
      req.minThreshold > 0 ? Math.min(studentScore / req.minThreshold, 1) : 1;
    totalRatio += ratio;

    if (studentScore >= req.minThreshold) {
      metSkills.push(req.skill);
    } else {
      gapSkills.push({
        skill: req.skill,
        studentScore,
        required: req.minThreshold,
      });
    }
  }

  const matchScore = Math.round((totalRatio / requiredSkills.length) * 100);

  return {
    opportunityId,
    matchScore,
    metSkills,
    gapSkills,
  };
}
