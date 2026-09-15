import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  BookOpen,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Layers,
  GraduationCap,
  School,
  Download,
} from "lucide-react";
import { getCourseRecommendationById } from "@/lib/analytics/institution-analytics";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface CourseInterventionDetailPageProps {
  params: { id: string };
}

export default async function CourseInterventionDetailPage({
  params,
}: CourseInterventionDetailPageProps) {
  const rec = await getCourseRecommendationById(params.id);

  if (!rec) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/admin/course-recommendations"
          className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Course Interventions</span>
        </Link>

        <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-950/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-2 py-0.5 text-xs font-bold ${
                  rec.urgency === "CRITICAL"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : rec.urgency === "HIGH"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                }`}
              >
                {rec.urgency} URGENCY
              </span>
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
                {rec.targetDepartment}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-2">
              {rec.title}
            </h1>
            <p className="text-xs text-foreground-muted mt-0.5">
              Curriculum Intervention Blueprint & Cohort Execution Plan
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/courses/${rec.courseId}`}
              className="flex items-center gap-1.5 rounded-md border border-blue-900/40 bg-[#0A1227] px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/5 transition-colors"
            >
              <span>View Portal Course Content</span>
              <ExternalLink className="h-3.5 w-3.5 text-foreground-muted" />
            </Link>
            <Link
              href="/admin/reports"
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export BOS Syllabus Proposal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Rationale & Explainability Section */}
      <div className="rounded-md border border-blue-900/50 bg-[#0A1227] p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
          <Sparkles className="h-4 w-4" />
          <h2>Explainable AI Rationale & Placement Impact</h2>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          {rec.whyThisCourse}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-blue-950/80">
          <div className="rounded-md border border-blue-950/60 bg-[#060A14] p-3">
            <span className="text-[11px] text-foreground-muted block">Estimated Readiness Gain</span>
            <div className="flex items-center gap-1 text-emerald-400 font-bold text-lg mt-0.5">
              <ArrowUpRight className="h-4 w-4" />
              <span>+{rec.estimatedReadinessGain}%</span>
            </div>
          </div>

          <div className="rounded-md border border-blue-950/60 bg-[#060A14] p-3">
            <span className="text-[11px] text-foreground-muted block">Targeted Student Cohort</span>
            <span className="text-lg font-bold text-white block mt-0.5">
              {rec.targetStudentsCount} students
            </span>
          </div>

          <div className="rounded-md border border-blue-950/60 bg-[#060A14] p-3">
            <span className="text-[11px] text-foreground-muted block">Intervention Duration</span>
            <span className="text-lg font-bold text-white block mt-0.5">
              {rec.durationWeeks} Weeks
            </span>
          </div>

          <div className="rounded-md border border-blue-950/60 bg-[#060A14] p-3">
            <span className="text-[11px] text-foreground-muted block">Primary Competency</span>
            <span className="text-lg font-bold text-cyan-400 block mt-0.5 truncate">
              {rec.skill}
            </span>
          </div>
        </div>
      </div>

      {/* Syllabus / Module Blueprint */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: Weekly Curriculum Modules */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-5 lg:col-span-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-blue-950/60 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">
                Course Module Blueprint & Lab Syllabus
              </h2>
            </div>
            <span className="text-[11px] text-foreground-muted font-mono">
              Course ID: {rec.courseId}
            </span>
          </div>

          <div className="space-y-3">
            {rec.modules.map((module, idx) => (
              <div
                key={idx}
                className="rounded-md border border-blue-950/60 bg-[#060A14]/70 p-3.5 flex items-start gap-3"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-500/20 text-blue-400 font-bold text-xs">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Module {idx + 1}: {module}</h3>
                  <p className="text-[11px] text-foreground-muted mt-1 leading-normal">
                    Hands-on practical assignments, automated code evaluation rubrics, and portfolio-ready capstone project component.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4 cols: Rollout Timeline & Assessment Strategy */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-5 lg:col-span-4 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-blue-950/60 pb-3">
            <GraduationCap className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Rollout Strategy</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-md border border-blue-950/60 bg-[#060A14] p-3 space-y-1">
              <span className="font-semibold text-white block">1. Faculty Briefing & FDP</span>
              <p className="text-foreground-muted text-[11px]">
                Organize 2-day orientation for department lab instructors.
              </p>
            </div>

            <div className="rounded-md border border-blue-950/60 bg-[#060A14] p-3 space-y-1">
              <span className="font-semibold text-white block">2. Automated Cohort Enrollment</span>
              <p className="text-foreground-muted text-[11px]">
                Target students with &lt;60% competency scores enrolled automatically.
              </p>
            </div>

            <div className="rounded-md border border-blue-950/60 bg-[#060A14] p-3 space-y-1">
              <span className="font-semibold text-white block">3. SkillLedger Verification Exam</span>
              <p className="text-foreground-muted text-[11px]">
                Post-course adaptive assessment updates candidate verified ledger badges.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button className="w-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90">
              Deploy to Academic Calendar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
