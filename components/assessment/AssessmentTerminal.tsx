"use client";

// components/assessment/AssessmentTerminal.tsx
// Live assessment terminal managing turn-by-turn question display and response evaluation.
// Strictly adheres to UI_UX_SPEC.md §5.5, §7.1, §10, and §13.

import React, { useState } from "react";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { ResponseInput } from "@/components/assessment/ResponseInput";
import { GapReport } from "@/components/assessment/GapReport";
import type { GapReportData } from "@/types";

interface AssessmentTerminalProps {
  sessionId: string;
  domain: string;
  initialQuestion: string;
  initialConceptNodeId: string;
  initialConceptNodeLabel: string;
  initialTurnIndex: number;
  totalNodes: number;
}

export function AssessmentTerminal({
  sessionId,
  domain,
  initialQuestion,
  initialConceptNodeId,
  initialConceptNodeLabel,
  initialTurnIndex,
  totalNodes,
}: AssessmentTerminalProps) {
  const [question, setQuestion] = useState(initialQuestion);
  const [conceptNodeId, setConceptNodeId] = useState(initialConceptNodeId);
  const [conceptNodeLabel, setConceptNodeLabel] = useState(
    initialConceptNodeLabel,
  );
  const [turnIndex, setTurnIndex] = useState(initialTurnIndex);
  const [isFollowup, setIsFollowup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Completion state
  const [isComplete, setIsComplete] = useState(false);
  const [gapReport, setGapReport] = useState<GapReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Progress calculation
  const safeTotal = Math.max(totalNodes, 1);
  const progressPercent = Math.min(
    Math.round(((turnIndex + 1) / (safeTotal * 1.2)) * 100),
    95,
  );

  const handleSubmitAnswer = async (answerText: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/assess/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          conceptNodeId,
          answer: answerText,
          question,
          turnIndex,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setErrorMsg(
          json.error?.message ??
            "Evaluation failed. Please try submitting again.",
        );
        setIsLoading(false);
        return;
      }

      const data = json.data;

      if (data.isComplete && data.reportId) {
        setIsComplete(true);
        setReportLoading(true);

        // Fetch final gap report
        const repRes = await fetch(`/api/assess/report/${data.reportId}`);
        const repJson = await repRes.json();
        if (repJson.success) {
          setGapReport(repJson.data);
        } else {
          setErrorMsg("Assessment finished, but failed to load gap report.");
        }
        setReportLoading(false);
      } else {
        // Next question
        setQuestion(data.question ?? "");
        setConceptNodeId(data.conceptNodeId ?? "");
        setConceptNodeLabel(data.conceptNodeLabel ?? "");
        setTurnIndex(data.turnIndex);
        setIsFollowup(data.conceptNodeId === conceptNodeId);
      }
    } catch {
      setErrorMsg("Network error while evaluating response. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    if (reportLoading || !gapReport) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-3">
          <p className="text-lg font-semibold text-foreground">
            Analyzing Assessment Performance
          </p>
          <p className="text-sm text-foreground-muted">
            Generating conceptual gap report and updating your verified
            SkillLedger profile...
          </p>
        </div>
      );
    }

    return <GapReport report={gapReport} />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-4">
      {/* Session header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
              Assessment · {domain.toUpperCase()}
            </p>
            <h1 className="text-2xl font-semibold text-foreground mt-0.5">
              Question {turnIndex + 1}
            </h1>
          </div>
          <span className="text-sm text-foreground-muted tabular-nums">
            {progressPercent}% estimated
          </span>
        </div>

        {/* Linear progress bar — cobalt, transition-all duration-300 ease-out */}
        <div
          className="h-1 w-full rounded-full bg-border"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-1 rounded-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-md border border-destructive-border bg-destructive-bg p-3 text-xs text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Question Card */}
      <QuestionCard
        question={question}
        conceptNodeLabel={conceptNodeLabel}
        isFollowup={isFollowup}
      />

      {/* Response Input */}
      <ResponseInput onSubmit={handleSubmitAnswer} isLoading={isLoading} />
    </div>
  );
}
