"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { StudentReadinessData } from "@/types";
import { ReadinessDonutChart } from "./charts/ReadinessDonutChart";

interface StudentReadinessViewProps {
  initialData: StudentReadinessData;
  departments: string[];
}

export function StudentReadinessView({
  initialData,
  departments,
}: StudentReadinessViewProps) {
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"top" | "remediation" | "all">("top");

  // In a full implementation, department filter can recalculate or filter
  const tierBreakdown = initialData.tierBreakdown;

  const filteredTopStudents = initialData.topReadyStudents.filter((s) => {
    const matchesDept = selectedDept === "ALL" || s.department === selectedDept;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.targetRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.topSkills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  const filteredNeedAttention = initialData.needingAttention.filter((s) => {
    const matchesDept = selectedDept === "ALL" || s.department === selectedDept;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.missingSkills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-950/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              Cohort Telemetry
            </span>
            <span className="text-xs text-foreground-muted">Live Verification</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Student Placement Readiness
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Benchmarked cohort proficiency, readiness distribution tiers, and proactive student intervention lists.
          </p>
        </div>

        {/* Department Filter Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-foreground-muted">Department:</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-md border border-blue-950/60 bg-[#080E1C] px-3 py-1.5 text-xs font-medium text-white focus:border-primary focus:outline-none"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === "ALL" ? "All Departments" : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Readiness Tier Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tierBreakdown.map((tier) => (
          <div
            key={tier.tier}
            className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: tier.color }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground-muted">
                {tier.tier.split("(")[0]}
              </span>
              <span className="text-[10px] font-semibold text-foreground-subtle">
                {tier.tier.match(/\((.*?)\)/)?.[1] ?? ""}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white">{tier.studentCount}</p>
              <span className="text-xs font-semibold" style={{ color: tier.color }}>
                ({tier.percentage}%)
              </span>
            </div>
            <p className="mt-1 text-[11px] text-foreground-muted">
              {tier.tier.includes("Tier 1")
                ? "Immediate placement ready"
                : tier.tier.includes("Tier 2")
                ? "Requires minor interview prep"
                : tier.tier.includes("Tier 3")
                ? "Needs core skill refinement"
                : "Needs urgent bridge course"}
            </p>
          </div>
        ))}
      </div>

      {/* Breakdown Chart + Cohort Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Readiness Chart */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 lg:col-span-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-blue-950/60 pb-3 mb-3">
            <h2 className="text-sm font-semibold text-white">Cohort Tier Breakdown</h2>
            <span className="text-[11px] text-foreground-muted">
              Total {initialData.totalStudents} Students
            </span>
          </div>
          <ReadinessDonutChart data={tierBreakdown} />
        </div>

        {/* Readiness Benchmarks by Department */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 lg:col-span-7 shadow-xs">
          <div className="flex items-center justify-between border-b border-blue-950/60 pb-3 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Department Performance Benchmark
              </h2>
              <p className="text-[11px] text-foreground-muted">
                Average competency score across academic departments.
              </p>
            </div>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
              Verified Assessments
            </span>
          </div>

          <div className="space-y-3.5 mt-4">
            {initialData.departmentBreakdown.map((dept) => (
              <div key={dept.department} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{dept.department}</span>
                    <span className="text-[11px] text-foreground-muted">
                      ({dept.studentCount} students)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-emerald-400 font-medium">
                      Tier 1: {dept.tier1Percent}%
                    </span>
                    <span className="font-bold text-white">{dept.averageScore}% avg</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-blue-950/80 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${dept.tier1Percent}%` }}
                    title={`Tier 1: ${dept.tier1Percent}%`}
                  />
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${Math.max(0, dept.averageScore - dept.tier1Percent)}%` }}
                    title={`Tier 2: ${(dept.averageScore - dept.tier1Percent).toFixed(0)}%`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cohort Student Lists Section */}
      <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs space-y-4">
        {/* Filter / Search / Tab Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-950/60 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("top")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "top"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "text-foreground-muted hover:text-white"
              }`}
            >
              Top Ready Candidates ({filteredTopStudents.length})
            </button>
            <button
              onClick={() => setActiveTab("remediation")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "remediation"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  : "text-foreground-muted hover:text-white"
              }`}
            >
              Needs Remediation ({filteredNeedAttention.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search candidate or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-blue-950/60 bg-[#060A14] py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-foreground-subtle focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Tab 1: Top Ready Students */}
        {activeTab === "top" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-blue-950/60 bg-[#060A14] text-[11px] uppercase tracking-wider text-foreground-muted">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Target Role</th>
                  <th className="py-2.5 px-3">Readiness Score</th>
                  <th className="py-2.5 px-3">Top Verified Skills</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-950/40 text-slate-200">
                {filteredTopStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-foreground-muted">{student.department}</td>
                    <td className="py-3 px-3 text-slate-300 font-medium">{student.targetRole}</td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                        {student.readinessScore}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {student.topSkills.map((sk) => (
                          <span
                            key={sk}
                            className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-300"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/portfolio/${student.id}`}
                        className="inline-flex items-center gap-1 rounded bg-[#0A1227] border border-blue-900/40 px-2 py-1 text-[11px] font-medium text-blue-400 hover:bg-white/5 transition-colors"
                      >
                        <span>Portfolio</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Needing Attention / Remediation */}
        {activeTab === "remediation" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-blue-950/60 bg-[#060A14] text-[11px] uppercase tracking-wider text-foreground-muted">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Current Score</th>
                  <th className="py-2.5 px-3">Missing Competencies</th>
                  <th className="py-2.5 px-3">Recommended Remediation</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-950/40 text-slate-200">
                {filteredNeedAttention.map((student) => (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[10px]">
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-foreground-muted">{student.department}</td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-400 border border-rose-500/20">
                        {student.readinessScore}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {student.missingSkills.map((sk) => (
                          <span
                            key={sk}
                            className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-300"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-amber-400 font-medium text-[11px]">
                        {student.recommendedCourse}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href="/admin/course-recommendations"
                        className="inline-flex items-center gap-1 rounded bg-primary/20 border border-primary/40 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/30 transition-colors"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Assign Course</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
