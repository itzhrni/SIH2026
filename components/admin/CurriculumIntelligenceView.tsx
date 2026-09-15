"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  ChevronRight,
  School,
  Layers,
} from "lucide-react";
import type { CurriculumIntelligenceItem } from "@/types";

interface CurriculumIntelligenceViewProps {
  items: CurriculumIntelligenceItem[];
}

export function CurriculumIntelligenceView({ items }: CurriculumIntelligenceViewProps) {
  const [coverageFilter, setCoverageFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((item) => {
    const matchesCoverage =
      coverageFilter === "ALL" || item.coverageStatus === coverageFilter;
    const matchesSearch =
      item.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.currentCourse && item.currentCourse.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCoverage && matchesSearch;
  });

  const missingCount = items.filter((i) => i.coverageStatus === "MISSING").length;
  const partialCount = items.filter((i) => i.coverageStatus === "PARTIAL").length;
  const coveredCount = items.filter((i) => i.coverageStatus === "COVERED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-950/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              Board of Studies (BOS) Intel
            </span>
            <span className="text-xs text-foreground-muted">Syllabus vs Market Demand</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Curriculum & Syllabus Intelligence
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Identify curriculum blind spots, outdated subject syllabi, and missing modern industry technologies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/reports"
            className="flex items-center gap-1.5 rounded-md border border-blue-900/40 bg-[#0A1227] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/5 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-blue-400" />
            <span>Export BOS Syllabus Dossier</span>
          </Link>
          <Link
            href="/admin/course-recommendations"
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>View Bridge Courses</span>
          </Link>
        </div>
      </div>

      {/* 3 Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Missing from Curriculum */}
        <button
          onClick={() => setCoverageFilter("MISSING")}
          className={`flex items-center justify-between rounded-md border p-4 text-left transition-colors ${
            coverageFilter === "MISSING"
              ? "border-rose-500/50 bg-rose-500/10"
              : "border-blue-950/60 bg-[#080E1C] hover:border-rose-950/80"
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Missing from Syllabus
              </span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{missingCount}</p>
            <p className="text-[11px] text-foreground-muted mt-0.5">
              High industry demand but absent from coursework
            </p>
          </div>
        </button>

        {/* Partially Covered / Outdated */}
        <button
          onClick={() => setCoverageFilter("PARTIAL")}
          className={`flex items-center justify-between rounded-md border p-4 text-left transition-colors ${
            coverageFilter === "PARTIAL"
              ? "border-amber-500/50 bg-amber-500/10"
              : "border-blue-950/60 bg-[#080E1C] hover:border-amber-950/80"
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Partially Covered
              </span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{partialCount}</p>
            <p className="text-[11px] text-foreground-muted mt-0.5">
              Theoretical only; lacks modern practical labs
            </p>
          </div>
        </button>

        {/* Covered in Curriculum */}
        <button
          onClick={() => setCoverageFilter("COVERED")}
          className={`flex items-center justify-between rounded-md border p-4 text-left transition-colors ${
            coverageFilter === "COVERED"
              ? "border-emerald-500/50 bg-emerald-500/10"
              : "border-blue-950/60 bg-[#080E1C] hover:border-emerald-950/80"
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Covered in Syllabus
              </span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{coveredCount}</p>
            <p className="text-[11px] text-foreground-muted mt-0.5">
              Fully aligned with active coursework
            </p>
          </div>
        </button>
      </div>

      {/* Detailed Curriculum Audit Table */}
      <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-950/60 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCoverageFilter("ALL")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                coverageFilter === "ALL"
                  ? "bg-primary/20 text-white border border-primary/40"
                  : "text-foreground-muted hover:text-white"
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setCoverageFilter("MISSING")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                coverageFilter === "MISSING"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  : "text-foreground-muted hover:text-white"
              }`}
            >
              Missing Only ({missingCount})
            </button>
            <button
              onClick={() => setCoverageFilter("PARTIAL")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                coverageFilter === "PARTIAL"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "text-foreground-muted hover:text-white"
              }`}
            >
              Partial Only ({partialCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search skill, subject or semester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-blue-950/60 bg-[#060A14] py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-foreground-subtle focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-blue-950/60 bg-[#060A14] text-[11px] uppercase tracking-wider text-foreground-muted">
              <tr>
                <th className="py-2.5 px-3">Industry Competency</th>
                <th className="py-2.5 px-3">Coverage Status</th>
                <th className="py-2.5 px-3">Current Course / Subject</th>
                <th className="py-2.5 px-3">Target Semester</th>
                <th className="py-2.5 px-3">Industry Demand</th>
                <th className="py-2.5 px-3">Recommended Syllabus Action</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950/40 text-slate-200">
              {filteredItems.map((item) => (
                <tr key={item.skill} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">
                    <div>
                      <span>{item.skill}</span>
                      <span className="text-[10px] text-foreground-muted block font-normal">
                        {item.category}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        item.coverageStatus === "COVERED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.coverageStatus === "PARTIAL"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {item.coverageStatus === "COVERED"
                        ? "COVERED IN SYLLABUS"
                        : item.coverageStatus === "PARTIAL"
                        ? "PARTIAL / OUTDATED"
                        : "MISSING FROM SYLLABUS"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {item.currentCourse ?? (
                      <span className="text-foreground-subtle italic">None (Not mapped)</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-foreground-muted font-medium">
                    {item.semester ? `Semester ${item.semester}` : "Elective / Open"}
                  </td>
                  <td className="py-3 px-3 font-semibold text-blue-400">
                    {item.industryDemandPercent}% Demand
                  </td>
                  <td className="py-3 px-3 text-slate-300 text-[11px]">
                    {item.recommendedAction}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href="/admin/course-recommendations"
                      className="inline-flex items-center gap-1 rounded bg-[#0A1227] border border-blue-900/40 px-2 py-1 text-[11px] font-medium text-blue-400 hover:bg-white/5 transition-colors whitespace-nowrap"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Deploy Course</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
