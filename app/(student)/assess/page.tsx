"use client";

// app/(student)/assess/page.tsx
// Assessment domain selection screen and completed gap report viewer.
// M4 deliverable: Domain selection screen connecting to live assessment engine.

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GapReport } from "@/components/assessment/GapReport";
import { BrainCircuit, Loader2, ArrowRight, CheckCircle2, Sparkles, Zap, ShieldCheck } from "lucide-react";
import type { GapReportData } from "@/types";

interface DomainCard {
  id: string;
  name: string;
  category: "Engineering & IT" | "AYUSH";
  description: string;
  topics: string[];
  nodesCount: number;
}

const DOMAINS: DomainCard[] = [
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    category: "Engineering & IT",
    description:
      "Arrays, linked lists, trees, graphs, dynamic programming, and computational complexity trade-offs.",
    topics: [
      "Sorting & Searching",
      "Trees & Graphs",
      "Dynamic Programming",
      "Complexity Analysis",
    ],
    nodesCount: 5,
  },
  {
    id: "system-design",
    name: "System Design & Distributed Systems",
    category: "Engineering & IT",
    description:
      "Scalable architecture, layer-7 load balancing, distributed caching, database sharding, and resilience.",
    topics: [
      "Load Balancing",
      "Caching & CDNs",
      "Database Sharding",
      "Microservices",
    ],
    nodesCount: 5,
  },
  {
    id: "machine-learning",
    name: "Machine Learning & Data Science",
    category: "Engineering & IT",
    description:
      "Supervised/unsupervised learning, validation metrics, feature engineering, and neural network architectures.",
    topics: [
      "Model Evaluation",
      "Feature Engineering",
      "Neural Networks",
      "Clustering",
    ],
    nodesCount: 4,
  },
  {
    id: "core-cs",
    name: "Core Computer Science & Systems",
    category: "Engineering & IT",
    description:
      "Operating systems, computer networks, database normalization, concurrency control, and deadlock detection.",
    topics: [
      "OS Processes",
      "Networking Basics",
      "Database Normalization",
      "Concurrency",
    ],
    nodesCount: 4,
  },
  {
    id: "ayurvedic-pharmacology",
    name: "Ayurvedic Pharmacology (Dravyaguna)",
    category: "AYUSH",
    description:
      "Medicinal plants, Rasa Shastra formulations, pharmacokinetics, and clinical therapeutic applications.",
    topics: [
      "Dravya Guna",
      "Rasa Shastra",
      "Herbal Formulations",
      "Pharmacopeia",
    ],
    nodesCount: 4,
  },
  {
    id: "clinical-practice",
    name: "Clinical Practice (Ayurveda)",
    category: "AYUSH",
    description:
      "Nadi Pariksha diagnostic protocols, Panchakarma therapy management, and patient care regimens.",
    topics: [
      "Nadi Pariksha",
      "Panchakarma Protocol",
      "Dietary Management",
      "Case Taking",
    ],
    nodesCount: 4,
  },
];

function AssessmentDomainSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewReportId = searchParams.get("viewReport");

  const [loadingDomain, setLoadingDomain] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If viewing a previous report
  const [reportData, setReportData] = useState<GapReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const fetchReport = useCallback(async (reportId: string) => {
    setReportLoading(true);
    try {
      const res = await fetch(`/api/assess/report/${reportId}`);
      const json = await res.json();
      if (json.success) {
        setReportData(json.data);
      } else {
        setErrorMsg(json.error?.message ?? "Failed to load report");
      }
    } catch {
      setErrorMsg("Failed to load report data");
    } finally {
      setReportLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewReportId) {
      fetchReport(viewReportId);
    }
  }, [viewReportId, fetchReport]);

  const handleStartAssessment = async (domainId: string) => {
    setLoadingDomain(domainId);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/assess/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domainId }),
      });

      const json = await res.json();

      if (!json.success) {
        setErrorMsg(
          json.error?.message ?? "Failed to start assessment session",
        );
        setLoadingDomain(null);
        return;
      }

      // Navigate to live assessment terminal
      router.push(`/assess/${json.data.sessionId}`);
    } catch {
      setErrorMsg("Could not connect to assessment engine");
      setLoadingDomain(null);
    }
  };

  if (viewReportId) {
    if (reportLoading) {
      return (
        <div className="flex h-64 flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-foreground-muted">
            Loading verified assessment report...
          </p>
        </div>
      );
    }

    if (reportData) {
      return (
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/assess")}
            className="text-xs text-foreground-muted hover:text-white"
          >
            ← Choose another domain
          </Button>
          <GapReport report={reportData} />
        </div>
      );
    }
  }

  const itDomains = DOMAINS.filter((d) => d.category === "Engineering & IT");
  const ayushDomains = DOMAINS.filter((d) => d.category === "AYUSH");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Adaptive Skill Assessments
          </h1>
          <p className="mt-0.5 text-xs text-foreground-muted">
            Evaluate your conceptual depth, trade-off awareness, and practical production applicability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-[#0E131F] px-2.5 py-1 text-xs text-foreground-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>4D AI Evaluation Engine</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Engineering & Technology Track */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
              Engineering & Technology Track
            </h2>
          </div>
          <span className="text-[11px] text-foreground-subtle">4 Domains</span>
        </div>

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {itDomains.map((domain) => {
            const isLoading = loadingDomain === domain.id;

            return (
              <div
                key={domain.id}
                className="group flex flex-col justify-between rounded-lg border border-border bg-[#0E131F] p-4.5 transition-all duration-150 hover:border-primary/40 hover:bg-[#121827]"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                      {domain.name}
                    </h3>
                    <BrainCircuit className="h-4 w-4 text-primary shrink-0" />
                  </div>
                  <p className="text-xs text-foreground-muted leading-relaxed">
                    {domain.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {domain.topics.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-foreground-muted border border-border/40"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-foreground-subtle">
                    {domain.nodesCount} Concept Nodes · 4D Rubric
                  </span>
                  <Button
                    size="sm"
                    disabled={!!loadingDomain}
                    onClick={() => handleStartAssessment(domain.id)}
                    className="h-7 gap-1.5 bg-primary px-3 text-xs font-medium text-white hover:bg-primary-hover shadow-xs"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        Start Assessment
                        <ArrowRight className="h-3 w-3" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AYUSH Track */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
              Ministry of Ayush · AYUSH Domain Taxonomy
            </h2>
          </div>
          <span className="text-[11px] text-foreground-subtle">2 Domains</span>
        </div>

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {ayushDomains.map((domain) => {
            const isLoading = loadingDomain === domain.id;

            return (
              <div
                key={domain.id}
                className="group flex flex-col justify-between rounded-lg border border-border bg-[#0E131F] p-4.5 transition-all duration-150 hover:border-emerald-500/40 hover:bg-[#121827]"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {domain.name}
                    </h3>
                    <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs text-foreground-muted leading-relaxed">
                    {domain.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {domain.topics.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-foreground-muted border border-border/40"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-foreground-subtle">
                    {domain.nodesCount} Concept Nodes · Clinical Rubric
                  </span>
                  <Button
                    size="sm"
                    disabled={!!loadingDomain}
                    onClick={() => handleStartAssessment(domain.id)}
                    className="h-7 gap-1.5 bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-500 shadow-xs"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        Start Assessment
                        <ArrowRight className="h-3 w-3" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <AssessmentDomainSelectionContent />
    </Suspense>
  );
}
