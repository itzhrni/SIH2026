import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Notice Bar */}
      <div className="border-b border-border bg-background-subtle px-4 py-2 text-center text-xs text-foreground-muted flex items-center justify-center gap-2">
        <span className="inline-flex items-center rounded-sm bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
          SIH 2026 · PS 26044
        </span>
        <span>
          Smart India Hackathon Prototype — Autonomous Skill Ledger & Placement
          Architecture
        </span>
      </div>

      {/* Main Navigation Bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm shadow-sm">
            SL
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-foreground">
              SkillLedger
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-foreground-muted border-l border-border pl-2">
              National Skill Ledger Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" size="sm" className="text-xs">
              Sign In
            </Button>
          </Link>
          <Link href="/industry/recruiter-dashboard">
            <Button size="sm" className="text-xs gap-1.5 shadow-sm">
              <Building2 className="w-3.5 h-3.5" />
              Industry Portal
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 max-w-5xl mx-auto w-full">
        <div className="text-center space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            Module M5 Live: Industry Discovery & Placement Pipeline
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Longitudinal Skill Verification & <br className="hidden sm:block" />
            <span className="text-primary">Precision Industry Placement</span>
          </h1>

          <p className="text-base sm:text-lg text-foreground-muted leading-relaxed">
            Move beyond static resumes. SkillLedger continuously tracks student
            skill trajectories through AI-evaluated technical assessments,
            providing recruiters with verified longitudinal growth signals.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href="/industry/recruiter-dashboard">
              <Button size="lg" className="gap-2 shadow-sm font-semibold">
                <Building2 className="w-4 h-4" />
                Launch Industry Portal (M5)
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                1-Click Demo Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full">
          {/* Card 1: Candidate Discovery */}
          <Card className="border border-border hover:border-primary/40 transition-colors duration-150">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">
                Longitudinal Signal Engine
              </CardTitle>
              <CardDescription className="text-xs">
                Judge-facing growth metrics computed across historical
                assessment sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-foreground-muted space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>
                  Classifies &quot;Rapid Improvers&quot; (+15% score delta)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Tracks stability and consistency indexes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Tamper-evident verification of domain scores</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Opportunity Posting */}
          <Card className="border border-border hover:border-primary/40 transition-colors duration-150">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Layers className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">
                Targeted Skill Criteria
              </CardTitle>
              <CardDescription className="text-xs">
                Post internships and jobs with exact domain and skill score
                thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-foreground-muted space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Automated skill match score calculation (0–100%)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Multi-threshold criteria (DSA, System Design, etc.)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Instant candidate ranking & talent shortlisting</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Placement Pipeline */}
          <Card className="border border-border hover:border-primary/40 transition-colors duration-150">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Award className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">Recruitment Pipeline</CardTitle>
              <CardDescription className="text-xs">
                Manage candidate transitions from application to interview &
                offer
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-foreground-muted space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>
                  Real-time status updates with recruiter private notes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Verified skill badge preview for every applicant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Enterprise RBAC protecting candidate data</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Credentials Cheat Sheet */}
        <div className="mt-12 p-4 rounded-md border border-border bg-card w-full max-w-2xl text-xs space-y-2">
          <div className="font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Live Demo Personas (Pre-seeded in PostgreSQL)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-foreground-muted">
            <div className="p-2 rounded bg-background-subtle border border-border">
              <div className="font-medium text-foreground">
                🏢 Vikram Malhotra (Recruiter)
              </div>
              <div>
                Email:{" "}
                <code className="text-primary font-mono">
                  recruiter.vikram@techcorp.dev
                </code>
              </div>
              <div>
                Password: <code className="font-mono">Demo@1234</code>
              </div>
            </div>
            <div className="p-2 rounded bg-background-subtle border border-border">
              <div className="font-medium text-foreground">
                🎓 Aarav Sharma (Top Candidate)
              </div>
              <div>
                Email:{" "}
                <code className="text-primary font-mono">
                  student.aarav@skillledger.dev
                </code>
              </div>
              <div>
                Password: <code className="font-mono">Demo@1234</code>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 text-center text-xs text-foreground-muted">
        SkillLedger · Smart India Hackathon 2026 · Problem Statement 26044 ·
        Built with Next.js 14, Prisma & PostgreSQL
      </footer>
    </div>
  );
}
