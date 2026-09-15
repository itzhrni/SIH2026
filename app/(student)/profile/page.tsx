// app/(student)/profile/page.tsx
// Comprehensive Student Profile page with verified academic identity and skill ledger credentials.
// RULE FE-01: Server Component.
// RULE FE-03: Direct async/await data fetching with Prisma.

import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { prisma } from "@/lib/db";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SkillBadge } from "@/components/portfolio/SkillBadge";
import { IN_PORTAL_COURSES, getCoursesForDomain, getRecommendedCourses } from "@/lib/courses/course-registry";
import type { DomainScore } from "@/types";
import {
  User,
  GraduationCap,
  Building2,
  Mail,
  Award,
  CheckCircle2,
  ArrowRight,
  BrainCircuit,
  FileText,
  Calendar,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  XCircle,
  BookOpen,
  Compass,
  Check,
} from "lucide-react";

export default async function StudentProfilePage() {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [user, profile, applicationCount, internships, gapReports] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        institution: true,
        department: true,
        createdAt: true,
      },
    }),
    prisma.skillProfile.findUnique({
      where: { userId },
      include: {
        scoreHistory: {
          orderBy: { recordedAt: "desc" },
          take: 5,
        },
      },
    }),
    prisma.application.count({
      where: { userId },
    }),
    prisma.internshipRecord.findMany({
      where: { studentId: userId },
      orderBy: { startDate: "desc" },
    }),
    prisma.gapReport.findMany({
      where: { userId },
      orderBy: { generatedAt: "desc" },
      take: 6,
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  const domainScores = (profile?.domainScores ?? {}) as unknown as Record<string, DomainScore>;
  const badges = (profile?.badges ?? {}) as unknown as Record<string, { earned: boolean; earnedAt: string | null }>;
  const earnedBadgesCount = Object.values(badges).filter((b) => b.earned).length;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "ST";

  // Aggregate concept-level diagnostics from all gap reports
  interface ConceptDiagnostic {
    concept: string;
    domain: string;
    type: "WEAK" | "PARTIAL";
    recommendedCourse?: {
      id: string;
      title: string;
    };
  }

  const diagnosedWeaknesses: ConceptDiagnostic[] = [];
  const diagnosedStrengths: { concept: string; domain: string }[] = [];
  const assessedDomains = new Set<string>();

  gapReports.forEach((report) => {
    assessedDomains.add(report.domain);
    const weakList = Array.isArray(report.weakNodes) ? (report.weakNodes as string[]) : [];
    const partialList = Array.isArray(report.partialNodes) ? (report.partialNodes as string[]) : [];
    const strongList = Array.isArray(report.strongNodes) ? (report.strongNodes as string[]) : [];

    const matchedCourses = getCoursesForDomain(report.domain);
    const defaultCourse = matchedCourses[0];

    weakList.forEach((concept) => {
      diagnosedWeaknesses.push({
        concept,
        domain: report.domain,
        type: "WEAK",
        recommendedCourse: defaultCourse ? { id: defaultCourse.id, title: defaultCourse.title } : undefined,
      });
    });

    partialList.forEach((concept) => {
      diagnosedWeaknesses.push({
        concept,
        domain: report.domain,
        type: "PARTIAL",
        recommendedCourse: defaultCourse ? { id: defaultCourse.id, title: defaultCourse.title } : undefined,
      });
    });

    strongList.forEach((concept) => {
      diagnosedStrengths.push({
        concept,
        domain: report.domain,
      });
    });
  });

  const gapDomainList = Array.from(assessedDomains);
  const recommendedCurricula = getRecommendedCourses(gapDomainList);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Identity Header Card */}
      <div className="rounded-lg border border-border bg-[#0E131F] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-lg border border-border bg-primary/10">
              <AvatarFallback className="rounded-lg bg-primary/20 text-primary font-bold text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white leading-tight">
                  {user.name}
                </h1>
                <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Ledger
                </span>
              </div>
              <p className="text-xs text-foreground-muted mt-0.5 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-foreground-subtle" />
                {user.institution || "National Competency Institute"}
                {user.department && ` · ${user.department}`}
              </p>
              <p className="text-[11px] text-foreground-subtle mt-0.5 flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-foreground-subtle" />
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/portfolio">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-border bg-white/[0.03] text-xs font-medium hover:bg-white/10"
              >
                <Award className="h-3.5 w-3.5 text-primary" />
                <span>Digital Portfolio</span>
              </Button>
            </Link>
            <Link href="/assess">
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs"
              >
                <BrainCircuit className="h-3.5 w-3.5" />
                <span>Assess Skills</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 4-Stat Metric Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/60">
          <div className="rounded bg-white/[0.02] border border-border/40 p-2.5">
            <span className="text-[10px] uppercase tracking-wider text-foreground-subtle font-semibold">
              Verified Badges
            </span>
            <p className="text-lg font-bold text-white tabular-nums mt-0.5">
              {earnedBadgesCount}
            </p>
          </div>

          <div className="rounded bg-white/[0.02] border border-border/40 p-2.5">
            <span className="text-[10px] uppercase tracking-wider text-foreground-subtle font-semibold">
              Assessed Domains
            </span>
            <p className="text-lg font-bold text-white tabular-nums mt-0.5">
              {Object.keys(domainScores).length}
            </p>
          </div>

          <div className="rounded bg-white/[0.02] border border-border/40 p-2.5">
            <span className="text-[10px] uppercase tracking-wider text-foreground-subtle font-semibold">
              Active Applications
            </span>
            <p className="text-lg font-bold text-white tabular-nums mt-0.5">
              {applicationCount}
            </p>
          </div>

          <div className="rounded bg-white/[0.02] border border-border/40 p-2.5">
            <span className="text-[10px] uppercase tracking-wider text-foreground-subtle font-semibold">
              Internships
            </span>
            <p className="text-lg font-bold text-white tabular-nums mt-0.5">
              {internships.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Split: Domain Scores + Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2/3: Domain Mastery Scores */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-lg border border-border bg-[#0B0F17] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Verified Domain Scores
                </h2>
                <p className="text-[11px] text-foreground-muted">
                  4-Dimensional evaluation composites calibrated against national standards
                </p>
              </div>
              <Link href="/assess" className="text-xs font-semibold text-primary hover:underline">
                New Assessment +
              </Link>
            </div>

            {Object.keys(domainScores).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(domainScores).map(([domainKey, scoreData]) => (
                  <div
                    key={domainKey}
                    className="rounded-lg border border-border bg-[#0E131F] p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {domainKey.replace("-", " ")}
                      </span>
                      <span className="text-xs font-bold text-primary tabular-nums">
                        {Math.round(scoreData.score)}% Score
                      </span>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-black/40 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(Math.round(scoreData.score), 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-foreground-subtle">
                      <span>
                        Status: {scoreData.score >= 75 ? "Verified Badge Awarded" : "Developing"}
                      </span>
                      <span suppressHydrationWarning>
                        Last evaluated: {new Date(scoreData.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-foreground-muted">
                <BrainCircuit className="mx-auto h-6 w-6 text-foreground-subtle mb-1.5" />
                No verified domain scores recorded yet. Take an assessment to populate your ledger.
              </div>
            )}
          </div>
        </div>

        {/* Right 1/3: Verified Badges */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-[#0B0F17] p-5 space-y-3">
            <div className="border-b border-border/80 pb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
                SkillLedger Badges
              </h2>
              <p className="text-[10px] text-foreground-muted">
                Score ≥ 75 benchmark
              </p>
            </div>

            <div className="space-y-2">
              {Object.entries(badges).length > 0 ? (
                Object.entries(badges).map(([domain, data]) => (
                  <SkillBadge
                    key={domain}
                    domain={domain}
                    earned={data.earned}
                  />
                ))
              ) : (
                <p className="text-xs text-foreground-muted py-2">
                  Complete an assessment scoring ≥ 75 to unlock a cryptographic SkillLedger badge.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Diagnosed Concept Knowledge Gaps & Remediation Pathways Section */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
                Concept Knowledge Gaps & Learning Remediation
              </h2>
            </div>
            <p className="text-xs text-foreground-muted mt-0.5">
              Specific conceptual topics diagnosed as weak or developing by the 4D AI evaluator, with mapped in-portal courses to bridge each gap.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/courses">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10 gap-1"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>All Courses</span>
              </Button>
            </Link>
          </div>
        </div>

        {diagnosedWeaknesses.length > 0 ? (
          <div className="space-y-4">
            {/* Concept Gap Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {diagnosedWeaknesses.map((item, idx) => (
                <div
                  key={`${item.domain}-${item.concept}-${idx}`}
                  className="rounded-lg border border-border bg-[#0E131F] p-4 flex flex-col justify-between gap-3 transition-all duration-150 hover:border-primary/40 hover:bg-[#121827]"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle">
                        {item.domain.replace("-", " ")}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          item.type === "WEAK"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {item.type === "WEAK" ? (
                          <>
                            <XCircle className="h-3 w-3 text-rose-400" />
                            <span>Critical Gap</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 text-amber-400" />
                            <span>Needs Depth</span>
                          </>
                        )}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white leading-snug">
                      {item.concept}
                    </h3>

                    {item.recommendedCourse && (
                      <p className="text-[11px] text-foreground-muted flex items-center gap-1">
                        <BookOpen className="h-3 w-3 text-primary shrink-0" />
                        <span>Remediate in: </span>
                        <strong className="text-foreground font-medium truncate">
                          {item.recommendedCourse.title}
                        </strong>
                      </p>
                    )}
                  </div>

                  {/* Actions for this concept gap */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                    {item.recommendedCourse ? (
                      <Link href={`/courses/${item.recommendedCourse.id}`} className="flex-1">
                        <Button
                          size="sm"
                          className="w-full h-7 text-xs bg-primary hover:bg-primary-hover text-white font-medium px-2 gap-1 shadow-xs"
                        >
                          <BookOpen className="h-3 w-3" />
                          <span>Study Course</span>
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/courses" className="flex-1">
                        <Button
                          size="sm"
                          className="w-full h-7 text-xs bg-primary hover:bg-primary-hover text-white font-medium px-2 gap-1 shadow-xs"
                        >
                          <BookOpen className="h-3 w-3" />
                          <span>Browse Course</span>
                        </Button>
                      </Link>
                    )}

                    <Link href={`/assess?domain=${item.domain}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-border bg-white/[0.03] text-foreground hover:text-white hover:bg-white/10 gap-1 px-2.5"
                      >
                        <BrainCircuit className="h-3 w-3 text-primary" />
                        <span>Retake 4D Test</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Verified Strengths Summary (if any) */}
            {diagnosedStrengths.length > 0 && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.04] p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Verified Concept Strengths (Score ≥ 75%)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {diagnosedStrengths.map((s, idx) => (
                    <span
                      key={`${s.domain}-${s.concept}-${idx}`}
                      className="inline-flex items-center gap-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-medium"
                    >
                      <Check className="h-2.5 w-2.5" />
                      <span>{s.concept}</span>
                      <span className="text-emerald-400/60 text-[9px] uppercase">
                        ({s.domain})
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-[#0E131F] p-6 text-center space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Compass className="h-5 w-5" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-semibold text-white">
                No Diagnosed Concept Gaps Yet
              </h3>
              <p className="text-xs text-foreground-muted">
                Complete an adaptive 4D AI skill assessment to reveal granular sub-topic strengths and targeted remediation checkpoints.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <Link href="/assess">
                <Button size="sm" className="h-8 text-xs bg-primary text-white hover:bg-primary-hover shadow-xs gap-1.5">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  <span>Start 4D Assessment</span>
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="sm" variant="outline" className="h-8 text-xs border-border bg-white/[0.03] text-foreground hover:text-white hover:bg-white/10 gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <span>Explore In-Portal Courses</span>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Recommended In-Portal Interactive Courses */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                Recommended In-Portal Curricula (SkillLedger Academy)
              </h3>
            </div>
            <Link href="/courses" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              <span>View All ({IN_PORTAL_COURSES.length})</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedCurricula.map((course) => (
              <div
                key={course.id}
                className="group flex flex-col justify-between rounded-lg border border-border bg-[#0E131F] p-4 transition-all duration-150 hover:border-primary/40 hover:bg-[#121827]"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider">
                      {course.level} · {course.duration}
                    </span>
                    <span className="text-[10px] text-foreground-subtle font-medium">
                      {course.lessonsCount} Interactive Lessons
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white group-hover:text-primary transition-colors leading-snug">
                    {course.title}
                  </h4>

                  <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {course.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-white/[0.04] text-foreground-muted border border-border/50 px-1.5 py-0.2 text-[10px]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-border/40">
                  <span className="text-[10px] text-foreground-subtle truncate">
                    By {course.instructor.name}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Link href={`/courses/${course.id}`}>
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-primary hover:bg-primary-hover text-white font-medium px-2.5 gap-1 shadow-xs"
                      >
                        <span>Start Course</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
