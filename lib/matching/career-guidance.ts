/**
 * lib/matching/career-guidance.ts
 * Pre-defined role taxonomy with 6 roles. Computes compatibility % per role.
 * In MVP: simplified — no JD-specific overlay, no interest filtering.
 *
 * RULE LIB-01: Pure business logic — no framework imports.
 */

interface RoleRequirement {
  skill: string;
  minThreshold: number;
  weight: number; // relative importance 0–1
}

export interface RoleMatch {
  roleId: string;
  displayName: string;
  compatibilityPercent: number;
  metSkills: string[];
  gapSkills: { skill: string; studentScore: number; required: number }[];
}

interface RoleTaxonomyEntry {
  roleId: string;
  displayName: string;
  requirements: RoleRequirement[];
}

/** Pre-defined role taxonomy — 6 roles covering IT and AYUSH tracks. */
export const ROLE_TAXONOMY: RoleTaxonomyEntry[] = [
  {
    roleId: "backend-engineer",
    displayName: "Backend Engineer",
    requirements: [
      { skill: "dsa", minThreshold: 65, weight: 0.35 },
      { skill: "system-design", minThreshold: 60, weight: 0.3 },
      { skill: "core-cs", minThreshold: 55, weight: 0.2 },
      { skill: "machine-learning", minThreshold: 40, weight: 0.15 },
    ],
  },
  {
    roleId: "ml-engineer",
    displayName: "ML Engineer",
    requirements: [
      { skill: "machine-learning", minThreshold: 70, weight: 0.4 },
      { skill: "dsa", minThreshold: 55, weight: 0.25 },
      { skill: "core-cs", minThreshold: 50, weight: 0.2 },
      { skill: "system-design", minThreshold: 45, weight: 0.15 },
    ],
  },
  {
    roleId: "fullstack-engineer",
    displayName: "Full-Stack Engineer",
    requirements: [
      { skill: "dsa", minThreshold: 55, weight: 0.3 },
      { skill: "system-design", minThreshold: 55, weight: 0.3 },
      { skill: "core-cs", minThreshold: 50, weight: 0.2 },
      { skill: "machine-learning", minThreshold: 35, weight: 0.2 },
    ],
  },
  {
    roleId: "data-scientist",
    displayName: "Data Scientist",
    requirements: [
      { skill: "machine-learning", minThreshold: 65, weight: 0.45 },
      { skill: "dsa", minThreshold: 50, weight: 0.25 },
      { skill: "core-cs", minThreshold: 45, weight: 0.2 },
      { skill: "system-design", minThreshold: 40, weight: 0.1 },
    ],
  },
  {
    roleId: "ayurvedic-practitioner",
    displayName: "Ayurvedic Practitioner",
    requirements: [
      { skill: "ayurvedic-pharmacology", minThreshold: 70, weight: 0.5 },
      { skill: "clinical-practice", minThreshold: 65, weight: 0.5 },
    ],
  },
  {
    roleId: "healthcare-administrator",
    displayName: "Healthcare Administrator",
    requirements: [
      { skill: "clinical-practice", minThreshold: 55, weight: 0.55 },
      { skill: "ayurvedic-pharmacology", minThreshold: 45, weight: 0.45 },
    ],
  },
];

/**
 * Compute ranked role compatibility for a student's domain scores.
 * Returns roles sorted descending by compatibility %.
 */
export function computeRoleCompatibility(
  domainScores: Record<string, { score: number; lastUpdated: string }>,
): RoleMatch[] {
  return ROLE_TAXONOMY.map((role) => {
    const totalWeight = role.requirements.reduce((sum, r) => sum + r.weight, 0);
    let weightedScore = 0;
    const metSkills: string[] = [];
    const gapSkills: {
      skill: string;
      studentScore: number;
      required: number;
    }[] = [];

    for (const req of role.requirements) {
      const studentScore = domainScores[req.skill]?.score ?? 0;
      const ratio =
        req.minThreshold > 0 ? Math.min(studentScore / req.minThreshold, 1) : 1;
      weightedScore += ratio * req.weight;

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

    const compatibilityPercent = Math.round(
      (weightedScore / totalWeight) * 100,
    );

    return {
      roleId: role.roleId,
      displayName: role.displayName,
      compatibilityPercent,
      metSkills,
      gapSkills,
    };
  }).sort((a, b) => b.compatibilityPercent - a.compatibilityPercent);
}
