// app/(student)/profile/page.tsx
// Comprehensive Student Profile page adhering to UI_UX_SPEC.md.
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner & Identity Card */}
      <Card className="border-border bg-gradient-to-r from-card via-card to-primary/5 shadow-xs overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-primary via-indigo-500 to-cyan-500 w-full" />
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 rounded-xl border-2 border-primary/20 shadow-sm">
                <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {user.name}
                  </h1>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5">
                    Student Scholar
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-foreground-muted flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-foreground-subtle" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-foreground-subtle" />
                    {user.institution || "National Institute of Technology"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Verified SkillLedger Academic Identity</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href="/portfolio" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full gap-2 shadow-xs">
                  <FileText className="h-4 w-4 text-primary" />
                  View Full Portfolio
                </Button>
              </Link>
              <Link href="/assess" className="w-full sm:w-auto">
                <Button className="w-full gap-2 bg-primary text-white hover:bg-primary-hover shadow-xs">
                  <BrainCircuit className="h-4 w-4" />
                  Take Assessment
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Verified Badges
            </span>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-foreground mt-2">{earnedBadgesCount}</p>
          <p className="text-xs text-foreground-subtle mt-1">Score ≥ 75 benchmark</p>
        </Card>

        <Card className="border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Assessed Domains
            </span>
            <BrainCircuit className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-extrabold text-foreground mt-2">
            {Object.keys(domainScores).length}
          </p>
          <p className="text-xs text-foreground-subtle mt-1">Active competency profiles</p>
        </Card>

        <Card className="border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Applications
            </span>
            <GraduationCap className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-foreground mt-2">{applicationCount}</p>
          <p className="text-xs text-foreground-subtle mt-1">Submitted opportunities</p>
        </Card>

        <Card className="border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Internships
            </span>
            <Building2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-foreground mt-2">{internships.length}</p>
          <p className="text-xs text-foreground-subtle mt-1">Completed / in progress</p>
        </Card>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Academic Details & Verified Skill Scores */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Academic & Institutional Details
              </CardTitle>
              <CardDescription>
                Enrolled university details linked with continuous skill monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-background-subtle border border-border">
                  <span className="text-xs text-foreground-muted">Department / Branch</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {user.department || "Computer Science & Engineering"}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-background-subtle border border-border">
                  <span className="text-xs text-foreground-muted">Enrolled College</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {user.institution || "Autonomous Engineering & Technology Institute"}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-background-subtle border border-border">
                  <span className="text-xs text-foreground-muted">Degree Level</span>
                  <p className="font-semibold text-foreground mt-0.5">Bachelor of Technology (B.Tech)</p>
                </div>
                <div className="p-3.5 rounded-lg bg-background-subtle border border-border">
                  <span className="text-xs text-foreground-muted">Account Registered</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessed Competency Domain Scores */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  Assessed Competency Scores
                </CardTitle>
                <CardDescription>
                  Verified domain scores from adaptive 4D rubric assessments
                </CardDescription>
              </div>
              <Link href="/assess">
                <Button size="sm" variant="outline" className="text-xs gap-1">
                  New Test <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-5">
              {Object.keys(domainScores).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(domainScores).map(([domain, data]) => (
                    <div
                      key={domain}
                      className="p-3.5 rounded-lg border border-border bg-background-subtle flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">
                          {domain.replace("-", " ")}
                        </h4>
                        <p className="text-xs text-foreground-muted mt-0.5">
                          Last Updated:{" "}
                          {new Date(data.lastUpdated).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-lg font-extrabold px-3 py-1 rounded-md border ${
                            data.score >= 75
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                              : data.score >= 50
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                              : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                          }`}
                        >
                          {data.score}
                          <span className="text-xs font-normal">/100</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <BrainCircuit className="h-10 w-10 text-foreground-subtle mx-auto" />
                  <p className="text-sm text-foreground-muted">No domain assessments completed yet.</p>
                  <Link href="/assess">
                    <Button size="sm" className="bg-primary text-white">
                      Start Your First 4D Assessment
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Verified Badges & Navigation Shortcuts */}
        <div className="space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Verified Badges
              </CardTitle>
              <CardDescription className="text-xs">
                Credentials unlocked on SkillLedger
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {Object.entries(badges).length > 0 ? (
                Object.entries(badges).map(([domain, data]) => (
                  <SkillBadge key={domain} domain={domain} earned={data.earned} />
                ))
              ) : (
                <p className="text-xs text-foreground-subtle text-center py-4">
                  Earn badges by scoring ≥ 75 in adaptive assessments.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Portal Quick Links */}
          <Card className="border-border shadow-xs bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-foreground">
                Quick Portal Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Link href="/student/portfolio" className="block">
                <Button variant="outline" className="w-full justify-between text-xs h-9 bg-card">
                  <span>Living Skill Timeline</span>
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                </Button>
              </Link>
              <Link href="/student/opportunities" className="block">
                <Button variant="outline" className="w-full justify-between text-xs h-9 bg-card">
                  <span>Skill-Matched Opportunities</span>
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                </Button>
              </Link>
              <Link href="/student/courses" className="block">
                <Button variant="outline" className="w-full justify-between text-xs h-9 bg-card">
                  <span>In-Portal Interactive Courses</span>
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
