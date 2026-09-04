import sys
import os
import pytest

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ai_assessment_engine.engine.session_manager import AssessmentSessionManager
from ai_assessment_engine.engine.evaluator import RubricEvaluator
from ai_assessment_engine.engine.question_generator import QuestionGenerator
from ai_assessment_engine.ai.llm_client import LLMClient
from ai_assessment_engine.knowledge_graph.graph_loader import registry
from ai_assessment_engine.analytics.profiler import SkillProfiler
from ai_assessment_engine.analytics.role_matcher import RoleMatcher
from ai_assessment_engine.analytics.recommender import LearningRecommender


def test_answer_differentiation_on_same_question():
    """
    Proves Requirement 11:
    Two different answers to the EXACT same question produce different
    AI evaluations, different missing concepts, and different follow-up decisions.
    """
    mock_client = LLMClient(provider="MOCK")
    evaluator = RubricEvaluator(client=mock_client)
    domain = registry.get_domain("system_design")
    concept = domain.get_concept("load_balancing")
    question = concept.foundational_question

    # Student A: Strong, deep, trade-off aware answer
    answer_a = "Layer 7 inspects HTTP headers, URLs, and cookies for smart content routing and SSL termination with slight CPU overhead, whereas Layer 4 routes purely at TCP/IP level with lower latency. In microservices, we use L7 for path routing /auth vs /feed."

    # Student B: Vague, superficial answer omitting trade-offs & mechanics
    answer_b = "Load balancing just shares traffic between servers so one server does not get overloaded."

    eval_a = evaluator.evaluate_response(concept, domain.domain_name, question, answer_a)
    eval_b = evaluator.evaluate_response(concept, domain.domain_name, question, answer_b)

    # 1. Scores must be distinctly different
    assert eval_a.composite_score > eval_b.composite_score
    assert eval_a.composite_score >= 70.0  # Strong mastery
    assert eval_b.composite_score < 70.0   # Needs probe or gap

    # 2. Decisions must be different
    assert eval_a.action_decision == "ADVANCE"
    assert eval_b.action_decision in ["FOLLOW_UP_PROBE", "FLAG_GAP"]

    # 3. Missing concepts diagnostic must be populated for Student B
    assert len(eval_b.missing_concepts) > 0
    assert len(eval_b.weaknesses) > 0

    print("\n[DIFFERENTIATION TEST PASSED]")
    print(f"Student A Score: {eval_a.composite_score}% (Decision: {eval_a.action_decision})")
    print(f"Student B Score: {eval_b.composite_score}% (Decision: {eval_b.action_decision})")
    print(f"Student B Missing Concepts: {eval_b.missing_concepts}")


def test_complete_harini_assessment_flow():
    """Tests end-to-end multi-node assessment session with follow-up probing and gap detection."""
    mock_client = LLMClient(provider="MOCK")
    evaluator = RubricEvaluator(client=mock_client)
    question_gen = QuestionGenerator(client=mock_client)
    manager = AssessmentSessionManager(evaluator=evaluator, question_gen=question_gen)
    
    # 1. Start session for Harini on System Design
    session = manager.create_session(student_name="Harini", domain_id="system_design")
    assert session.session_id is not None
    assert session.current_concept_index == 0

    # 2. Node 1: Load Balancing (Strong answer -> ADVANCE)
    ans_lb = "Layer 7 inspects HTTP headers, URLs, and cookies for smart content routing and SSL termination with slight CPU overhead, whereas Layer 4 routes purely at TCP/IP level with lower latency. In microservices, we use L7 for path routing /auth vs /feed."
    res_lb = manager.process_student_response(session.session_id, ans_lb)
    assert res_lb["status"] == "ADVANCED"
    assert res_lb["evaluation"]["composite_score"] >= 70.0

    # 3. Node 2: Caching (Good answer -> ADVANCE)
    ans_cache = "In Cache-Aside, the application queries cache first and falls back to database on cache miss. In Write-Through, writes are synchronously saved to cache and DB. We use TTL and distributed mutex locks with background warming to prevent cache stampede."
    res_cache = manager.process_student_response(session.session_id, ans_cache)
    assert res_cache["status"] == "ADVANCED"
    assert res_cache["evaluation"]["composite_score"] >= 70.0

    # 4. Node 3: DB Sharding (Partial answer -> triggers follow-up probe -> low score GAP)
    ans_shard_1 = "Horizontal sharding splits database table rows across multiple server instances using a hash of the shard key to distribute write operations."
    res_shard_1 = manager.process_student_response(session.session_id, ans_shard_1)
    assert res_shard_1["status"] == "FOLLOW_UP"

    # Student answers follow-up vaguely
    ans_shard_2 = "When hash distribution becomes uneven, I am not really sure how re-sharding works without downtime, maybe we just manually add more database nodes."
    res_shard_2 = manager.process_student_response(session.session_id, ans_shard_2)
    assert res_shard_2["status"] == "ADVANCED"
    assert res_shard_2["evaluation"]["is_gap"] is True
    assert res_shard_2["evaluation"]["composite_score"] < 60.0

    # 5. Node 4: Scalability (Good answer -> COMPLETED)
    ans_scale = "We achieve horizontal scale by decoupling synchronous REST APIs into event-driven message brokers like Apache Kafka. Kafka consumer groups allow parallel partitioned processing with guaranteed ordering per partition. To isolate downstream failures, we implement resilience patterns including Circuit Breakers (Resilience4j), Bulkheads, and Exponential Backoff with Jitter."
    res_scale = manager.process_student_response(session.session_id, ans_scale)
    assert res_scale["status"] == "COMPLETED"
    assert res_scale["is_completed"] is True

    # 6. Verify Skill Profile & Report Output
    report = SkillProfiler.generate_json_report(session)
    assert report["student_name"] == "Harini"
    
    tree_text = report["ascii_tree"]
    print("\n--- GENERATED TREE REPORT ---")
    print(tree_text)
    assert "Harini" in tree_text
    assert "DB Sharding" in tree_text
    assert "GAP" in tree_text

    # 7. Verify Role Matcher
    role_matches = RoleMatcher.match_all_predefined_roles(session.concept_scores)
    backend_match = next(r for r in role_matches if r.role_id == "backend_swe")
    print(f"\nBackend Role Match: {backend_match.compatibility_score}%, Eligible: {backend_match.is_eligible}")
    assert backend_match.is_eligible is False
    assert any(gap["skill_id"] == "db_sharding" for gap in backend_match.missing_skill_gaps)

    # 8. Verify Personalized Learning Recommendations
    recommendations = LearningRecommender.get_recommendations_for_session(session.domain_id, session.concept_scores)
    assert len(recommendations) >= 1
    assert recommendations[0]["concept_id"] == "db_sharding"
    assert len(recommendations[0]["recommended_courses"]) >= 1


def test_gemini_dynamic_model_discovery_and_candidates():
    """
    Verifies that Gemini candidates prioritize the configured primary model
    and fall back ONLY to models confirmed by models.list(), with zero hardcoded deprecated models
    and zero specialized audio/TTS/embedding models.
    """
    client = LLMClient(provider="MOCK")
    client._discovered_gemini_models = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-preview-tts", "text-embedding-004"]
    client.model_name = "gemini-3.6-flash"
    candidates = client.get_candidate_gemini_models()
    
    assert candidates == ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.5-pro"]
    assert "gemini-2.5-flash-preview-tts" not in candidates
    assert "text-embedding-004" not in candidates
    assert "gemini-1.5-flash" not in candidates
    assert "gemini-2.0-flash" not in candidates


def test_live_gemini_integration_when_configured():
    """
    Live API Integration Test:
    Executes an actual Gemini call only when GEMINI_API_KEY is configured in the environment.
    """
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        pytest.skip("GEMINI_API_KEY not set - skipping live test to preserve offline determinism")

    client = LLMClient(api_key=api_key, provider="GEMINI")
    assert client.provider == "GEMINI"
    assert "LIVE GEMINI" in client.get_current_mode()

    domain = registry.get_domain("system_design")
    concept = domain.get_concept("load_balancing")

    # 1. Question generation
    q_out = client.generate_initial_question(concept, domain.domain_name, concept.prerequisites)
    assert q_out.question and len(q_out.question) > 10

    # 2. Strong answer evaluation
    eval_strong = client.evaluate_answer(
        concept, domain.domain_name, q_out.question,
        "Layer 7 load balancers route based on HTTP headers and URLs with SSL termination, while Layer 4 operates at TCP packet level with wire-speed throughput."
    )
    assert 0.0 <= eval_strong.correctness <= 100.0
    assert 0.0 <= eval_strong.depth <= 100.0
    assert 0.0 <= eval_strong.tradeoff_awareness <= 100.0
    assert 0.0 <= eval_strong.real_world_applicability <= 100.0
    assert len(eval_strong.reasoning) > 0


if __name__ == "__main__":
    test_answer_differentiation_on_same_question()
    test_complete_harini_assessment_flow()
    test_gemini_dynamic_model_discovery_and_candidates()
    print("\n[ALL TESTS PASSED SUCCESSFULLY!]")

