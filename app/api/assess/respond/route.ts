// app/api/assess/respond/route.ts
// POST — Submit a student answer and receive the next question (or completion).
// Evaluates the answer via LLM, persists node results, advances the session.
// Returns RespondResult — null question + isComplete:true when session ends.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { z } from "zod";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { prisma } from "@/lib/db";
import type {
  KnowledgeGraph,
  ConceptNode,
  NodeEvaluation,
  RespondResult,
} from "@/types";

const RequestSchema = z.object({
  sessionId: z.string().min(1),
  conceptNodeId: z.string().min(1),
  answer: z.string().min(1, "Answer cannot be empty"),
  question: z.string().min(1),
  turnIndex: z.number().int().min(0),
});

const BADGE_THRESHOLD = 75; // Domain score ≥ 75 earns a badge

function computeOverallScore(
  nodeResults: Record<string, NodeEvaluation & { status: string }>,
  graph: KnowledgeGraph,
): number {
  const nodes = graph.nodes;
  let totalWeight = 0;
  let weightedScore = 0;

  for (const node of nodes) {
    const result = nodeResults[node.id];
    if (result) {
      weightedScore += result.composite * 100 * node.importance;
      totalWeight += node.importance;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedScore / totalWeight);
}

function selectNextNode(
  graph: KnowledgeGraph,
  nodeResults: Record<string, unknown>,
  currentNodeId: string,
): ConceptNode | null {
  // Find the first untested node that has all dependencies satisfied
  for (const node of graph.nodes) {
    if (nodeResults[node.id]) continue; // already tested
    if (node.id === currentNodeId) continue;
    const depsOk = node.dependencies.every((dep) => nodeResults[dep]);
    if (depsOk) return node;
  }

  // Fallback: any untested node
  for (const node of graph.nodes) {
    if (!nodeResults[node.id] && node.id !== currentNodeId) return node;
  }

  return null; // all nodes tested
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json(apiError("UNAUTHORIZED", "Not authenticated"), {
        status: 401,
      });
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json(apiError("FORBIDDEN", "Insufficient role"), {
        status: 403,
      });
    }

    // 2. Validate
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError(
          "VALIDATION_ERROR",
          parsed.error.issues[0]?.message ?? "Invalid input",
        ),
        { status: 400 },
      );
    }

    const { sessionId, conceptNodeId, answer, question, turnIndex } =
      parsed.data;
    const userId = session.user.id;

    // 3. Load session — verify ownership
    const dbSession = await prisma.assessmentSession.findFirst({
      where: { id: sessionId, userId, status: "in_progress" },
      select: {
        id: true,
        domain: true,
        turnIndex: true,
        graphSnapshot: true,
        nodeResults: true,
      },
    });

    if (!dbSession) {
      return NextResponse.json(
        apiError(
          "NOT_FOUND",
          "Assessment session not found or already completed",
        ),
        { status: 404 },
      );
    }

    // 4. Evaluate answer via LLM
    const graph = dbSession.graphSnapshot as unknown as KnowledgeGraph;
    const currentNode = graph.nodes.find((n) => n.id === conceptNodeId);

    if (!currentNode) {
      return NextResponse.json(
        apiError("VALIDATION_ERROR", "Concept node not found in graph"),
        { status: 400 },
      );
    }

    const { evaluateResponse } = await import("@/lib/assessment/llm-adapter");
    const evalResult = await evaluateResponse(currentNode, question, answer);

    // 5. RULE CW-03 — Optimistic locking: update with turnIndex guard
    const currentResults = (dbSession.nodeResults ?? {}) as unknown as Record<
      string,
      NodeEvaluation & {
        questionAsked: string;
        answerGiven: string;
        status: string;
      }
    >;

    const updatedResults = {
      ...currentResults,
      [conceptNodeId]: {
        ...evalResult.evaluation,
        questionAsked: question,
        answerGiven: answer,
        status: evalResult.evaluation.status,
      },
    };

    // Determine next node
    const nextNode = selectNextNode(graph, updatedResults, conceptNodeId);
    const isComplete =
      nextNode === null ||
      evalResult.next_action === "complete" ||
      // Coverage check: ≥ 70% of nodes assessed
      Object.keys(updatedResults).length >= Math.ceil(graph.nodes.length * 0.7);

    // 6. Handle follow-up vs advance
    let nextQuestion: string | null = null;
    let nextNodeId: string | null = null;
    let nextNodeLabel: string | null = null;

    if (!isComplete) {
      const { generateQuestion } = await import("@/lib/assessment/llm-adapter");

      if (
        evalResult.next_action === "followup" &&
        evalResult.followup_question
      ) {
        // Stay on current node for follow-up
        nextQuestion = evalResult.followup_question;
        nextNodeId = currentNode.id;
        nextNodeLabel = currentNode.label;
      } else {
        // Advance to next node
        const target = nextNode!;
        nextQuestion = await generateQuestion(target, false);
        nextNodeId = target.id;
        nextNodeLabel = target.label;
      }
    }

    // 7. Persist update with atomic turnIndex increment (RULE CW-02)
    const updated = await prisma.assessmentSession.updateMany({
      where: { id: sessionId, turnIndex, userId },
      data: {
        nodeResults: updatedResults as object,
        currentNodeId: nextNodeId,
        turnIndex: { increment: 1 },
        ...(isComplete ? { status: "completed", completedAt: new Date() } : {}),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        apiError(
          "CONFLICT",
          "Session was modified concurrently. Please refresh.",
        ),
        { status: 409 },
      );
    }

    // 8. If complete, generate GapReport + update SkillProfile (idempotent)
    let reportId: string | null = null;

    if (isComplete) {
      // RULE CW-04: idempotent
      const existingReport = await prisma.gapReport.findUnique({
        where: { sessionId },
        select: { id: true },
      });

      if (existingReport) {
        reportId = existingReport.id;
      } else {
        const overallScore = computeOverallScore(
          updatedResults as Record<string, NodeEvaluation & { status: string }>,
          graph,
        );

        const strongNodes = Object.entries(updatedResults)
          .filter(([, v]) => (v as NodeEvaluation).composite >= 0.75)
          .map(([k]) => k);
        const partialNodes = Object.entries(updatedResults)
          .filter(([, v]) => {
            const c = (v as NodeEvaluation).composite;
            return c >= 0.45 && c < 0.75;
          })
          .map(([k]) => k);
        const weakNodes = Object.entries(updatedResults)
          .filter(([, v]) => (v as NodeEvaluation).composite < 0.45)
          .map(([k]) => k);

        const report = await prisma.gapReport.create({
          data: {
            sessionId,
            userId,
            domain: dbSession.domain,
            strongNodes,
            partialNodes,
            weakNodes,
            overallScore,
          },
          select: { id: true },
        });
        reportId = report.id;

        // Update SkillProfile (upsert)
        const badgeEarned = overallScore >= BADGE_THRESHOLD;
        const now = new Date().toISOString();

        const existingProfile = await prisma.skillProfile.findUnique({
          where: { userId },
          select: { id: true, domainScores: true, badges: true },
        });

        const domainScores = (existingProfile?.domainScores ?? {}) as Record<
          string,
          { score: number; lastUpdated: string }
        >;
        const badges = (existingProfile?.badges ?? {}) as Record<
          string,
          { earned: boolean; earnedAt: string | null }
        >;

        domainScores[dbSession.domain] = {
          score: overallScore,
          lastUpdated: now,
        };
        if (badgeEarned && !badges[dbSession.domain]?.earned) {
          badges[dbSession.domain] = { earned: true, earnedAt: now };
        } else if (!badges[dbSession.domain]) {
          badges[dbSession.domain] = { earned: false, earnedAt: null };
        }

        if (existingProfile) {
          await prisma.skillProfile.update({
            where: { userId },
            data: {
              domainScores: domainScores as object,
              badges: badges as object,
            },
          });

          // Append score history
          await prisma.skillScoreHistory.create({
            data: {
              profileId: existingProfile.id,
              domain: dbSession.domain,
              score: overallScore,
              sessionId,
            },
          });
        } else {
          const profile = await prisma.skillProfile.create({
            data: {
              userId,
              domainScores: domainScores as object,
              badges: badges as object,
            },
            select: { id: true },
          });

          await prisma.skillScoreHistory.create({
            data: {
              profileId: profile.id,
              domain: dbSession.domain,
              score: overallScore,
              sessionId,
            },
          });
        }
      }
    }

    const result: RespondResult = {
      question: nextQuestion,
      conceptNodeId: nextNodeId,
      conceptNodeLabel: nextNodeLabel,
      turnIndex: turnIndex + 1,
      totalNodes: graph.nodes.length,
      isComplete,
      reportId,
    };

    return NextResponse.json(apiSuccess(result), { status: 200 });
  } catch (err) {
    console.error("[POST /api/assess/respond]", err);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Something went wrong evaluating your answer"),
      { status: 500 },
    );
  }
}
