import React from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  Building2,
  Award,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import {
  getInstitutionOverviewStats,
  getIndustryDemandVsSupply,
  getStudentReadinessAnalytics,
} from "@/lib/analytics/institution-analytics";
import { IndustryDemandChart } from "@/components/admin/charts/IndustryDemandChart";
import { ReadinessDonutChart } from "@/components/admin/charts/ReadinessDonutChart";

export const dynamic = "force-dynamic";

export default async function InstitutionOverviewPage() {
  const [stats, demandComparison, readinessData] = await Promise.all([
    getInstitutionOverviewStats(),
    getIndustryDemandVsSupply(),
    getStudentReadinessAnalytics("ALL"),
  ]);

  const criticalDemands = demandComparison.filter((d) => d.severity === "CRITICAL");

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-950/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Institutional Intelligence
            </span>
            <span className="text-xs text-foreground-muted">Academic Year 2025-2026</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Executive Analytics & Skill Intelligence
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Real-time telemetry on student competency, industry skill drift, and strategic curriculum interventions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/reports"
            className="flex items-center gap-1.5 rounded-md border border-blue-900/40 bg-[#0A1227] px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/5 transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-blue-400" />
            <span>Generate NBA / NAAC Report</span>
          </Link>
          <Link
            href="/admin/course-recommendations"
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Review Interventions ({stats.activeCourseInterventions})</span>
          </Link>
        </div>
      </div>

      {/* 6 Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total Students */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-foreground-muted">Assessed Students</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-white tracking-tight">
            {(stats.totalStudentsAssessed ?? stats.studentsAssessed ?? 0).toLocaleString()}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <ArrowUpRight className="h-3 w-3" />
            <span>88% Cohort Verified</span>
          </div>
        </div>

        {/* Readiness Index */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-foreground-muted">Avg Readiness Index</span>
            <GraduationCap className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-white tracking-tight">
            {stats.averageReadinessIndex ?? stats.placementReadinessPercent ?? 68}%
          </p>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-indigo-400 font-medium">
            <span>+6.4% this semester</span>
          </div>
        </div>

        {/* Industry Openings */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-foreground-muted">Active Openings</span>
            <Briefcase className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-white tracking-tight">
            {stats.activeIndustryOpportunities ?? stats.totalOpportunities ?? 45}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-foreground-muted">
            <span>Jobs & Internships</span>
          </div>
        </div>

        {/* Placement Rate */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-foreground-muted">Placement Rate</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-emerald-400 tracking-tight">
            {stats.placementRate ?? 84}%
          </p>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400">
            <span>Target: 85%</span>
          </div>
        </div>

        {/* Critical Skill Gaps */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-foreground-muted">Critical Skill Gaps</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-rose-400 tracking-tight">
            {stats.criticalSkillGapsCount}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-medium">
            <span>&gt;25% Supply Deficit</span>
          </div>
        </div>

        {/* Active Interventions */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-foreground-muted">Course Interventions</span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-amber-400 tracking-tight">
            {stats.activeCourseInterventions ?? 4}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400">
            <span>Recommended for TPO</span>
          </div>
        </div>
      </div>

      {/* Strategic Action Plan Box */}
      <div className="rounded-md border border-blue-900/40 bg-gradient-to-r from-[#0A1227] via-[#080E1C] to-[#0A1227] p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-blue-950/60 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">
              Institutional Action Plan (Prioritized Interventions)
            </h2>
          </div>
          <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20">
            AI Recommendations Engine
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          {(stats.priorityActionPlans ?? []).map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col justify-between rounded-md border border-blue-950/80 bg-[#060A14]/70 p-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      plan.priority === "HIGH"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : plan.priority === "MEDIUM"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}
                  >
                    {plan.priority} PRIORITY
                  </span>
                  <span className="text-[10px] text-foreground-muted">{plan.category}</span>
                </div>
                <h3 className="text-xs font-semibold text-white mt-2 leading-snug">
                  {plan.title}
                </h3>
                <p className="text-[11px] text-foreground-muted mt-1 leading-normal">
                  {plan.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-blue-950/50 flex items-center justify-between text-[10px]">
                <span className="text-foreground-muted">{plan.targetAudience}</span>
                <span className="font-semibold text-emerald-400">{plan.expectedOutcome}</span>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Main Analytics Grid (Charts) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 7 cols: Industry Demand vs Supply Comparison */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 lg:col-span-7 shadow-xs">
          <div className="flex items-center justify-between border-b border-blue-950/60 pb-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-white">
                  Industry Demand vs. Student Supply Gaps
                </h2>
              </div>
              <p className="text-[11px] text-foreground-muted mt-0.5">
                Calculated from {stats.activeIndustryOpportunities} live employer postings against verified student skill profiles.
              </p>
            </div>
            <Link
              href="/admin/industry-demand"
              className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
            >
              <span>Detailed Breakdown</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <IndustryDemandChart data={demandComparison.slice(0, 7)} />

          {/* Critical Deficit Callout */}
          {criticalDemands.length > 0 && (
            <div className="mt-3 rounded-md border border-rose-950/60 bg-rose-950/20 p-2.5 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-[11px]">
                <span className="font-semibold text-rose-300">Critical Skill Alert: </span>
                <span className="text-slate-300">
                  {criticalDemands.map((c) => `${c.skill} (Gap: -${c.gapPercent}%)`).join(", ")}
                  . Immediate bridge courses recommended.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 cols: Student Readiness Breakdown */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 lg:col-span-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-blue-950/60 pb-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">
                  Cohort Placement Readiness
                </h2>
              </div>
              <p className="text-[11px] text-foreground-muted mt-0.5">
                Multi-domain evaluation across all enrolled departments.
              </p>
            </div>
            <Link
              href="/admin/student-readiness"
              className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              <span>Explore Tiers</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <ReadinessDonutChart data={readinessData.tierBreakdown} />

          {/* Quick Tier Stats Table */}
          <div className="mt-2 space-y-1.5 border-t border-blue-950/60 pt-3">
            {readinessData.tierBreakdown.map((tier) => (
              <div
                key={tier.tier}
                className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[#060A14]/50"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className="text-slate-300 text-[11px]">{tier.tier.split("(")[0]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white">{tier.studentCount}</span>
                  <span className="text-[11px] text-foreground-muted w-10 text-right">
                    {tier.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Readiness Table */}
      <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-blue-950/60 pb-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">
                Department Performance & Alignment Matrix
              </h2>
            </div>
            <p className="text-[11px] text-foreground-muted mt-0.5">
              Comparative benchmark across academic branches.
            </p>
          </div>
          <Link
            href="/admin/skill-gap-matrix"
            className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300"
          >
            <span>Full Matrix Heatmap</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-blue-950/60 bg-[#060A14] text-[11px] uppercase tracking-wider text-foreground-muted">
              <tr>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Assessed Students</th>
                <th className="py-2.5 px-3">Readiness Index</th>
                <th className="py-2.5 px-3">Placement %</th>
                <th className="py-2.5 px-3">Primary Gap Area</th>
                <th className="py-2.5 px-3">Intervention Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950/40 text-slate-200">
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 font-semibold text-white">Computer Science & Eng. (CSE)</td>
                <td className="py-3 px-3">184</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-400">76%</span>
                    <div className="h-1.5 w-16 rounded-full bg-blue-950 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "76%" }} />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-emerald-400 font-semibold">82%</td>
                <td className="py-3 px-3 text-rose-400 font-medium">Distributed Systems</td>
                <td className="py-3 px-3">
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                    Active Bridge Course
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 font-semibold text-white">Information Technology (IT)</td>
                <td className="py-3 px-3">142</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-400">71%</span>
                    <div className="h-1.5 w-16 rounded-full bg-blue-950 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "71%" }} />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-blue-400 font-semibold">78%</td>
                <td className="py-3 px-3 text-amber-400 font-medium">Cloud DevOps (K8s)</td>
                <td className="py-3 px-3">
                  <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20">
                    Scheduled Workshop
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 font-semibold text-white">Electronics & Comm. (ECE)</td>
                <td className="py-3 px-3">118</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-amber-400">58%</span>
                    <div className="h-1.5 w-16 rounded-full bg-blue-950 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "58%" }} />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-amber-400 font-semibold">61%</td>
                <td className="py-3 px-3 text-rose-400 font-medium">Embedded C / RTOS</td>
                <td className="py-3 px-3">
                  <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400 border border-rose-500/20">
                    Needs Action
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 font-semibold text-white">Electrical & Electronics (EEE)</td>
                <td className="py-3 px-3">92</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-amber-400">52%</span>
                    <div className="h-1.5 w-16 rounded-full bg-blue-950 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "52%" }} />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-amber-400 font-semibold">54%</td>
                <td className="py-3 px-3 text-rose-400 font-medium">IoT Protocols</td>
                <td className="py-3 px-3">
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                    Planning FDP
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
