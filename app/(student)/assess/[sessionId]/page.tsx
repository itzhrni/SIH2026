// app/(student)/assess/[sessionId]/page.tsx
// Server component hosting the live assessment session terminal.
// RULE FE-01: Server Component.
// RULE FE-03: Direct async/await data fetching with Prisma.

import React from "react";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { prisma } from "@/lib/db";
import { AssessmentTerminal } from "@/components/assessment/AssessmentTerminal";
import { GapReport } from "@/components/assessment/GapReport";
import { getResourcesForNodes } from "@/lib/learning/resources";
import { generateQuestion } from "@/lib/assessment/llm-adapter";
import type { KnowledgeGraph, GapReportData } from "@/types";

interface PageProps {
  params: {
    sessionId: string;
  };
}

export default async function LiveAssessmentSessionPage({ params }: PageProps) {
  const userSession = await getServerSession(nextAuthConfig);
  if (!userSession || !userSession.user) {
    redirect("/login");
  }

  const userId = userSession.user.id;
  const { sessionId } = params;

  // 1. Fetch the assessment session
  const dbSession = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
    include: { gapReport: true },
  });

  if (!dbSession || dbSession.userId !== userId) {
    notFound();
  }

  // 2. If already completed, show the gap report directly
  if (dbSession.status === "completed" && dbSession.gapReport) {
    const report = dbSession.gapReport;
    const weakNodes = report.weakNodes as string[];
    const partialNodes = report.partialNodes as string[];
    const gapNodes = [...weakNodes, ...partialNodes];
    const learningResources = getResourcesForNodes(gapNodes);

    const reportData: GapReportData = {
      id: report.id,
      domain: report.domain,
      overallScore: report.overallScore,
      strongNodes: report.strongNodes as string[],
      partialNodes,
      weakNodes,
      learningResources,
    };

    return <GapReport report={reportData} />;
  }

  // 3. Active session: resolve current concept node and generate/fetch question
  const graph = dbSession.graphSnapshot as unknown as KnowledgeGraph;
  const currentNodeId = dbSession.currentNodeId ?? graph.nodes[0].id;
  const currentNode =
    graph.nodes.find((n) => n.id === currentNodeId) ?? graph.nodes[0];

  const question = await generateQuestion(currentNode, false);

  return (
    <AssessmentTerminal
      sessionId={dbSession.id}
      domain={dbSession.domain}
      initialQuestion={question}
      initialConceptNodeId={currentNode.id}
      initialConceptNodeLabel={currentNode.label}
      initialTurnIndex={dbSession.turnIndex}
      totalNodes={graph.nodes.length}
    />
  );
}
