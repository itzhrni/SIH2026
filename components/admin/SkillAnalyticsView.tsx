"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from "lucide-react";
import type { SkillHealthItem } from "@/types";
import { SkillTrendChart } from "./charts/SkillTrendChart";

interface SkillAnalyticsViewProps {
  skills: SkillHealthItem[];
  categories: string[];
}

export function SkillAnalyticsView({ skills, categories }: SkillAnalyticsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSkills = skills.filter((s) => {
    const matchesCategory =
      selectedCategory === "ALL" || s.category === selectedCategory;
    const matchesSearch =
      s.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const strongestSkills = [...skills].sort((a, b) => b.averageScore - a.averageScore).slice(0, 4);
  const weakestSkills = [...skills].sort((a, b) => a.averageScore - b.averageScore).slice(0, 4);
  const improvingSkills = [...skills].filter((s) => s.trend === "UP").slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-950/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Competency Health
            </span>
            <span className="text-xs text-foreground-muted">Multi-Domain Evaluation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Skill Health & Mastery Drift Analytics
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Identify domain strengths, monitor mastery decay, and track curriculum-driven skill velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/course-recommendations"
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Target Weak Competencies</span>
          </Link>
        </div>
      </div>

      {/* 3 Overview Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strongest Skills */}
        <div className="rounded-md border border-emerald-950/60 bg-emerald-950/10 p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-emerald-950/40 pb-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Strongest Competencies
              </h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">Top Verified</span>
          </div>
          <div className="mt-3 space-y-2">
            {strongestSkills.map((s) => (
              <div key={s.skill} className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium">{s.skill}</span>
                <span className="font-bold text-emerald-400">{s.averageScore}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weakest / Deficit Skills */}
        <div className="rounded-md border border-rose-950/60 bg-rose-950/10 p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-rose-950/40 pb-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                Critical Deficits
              </h3>
            </div>
            <span className="text-[10px] text-rose-400 font-semibold">Intervene</span>
          </div>
          <div className="mt-3 space-y-2">
            {weakestSkills.map((s) => (
              <div key={s.skill} className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium">{s.skill}</span>
                <span className="font-bold text-rose-400">{s.averageScore}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fastest Improving Skills */}
        <div className="rounded-md border border-blue-950/60 bg-blue-950/10 p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-blue-950/40 pb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                Fastest Improving
              </h3>
            </div>
            <span className="text-[10px] text-blue-400 font-semibold">High Velocity</span>
          </div>
          <div className="mt-3 space-y-2">
            {improvingSkills.map((s) => (
              <div key={s.skill} className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium">{s.skill}</span>
                <div className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+{s.growthPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skill Mastery Distribution Chart */}
      <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-blue-950/60 pb-3 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Skill Mastery Level by Domain
            </h2>
            <p className="text-[11px] text-foreground-muted">
              Average verified assessment score across all student submissions.
            </p>
          </div>
          <span className="text-[11px] text-foreground-muted">
            Green: &gt;75% | Blue: 55-74% | Orange: 40-54% | Red: &lt;40%
          </span>
        </div>
        <SkillTrendChart data={filteredSkills} />
      </div>

      {/* Search & Comprehensive Skill Health Table */}
      <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-950/60 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary/20 text-white border border-primary/40"
                    : "text-foreground-muted hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search skill..."
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
                <th className="py-2.5 px-3">Skill / Competency</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Verified Cohort Size</th>
                <th className="py-2.5 px-3">Avg Mastery Score</th>
                <th className="py-2.5 px-3">Drift / Velocity</th>
                <th className="py-2.5 px-3">Health Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950/40 text-slate-200">
              {filteredSkills.map((s) => (
                <tr key={s.skill} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">{s.skill}</td>
                  <td className="py-3 px-3 text-foreground-muted">{s.category}</td>
                  <td className="py-3 px-3">{s.verifiedCount} students</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{s.averageScore}%</span>
                      <div className="h-1.5 w-14 rounded-full bg-blue-950 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.averageScore >= 75
                              ? "bg-emerald-500"
                              : s.averageScore >= 55
                              ? "bg-blue-500"
                              : s.averageScore >= 40
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${s.averageScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div
                      className={`flex items-center gap-1 font-semibold ${
                        s.growthPercent > 0
                          ? "text-emerald-400"
                          : s.growthPercent < 0
                          ? "text-rose-400"
                          : "text-foreground-muted"
                      }`}
                    >
                      {s.growthPercent > 0 ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : s.growthPercent < 0 ? (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      ) : null}
                      <span>{s.growthPercent > 0 ? `+${s.growthPercent}%` : `${s.growthPercent}%`}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        s.status === "HEALTHY"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : s.status === "MODERATE"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href="/admin/course-recommendations"
                      className="inline-flex items-center gap-1 rounded bg-[#0A1227] border border-blue-900/40 px-2 py-1 text-[11px] font-medium text-blue-400 hover:bg-white/5 transition-colors"
                    >
                      <span>Intervene</span>
                      <ChevronRight className="h-3 w-3" />
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
