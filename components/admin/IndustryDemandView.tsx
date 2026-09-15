"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  ChevronRight,
} from "lucide-react";
import type { IndustryDemandComparison } from "@/types";
import { IndustryDemandChart } from "./charts/IndustryDemandChart";

interface IndustryDemandViewProps {
  data: IndustryDemandComparison[];
}

export function IndustryDemandView({ data }: IndustryDemandViewProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = data.filter((item) => {
    const matchesSeverity =
      filterSeverity === "ALL" ||
      (filterSeverity === "CRITICAL" && item.severity === "CRITICAL") ||
      (filterSeverity === "MODERATE" && item.severity === "MODERATE") ||
      (filterSeverity === "ALIGNED" && (item.severity === "ALIGNED" || item.severity === "SURPLUS"));

    const matchesSearch =
      item.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSeverity && matchesSearch;
  });

  const criticalCount = data.filter((d) => d.severity === "CRITICAL").length;
  const moderateCount = data.filter((d) => d.severity === "MODERATE").length;
  const alignedCount = data.filter((d) => d.severity === "ALIGNED" || d.severity === "SURPLUS").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-950/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Core SIH26044 Engine
            </span>
            <span className="text-xs text-foreground-muted">Live Employer Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Industry Demand vs. Student Supply Gaps
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Transparent mathematical comparison of platform job/internship market demand versus verified institutional cohort talent.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/course-recommendations"
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Bridge Critical Gaps ({criticalCount})</span>
          </Link>
        </div>
      </div>

      {/* Transparent Math Explanation Banner */}
      <div className="rounded-md border border-blue-900/40 bg-[#0A1227]/60 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-white">
              Deterministic Methodology & Formula:
            </p>
            <p className="text-slate-400 text-[11px]">
              <span className="text-blue-300 font-mono">Demand % = (Active Postings Requiring Skill ÷ Total Postings) × 100</span>
              {"  |  "}
              <span className="text-cyan-300 font-mono">Supply % = (Students Verified in Skill ÷ Total Assessed Students) × 100</span>
              {"  |  "}
              <span className="text-rose-300 font-mono">Net Gap = Demand % - Supply %</span>.
              Gaps &gt; 25% trigger automated high-priority institutional curriculum interventions.
            </p>
          </div>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterSeverity("ALL")}
          className={`flex items-center justify-between rounded-md border p-3 text-left transition-colors ${
            filterSeverity === "ALL"
              ? "border-blue-500/50 bg-blue-500/10 text-white"
              : "border-blue-950/60 bg-[#080E1C] text-foreground-muted hover:text-white"
          }`}
        >
          <div>
            <span className="text-[11px] block font-medium">All Monitored Skills</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{data.length}</span>
          </div>
          <Layers className="h-4 w-4 text-blue-400" />
        </button>

        <button
          onClick={() => setFilterSeverity("CRITICAL")}
          className={`flex items-center justify-between rounded-md border p-3 text-left transition-colors ${
            filterSeverity === "CRITICAL"
              ? "border-rose-500/50 bg-rose-500/10 text-white"
              : "border-blue-950/60 bg-[#080E1C] text-foreground-muted hover:text-white"
          }`}
        >
          <div>
            <span className="text-[11px] block font-medium text-rose-400">Critical Deficits (&gt;25% Gap)</span>
            <span className="text-lg font-bold text-rose-400 mt-0.5 block">{criticalCount}</span>
          </div>
          <AlertTriangle className="h-4 w-4 text-rose-400" />
        </button>

        <button
          onClick={() => setFilterSeverity("MODERATE")}
          className={`flex items-center justify-between rounded-md border p-3 text-left transition-colors ${
            filterSeverity === "MODERATE"
              ? "border-amber-500/50 bg-amber-500/10 text-white"
              : "border-blue-950/60 bg-[#080E1C] text-foreground-muted hover:text-white"
          }`}
        >
          <div>
            <span className="text-[11px] block font-medium text-amber-400">Moderate Gaps (10-25%)</span>
            <span className="text-lg font-bold text-amber-400 mt-0.5 block">{moderateCount}</span>
          </div>
          <TrendingUp className="h-4 w-4 text-amber-400" />
        </button>

        <button
          onClick={() => setFilterSeverity("ALIGNED")}
          className={`flex items-center justify-between rounded-md border p-3 text-left transition-colors ${
            filterSeverity === "ALIGNED"
              ? "border-emerald-500/50 bg-emerald-500/10 text-white"
              : "border-blue-950/60 bg-[#080E1C] text-foreground-muted hover:text-white"
          }`}
        >
          <div>
            <span className="text-[11px] block font-medium text-emerald-400">Balanced / Surplus</span>
            <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{alignedCount}</span>
          </div>
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </button>
      </div>

      {/* Main Comparison Chart */}
      <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-blue-950/60 pb-3 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Market Demand % vs Institutional Supply %
            </h2>
            <p className="text-[11px] text-foreground-muted">
              Blue bars represent current employer hiring requirement frequency. Color bars indicate institutional cohort availability.
            </p>
          </div>
          <span className="text-[10px] text-foreground-muted">
            Live Feed Updated
          </span>
        </div>
        <IndustryDemandChart data={filteredData} />
      </div>

      {/* Detailed Skill Gap Table */}
      <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-950/60 pb-3">
          <h2 className="text-sm font-semibold text-white">
            Skill Gap Breakdown & Recommended Interventions
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search skill or domain..."
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
                <th className="py-2.5 px-3">Domain / Skill</th>
                <th className="py-2.5 px-3">Industry Demand %</th>
                <th className="py-2.5 px-3">Student Supply %</th>
                <th className="py-2.5 px-3">Net Deficit Gap</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Suggested Institutional Action</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950/40 text-slate-200">
              {filteredData.map((item) => (
                <tr key={item.skill} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3">
                    <div>
                      <span className="font-semibold text-white block">{item.skill}</span>
                      <span className="text-[10px] text-foreground-muted">{item.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-blue-400">
                    {item.demandPercent}%
                  </td>
                  <td className="py-3 px-3 font-semibold text-cyan-400">
                    {item.supplyPercent}%
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-bold ${
                        item.gapPercent > 25
                          ? "text-rose-400"
                          : item.gapPercent > 10
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {item.gapPercent > 0 ? `-${item.gapPercent}%` : `+${Math.abs(item.gapPercent)}%`}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        item.severity === "CRITICAL"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : item.severity === "MODERATE"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : item.severity === "ALIGNED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 text-[11px]">
                    {item.suggestedAction}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href="/admin/course-recommendations"
                      className="inline-flex items-center gap-1 rounded bg-[#0A1227] border border-blue-900/40 px-2 py-1 text-[11px] font-medium text-blue-400 hover:bg-white/5 transition-colors whitespace-nowrap"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Create Intervention</span>
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
