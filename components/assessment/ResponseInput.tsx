"use client";

// components/assessment/ResponseInput.tsx
// Response input area for assessment session adhering strictly to UI_UX_SPEC.md §5.5 & §10.

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";

interface ResponseInputProps {
  onSubmit: (answer: string) => Promise<void> | void;
  isLoading: boolean;
}

export function ResponseInput({ onSubmit, isLoading }: ResponseInputProps) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isLoading) return;
    onSubmit(answer.trim());
    setAnswer("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-border bg-card p-4"
    >
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={isLoading}
        placeholder="Type your answer here... Provide conceptual reasoning, trade-offs, and practical considerations."
        className="min-h-[140px] resize-none border-0 bg-transparent p-0 text-base text-foreground placeholder:text-foreground-subtle focus-visible:ring-0 focus-visible:ring-offset-0"
      />

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <p className="text-xs text-foreground-subtle">
          Explain your reasoning clearly. Depth and trade-offs are evaluated.
        </p>

        <Button
          type="submit"
          size="sm"
          disabled={isLoading || !answer.trim()}
          className="h-8 gap-1.5 bg-primary text-white hover:bg-primary-hover"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Evaluating...
            </>
          ) : (
            <>
              Submit Answer
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
