"""
Personalized Gap-Driven Learning Recommender.
Surfaces specific NPTEL courses, official documentation, and company training modules for identified gaps.
"""
from typing import Dict, List, Any
from ai_assessment_engine.knowledge_graph.graph_loader import registry


class LearningRecommender:
    """Recommends targeted learning paths to close concept gaps."""

    @staticmethod
    def get_recommendations_for_session(domain_id: str, concept_scores: Dict[str, float]) -> List[Dict[str, Any]]:
        domain = registry.get_domain(domain_id)
        if not domain:
            return []

        recommendations = []
        for concept in domain.concepts:
            score = concept_scores.get(concept.id, 0.0)
            if score < 65.0:  # Flagged gap threshold
                gap_severity = "HIGH" if score < 50.0 else "MEDIUM"
                resources = [r.model_dump() if hasattr(r, "model_dump") else r.dict() for r in concept.learning_resources]
                recommendations.append({
                    "concept_id": concept.id,
                    "concept_name": concept.name,
                    "current_score": score,
                    "gap_severity": gap_severity,
                    "target_benchmark": 75.0,
                    "recommended_courses": resources
                })

        return recommendations
