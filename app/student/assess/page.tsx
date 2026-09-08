"use client";

// app/(student)/assess/page.tsx
// Assessment domain selection screen and completed gap report viewer.
// M4 deliverable: Domain selection screen connecting to live assessment engine.

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GapReport } from "@/components/assessment/GapReport";
import { BrainCircuit, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import type { GapReportData } from "@/types";

interface DomainCard {
  id: string;
  name: string;
  category: "Engineering & IT" | "AYUSH";
  description: string;
  topics: string[];
}

const DOMAINS: DomainCard[] = [
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    category: "Engineering & IT",
    description:
      "Arrays, linked lists, trees, graphs, dynamic programming, and complexity trade-offs.",
    topics: [
      "Sorting & Searching",
      "Trees & Graphs",
      "Dynamic Programming",
      "Complexity Analysis",
    ],
  },
  {
    id: "system-design",
    name: "System Design",
    category: "Engineering & IT",
    description:
      "Scalable architecture, load balancing, caching, sharding, and distributed system trade-offs.",
    topics: [
      "Load Balancing",
      "Caching & CDNs",
      "Database Sharding",
      "Microservices",
    ],
  },
  {
    id: "machine-learning",
    name: "Machine Learning & Data Science",
    category: "Engineering & IT",
    description:
      "Supervised/unsupervised learning, model evaluation, feature engineering, and neural networks.",
    topics: [
      "Model Evaluation",
      "Feature Engineering",
      "Neural Networks",
      "Clustering",
    ],
  },
  {
    id: "core-cs",
    name: "Core Computer Science",
    category: "Engineering & IT",
    description:
      "Operating systems, computer networks, database normalization, and concurrency control.",
    topics: [
      "OS Processes",
      "Networking Basics",
      "Database Normalization",
      "Concurrency",
    ],
  },
  {
    id: "ayurvedic-pharmacology",
    name: "Ayurvedic Pharmacology (Dravyaguna)",
    category: "AYUSH",
    description:
      "Medicinal plants, Rasa Shastra formulations, pharmacokinetics, and therapeutic applications.",
    topics: [
      "Dravya Guna",
      "Rasa Shastra",
      "Herbal Formulations",
      "Pharmacopeia",
    ],
  },
  {
    id: "clinical-practice",
    name: "Clinical Practice (Ayurveda)",
    category: "AYUSH",
    description:
      "Nadi Pariksha diagnostic protocols, Panchakarma therapy management, and patient care.",
    topics: [
      "Nadi Pariksha",
      "Panchakarma Protocol",
      "Dietary Management",
      "Case Taking",
    ],
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
      router.push(`/student/assess/${json.data.sessionId}`);
    } catch {
      setErrorMsg("Could not connect to assessment engine");
      setLoadingDomain(null);
    }
  };

  if (viewReportId) {
    if (reportLoading) {
      return (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
          <p className="text-sm text-foreground-muted">
            Loading verified assessment report...
          </p>
        </div>
      );
    }

    if (reportData) {
      return (
        <div>
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/student/assess")}
              className="text-xs text-foreground-muted hover:text-foreground"
            >
              ← Choose another domain
            </Button>
          </div>
          <GapReport report={reportData} />
        </div>
      );
    }
  }

  const itDomains = DOMAINS.filter((d) => d.category === "Engineering & IT");
  const ayushDomains = DOMAINS.filter((d) => d.category === "AYUSH");

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Adaptive Skill Assessments
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Select a verified knowledge domain to test your conceptual reasoning,
          trade-off awareness, and practical applicability.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-md border border-destructive-border bg-destructive-bg p-3 text-xs text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Engineering & IT Track */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted">
            Engineering & Technology Track
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {itDomains.map((domain) => {
            const isLoading = loadingDomain === domain.id;

            return (
              <div
                key={domain.id}
                className="flex flex-col justify-between rounded-md border border-border bg-card p-5 transition-colors duration-150 hover:border-border-strong"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-base font-semibold text-foreground">
                      {domain.name}
                    </h3>
                    <BrainCircuit className="h-4 w-4 text-primary shrink-0" />
                  </div>
                  <p className="mt-1.5 text-xs text-foreground-muted leading-relaxed">
                    {domain.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {domain.topics.map((t) => (
                      <span
                        key={t}
                        className="rounded-sm border border-border bg-background-muted px-2 py-0.5 text-2xs text-foreground-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-2xs text-foreground-subtle">
                    Live Adaptive LLM Evaluation
                  </span>
                  <Button
                    size="sm"
                    disabled={!!loadingDomain}
                    onClick={() => handleStartAssessment(domain.id)}
                    className="h-8 gap-1.5 bg-primary px-3 text-xs text-white hover:bg-primary-hover"
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
      </div>

      {/* AYUSH Track (Ministry of Ayush / PS 26044 requirement) */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted">
            Ministry of Ayush · AYUSH Domain Taxonomy
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ayushDomains.map((domain) => {
            const isLoading = loadingDomain === domain.id;

            return (
              <div
                key={domain.id}
                className="flex flex-col justify-between rounded-md border border-border bg-card p-5 transition-colors duration-150 hover:border-border-strong"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-base font-semibold text-foreground">
                      {domain.name}
                    </h3>
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  </div>
                  <p className="mt-1.5 text-xs text-foreground-muted leading-relaxed">
                    {domain.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {domain.topics.map((t) => (
                      <span
                        key={t}
                        className="rounded-sm border border-border bg-background-muted px-2 py-0.5 text-2xs text-foreground-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-2xs text-foreground-subtle">
                    AIIA Knowledge Graph Rubric
                  </span>
                  <Button
                    size="sm"
                    disabled={!!loadingDomain}
                    onClick={() => handleStartAssessment(domain.id)}
                    className="h-8 gap-1.5 bg-primary px-3 text-xs text-white hover:bg-primary-hover"
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
      </div>
    </div>
  );
}

export default function AssessmentDomainSelectionPage() {
  return (
    <Suspense
      fallback={<div className="flex h-64 items-center justify-center" />}
    >
      <AssessmentDomainSelectionContent />
    </Suspense>
  );
}
