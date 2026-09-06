// components/assessment/QuestionCard.tsx
import React from "react";
import { BrainCircuit } from "lucide-react";

interface QuestionCardProps {
  question: string;
  conceptNodeLabel?: string;
  isFollowup?: boolean;
}

export function QuestionCard({
  question,
  conceptNodeLabel,
  isFollowup,
}: QuestionCardProps) {
  return (
    <div className="space-y-3">
      <div
        className="rounded-md border border-border bg-card p-5"
        role="region"
        aria-label="Assessment Question"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-primary-subtle">
            <BrainCircuit className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex-1">
            {isFollowup && (
              <span className="mb-1.5 inline-block text-2xs font-medium uppercase tracking-wider text-warning">
                Targeted Follow-up Question
              </span>
            )}
            <p className="text-base leading-relaxed text-foreground">
              {question}
            </p>
          </div>
        </div>
      </div>

      {conceptNodeLabel && (
        <p className="text-center text-xs text-foreground-subtle">
          Assessing Concept:{" "}
          <span className="font-medium text-foreground-muted">
            {conceptNodeLabel}
          </span>
        </p>
      )}
    </div>
  );
}
