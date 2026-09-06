"use client";

import React, { useState } from "react";
import type { CandidateMatch } from "@/types";
import {
  Search,
  Filter,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Eye,
  X,
  Building2,
  Mail,
} from "lucide-react";

interface CandidateDiscoveryTableProps {
  initialCandidates: CandidateMatch[];
}

export function CandidateDiscoveryTable({
  initialCandidates,
}: CandidateDiscoveryTableProps) {
  const [candidates] = useState<CandidateMatch[]>(initialCandidates);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [minMatchScore, setMinMatchScore] = useState<number>(0);
  const [selectedTrajectory, setSelectedTrajectory] = useState<string>("ALL");
  const [inspectCandidate, setInspectCandidate] =
    useState<CandidateMatch | null>(null);

  // Extract all unique domains for filter dropdown
  const allDomains = Array.from(
    new Set(candidates.map((c) => c.topDomain).filter(Boolean)),
  );

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.institution &&
        c.institution.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.department &&
        c.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDomain =
      selectedDomain === "ALL" ||
      c.topDomain.toLowerCase() === selectedDomain.toLowerCase();

    const matchesScore = c.matchScore >= minMatchScore;

    const matchesTrajectory =
      selectedTrajectory === "ALL" ||
      c.longitudinalSignal.trajectory === selectedTrajectory;

    return matchesSearch && matchesDomain && matchesScore && matchesTrajectory;
  });

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="rounded-md border border-border bg-card p-3.5 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground-subtle" />
            <input
              type="text"
              placeholder="Search candidates by name, institution, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Domain Filter */}
          <div>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Skill Domains</option>
              {allDomains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Trajectory Filter */}
          <div>
            <select
              value={selectedTrajectory}
              onChange={(e) => setSelectedTrajectory(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Trajectories</option>
              <option value="STABLE_HIGH">Consistent High Performer</option>
              <option value="IMPROVING">Rapid Improver (+15%)</option>
              <option value="GROWTH_DETECTED">Positive Growth</option>
              <option value="BASELINE">Baseline Verified</option>
            </select>
          </div>
        </div>

        {/* Bottom controls: Min Score Slider & Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border text-xs text-foreground-muted">
          <div className="flex items-center gap-3">
            <span className="font-medium whitespace-nowrap">
              Min Match Score:
            </span>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(Number(e.target.value))}
              className="w-32 h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="font-semibold tabular-nums text-foreground">
              {minMatchScore}%+
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>
              Showing{" "}
              <strong className="text-foreground">
                {filteredCandidates.length}
              </strong>{" "}
              of {candidates.length} verified candidates
            </span>
          </div>
        </div>
      </div>

      {/* Candidates High-Density Table */}
      <div className="rounded-md border border-border bg-card overflow-hidden">
        {filteredCandidates.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center p-6 text-sm text-foreground-muted">
            <GraduationCap className="h-8 w-8 text-foreground-subtle mb-2" />
            <p className="font-medium text-foreground">
              No matching candidates found
            </p>
            <p className="text-xs text-foreground-subtle mt-1">
              Try adjusting your search query, domain selection, or minimum
              score threshold.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background-subtle">
                <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                  Candidate & Institution
                </th>
                <th className="px-3 py-2.5 text-center text-xs font-medium uppercase tracking-wide text-foreground-muted">
                  Match Score
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                  Top Domain
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                  Longitudinal Performance Signal
                </th>
                <th className="px-3 py-2.5 text-center text-xs font-medium uppercase tracking-wide text-foreground-muted">
                  Sessions
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-foreground-muted">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCandidates.map((candidate) => (
                <tr
                  key={candidate.id}
                  className="transition-colors duration-150 hover:bg-background-subtle"
                >
                  {/* Candidate Name & Institution */}
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      {candidate.name}
                      {candidate.badges.length > 0 && (
                        <span
                          className="inline-flex items-center gap-0.5 text-2xs text-warning"
                          title={`${candidate.badges.length} verified badges`}
                        >
                          <Award className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-foreground-muted">
                      {candidate.institution || "University Candidate"} ·{" "}
                      {candidate.department || "Computer Science"}
                    </div>
                  </td>

                  {/* Match Score Badge */}
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold tabular-nums ${
                        candidate.matchScore >= 75
                          ? "bg-success-bg text-success border border-success-border"
                          : candidate.matchScore >= 50
                            ? "bg-warning-bg text-warning border border-warning-border"
                            : "bg-destructive-bg text-destructive border border-destructive-border"
                      }`}
                    >
                      {candidate.matchScore}% Match
                    </span>
                  </td>

                  {/* Top Domain */}
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-foreground text-xs">
                      {candidate.topDomain}
                    </div>
                    <div className="text-2xs text-foreground-subtle tabular-nums">
                      Score: {candidate.topDomainScore}%
                    </div>
                  </td>

                  {/* Longitudinal Signal Badge */}
                  <td className="px-3 py-2.5">
                    <div className="inline-flex items-center gap-1.5 rounded-sm bg-background-muted px-2 py-0.5 text-2xs font-semibold text-foreground border border-border">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span>{candidate.longitudinalSignal.label}</span>
                    </div>
                  </td>

                  {/* Session Count */}
                  <td className="px-3 py-2.5 text-center tabular-nums text-foreground-muted text-xs">
                    {candidate.sessionCount}
                  </td>

                  {/* Action */}
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => setInspectCandidate(candidate)}
                      className="inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground-muted hover:bg-background-muted hover:text-foreground transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Candidate Profile Quick-Preview Modal */}
      {inspectCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-md border border-border bg-card p-6 shadow-card space-y-4">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {inspectCandidate.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-foreground-muted mt-0.5">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {inspectCandidate.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {inspectCandidate.institution || "University Candidate"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectCandidate(null)}
                className="text-foreground-subtle hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Match & Signal Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-border bg-background-subtle p-3">
                <span className="text-2xs font-medium uppercase tracking-wider text-foreground-muted">
                  Overall Match Rating
                </span>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  {inspectCandidate.matchScore}%
                </p>
                <p className="text-2xs text-foreground-subtle">
                  Based on required competency thresholds
                </p>
              </div>

              <div className="rounded-md border border-border bg-background-subtle p-3">
                <span className="text-2xs font-medium uppercase tracking-wider text-foreground-muted">
                  Longitudinal Performance Signal
                </span>
                <p className="mt-1 text-xs font-bold text-primary">
                  {inspectCandidate.longitudinalSignal.label}
                </p>
                <p className="text-2xs text-foreground-subtle">
                  Across {inspectCandidate.sessionCount} verified sessions
                </p>
              </div>
            </div>

            {/* Domain Competency Scores */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">
                Verified Skill Depth Profile
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(inspectCandidate.domainScores).map(
                  ([domain, score]) => (
                    <div
                      key={domain}
                      className="flex items-center justify-between rounded-sm border border-border bg-background-subtle px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-foreground truncate mr-2">
                        {domain}
                      </span>
                      <span
                        className={`font-bold tabular-nums ${
                          score >= 70
                            ? "text-success"
                            : score >= 50
                              ? "text-warning"
                              : "text-destructive"
                        }`}
                      >
                        {score}%
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Badges */}
            {inspectCandidate.badges.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">
                  Earned SkillLedger Badges
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {inspectCandidate.badges.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-2xs font-semibold text-white [background:linear-gradient(135deg,#0067B8,#4F46E5)]"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Verified · {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setInspectCandidate(null)}
                className="rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
