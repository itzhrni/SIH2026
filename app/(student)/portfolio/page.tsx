// app/(student)/portfolio/page.tsx
// Verified Student Digital Portfolio page adhering to UI_UX_SPEC.md §5.7 and MVP_Cut.md §3.3.
// RULE FE-01: Server Component.
// RULE FE-03: Direct async/await data fetching with Prisma.

import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { prisma } from "@/lib/db";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SkillBadge } from "@/components/portfolio/SkillBadge";
import { SkillTimeline } from "@/components/portfolio/SkillTimeline";
import { DepthProfile } from "@/components/portfolio/DepthProfile";
import { PortfolioShareButton } from "@/components/portfolio/PortfolioShareButton";
import { IN_PORTAL_COURSES, getCoursesForDomain } from "@/lib/courses/course-registry";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { DomainScore, ScoreHistoryPoint } from "@/types";
import {
  FileText,
  Github,
  Building2,
  Calendar,
  CheckCircle2,
  Lock,
  AlertTriangle,
  XCircle,
  BookOpen,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";

const PRE_BUILT_DOMAINS = [
  "dsa",
  "system-design",
  "machine-learning",
  "core-cs",
  "ayurvedic-pharmacology",
  "clinical-practice",
];

export default async function StudentPortfolioPage() {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // 1. Fetch user data, skillProfile, score history, internships, and gap reports
  const [user, profile, internships, gapReports] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        institution: true,
        department: true,
      },
    }),
    prisma.skillProfile.findUnique({
      where: { userId },
      include: {
        scoreHistory: {
          orderBy: { recordedAt: "asc" },
        },
      },
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

  const domainScores = (profile?.domainScores ?? {}) as unknown as Record<
    string,
    DomainScore
  >;
  const badges = (profile?.badges ?? {}) as unknown as Record<
    string,
    { earned: boolean; earnedAt: string | null }
  >;
  const scoreHistory = (profile?.scoreHistory ?? []).map((h) => ({
    domain: h.domain,
    score: h.score,
    recordedAt: h.recordedAt.toISOString(),
    sessionId: h.sessionId,
  })) as ScoreHistoryPoint[];

  // Concept diagnostics extraction
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

  gapReports.forEach((report) => {
    const weakList = Array.isArray(report.weakNodes) ? (report.weakNodes as string[]) : [];
    const partialList = Array.isArray(report.partialNodes) ? (report.partialNodes as string[]) : [];
    const strongList = Array.isArray(report.strongNodes) ? (report.strongNodes as string[]) : [];
    const matchedCourse = getCoursesForDomain(report.domain)[0];

    weakList.forEach((concept) => {
      diagnosedWeaknesses.push({
        concept,
        domain: report.domain,
        type: "WEAK",
        recommendedCourse: matchedCourse ? { id: matchedCourse.id, title: matchedCourse.title } : undefined,
      });
    });

    partialList.forEach((concept) => {
      diagnosedWeaknesses.push({
        concept,
        domain: report.domain,
        type: "PARTIAL",
        recommendedCourse: matchedCourse ? { id: matchedCourse.id, title: matchedCourse.title } : undefined,
      });
    });

    strongList.forEach((concept) => {
      diagnosedStrengths.push({
        concept,
        domain: report.domain,
      });
    });
  });

  const userName = user.name;
  const initials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "ST";

  // Sample self-reported student projects for MVP portfolio demonstration
  const projects = [
    {
      title: "Distributed In-Memory Key-Value Store",
      description:
        "LSM-tree based persistent storage engine with Raft consensus replication, write-ahead logging, and configurable bloom filters.",
      githubUrl: "https://github.com/demo/distributed-kv-store",
      skills: ["system-design", "core-cs", "dsa"],
    },
    {
      title: "Automated Clinical Diagnosis Support Pipeline",
      description:
        "Transformer-based medical NER system integrating clinical terminology with Ayurvedic pharmacology references for patient intake classification.",
      githubUrl: "https://github.com/demo/clinical-diagnosis-pipeline",
      skills: ["machine-learning", "ayurvedic-pharmacology"],
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header bar with Copy Shareable Link */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Digital Skill Portfolio
          </h1>
          <p className="mt-0.5 text-xs text-foreground-muted">
            Platform-verified skill credentials, longitudinal reasoning growth, concept gap diagnostics, and verified artifacts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/courses">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-border bg-white/[0.03] text-xs font-medium hover:bg-white/10"
            >
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>In-Portal Courses</span>
            </Button>
          </Link>
          <PortfolioShareButton studentId={user.id} studentName={user.name} />
        </div>
      </div>

      {/* Portfolio layout — two-column on desktop (UI_UX_SPEC §5.7) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: identity + verified badges (sticky on desktop) */}
        <div className="space-y-4 lg:sticky lg:top-16 lg:self-start">
          {/* Identity Card */}
          <div className="rounded-lg border border-border bg-[#0E131F] p-5">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 rounded-lg border border-border bg-primary/10">
                <AvatarFallback className="rounded-lg bg-primary/20 text-primary font-bold text-base">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-white truncate">
                  {user.name}
                </h2>
                <p className="text-xs text-foreground-muted truncate">
                  {user.institution ?? "Autonomous Institution"}
                </p>
                <p className="text-[11px] text-foreground-subtle mt-0.5 truncate">
                  {user.department ?? "Computer Science & Engineering"}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified Identity · SkillLedger</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verified Badges Section */}
          <div className="rounded-lg border border-border bg-[#0E131F] p-5">
            <div className="mb-3 border-b border-border/60 pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                Verified Skill Badges
              </h3>
              <p className="text-[10px] text-foreground-muted mt-0.5">
                Earned strictly by scoring ≥ 75 in adaptive AI assessments
              </p>
            </div>

            <div className="space-y-2">
              {PRE_BUILT_DOMAINS.map((domain) => {
                const isEarned = badges[domain]?.earned;

                return (
                  <div key={domain}>
                    {isEarned ? (
                      <SkillBadge domain={domain} earned={true} />
                    ) : (
                      <div className="flex items-center gap-2 rounded border border-dashed border-border/60 bg-white/[0.01] px-2.5 py-1.5 text-[11px] text-foreground-subtle">
                        <Lock className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {domain.toUpperCase().replace("-", " ")} — not yet verified
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Self-Reported Document Store (MVP Feature 14.2) */}
          <div className="rounded-lg border border-border bg-[#0E131F] p-5">
            <div className="mb-3 border-b border-border/60 pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                Verified Documents
              </h3>
              <p className="text-[10px] text-foreground-muted mt-0.5">
                Restricted to authorized recruiters upon opportunity application
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded border border-border bg-white/[0.02] p-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      Resume_2026.pdf
                    </p>
                    <span className="text-[10px] text-foreground-subtle">
                      Self-Reported · PDF
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-foreground-muted bg-white/[0.05] px-1.5 py-0.5 rounded">
                  Restricted
                </span>
              </div>

              <div className="flex items-center justify-between rounded border border-border bg-white/[0.02] p-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      Academic_Transcript.pdf
                    </p>
                    <span className="text-[10px] text-foreground-subtle">
                      Institutional Record
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-foreground-muted bg-white/[0.05] px-1.5 py-0.5 rounded">
                  Restricted
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: main content (Concept Gaps, Timeline, Depth, Internships, Projects) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Concept Knowledge Gaps & Remediation Status Card */}
          <div className="rounded-lg border border-border bg-[#0E131F]">
            <div className="border-b border-border px-5 py-3.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Concept Knowledge Diagnostics & Learning Remediation
                  </h3>
                </div>
                <p className="text-xs text-foreground-muted mt-0.5">
                  Granular conceptual gap analysis identified by 4D AI evaluations with linked in-portal coursework.
                </p>
              </div>
              <span className="rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                {diagnosedWeaknesses.length} Action Items
              </span>
            </div>

            <div className="p-5 space-y-4">
              {diagnosedWeaknesses.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {diagnosedWeaknesses.map((item, idx) => (
                      <div
                        key={`${item.domain}-${item.concept}-${idx}`}
                        className="rounded border border-border/80 bg-black/20 p-3 space-y-2 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-foreground-subtle">
                              {item.domain.replace("-", " ")}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider border ${
                                item.type === "WEAK"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                  : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {item.type === "WEAK" ? "Gap" : "Developing"}
                            </span>
                          </div>

                          <h4 className="text-xs font-semibold text-white mt-1">
                            {item.concept}
                          </h4>

                          {item.recommendedCourse && (
                            <p className="text-[10px] text-foreground-muted mt-1 truncate">
                              Course: {item.recommendedCourse.title}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/40">
                          {item.recommendedCourse ? (
                            <Link href={`/courses/${item.recommendedCourse.id}`} className="flex-1">
                              <Button size="sm" className="w-full h-6 text-[11px] bg-primary text-white hover:bg-primary-hover px-2 gap-1 shadow-xs">
                                <BookOpen className="h-2.5 w-2.5" />
                                <span>Remediate</span>
                              </Button>
                            </Link>
                          ) : (
                            <Link href="/courses" className="flex-1">
                              <Button size="sm" className="w-full h-6 text-[11px] bg-primary text-white hover:bg-primary-hover px-2 gap-1 shadow-xs">
                                <BookOpen className="h-2.5 w-2.5" />
                                <span>Courses</span>
                              </Button>
                            </Link>
                          )}
                          <Link href={`/assess?domain=${item.domain}`}>
                            <Button size="sm" variant="outline" className="h-6 text-[11px] border-border bg-white/[0.03] text-foreground hover:text-white px-2">
                              <span>Retest</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  {diagnosedStrengths.length > 0 && (
                    <div className="rounded border border-emerald-500/30 bg-emerald-500/[0.03] p-3 space-y-1.5">
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified Concept Masteries (Score ≥ 75%)
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {diagnosedStrengths.map((s, idx) => (
                          <span
                            key={`${s.domain}-${s.concept}-${idx}`}
                            className="inline-flex items-center gap-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.2 text-[10px] font-medium"
                          >
                            <Check className="h-2.5 w-2.5" />
                            <span>{s.concept}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center space-y-2">
                  <p className="text-xs text-foreground-muted">
                    No conceptual gaps diagnosed. Complete an adaptive 4D AI assessment to populate your concept diagnostics and course recommendations.
                  </p>
                  <Link href="/assess">
                    <Button size="sm" className="h-7 text-xs bg-primary text-white hover:bg-primary-hover px-3 gap-1">
                      <BrainCircuit className="h-3 w-3" />
                      <span>Take 4D Assessment</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Living Skill Development Graph — Line chart over time (Core Novelty) */}
          <div className="rounded-lg border border-border bg-[#0E131F]">
            <div className="border-b border-border px-5 py-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Living Skill Development Graph
                  </h3>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    Longitudinal trajectory of domain proficiency scores across adaptive assessment sessions
                  </p>
                </div>
                <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Core Novelty
                </span>
              </div>
            </div>

            <div className="p-5">
              <SkillTimeline history={scoreHistory} />
            </div>
          </div>

          {/* Topic-Wise Knowledge Depth Profile */}
          <div className="rounded-lg border border-border bg-[#0E131F]">
            <div className="border-b border-border px-5 py-3.5">
              <h3 className="text-sm font-semibold text-white">
                Knowledge Depth Profile
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                Topic-level proficiency scores with benchmark status and competency tiering
              </p>
            </div>

            <div className="p-5">
              <DepthProfile domainScores={domainScores} />
            </div>
          </div>

          {/* Internship Records — Populated by Module 2 Tracker */}
          <div className="rounded-lg border border-border bg-[#0E131F]">
            <div className="border-b border-border px-5 py-3.5">
              <h3 className="text-sm font-semibold text-white">
                Verified Internship Records
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                Completed industry engagements confirmed with mentor verification
              </p>
            </div>

            <div className="p-5">
              {internships.length > 0 ? (
                <div className="space-y-3">
                  {internships.map((record) => (
                    <div
                      key={record.id}
                      className="rounded border border-border bg-white/[0.02] p-3.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary" />
                            <h4 className="text-sm font-semibold text-white">
                              {record.companyName}
                            </h4>
                          </div>
                          <p className="text-xs text-foreground-muted mt-1 font-medium">
                            {record.role}
                          </p>
                        </div>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                            record.isComplete
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {record.isComplete
                            ? "Completed & Verified"
                            : "In Progress"}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-foreground-subtle" suppressHydrationWarning>
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(record.startDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              year: "numeric",
                              timeZone: "UTC",
                            },
                          )}
                          {" — "}
                          {record.endDate
                            ? new Date(record.endDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  year: "numeric",
                                  timeZone: "UTC",
                                },
                              )
                            : "Present"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-foreground-muted text-center py-4">
                  No completed internship records yet.
                </p>
              )}
            </div>
          </div>

          {/* Self-Reported Project Entries */}
          <div className="rounded-lg border border-border bg-[#0E131F]">
            <div className="border-b border-border px-5 py-3.5">
              <h3 className="text-sm font-semibold text-white">
                Technical Projects
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                Applied development projects linked to relevant assessed domains
              </p>
            </div>

            <div className="divide-y divide-border/60">
              {projects.map((proj) => (
                <div key={proj.title} className="p-5 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-semibold text-white">
                      {proj.title}
                    </h4>
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Github className="h-3.5 w-3.5" />
                        <span>Source</span>
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-foreground-muted leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-white/[0.04] border border-border/60 px-2 py-0.5 text-[10px] text-foreground-muted"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
