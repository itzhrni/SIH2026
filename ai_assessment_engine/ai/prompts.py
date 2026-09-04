"""
Prompt Templates for Adaptive AI Assessment Engine.
"""

SYSTEM_ASSESSOR_PROMPT = """You are the Senior Technical Assessor and Domain Evaluator for the Academia-Industry Collaboration Platform (SIH 2026).
Your role is to conduct rigorous, pedigree-free, evidence-based skill evaluations.

Evaluation Philosophy:
1. Do NOT give high scores merely for technical jargon or vocabulary.
2. Evaluate genuine mechanical depth: Does the student explain HOW and WHY systems work, or just list names?
3. Evaluate trade-off awareness: Can the student reason about latency vs throughput, consistency vs availability, CPU overhead, or failure modes?
4. Evaluate real-world applicability: Can the student apply this concept to realistic high-scale production scenarios or industry standards?

You must always output valid, clean JSON matching the requested schema.
"""

EVALUATION_PROMPT_TEMPLATE = """Evaluate the student's response for the concept '{concept_name}' in domain '{domain_name}'.

CONCEPT DETAILS:
- Description: {concept_description}
- Correctness Rubric: {correctness_rubric}
- Depth Rubric: {depth_rubric}
- Trade-offs Rubric: {tradeoff_rubric}
- Real-World Applicability Rubric: {applicability_rubric}
- Known Sub-Gaps Taxonomy: {sub_gaps_taxonomy}

QUESTION ASKED:
{question}

STUDENT'S ANSWER:
{student_answer}

INSTRUCTIONS:
1. Grade each of the 4 dimensions independently on a scale of 0.0 to 100.0:
   - correctness: Factual accuracy against the rubric.
   - depth: Mechanical and theoretical understanding.
   - tradeoff_awareness: Awareness of alternatives, latency, failure modes.
   - real_world_applicability: Practical production edge-case handling.
2. List specific 'strengths' (what the student understood well).
3. List specific 'weaknesses' (where the student was vague or flawed).
4. List specific 'missing_concepts' (critical sub-concepts or trade-offs omitted).
5. Provide clear 'reasoning' explaining the diagnosis.

Output strictly valid JSON matching this schema:
{{
  "correctness": 85.0,
  "depth": 75.0,
  "tradeoff_awareness": 60.0,
  "real_world_applicability": 70.0,
  "strengths": ["...", "..."],
  "weaknesses": ["..."],
  "missing_concepts": ["..."],
  "reasoning": "..."
}}
"""

INITIAL_QUESTION_PROMPT_TEMPLATE = """Generate an adaptive, high-quality assessment question for the concept '{concept_name}' in domain '{domain_name}'.

CONCEPT INFORMATION:
- Description: {concept_description}
- Prerequisites in Graph: {prerequisites}
- Correctness Benchmark: {correctness_rubric}
- Depth Benchmark: {depth_rubric}
- Trade-off Benchmark: {tradeoff_rubric}
- Real-World Scenario: {applicability_rubric}

STUDENT CONTEXT:
- Previous Assessment History: {history_context}
- Previously Detected Weaknesses: {prior_weaknesses}

INSTRUCTIONS:
Craft an engaging, scenario-driven question that tests foundational understanding while prompting the student to explain underlying mechanics and trade-offs.
If the student had prior weaknesses in related concepts, subtly challenge them on connected principles.

Output strictly valid JSON matching this schema:
{{
  "question": "Your question here...",
  "focus_concept": "{concept_name}",
  "expected_depth_areas": ["point 1", "point 2"]
}}
"""

FOLLOW_UP_PROMPT_TEMPLATE = """The student gave a partial/vague answer on '{concept_name}'. Generate a targeted follow-up probing question to assess their depth on the missing concept.

ORIGINAL QUESTION:
{original_question}

STUDENT'S ANSWER:
{student_answer}

EVALUATION DIAGNOSTICS:
- Strengths: {strengths}
- Weaknesses: {weaknesses}
- Missing Concepts / Omissions: {missing_concepts}
- Trade-off Rubric: {tradeoff_rubric}

INSTRUCTIONS:
Craft a focused follow-up question that directly probes ONE of the missing concepts or unaddressed trade-offs identified above.
Do NOT give away the answer. Probe their reasoning (e.g., 'What happens when...', 'How would you handle...').

Output strictly valid JSON matching this schema:
{{
  "follow_up_question": "Your targeted probing question...",
  "targeted_missing_concept": "The specific missing concept probed",
  "rationale": "Reason for selecting this probe based on the student's omission"
}}
"""
