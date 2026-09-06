// lib/assessment/llm-adapter.ts
/**
 * Anthropic Claude adapter for adaptive assessment.
 * RULE LIB-03: All Anthropic API calls are routed through this file.
 * RULE LLM-01: 12-second timeout wrapper via Promise.race.
 * RULE LLM-02: Safe fallback on timeout or error.
 * RULE LLM-03: Single retry on parse failure before falling back.
 * RULE LLM-04: Model string 'claude-sonnet-4-6'.
 * RULE LLM-05: max_tokens: 1000.
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type {
  ConceptNode,
  LLMEvaluationResponse,
  NodeEvaluation,
} from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "mock-key",
});

const MODEL = "claude-sonnet-4-6";
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

const SAFE_FALLBACK_EVALUATION: LLMEvaluationResponse = {
  evaluation: {
    correctness: 0.5,
    depth: 0.5,
    tradeoffAwareness: 0.5,
    realWorldApplicability: 0.5,
    composite: 0.5,
    status: "partial",
  },
  next_action: "advance",
  followup_question: null,
  reasoning: "Safe fallback applied due to timeout or parse failure.",
};

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

  try {
    const response = await timeout(
      anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: "user", content: prompt }],
      }),
      TIMEOUT_MS,
      "generateQuestion",
    );

    const textContent = response.content.find((c) => c.type === "text");
    return textContent
      ? textContent.text.trim()
      : `Explain the core concepts and trade-offs of ${node.label}.`;
  } catch (err) {
    console.error("[LLM_TIMEOUT or ERROR] generateQuestion:", err);
    return `Can you explain the key mechanisms, trade-offs, and practical application of ${node.label}?`;
  }
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

  const runCall = async (): Promise<LLMEvaluationResponse> => {
    const response = await timeout(
      anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: "user", content: systemPrompt }],
      }),
      TIMEOUT_MS,
      "evaluateResponse",
    );

    const textBlock = response.content.find((c) => c.type === "text");
    if (!textBlock) throw new Error("No text in LLM response");

    const cleanText = textBlock.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsedJson = JSON.parse(cleanText);
    return EvaluationSchema.parse(parsedJson);
  };

  try {
    return await runCall();
  } catch (firstErr) {
    console.warn(
      "[LLM_RETRY] evaluateResponse first attempt failed, retrying once:",
      firstErr,
    );
    try {
      return await runCall();
    } catch (secondErr) {
      console.error(
        "[LLM_TIMEOUT or PARSE_ERROR] evaluateResponse failed twice, using safe fallback:",
        secondErr,
      );
      return SAFE_FALLBACK_EVALUATION;
    }
  }
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

  try {
    const response = await timeout(
      anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: "user", content: prompt }],
      }),
      TIMEOUT_MS,
      "generateGapNarrative",
    );

    const text = response.content.find((c) => c.type === "text")?.text;
    return text
      ? text.trim()
      : "Assessment completed successfully. Review concept gaps below.";
  } catch (err) {
    console.error("[LLM_TIMEOUT or ERROR] generateGapNarrative:", err);
    return "Assessment completed. Concept breakdown and targeted recommendations are listed below.";
  }
}
