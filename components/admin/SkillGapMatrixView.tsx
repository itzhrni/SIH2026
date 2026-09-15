"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TableProperties,
  Sparkles,
  Info,
  Search,
  X,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Building2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { SkillGapMatrixRow } from "@/types";
import { Button } from "@/components/ui/button";

interface SkillGapMatrixViewProps {
  matrix: SkillGapMatrixRow[];
  departments: string[];
}

export function SkillGapMatrixView({ matrix, departments }: SkillGapMatrixViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCell, setSelectedCell] = useState<{
    skill: string;
    department: string;
    score: number;
    severity: string;
  } | null>(null);

  const filteredMatrix = matrix.filter((row) =>
    row.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCellColor = (score: number) => {
    if (score >= 75) return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30";
    if (score >= 60) return "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30";
    if (score >= 45) return "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30";
    return "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-950/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
              Diagnostic Heatmap
            </span>
            <span className="text-xs text-foreground-muted">Departmental Cross-Section</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Skill Gap Matrix (Department × Skill)
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Granular competency score distribution across academic departments. Click any matrix cell to inspect drill-down telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search skill in matrix..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-blue-950/60 bg-[#080E1C] py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-foreground-subtle focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Legend & Guidance */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-blue-950/60 bg-[#080E1C] p-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-foreground-muted text-[11px] font-medium">Color Scale:</span>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-emerald-500/30 border border-emerald-500/50" />
            <span className="text-slate-300 text-[11px]">Strong (&ge;75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-blue-500/30 border border-blue-500/50" />
            <span className="text-slate-300 text-[11px]">Good (60-74%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-amber-500/30 border border-amber-500/50" />
            <span className="text-slate-300 text-[11px]">Moderate Deficit (45-59%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-rose-500/30 border border-rose-500/50" />
            <span className="text-slate-300 text-[11px]">Critical Deficit (&lt;45%)</span>
          </div>
        </div>

        <span className="text-[11px] text-blue-400 font-medium hidden sm:inline">
          💡 Click any cell for departmental drilldown
        </span>
      </div>

      {/* Heatmap Grid Table */}
      <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-4 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-blue-950/60 bg-[#060A14] text-[11px] uppercase tracking-wider text-foreground-muted">
              <th className="py-3 px-4 sticky left-0 bg-[#060A14] z-10 w-56">
                Skill / Domain
              </th>
              {departments.map((dept) => (
                <th key={dept} className="py-3 px-4 text-center font-bold text-white">
                  {dept}
                </th>
              ))}
              <th className="py-3 px-4 text-center font-bold text-white">
                Institution Avg
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-950/40 text-slate-200">
            {filteredMatrix.map((row) => (
              <tr key={row.skill} className="hover:bg-white/[0.01] transition-colors">
                <td className="py-3 px-4 sticky left-0 bg-[#080E1C] z-10 font-semibold text-white border-r border-blue-950/40">
                  <div>
                    <span className="block">{row.skill}</span>
                    <span className="text-[10px] text-foreground-muted font-normal">
                      {row.category}
                    </span>
                  </div>
                </td>
                {departments.map((dept) => {
                  const score = row.scoresByDepartment[dept] ?? 0;
                  const severity =
                    score >= 75
                      ? "STRONG"
                      : score >= 60
                      ? "GOOD"
                      : score >= 45
                      ? "MODERATE"
                      : "CRITICAL";

                  return (
                    <td key={dept} className="py-2.5 px-3 text-center">
                      <button
                        onClick={() =>
                          setSelectedCell({
                            skill: row.skill,
                            department: dept,
                            score,
                            severity,
                          })
                        }
                        className={`w-full py-1.5 px-2 rounded-md font-bold text-xs transition-all cursor-pointer ${getCellColor(
                          score
                        )}`}
                      >
                        {score}%
                      </button>
                    </td>
                  );
                })}
                <td className="py-2.5 px-3 text-center">
                  <span className="font-bold text-white bg-blue-950/60 px-2.5 py-1 rounded border border-blue-900/40">
                    {row.institutionAverage}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drill-down Drawer / Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-lg border border-blue-900/60 bg-[#0A1227] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-blue-950/80 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  {selectedCell.department} — {selectedCell.skill}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="h-6 w-6 rounded flex items-center justify-center text-foreground-muted hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-blue-950/60 bg-[#060A14] p-3">
                <span className="text-[11px] text-foreground-muted block">Department Score</span>
                <span
                  className={`text-2xl font-bold block mt-1 ${
                    selectedCell.score >= 75
                      ? "text-emerald-400"
                      : selectedCell.score >= 60
                      ? "text-blue-400"
                      : selectedCell.score >= 45
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {selectedCell.score}%
                </span>
              </div>
              <div className="rounded-md border border-blue-950/60 bg-[#060A14] p-3">
                <span className="text-[11px] text-foreground-muted block">Competency Status</span>
                <span className="text-sm font-bold text-white block mt-2">
                  {selectedCell.severity} DEFICIT
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p className="font-semibold text-white">Recommended Action Plan:</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {selectedCell.score < 60
                  ? `Students in ${selectedCell.department} show a critical deficit in ${selectedCell.skill}. Recommend offering an elective bridge course or a 2-week hands-on lab workshop.`
                  : `Strong baseline competency in ${selectedCell.department}. Students are recommended for direct industry placement tracks and advanced hackathons.`}
              </p>
            </div>

            <div className="pt-3 border-t border-blue-950/80 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCell(null)}
                className="border-blue-900/40 text-xs text-slate-300 hover:bg-white/5"
              >
                Close
              </Button>
              <Link
                href="/admin/course-recommendations"
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Assign Interventions</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
