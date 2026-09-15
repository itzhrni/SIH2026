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
} from "lucide-react";

export default async function StudentProfilePage() {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [user, profile, applicationCount, internships] = await Promise.all([
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
                      <span>
                        Last evaluated: {new Date(scoreData.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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
    </div>
  );
}
