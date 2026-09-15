"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Building,
  Calendar,
  MapPin,
  Clock,
  IndianRupee,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import type { ApiResponse } from "@/types";

interface OpportunityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string | null;
  duration: string | null;
  stipendRange: string | null;
  deadline: string;
  postedBy: {
    id: string;
    name: string;
    institution: string | null;
  };
  requiredSkills: Array<{ skill: string; minThreshold: number }>;
}

const TYPE_LABELS: Record<string, string> = {
  FDP: "Faculty Development Program",
  FACULTY_INTERNSHIP: "Faculty Internship",
  RESEARCH_PROJECT: "Research Collaboration",
  CONSULTANCY: "Consultancy",
  LEARNING_PROGRAM: "Industry Learning Program",
};

const ACAD_TYPES = [
  "ALL",
  "FDP",
  "FACULTY_INTERNSHIP",
  "RESEARCH_PROJECT",
  "CONSULTANCY",
  "LEARNING_PROGRAM",
];

export default function AcadOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [selectedType, setSelectedType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    id: string;
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const res = await fetch("/api/opportunities");
        const json: ApiResponse<OpportunityItem[]> = await res.json();
        if (json.success) {
          setOpportunities(json.data);
        }
      } catch (err) {
        console.error("[AcadOpportunities] Failed to load:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOpportunities();
  }, []);

  async function handleApply(opportunityId: string) {
    setApplyingId(opportunityId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchScoreAtApply: 85 }), // Standard academic profile match
      });
      const json: ApiResponse<{ id: string }> = await res.json();

      if (json.success) {
        setFeedback({
          id: opportunityId,
          success: true,
          message:
            "Application submitted successfully using your Academician profile.",
        });
      } else {
        setFeedback({
          id: opportunityId,
          success: false,
          message: json.error.message || "Failed to submit application.",
        });
      }
    } catch {
      setFeedback({
        id: opportunityId,
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setApplyingId(null);
    }
  }

  // Filter opportunities
  const filtered = opportunities.filter((item) => {
    const matchesType = selectedType === "ALL" || item.type === selectedType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.postedBy.institution &&
        item.postedBy.institution
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-blue-950/60 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Academician Portal · Programs & Collabs</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Faculty & Academician Opportunities
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Explore industry-sponsored Faculty Development Programs (FDP), consultancy engagements, research collaborations, and joint curriculum initiatives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
            <Building className="h-3.5 w-3.5" />
            {opportunities.length} Active Industry Programs
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-lg border border-blue-900/30 bg-[#0A1227] p-3.5 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {ACAD_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  selectedType === type
                    ? "bg-primary text-white font-semibold shadow-xs"
                    : "bg-[#060A14] text-foreground-muted hover:bg-white/5 hover:text-white border border-blue-950/60"
                }`}
              >
                {type === "ALL" ? "All Programs" : TYPE_LABELS[type] || type}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
            <Input
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-[#060A14] border-blue-950/60 text-white placeholder:text-foreground-subtle focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Opportunity Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-blue-900/30 bg-[#0C1427] p-5 space-y-3"
            >
              <Skeleton className="h-6 w-1/3 bg-white/5" />
              <Skeleton className="h-4 w-1/4 bg-white/5" />
              <Skeleton className="h-16 w-full bg-white/5" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-blue-900/40 bg-[#0A1227] p-6 text-center">
          <Briefcase className="h-8 w-8 text-foreground-subtle mb-2" />
          <p className="text-sm font-semibold text-white">
            No opportunities match your filter
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            Try selecting "All Programs" or clearing your search keywords.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-blue-900/30 bg-[#0C1427] p-5 transition-all duration-150 hover:border-blue-500/40 hover:shadow-md space-y-3"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-white">
                      {item.title}
                    </h2>
                    <span className="rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 text-[11px] font-semibold">
                      {TYPE_LABELS[item.type] || item.type}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-foreground-muted">
                    <Building className="h-3.5 w-3.5 text-primary" />
                    <span className="text-white font-medium">
                      {item.postedBy.institution || item.postedBy.name}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleApply(item.id)}
                  disabled={applyingId === item.id}
                  className="h-8 gap-1.5 bg-primary px-4 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs shrink-0"
                >
                  {applyingId === item.id ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Applying...
                    </span>
                  ) : (
                    "Apply with Faculty Profile"
                  )}
                </Button>
              </div>

              <p className="text-xs leading-relaxed text-foreground-muted">
                {item.description}
              </p>

              {/* Meta details */}
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-blue-950/60 text-xs text-foreground-muted">
                {item.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{item.location}</span>
                  </div>
                )}
                {item.duration && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{item.duration}</span>
                  </div>
                )}
                {item.stipendRange && (
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{item.stipendRange}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 ml-auto">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  <span>
                    Deadline: {new Date(item.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Feedback alert */}
              {feedback && feedback.id === item.id && (
                <div
                  className={`mt-2 flex items-center gap-2 rounded-md border p-2.5 text-xs ${
                    feedback.success
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                  }`}
                >
                  {feedback.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
