"""
Skill Profiler and Gap Report Generator.
Renders the exact tree-structure skill assessment report.
"""
from typing import Dict, Any
from ai_assessment_engine.engine.session_manager import AssessmentSessionState
from ai_assessment_engine.knowledge_graph.graph_loader import registry


class SkillProfiler:
    """Generates structured skill profiles and ASCII tree reports."""

    @staticmethod
    def generate_ascii_tree(session: AssessmentSessionState) -> str:
        """
        Renders output matching the exact requirement:
        Student: Harini
        System Design
        ├── Load Balancing      85%
        ├── Caching             72%
        ├── DB Sharding         41%  ← GAP
        └── Scalability         78%
        Overall: 69%
        """
        domain = registry.get_domain(session.domain_id)
        lines = []
        lines.append(f"Student: {session.student_name}")
        lines.append(f"{session.domain_name}")

        concepts = domain.concepts if domain else []
        total = len(concepts)

        for i, concept in enumerate(concepts):
            prefix = "└── " if i == total - 1 else "├── "
            score = session.concept_scores.get(concept.id, 0.0)
            score_int = int(round(score))
            
            gap_marker = "  ← GAP" if score < 60.0 else ""
            lines.append(f"{prefix}{concept.name:<20} {score_int:>3}%{gap_marker}")

        lines.append(f"\nOverall: {int(round(session.overall_domain_score))}%")
        return "\n".join(lines)

    @staticmethod
    def generate_json_report(session: AssessmentSessionState) -> Dict[str, Any]:
        domain = registry.get_domain(session.domain_id)
        breakdown = []
        gaps = []

        if domain:
            for concept in domain.concepts:
                score = session.concept_scores.get(concept.id, 0.0)
                is_gap = score < 60.0
                item = {
                    "concept_id": concept.id,
                    "concept_name": concept.name,
                    "score": score,
                    "weight": concept.weight,
                    "is_gap": is_gap,
                    "status": "CRITICAL GAP" if score < 50 else ("NEEDS IMPROVEMENT" if score < 70 else "STRONG")
                }
                breakdown.append(item)
                if is_gap:
                    gaps.append(item)

        return {
            "session_id": session.session_id,
            "student_name": session.student_name,
            "domain_id": session.domain_id,
            "domain_name": session.domain_name,
            "overall_score": session.overall_domain_score,
            "concept_breakdown": breakdown,
            "identified_gaps": gaps,
            "ascii_tree": SkillProfiler.generate_ascii_tree(session)
        }
