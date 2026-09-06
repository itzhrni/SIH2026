// app/api/assess/start/route.ts
// POST — Start or resume an assessment session for a given domain.
// Checks for existing in_progress session (RULE CW-01) before creating.
// Calls lib/assessment/engine.ts to initialise and generate first question.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { z } from "zod";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { prisma } from "@/lib/db";
import type { KnowledgeGraph, StartSessionResult } from "@/types";
import { promises as fs } from "fs";
import path from "path";

const VALID_DOMAINS = [
  "dsa",
  "system-design",
  "machine-learning",
  "ml",
  "core-cs",
  "ayurvedic-pharmacology",
  "clinical-practice",
] as const;

type DomainKey = (typeof VALID_DOMAINS)[number];

const RequestSchema = z.object({
  domain: z.enum(VALID_DOMAINS),
});

async function loadKnowledgeGraph(domain: DomainKey): Promise<KnowledgeGraph> {
  const filename = domain === "machine-learning" ? "ml" : domain;
  const filePath = path.join(
    process.cwd(),
    "data",
    "knowledge-graphs",
    `${filename}.json`,
  );
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as KnowledgeGraph;
}

async function generateOpeningQuestion(
  graph: KnowledgeGraph,
): Promise<{ question: string; nodeId: string; nodeLabel: string }> {
  // Find the first foundational node (no dependencies, or lowest importance threshold)
  const foundational =
    graph.nodes.find((n) => n.dependencies.length === 0) ?? graph.nodes[0];

  // Dynamically import llm-adapter to keep the route thin
  const { generateQuestion } = await import("@/lib/assessment/llm-adapter");
  const question = await generateQuestion(foundational, false);

  return {
    question,
    nodeId: foundational.id,
    nodeLabel: foundational.label,
  };
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

    // 2. Role check
    if (session.user.role !== "STUDENT") {
      return NextResponse.json(
        apiError("FORBIDDEN", "Only students can take assessments"),
        { status: 403 },
      );
    }

    // 3. Validate
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

    const { domain } = parsed.data;
    const userId = session.user.id;

    // 4. RULE CW-01 — Check for existing in_progress session
    const existing = await prisma.assessmentSession.findFirst({
      where: { userId, domain, status: "in_progress" },
      select: {
        id: true,
        currentNodeId: true,
        turnIndex: true,
        graphSnapshot: true,
      },
    });

    if (existing) {
      const graph = existing.graphSnapshot as unknown as KnowledgeGraph;
      const currentNode =
        graph.nodes.find((n) => n.id === existing.currentNodeId) ??
        graph.nodes[0];

      // Regenerate question for the current node to resume
      const { generateQuestion } = await import("@/lib/assessment/llm-adapter");
      const question = await generateQuestion(currentNode, false);

      const result: StartSessionResult = {
        sessionId: existing.id,
        question,
        conceptNodeId: currentNode.id,
        conceptNodeLabel: currentNode.label,
        turnIndex: existing.turnIndex,
        totalNodes: graph.nodes.length,
        resumed: true,
      };
      return NextResponse.json(apiSuccess(result), { status: 200 });
    }

    // 5. Load knowledge graph + create new session
    const graph = await loadKnowledgeGraph(domain);
    const { question, nodeId, nodeLabel } =
      await generateOpeningQuestion(graph);

    const newSession = await prisma.assessmentSession.create({
      data: {
        userId,
        domain,
        status: "in_progress",
        currentNodeId: nodeId,
        turnIndex: 0,
        graphSnapshot: graph as object,
        nodeResults: {},
      },
      select: { id: true, turnIndex: true },
    });

    const result: StartSessionResult = {
      sessionId: newSession.id,
      question,
      conceptNodeId: nodeId,
      conceptNodeLabel: nodeLabel,
      turnIndex: newSession.turnIndex,
      totalNodes: graph.nodes.length,
      resumed: false,
    };

    return NextResponse.json(apiSuccess(result), { status: 200 });
  } catch (err) {
    console.error("[POST /api/assess/start]", err);
    return NextResponse.json(
      apiError(
        "INTERNAL_ERROR",
        "Something went wrong starting the assessment",
      ),
      { status: 500 },
    );
  }
}
