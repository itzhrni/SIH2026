"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Building2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import type { PlacementAnalyticsData } from "@/types";
import { PlacementFunnelChart } from "./charts/PlacementFunnelChart";

interface PlacementAnalyticsViewProps {
  data: PlacementAnalyticsData;
}

export function PlacementAnalyticsView({ data }: PlacementAnalyticsViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-950/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              TPO Career Intelligence
            </span>
            <span className="text-xs text-foreground-muted">Graduating Batch 2026</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Placement Funnel & Outcome Analytics
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Recruitment pipeline telemetry, technical round drop-off diagnostic, and verified skill impact.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/reports"
            className="flex items-center gap-1.5 rounded-md border border-blue-900/40 bg-[#0A1227] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/5 transition-colors"
          >
            <span>Generate Placement Audit</span>
          </Link>
        </div>
      </div>

      {/* 4 Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Placement Rate */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-muted">Overall Placement Rate</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-400">{data.placementRate}%</p>
          <p className="mt-1 text-[11px] text-foreground-muted">
            {data.totalPlaced} of {data.totalEligibleStudents} eligible students
          </p>
        </div>

        {/* Offers Count */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-muted">Total Offers Released</span>
            <Award className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{data.totalOffers}</p>
          <p className="mt-1 text-[11px] text-foreground-muted">Including multiple dream offers</p>
        </div>

        {/* Average Package */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-muted">Average CTC Package</span>
            <Briefcase className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{data.averageSalary}</p>
          <p className="mt-1 text-[11px] text-foreground-muted">Highest: {data.highestSalary}</p>
        </div>

        {/* Verified Advantage */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-muted">SkillLedger Lift</span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-cyan-400">2.4x</p>
          <p className="mt-1 text-[11px] text-foreground-muted">Interview call conversion multiplier</p>
        </div>
      </div>

      {/* Recruitment Funnel Chart & Drop-off Diagnostic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Funnel Chart (7 cols) */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 lg:col-span-7 shadow-xs">
          <div className="flex items-center justify-between border-b border-blue-950/60 pb-3 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Candidate Pipeline Conversion Funnel
              </h2>
              <p className="text-[11px] text-foreground-muted">
                Conversion stages from initial application to final offer acceptance.
              </p>
            </div>
            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20">
              Live Applications
            </span>
          </div>

          <PlacementFunnelChart stages={data.funnelStages} />
        </div>

        {/* Technical Rejection Skill Gaps (5 cols) */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 lg:col-span-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-blue-950/60 pb-3 mb-3">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <h2 className="text-sm font-semibold text-white">
                  Technical Rejection Skill Gaps
                </h2>
              </div>
              <span className="text-[10px] text-rose-400 font-semibold">
                Employer Feedback
              </span>
            </div>
            <p className="text-[11px] text-foreground-muted mb-3">
              Specific domain skills cited by interviewers during stage drop-offs:
            </p>

            <div className="space-y-2.5">
              {data.topRejectionReasons.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-md border border-blue-950/60 bg-[#060A14] p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white">{item.skill}</span>
                    <span className="text-[10px] text-foreground-muted block">
                      {item.rejectionsCount} candidates rejected
                    </span>
                  </div>
                  <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                    {item.percentage}% of failures
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-950/60">
            <Link
              href="/admin/course-recommendations"
              className="flex items-center justify-center gap-1.5 w-full rounded-md bg-primary py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Launch Mock Interview & Bridge Prep</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Recruiting Companies */}
      <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-blue-950/60 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">
              Active Enterprise Recruiting Partners
            </h2>
          </div>
          <span className="text-xs text-foreground-muted">Industry Network</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.topRecruiters.map((recruiter) => (
            <div
              key={recruiter.name}
              className="rounded-md border border-blue-950/60 bg-[#060A14] p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{recruiter.name}</span>
                <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
                  {recruiter.hiresCount} Offers
                </span>
              </div>
              <p className="text-[11px] text-foreground-muted">
                Avg Package: <span className="text-emerald-400 font-semibold">{recruiter.averagePackage}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
