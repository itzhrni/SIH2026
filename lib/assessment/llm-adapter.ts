// lib/assessment/llm-adapter.ts
/**
 * Hybrid LLM Adapter for Adaptive Assessment.
 * Supports:
 * 1. Google Gemini (via GEMINI_API_KEY / GOOGLE_API_KEY) — Primary Live AI
 * 2. Python AI Assessment Engine (http://localhost:8000) — FastAPI Engine Bridge
 * 3. Anthropic Claude (via ANTHROPIC_API_KEY) — Secondary Live AI
 * 4. Deterministic 4D Semantic Rubric Evaluator — Offline & Hackathon Demo Fallback
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type {
  ConceptNode,
  LLMEvaluationResponse,
  NodeEvaluation,
} from "@/types";

const GEMINI_KEY =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const ANTHROPIC_KEY =
  process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "mock-key"
    ? process.env.ANTHROPIC_API_KEY
    : "";
const AI_ENGINE_URL =
  process.env.AI_ENGINE_URL || "http://localhost:8000";

const CLAUDE_MODEL = "claude-sonnet-4-6";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const MAX_TOKENS = 1000;
const TIMEOUT_MS = 12000;

const timeout = <T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`[LLM_TIMEOUT] ${label} exceeded ${ms}ms`)),
        ms,
      ),
    ),
  ]);

const EvaluationSchema = z.object({
  evaluation: z.object({
    correctness: z.number().min(0).max(1),
    depth: z.number().min(0).max(1),
    tradeoffAwareness: z.number().min(0).max(1),
    realWorldApplicability: z.number().min(0).max(1),
    composite: z.number().min(0).max(1),
    status: z.enum(["strong", "partial", "weak"]),
  }),
  next_action: z.enum(["advance", "followup", "mark_gap_advance", "complete"]),
  followup_question: z.string().nullable(),
  reasoning: z.string(),
});

/**
 * Deterministic Semantic Rubric Evaluator (Zero-API Hackathon Fallback).
 * Implements 4-pillar weighted formula: 0.35C + 0.25D + 0.20T + 0.20R.
 */
function evaluateWithSemanticRubric(
  node: ConceptNode,
  question: string,
  answer: string,
): LLMEvaluationResponse {
  const ans = answer.trim().toLowerCase();
  const words = ans.split(/\s+/);
  const wordCount = words.length;

  const extractTokens = (text: string) =>
    new Set(
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2),
    );

  const ansTokens = extractTokens(ans);
  const cTokens = extractTokens(node.rubric.correctness);
  const dTokens = extractTokens(node.rubric.depth);
  const tTokens = extractTokens(node.rubric.tradeoffAwareness);
  const rTokens = extractTokens(node.rubric.realWorldApplicability);

  const overlap = (setB: Set<string>) => {
    let count = 0;
    for (const t of ansTokens) {
      if (setB.has(t)) count++;
    }
    return count;
  };

  const cOverlap = overlap(cTokens);
  const dOverlap = overlap(dTokens);
  const tOverlap = overlap(tTokens);
  const rOverlap = overlap(rTokens);

  // 1. Correctness (0.0–1.0)
  let correctness =
    0.45 + Math.min(cOverlap * 0.12, 0.45) + (wordCount >= 15 ? 0.08 : 0);
  correctness = Math.min(Math.max(correctness, 0.2), 0.96);

  // 2. Depth (0.0–1.0)
  let depth =
    0.35 + Math.min(dOverlap * 0.14, 0.5) + (wordCount >= 25 ? 0.1 : 0);
  depth = Math.min(Math.max(depth, 0.15), 0.92);

  // 3. Trade-off Awareness (0.0–1.0)
  const tradeoffKeywords = [
    "tradeoff",
    "trade-off",
    "latency",
    "overhead",
    "consistency",
    "bottleneck",
    "scale",
    "cost",
    "concurrency",
    "vs",
    "versus",
    "faster",
    "slower",
    "memory",
  ];
  const tHits = tradeoffKeywords.filter((k) => ans.includes(k)).length;
  let tradeoffAwareness =
    0.3 + Math.min(tOverlap * 0.1 + tHits * 0.15, 0.6);
  tradeoffAwareness = Math.min(Math.max(tradeoffAwareness, 0.15), 0.95);

  // 4. Real-World Applicability (0.0–1.0)
  const realKeywords = [
    "production",
    "microservice",
    "redis",
    "database",
    "api",
    "failover",
    "cache",
    "distributed",
    "cloud",
    "throughput",
    "cluster",
  ];
  const rHits = realKeywords.filter((k) => ans.includes(k)).length;
  let realWorldApplicability =
    0.3 + Math.min(rOverlap * 0.1 + rHits * 0.15, 0.6);
  realWorldApplicability = Math.min(Math.max(realWorldApplicability, 0.15), 0.92);

  if (wordCount < 10) {
    correctness = Math.min(correctness, 0.4);
    depth = Math.min(depth, 0.3);
    tradeoffAwareness = Math.min(tradeoffAwareness, 0.25);
    realWorldApplicability = Math.min(realWorldApplicability, 0.25);
  }

  // Composite calculation: 0.35C + 0.25D + 0.20T + 0.20R
  const composite = Number(
    (
      0.35 * correctness +
      0.25 * depth +
      0.2 * tradeoffAwareness +
      0.2 * realWorldApplicability
    ).toFixed(2),
  );

  let status: "strong" | "partial" | "weak" = "partial";
  let nextAction: "advance" | "followup" | "mark_gap_advance" | "complete" =
    "advance";
  let followupQuestion: string | null = null;

  if (composite >= 0.75) {
    status = "strong";
    nextAction = "advance";
  } else if (composite >= 0.45) {
    status = "partial";
    nextAction = "followup";
    followupQuestion = `Can you expand on the operational trade-offs and latency bottlenecks when applying ${node.label} in a high-concurrency production environment?`;
  } else {
    status = "weak";
    nextAction = "mark_gap_advance";
  }

  return {
    evaluation: {
      correctness: Number(correctness.toFixed(2)),
      depth: Number(depth.toFixed(2)),
      tradeoffAwareness: Number(tradeoffAwareness.toFixed(2)),
      realWorldApplicability: Number(realWorldApplicability.toFixed(2)),
      composite,
      status,
    },
    next_action: nextAction,
    followup_question: followupQuestion,
    reasoning: `Deterministic semantic evaluation on ${node.label} (${wordCount} words). Composite score: ${Math.round(composite * 100)}%.`,
  };
}

/**
 * Call Google Gemini REST API.
 */
async function callGemini(
  prompt: string,
  systemInstruction?: string,
  jsonMode = false,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

  const payload: Record<string, unknown> = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: MAX_TOKENS,
      temperature: 0.2,
      ...(jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const res = await timeout(
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
    TIMEOUT_MS,
    "GeminiAPI",
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API HTTP ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty candidate in Gemini response");
  return text.trim();
}

/**
 * Call Anthropic Claude API.
 */
async function callClaude(
  prompt: string,
  systemPrompt?: string,
): Promise<string> {
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
  const response = await timeout(
    anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: MAX_TOKENS,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: [{ role: "user", content: prompt }],
    }),
    TIMEOUT_MS,
    "ClaudeAPI",
  );

  const textBlock = response.content.find((c) => c.type === "text");
  if (!textBlock) throw new Error("No text block in Anthropic response");
  return textBlock.text.trim();
}

/**
 * Generate an assessment question targeting a concept node.
 */
export async function generateQuestion(
  node: ConceptNode,
  isFollowup: boolean,
  priorAnswer?: string,
): Promise<string> {
  const prompt = isFollowup
    ? `The student provided this answer on "${node.label}":\n"${priorAnswer ?? ""}"\n\nGenerate a probing, targeted follow-up question to test their understanding and evaluate depth and trade-offs. Return ONLY the question text.`
    : `Generate a clear, professional technical assessment question for the concept: "${node.label}".
Rubric criteria:
- Correctness: ${node.rubric.correctness}
- Depth: ${node.rubric.depth}
- Trade-off Awareness: ${node.rubric.tradeoffAwareness}
- Real-World Applicability: ${node.rubric.realWorldApplicability}

Ask a question that invites reasoning and trade-off analysis rather than rote memorization. Return ONLY the question text.`;

  // 1. Try Google Gemini if API Key is configured
  if (GEMINI_KEY) {
    try {
      return await callGemini(
        prompt,
        "You are an expert technical interviewer creating adaptive assessment questions.",
      );
    } catch (err) {
      console.warn("[GEMINI_QUESTION_FAIL] Falling back:", err);
    }
  }

  // 2. Try Anthropic Claude if API Key is configured
  if (ANTHROPIC_KEY) {
    try {
      return await callClaude(
        prompt,
        "You are an expert technical interviewer creating adaptive assessment questions.",
      );
    } catch (err) {
      console.warn("[CLAUDE_QUESTION_FAIL] Falling back:", err);
    }
  }

  // 3. Offline / Deterministic Template Question
  return isFollowup
    ? `Can you explain the mechanical trade-offs and real-world failure scenarios for ${node.label}?`
    : `How does ${node.label} work in high-scale systems, and what are the primary architectural trade-offs to consider?`;
}

/**
 * Evaluate a student's answer against the concept node's rubric.
 */
export async function evaluateResponse(
  node: ConceptNode,
  question: string,
  answer: string,
): Promise<LLMEvaluationResponse> {
  const systemPrompt = `You are a technical interviewer evaluating a student's response in an adaptive skill assessment.
Concept: ${node.label}

Rubric:
- Correctness: ${node.rubric.correctness}
- Depth: ${node.rubric.depth}
- Trade-off Awareness: ${node.rubric.tradeoffAwareness}
- Real-World Applicability: ${node.rubric.realWorldApplicability}

Question asked: ${question}
Student answer: ${answer}

Respond ONLY with a valid JSON object. No markdown, no backticks, no preamble. Schema:
{
  "evaluation": {
    "correctness": <0.0–1.0>,
    "depth": <0.0–1.0>,
    "tradeoffAwareness": <0.0–1.0>,
    "realWorldApplicability": <0.0–1.0>,
    "composite": <weighted average 0.0–1.0>,
    "status": <"strong"|"partial"|"weak">
  },
  "next_action": <"advance"|"followup"|"mark_gap_advance"|"complete">,
  "followup_question": <string or null>,
  "reasoning": <one sentence>
}

Thresholds: composite >= 0.75 -> strong/advance. 0.45-0.74 -> partial/followup. < 0.45 -> weak/mark_gap_advance.`;

  // 1. Try Google Gemini (Live AI)
  if (GEMINI_KEY) {
    try {
      const raw = await callGemini(
        `Evaluate this response:\nQuestion: ${question}\nAnswer: ${answer}`,
        systemPrompt,
        true,
      );
      const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      return EvaluationSchema.parse(JSON.parse(clean));
    } catch (err) {
      console.warn("[GEMINI_EVAL_FAIL] Falling back to semantic rubric:", err);
    }
  }

  // 2. Try Anthropic Claude
  if (ANTHROPIC_KEY) {
    try {
      const raw = await callClaude(
        `Evaluate this response:\nQuestion: ${question}\nAnswer: ${answer}`,
        systemPrompt,
      );
      const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      return EvaluationSchema.parse(JSON.parse(clean));
    } catch (err) {
      console.warn("[CLAUDE_EVAL_FAIL] Falling back to semantic rubric:", err);
    }
  }

  // 3. Semantic Rubric Fallback (Offline & Deterministic)
  return evaluateWithSemanticRubric(node, question, answer);
}

/**
 * Generate a high-level gap narrative for the completed session.
 */
export async function generateGapNarrative(
  domain: string,
  nodeResults: Record<string, NodeEvaluation>,
): Promise<string> {
  const prompt = `Summarize the assessment findings for domain "${domain}" given these node evaluation results:
${JSON.stringify(nodeResults, null, 2)}

Provide a concise 2-3 sentence executive assessment of the student's conceptual strengths and primary skill gaps.`;

  if (GEMINI_KEY) {
    try {
      return await callGemini(prompt);
    } catch (err) {
      console.warn("[GEMINI_NARRATIVE_FAIL]", err);
    }
  }

  if (ANTHROPIC_KEY) {
    try {
      return await callClaude(prompt);
    } catch (err) {
      console.warn("[CLAUDE_NARRATIVE_FAIL]", err);
    }
  }

  const strongCount = Object.values(nodeResults).filter(
    (n) => n.composite >= 0.75,
  ).length;
  const totalCount = Object.keys(nodeResults).length;

  return `Candidate demonstrated foundational understanding across ${domain}, mastering ${strongCount} of ${totalCount} assessed concept areas. Review prioritized micro-learning recommendations below.`;
}

