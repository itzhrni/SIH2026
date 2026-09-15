"use client";

// components/assessment/ResponseInput.tsx
// Response input area supporting both Interactive Scenario MCQs and Free-Text response.
// Strictly adheres to UI_UX_SPEC.md §5.5 & §10.

import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, CheckCircle2, Sparkles, PenLine } from "lucide-react";

interface ResponseInputProps {
  onSubmit: (answer: string) => Promise<void> | void;
  isLoading: boolean;
  conceptNodeId?: string;
  conceptNodeLabel?: string;
}

interface McqOption {
  key: string;
  title: string;
  text: string;
  tradeoffHighlight: string;
}

// Map domain concepts to high-impact architectural / clinical trade-off options
function getContextualMcqs(conceptId?: string, conceptLabel?: string): McqOption[] {
  const id = (conceptId || "").toLowerCase();
  const label = (conceptLabel || "").toLowerCase();

  if (id.includes("load") || label.includes("load") || label.includes("balancing")) {
    return [
      {
        key: "A",
        title: "Layer 7 Application Load Balancer with Least Connections",
        text: "Deploy Layer 7 ALB (like NGINX/Envoy) using the Least Connections algorithm with active health checks. Trade-off: Higher CPU overhead for TLS termination and HTTP header parsing vs Layer 4 TCP proxying, but ensures optimal distribution for long-lived WebSocket and REST connections.",
        tradeoffHighlight: "Optimal Trade-off: High routing precision vs slight CPU overhead",
      },
      {
        key: "B",
        title: "DNS-Based Round Robin Routing",
        text: "Use DNS Round Robin to distribute client traffic across multiple server public IPs. Trade-off: Extremely simple and zero proxy infrastructure cost, but cannot detect sudden server crashes or route around unbalanced client session durations.",
        tradeoffHighlight: "Simpler setup, but zero dynamic health detection",
      },
      {
        key: "C",
        title: "Single Reverse Proxy Instance",
        text: "Direct all traffic through a single standalone reverse proxy with standard round-robin routing. Trade-off: Low deployment complexity, but creates a single point of failure (SPOF) and bottleneck during flash traffic spikes.",
        tradeoffHighlight: "Naive Approach: Creates single point of failure (SPOF)",
      },
      {
        key: "D",
        title: "Direct Client-to-Server Hardcoded Routing",
        text: "Clients connect directly to fixed server IPs with random client-side selection. Trade-off: Eliminates load balancer cost, but offers zero failover resilience and requires client app updates when servers scale.",
        tradeoffHighlight: "Suboptimal: Zero scalability and high failure rate",
      },
    ];
  }

  if (id.includes("cach") || label.includes("cach")) {
    return [
      {
        key: "A",
        title: "Cache-Aside with Redis & Jittered TTLs",
        text: "Implement Cache-Aside with a Redis cluster and jittered TTLs. When querying, check Redis first; on a miss, read from the database and populate cache with randomized TTL to avoid Cache Stampede. Trade-off: Potential short-lived stale reads vs minimizing write-latency overhead on database updates.",
        tradeoffHighlight: "Optimal: Prevents cache stampede & optimizes write throughput",
      },
      {
        key: "B",
        title: "Write-Through Caching Pattern",
        text: "Use Write-Through caching where every write updates both Redis and the database synchronously. Trade-off: Guarantees 100% data consistency for subsequent reads, but introduces higher write latency and storage overhead on updates.",
        tradeoffHighlight: "100% read consistency at the cost of higher write latency",
      },
      {
        key: "C",
        title: "Local In-Memory Cache (RAM / Guava)",
        text: "Store frequent query responses directly inside application pod memory (RAM). Trade-off: Near-zero network latency, but causes inconsistent state across load-balanced pods and high memory footprint per container.",
        tradeoffHighlight: "Zero latency, but creates inconsistent cross-pod state",
      },
      {
        key: "D",
        title: "Bypass Caching with Database Read Replicas",
        text: "Route all queries directly to read-replica database nodes without a cache layer. Trade-off: Eliminates cache invalidation bugs, but risks database connection exhaustion under 100k+ QPS read surges.",
        tradeoffHighlight: "No cache bugs, but risks database connection exhaustion",
      },
    ];
  }

  if (id.includes("shard") || label.includes("shard") || label.includes("database")) {
    return [
      {
        key: "A",
        title: "Horizontal Sharding via Consistent Hashing on UserID",
        text: "Horizontally partition the database across multiple physical database instances using consistent hashing on UserID. Trade-off: Scales write throughput linearly, but makes cross-shard JOINs and distributed transactions (2PC) complex and latency-heavy.",
        tradeoffHighlight: "Optimal: Linear write scale vs cross-shard join complexity",
      },
      {
        key: "B",
        title: "Range-Based Sharding on Timestamp",
        text: "Partition database tables into shards based on creation timestamp or date range. Trade-off: Simplifies historical range queries, but all write traffic hits only the latest shard, creating an acute write hot-spot bottleneck.",
        tradeoffHighlight: "Easy time queries, but causes write hot-spot bottlenecks",
      },
      {
        key: "C",
        title: "Vertical Sharding (Table-Level Separation)",
        text: "Split different business domain tables (Users, Orders, Payments) into separate databases. Trade-off: Clean domain separation, but fails to solve write scalability if a single table grows to billions of rows.",
        tradeoffHighlight: "Domain isolation, but doesn't scale single high-volume tables",
      },
      {
        key: "D",
        title: "Monolithic DB with Vertical Hardware Scaling",
        text: "Upgrade primary database instance RAM and CPU without partitioning. Trade-off: Zero application complexity and simple SQL queries, but hits physical hardware throughput and cost ceilings.",
        tradeoffHighlight: "Simple queries, but reaches physical hardware ceiling",
      },
    ];
  }

  if (id.includes("ayush") || label.includes("ayush") || label.includes("pharma") || label.includes("dravya") || label.includes("rasa")) {
    return [
      {
        key: "A",
        title: "Classical Rasayana Formulation with Appropriate Anupana (Vehicle)",
        text: "Administer Ashwagandha (Withania somnifera) as a Rasayana targeting Vata-Kapha balance, using warm milk or ghee as the lipid vehicle (Anupana) to enhance withanolide bioavailability. Trade-off: Maximizes therapeutic efficacy, but requires clinical screening for Pitta aggravation and contraindications with allopathic sedatives.",
        tradeoffHighlight: "Optimal: Maximizes bioavailability with clinical safety checks",
      },
      {
        key: "B",
        title: "High-Potency Isolated Synthetic Withanolides",
        text: "Use highly concentrated isolated withanolides in pill form. Trade-off: Standardized biochemical dosage, but loses the holistic multi-alkaloid synergy and digestive tolerance provided by classical full-spectrum roots.",
        tradeoffHighlight: "Standardized potency, but loses holistic herbal synergy",
      },
      {
        key: "C",
        title: "Generic Over-the-Counter Raw Churna",
        text: "Prescribe standardized raw powder without adjusting for the patient's individual Prakriti (constitution) or Agni (digestive fire). Trade-off: Low cost and widely accessible, but risks digestive heaviness (Ama) in low-metabolism patients.",
        tradeoffHighlight: "Accessible, but ignores individual metabolic constitution",
      },
      {
        key: "D",
        title: "Unpurified Mineral/Herbal Preparation without Shodhana",
        text: "Administer raw compound without classical Shodhana (purification and detoxification protocols). Trade-off: Faster preparation time, but creates severe toxicity risks and violates Ayurvedic Pharmacopoeia (API) safety standards.",
        tradeoffHighlight: "Suboptimal: Violates safety standards and risks toxicity",
      },
    ];
  }

  // Fallback high-impact trade-off options for any technical / domain concept
  const conceptName = conceptLabel || "this concept";
  return [
    {
      key: "A",
      title: `Optimal Production Implementation of ${conceptName}`,
      text: `Implement ${conceptName} using industry best-practices with decoupling, automated failover, and telemetry monitoring. Trade-off: Balances performance and resilience against operational complexity and initial setup overhead.`,
      tradeoffHighlight: "Production Optimal: Maximum resilience & scalability",
    },
    {
      key: "B",
      title: `Low-Complexity Lightweight Pattern for ${conceptName}`,
      text: `Apply a simplified baseline implementation of ${conceptName} focused on minimal infrastructure cost and rapid deployment. Trade-off: Fast time-to-market, but requires re-architecting under 10x traffic surges.`,
      tradeoffHighlight: "Fast deployment, but requires re-architecture at scale",
    },
    {
      key: "C",
      title: `Strict Consistency First Strategy for ${conceptName}`,
      text: `Prioritize strong data consistency and synchronous verification across all nodes. Trade-off: Prevents race conditions and data drift, but increases end-to-end user latency during peak concurrency.`,
      tradeoffHighlight: "Guaranteed consistency at the cost of higher latency",
    },
    {
      key: "D",
      title: `Monolithic Traditional Approach for ${conceptName}`,
      text: `Rely on standard synchronous processing without distributed caching or asynchronous queues. Trade-off: Simple to debug locally, but prone to cascading timeouts and database saturation.`,
      tradeoffHighlight: "Simple debugging, but susceptible to cascading timeouts",
    },
  ];
}

export function ResponseInput({
  onSubmit,
  isLoading,
  conceptNodeId,
  conceptNodeLabel,
}: ResponseInputProps) {
  const [mode, setMode] = useState<"mcq" | "text">("mcq");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");

  const mcqOptions = getContextualMcqs(conceptNodeId, conceptNodeLabel);

  // Reset selected option when concept changes
  useEffect(() => {
    setSelectedOption(null);
    setAnswer("");
  }, [conceptNodeId, conceptNodeLabel]);

  const handleSelectOption = (opt: McqOption) => {
    setSelectedOption(opt.key);
    setAnswer(opt.text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isLoading) return;
    onSubmit(answer.trim());
    setAnswer("");
    setSelectedOption(null);
  };

  return (
    <div className="space-y-3">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-md bg-muted/60 p-1 border border-border">
          <button
            type="button"
            onClick={() => setMode("mcq")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
              mode === "mcq"
                ? "bg-primary text-white shadow-xs"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            Scenario MCQs (Fast Choice)
          </button>
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
              mode === "text"
                ? "bg-primary text-white shadow-xs"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            <PenLine className="h-3 w-3" />
            Free-Text Response
          </button>
        </div>

        <span className="text-2xs text-foreground-subtle hidden sm:inline">
          {mode === "mcq"
            ? "Click an option to test trade-off reasoning"
            : "Type custom reasoning"}
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-md border border-border bg-card p-4 space-y-3"
      >
        {mode === "mcq" ? (
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-foreground-muted mb-1">
              Select the optimal engineering/clinical strategy for this scenario:
            </p>

            <div className="grid grid-cols-1 gap-2">
              {mcqOptions.map((opt) => {
                const isSelected = selectedOption === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSelectOption(opt)}
                    className={`text-left p-3 rounded-md border transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary-subtle/30 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-xs font-semibold ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-muted text-foreground-muted border border-border"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-foreground">
                            {opt.title}
                          </h4>
                          {isSelected && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-foreground-muted leading-relaxed line-clamp-2">
                          {opt.text}
                        </p>
                        <span className="inline-block text-2xs font-medium text-primary">
                          ↳ {opt.tradeoffHighlight}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isLoading}
            placeholder="Type your answer here... Provide conceptual reasoning, trade-offs, and practical considerations."
            className="min-h-[140px] resize-none border-0 bg-transparent p-0 text-base text-foreground placeholder:text-foreground-subtle focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        )}

        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-xs text-foreground-subtle">
            {mode === "mcq"
              ? selectedOption
                ? `Option (${selectedOption}) selected. Click Submit to evaluate.`
                : "Select an option to evaluate."
              : "Explain your reasoning clearly. Depth and trade-offs are evaluated."}
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
    </div>
  );
}

