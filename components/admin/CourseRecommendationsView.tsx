"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  ArrowUpRight,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Search,
  Filter,
  Layers,
  GraduationCap,
} from "lucide-react";
import type { CourseRecommendation } from "@/types";
import { Button } from "@/components/ui/button";

interface CourseRecommendationsViewProps {
  recommendations: CourseRecommendation[];
}

export function CourseRecommendationsView({
  recommendations,
}: CourseRecommendationsViewProps) {
  const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [assignedStatus, setAssignedStatus] = useState<Record<string, boolean>>({});

  const filteredRecs = recommendations.filter((rec) => {
    const matchesUrgency =
      urgencyFilter === "ALL" || rec.urgency === urgencyFilter;
    const matchesSearch =
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.targetDepartment.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesUrgency && matchesSearch;
  });

  const handleAssign = (id: string) => {
    setAssignedStatus((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-950/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
              Explainable AI Interventions
            </span>
            <span className="text-xs text-foreground-muted">Ranked by Placement Impact</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Targeted Course & Curriculum Interventions
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Automated recommendations designed to eliminate critical skill deficits and maximize immediate student hiring readiness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search interventions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-blue-950/60 bg-[#080E1C] py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-foreground-subtle focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setUrgencyFilter("ALL")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            urgencyFilter === "ALL"
              ? "bg-primary/20 text-white border border-primary/40"
              : "text-foreground-muted hover:text-white"
          }`}
        >
          All Recommendations ({recommendations.length})
        </button>
        <button
          onClick={() => setUrgencyFilter("CRITICAL")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            urgencyFilter === "CRITICAL"
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
              : "text-foreground-muted hover:text-white"
          }`}
        >
          Critical Urgency ({recommendations.filter((r) => r.urgency === "CRITICAL").length})
        </button>
        <button
          onClick={() => setUrgencyFilter("HIGH")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            urgencyFilter === "HIGH"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              : "text-foreground-muted hover:text-white"
          }`}
        >
          High Urgency ({recommendations.filter((r) => r.urgency === "HIGH").length})
        </button>
        <button
          onClick={() => setUrgencyFilter("MEDIUM")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            urgencyFilter === "MEDIUM"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
              : "text-foreground-muted hover:text-white"
          }`}
        >
          Medium Urgency ({recommendations.filter((r) => r.urgency === "MEDIUM").length})
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecs.map((rec) => {
          const isAssigned = assignedStatus[rec.id];

          return (
            <div
              key={rec.id}
              className="flex flex-col justify-between rounded-md border border-blue-950/60 bg-[#080E1C] p-5 shadow-xs relative overflow-hidden transition-all hover:border-blue-900/60"
            >
              <div>
                {/* Header Tags */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        rec.urgency === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : rec.urgency === "HIGH"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {rec.urgency} URGENCY
                    </span>
                    <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-300 border border-blue-500/20">
                      {rec.targetDepartment}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span>+{rec.estimatedReadinessGain}% Placement Gain</span>
                  </div>
                </div>

                {/* Course Title */}
                <h3 className="text-base font-bold text-white mt-3 leading-snug">
                  {rec.title}
                </h3>

                {/* Explainability Callout: "WHY THIS COURSE?" */}
                <div className="mt-3 rounded-md border border-blue-900/40 bg-[#0A1227] p-3">
                  <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>WHY THIS COURSE? (AI REASONING)</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    {rec.whyThisCourse}
                  </p>
                </div>

                {/* Metadata Row */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs border-t border-blue-950/60 pt-3">
                  <div>
                    <span className="text-[10px] text-foreground-muted block">Deficit Skill</span>
                    <span className="font-semibold text-white truncate block">{rec.skill}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-foreground-muted block">Impacted Cohort</span>
                    <span className="font-semibold text-white block">{rec.targetStudentsCount} students</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-foreground-muted block">Duration</span>
                    <span className="font-semibold text-white block">{rec.durationWeeks} weeks</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-blue-950/60 flex items-center justify-between gap-3">
                <Link
                  href={`/admin/course-recommendations/${rec.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
                >
                  <span>Detailed Blueprint</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/courses/${rec.courseId}`}
                    className="inline-flex items-center gap-1 rounded border border-blue-900/40 bg-[#0A1227] px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/5 transition-colors"
                  >
                    <span>View Course</span>
                    <ExternalLink className="h-3 w-3 text-foreground-muted" />
                  </Link>

                  <Button
                    size="sm"
                    onClick={() => handleAssign(rec.id)}
                    disabled={isAssigned}
                    className={`h-7 text-xs font-semibold ${
                      isAssigned
                        ? "bg-emerald-600 text-white"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isAssigned ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Cohort Assigned</span>
                      </div>
                    ) : (
                      "Assign to Cohort"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
