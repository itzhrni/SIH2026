"""
Role Compatibility and Job Description (JD) Matcher Engine.
Compares student skill profile against predefined job roles and custom company JDs.
"""
from typing import Dict, List, Any
from pydantic import BaseModel, Field


class JobRoleRequirement(BaseModel):
    role_id: str
    role_title: str
    department: str
    required_skills: Dict[str, float] = Field(
        ...,
        description="Dict of {concept_id: minimum_score_threshold (0-100)}"
    )
    skill_weights: Dict[str, float] = Field(
        default_factory=dict,
        description="Relative weight of each skill in overall role fit"
    )


class RoleMatchResult(BaseModel):
    role_id: str
    role_title: str
    compatibility_score: float = Field(..., ge=0, le=100)
    is_eligible: bool
    met_skills: List[str]
    missing_skill_gaps: List[Dict[str, Any]]


# Predefined Job Role Taxonomy
DEFAULT_ROLE_TAXONOMY: List[JobRoleRequirement] = [
    JobRoleRequirement(
        role_id="backend_swe",
        role_title="Backend Software Engineer",
        department="Software Engineering",
        required_skills={
            "load_balancing": 70.0,
            "caching": 65.0,
            "db_sharding": 60.0,
            "scalability": 70.0
        },
        skill_weights={
            "load_balancing": 1.0,
            "caching": 1.2,
            "db_sharding": 1.5,
            "scalability": 1.3
        }
    ),
    JobRoleRequirement(
        role_id="devops_cloud_eng",
        role_title="DevOps & Cloud Infrastructure Engineer",
        department="Infrastructure",
        required_skills={
            "load_balancing": 80.0,
            "scalability": 75.0,
            "caching": 50.0
        },
        skill_weights={
            "load_balancing": 2.0,
            "scalability": 1.5,
            "caching": 0.8
        }
    ),
    JobRoleRequirement(
        role_id="ayush_qc_specialist",
        role_title="Ayush Quality Control & Analytical Chemist",
        department="Ayurvedic Pharmaceuticals",
        required_skills={
            "herbal_standardization": 75.0,
            "ayush_gmp_qc": 70.0
        },
        skill_weights={
            "herbal_standardization": 1.5,
            "ayush_gmp_qc": 1.5
        }
    )
]


class RoleMatcher:
    """Calculates compatibility percentage against Job Roles & Custom JDs."""

    @staticmethod
    def match_against_role(student_scores: Dict[str, float], role: JobRoleRequirement) -> RoleMatchResult:
        total_weight = 0.0
        weighted_score_sum = 0.0
        met_skills = []
        missing_gaps = []
        is_eligible = True

        for skill_id, min_thresh in role.required_skills.items():
            weight = role.skill_weights.get(skill_id, 1.0)
            student_score = student_scores.get(skill_id, 0.0)
            total_weight += weight

            # Proportional score up to 100%
            ratio = min(student_score / 100.0, 1.0)
            weighted_score_sum += ratio * weight * 100.0

            if student_score >= min_thresh:
                met_skills.append(skill_id)
            else:
                is_eligible = False
                missing_gaps.append({
                    "skill_id": skill_id,
                    "student_score": student_score,
                    "required_threshold": min_thresh,
                    "gap_deficit": round(min_thresh - student_score, 1)
                })

        compatibility = round(weighted_score_sum / total_weight, 1) if total_weight > 0 else 0.0

        return RoleMatchResult(
            role_id=role.role_id,
            role_title=role.role_title,
            compatibility_score=compatibility,
            is_eligible=is_eligible,
            met_skills=met_skills,
            missing_skill_gaps=missing_gaps
        )

    @classmethod
    def match_all_predefined_roles(cls, student_scores: Dict[str, float]) -> List[RoleMatchResult]:
        results = [cls.match_against_role(student_scores, role) for role in DEFAULT_ROLE_TAXONOMY]
        # Sort by compatibility score descending
        results.sort(key=lambda r: r.compatibility_score, reverse=True)
        return results

    @classmethod
    def match_custom_jd(
        cls,
        student_scores: Dict[str, float],
        jd_title: str,
        required_skills: Dict[str, float]
    ) -> RoleMatchResult:
        custom_role = JobRoleRequirement(
            role_id="custom_jd",
            role_title=jd_title,
            department="Industry Opportunity",
            required_skills=required_skills
        )
        return cls.match_against_role(student_scores, custom_role)
