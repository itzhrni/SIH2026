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
import type { DomainScore, ScoreHistoryPoint } from "@/types";
import {
  FileText,
  Github,
  Building2,
  Calendar,
  CheckCircle2,
  Lock,
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

  // 1. Fetch user data, skillProfile, score history, and internships
  const [user, profile, internships] = await Promise.all([
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
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header bar with Copy Shareable Link */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Digital Skill Portfolio
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Platform-verified skill credentials, longitudinal reasoning growth,
            and self-reported artifacts.
          </p>
        </div>

        <PortfolioShareButton studentId={user.id} studentName={user.name} />
      </div>

      {/* Portfolio layout — two-column on desktop (UI_UX_SPEC §5.7) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: identity + verified badges (sticky on desktop) */}
        <div className="space-y-4 lg:sticky lg:top-16 lg:self-start">
          {/* Identity Card */}
          <div className="rounded-md border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-11 w-11 rounded-md">
                <AvatarFallback className="rounded-md bg-primary-subtle text-primary font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-foreground truncate">
                  {user.name}
                </h2>
                <p className="text-xs text-foreground-muted truncate">
                  {user.institution ?? "Autonomous Institution"}
                </p>
                <p className="text-2xs text-foreground-subtle mt-0.5">
                  {user.department ?? "Computer Science & Engineering"}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-2xs text-primary font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Verified Identity · SkillLedger</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verified Badges Section */}
          <div className="rounded-md border border-border bg-card p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Verified Skill Badges
              </h3>
              <p className="text-2xs text-foreground-subtle mt-0.5">
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
                      <div className="flex items-center gap-2 rounded-sm border border-dashed border-border px-2.5 py-1.5 text-2xs text-foreground-subtle">
                        <Lock className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {domain.toUpperCase()} — not yet verified
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Self-Reported Document Store (MVP Feature 14.2) */}
          <div className="rounded-md border border-border bg-card p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Uploaded Documents
              </h3>
              <p className="text-2xs text-foreground-subtle mt-0.5">
                Restricted to authorized recruiters upon opportunity application
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-sm border border-border bg-background-subtle p-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      Resume_2026.pdf
                    </p>
                    <span className="text-2xs text-foreground-subtle">
                      Self-Reported · PDF
                    </span>
                  </div>
                </div>
                <span className="text-2xs font-medium text-foreground-muted bg-background-muted px-1.5 py-0.5 rounded-sm">
                  Restricted
                </span>
              </div>

              <div className="flex items-center justify-between rounded-sm border border-border bg-background-subtle p-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      Academic_Transcript.pdf
                    </p>
                    <span className="text-2xs text-foreground-subtle">
                      Institutional Record
                    </span>
                  </div>
                </div>
                <span className="text-2xs font-medium text-foreground-muted bg-background-muted px-1.5 py-0.5 rounded-sm">
                  Restricted
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: main content (Timeline, Depth, Internships, Projects) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Living Skill Development Graph — Line chart over time (Core Novelty) */}
          <div className="rounded-md border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Living Skill Development Graph
                  </h3>
                  <p className="text-xs text-foreground-subtle mt-0.5">
                    Longitudinal trajectory of domain proficiency scores across
                    adaptive assessment sessions
                  </p>
                </div>
                <span className="rounded-sm bg-primary-subtle px-2 py-0.5 text-2xs font-semibold text-primary">
                  Core Novelty
                </span>
              </div>
            </div>

            <div className="p-4">
              <SkillTimeline history={scoreHistory} />
            </div>
          </div>

          {/* Topic-Wise Knowledge Depth Profile */}
          <div className="rounded-md border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-base font-semibold text-foreground">
                Knowledge Depth Profile
              </h3>
              <p className="text-xs text-foreground-subtle mt-0.5">
                Topic-level proficiency scores with benchmark status and
                competency tiering
              </p>
            </div>

            <div className="p-4">
              <DepthProfile domainScores={domainScores} />
            </div>
          </div>

          {/* Internship Records — Populated by Module 2 Tracker */}
          <div className="rounded-md border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-base font-semibold text-foreground">
                Verified Internship Records
              </h3>
              <p className="text-xs text-foreground-subtle mt-0.5">
                Completed industry engagements confirmed with mentor
                verification
              </p>
            </div>

            <div className="p-4">
              {internships.length > 0 ? (
                <div className="space-y-3">
                  {internships.map((record) => (
                    <div
                      key={record.id}
                      className="rounded-sm border border-border bg-background-subtle p-3.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary" />
                            <h4 className="text-sm font-semibold text-foreground">
                              {record.companyName}
                            </h4>
                          </div>
                          <p className="text-xs text-foreground-muted mt-1 font-medium">
                            {record.role}
                          </p>
                        </div>
                        <span
                          className={`rounded-sm px-2 py-0.5 text-2xs font-medium ${
                            record.isComplete
                              ? "bg-success-bg text-success border border-success-border"
                              : "bg-info-bg text-info border border-info-border"
                          }`}
                        >
                          {record.isComplete
                            ? "Completed & Verified"
                            : "In Progress"}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-1.5 text-2xs text-foreground-subtle">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(record.startDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              year: "numeric",
                            },
                          )}
                          {" — "}
                          {record.endDate
                            ? new Date(record.endDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "Present"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-foreground-subtle text-center py-4">
                  No completed internship records yet.
                </p>
              )}
            </div>
          </div>

          {/* Self-Reported Project Entries */}
          <div className="rounded-md border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-base font-semibold text-foreground">
                Technical Projects
              </h3>
              <p className="text-xs text-foreground-subtle mt-0.5">
                Applied development projects linked to relevant assessed domains
              </p>
            </div>

            <div className="divide-y divide-border">
              {projects.map((proj) => (
                <div key={proj.title} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-semibold text-foreground">
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
                        className="rounded-sm border border-border bg-background-muted px-2 py-0.5 text-2xs text-foreground-muted"
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
