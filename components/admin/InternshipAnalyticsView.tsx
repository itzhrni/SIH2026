"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Handshake,
  Star,
  TrendingUp,
  Award,
  Users,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import type { InternshipAnalyticsData } from "@/types";

interface InternshipAnalyticsViewProps {
  data: InternshipAnalyticsData;
}

export function InternshipAnalyticsView({ data }: InternshipAnalyticsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEngagements = data.recentEngagements.filter(
    (e) =>
      e.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-950/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
              Experiential Learning
            </span>
            <span className="text-xs text-foreground-muted">Academic-Industry Collaboration</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Internship & Industry Project Analytics
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Track student internship deployment, industry mentor performance appraisals, and Pre-Placement Offer (PPO) conversions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/reports"
            className="flex items-center gap-1.5 rounded-md border border-blue-900/40 bg-[#0A1227] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/5 transition-colors"
          >
            <span>Export Internship Ledger</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Internships */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-muted">Active Internships</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{data.activeInternships}</p>
          <p className="mt-1 text-[11px] text-foreground-muted">Across 24 corporate partners</p>
        </div>

        {/* PPO Conversion Rate */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-muted">PPO Conversion Rate</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-400">{data.ppoConversionRate}%</p>
          <p className="mt-1 text-[11px] text-emerald-400">+8% vs prior academic year</p>
        </div>

        {/* Average Mentor Rating */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-muted">Industry Mentor Rating</span>
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-400">{data.averageMentorRating} / 5.0</p>
          <p className="mt-1 text-[11px] text-foreground-muted">Based on 98 verified appraisals</p>
        </div>

        {/* Total Corporate Partners */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-muted">Industry Partners</span>
            <Building2 className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{data.totalCompaniesEngaged}</p>
          <p className="mt-1 text-[11px] text-foreground-muted">Active MOUs & hiring pipelines</p>
        </div>
      </div>

      {/* Top Requested Skills for Internships */}
      <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-blue-950/60 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Handshake className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">
              Most Demanded Competencies by Internship Mentors
            </h2>
          </div>
          <span className="text-xs text-foreground-muted">Employer Survey Signals</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {data.topRequestedSkills.map((item) => (
            <div
              key={item.skill}
              className="rounded-md border border-blue-950/60 bg-[#060A14] p-3 text-center"
            >
              <span className="font-semibold text-white text-xs block truncate">{item.skill}</span>
              <span className="text-[11px] text-cyan-400 font-bold block mt-1">
                {item.requestsCount} Openings
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Engagements Table */}
      <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-950/60 pb-3">
          <h2 className="text-sm font-semibold text-white">
            Active Internship Engagements & Appraisals
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search student or company..."
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
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Company Partner</th>
                <th className="py-2.5 px-3">Role / Track</th>
                <th className="py-2.5 px-3">Stipend</th>
                <th className="py-2.5 px-3">Mentor Rating</th>
                <th className="py-2.5 px-3">PPO Outcome Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950/40 text-slate-200">
              {filteredEngagements.map((eng) => (
                <tr key={eng.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">
                    {eng.studentName}
                  </td>
                  <td className="py-3 px-3 text-blue-400 font-medium">
                    {eng.company}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {eng.role}
                  </td>
                  <td className="py-3 px-3 text-emerald-400 font-medium">
                    {eng.stipend}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-white">{eng.mentorRating}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        eng.status === "PPO_OFFERED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : eng.status === "ONGOING"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      {eng.status === "PPO_OFFERED"
                        ? "PPO EXTENDED"
                        : eng.status === "ONGOING"
                        ? "IN PROGRESS"
                        : "COMPLETED"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/portfolio/${eng.id}`}
                      className="inline-flex items-center gap-1 rounded bg-[#0A1227] border border-blue-900/40 px-2 py-1 text-[11px] font-medium text-blue-400 hover:bg-white/5 transition-colors"
                    >
                      <span>Ledger</span>
                      <ExternalLink className="h-3 w-3" />
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
