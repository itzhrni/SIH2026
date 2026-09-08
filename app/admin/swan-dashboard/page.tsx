"use client";

import { useState, useEffect } from "react";
import { DemandSupplyChart } from "@/components/dashboard/DemandSupplyChart";
import { CohortSkillChart } from "@/components/dashboard/CohortSkillChart";
import { PlacementPipelineCard } from "@/components/dashboard/PlacementPipelineCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  Building,
} from "lucide-react";
import type {
  SkillGapDataPoint,
  CohortSkillDataPoint,
  PlacementProgressStats,
  ApiResponse,
} from "@/types";

export default function AdminDashboardPage() {
  const [demandData, setDemandData] = useState<SkillGapDataPoint[]>([]);
  const [cohortData, setCohortData] = useState<CohortSkillDataPoint[]>([]);
  const [placementStats, setPlacementStats] =
    useState<PlacementProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [demandRes, cohortRes, placementRes] = await Promise.all([
          fetch("/api/analytics/demand"),
          fetch("/api/analytics/cohort"),
          fetch("/api/analytics/placement"),
        ]);

        const demandJson: ApiResponse<SkillGapDataPoint[]> =
          await demandRes.json();
        const cohortJson: ApiResponse<CohortSkillDataPoint[]> =
          await cohortRes.json();
        const placementJson: ApiResponse<PlacementProgressStats> =
          await placementRes.json();

        if (demandJson.success) setDemandData(demandJson.data);
        if (cohortJson.success) setCohortData(cohortJson.data);
        if (placementJson.success) setPlacementStats(placementJson.data);
      } catch (err) {
        console.error("[AdminDashboard] Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const criticalGaps = demandData.filter((d) => d.severity === "HIGH");
  const avgReadiness =
    cohortData.length > 0
      ? Math.round(
          cohortData.reduce((sum, item) => sum + item.averageScore, 0) /
            cohortData.length,
        )
      : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Institutional Admin Dashboard
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time skill readiness cohorts, industry demand alignment, and
          placement pipeline analytics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Enrolled Students
            </span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          {loading ? (
            <Skeleton className="mt-2 h-7 w-20" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-foreground">
              {placementStats?.totalStudents ?? 0}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            With active skill profiles
          </p>
        </div>

        <div className="rounded-md border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Average Skill Score
            </span>
            <GraduationCap className="h-4 w-4 text-primary" />
          </div>
          {loading ? (
            <Skeleton className="mt-2 h-7 w-20" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-foreground">
              {avgReadiness}/100
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            Across all assessed domains
          </p>
        </div>

        <div className="rounded-md border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Active Postings
            </span>
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          {loading ? (
            <Skeleton className="mt-2 h-7 w-20" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-foreground">
              {placementStats?.activePostings ?? 0}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            Internships, jobs & FDPs
          </p>
        </div>

        <div className="rounded-md border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Critical Skill Gaps
            </span>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          {loading ? (
            <Skeleton className="mt-2 h-7 w-20" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-destructive">
              {criticalGaps.length}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            Severity &gt; 50% gap
          </p>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Demand vs Supply Chart */}
        <div className="rounded-md border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Skill Demand vs. Supply Gap Analysis
              </h2>
              <span className="rounded-sm bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                Live Data
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Comparing Industry demand percentage with student proficiency
              supply by domain.
            </p>
          </div>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <DemandSupplyChart data={demandData} />
          )}
        </div>

        {/* Cohort Skill Distribution */}
        <div className="rounded-md border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Cohort Skill Readiness by Department
              </h2>
              <span className="rounded-sm bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                Assessed Scores
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Average domain proficiency score across academic departments.
            </p>
          </div>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <CohortSkillChart data={cohortData} />
          )}
        </div>
      </div>

      {/* Placement Progress Section */}
      <div className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Placement & Application Progress
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Real-time pipeline tracking across student applications and
              industry hiring.
            </p>
          </div>
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        {loading ? (
          <Skeleton className="h-28 w-full" />
        ) : placementStats ? (
          <PlacementPipelineCard stats={placementStats} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No placement data available.
          </p>
        )}
      </div>

      {/* Strategic Curriculum & Interventions */}
      <div className="rounded-md border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">
          Curriculum & Institutional Interventions
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Automated recommendations based on platform demand vs. supply gap
          signals.
        </p>

        <div className="mt-4 space-y-2.5">
          {criticalGaps.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No critical skill gaps identified. All domains are currently
              aligned with industry demand.
            </p>
          ) : (
            criticalGaps.map((gap) => (
              <div
                key={gap.skill}
                className="flex items-start justify-between rounded-sm border border-destructive-border bg-destructive-bg/30 p-3"
              >
                <div>
                  <p className="text-xs font-semibold text-destructive">
                    Critical Gap in {gap.skill.toUpperCase()}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Industry demand is {gap.demandPercent}% while institutional
                    student supply is only {gap.supplyPercent}%. Recommended:
                    Organize Faculty Development Program (FDP) or workshops.
                  </p>
                </div>
                <span className="rounded-sm bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
                  HIGH SEVERITY
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
