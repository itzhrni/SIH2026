import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { getRecruiterOpportunities } from "@/lib/opportunities/opportunity-service";
import {
  Briefcase,
  PlusCircle,
  Calendar,
  MapPin,
  Clock,
  IndianRupee,
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "My Opportunity Postings | SkillLedger Industry",
  description:
    "Manage your active job postings, internship mandates, and applicant counts.",
};

export default async function OpportunitiesPage() {
  const session = await getServerSession(nextAuthConfig);
  const recruiterId = session?.user?.id || "";

  const opportunities = await getRecruiterOpportunities(recruiterId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Opportunity Postings
          </h1>
          <p className="mt-0.5 text-xs text-foreground-muted">
            All active recruitment listings, required competency thresholds, and candidate pipeline stats.
          </p>
        </div>

        <Link href="/industry/opportunities/new">
          <Button
            size="sm"
            className="h-8 gap-1.5 bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Post New Opportunity</span>
          </Button>
        </Link>
      </div>

      {/* Postings List */}
      <div className="space-y-3">
        {opportunities.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-[#0E131F] p-12 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-foreground-subtle mb-2" />
            <h3 className="text-xs font-semibold text-white">
              No opportunities published yet
            </h3>
            <p className="mt-1 text-[11px] text-foreground-muted max-w-sm mx-auto">
              Get started by creating your first job posting or internship mandate.
            </p>
            <div className="mt-4">
              <Link href="/industry/opportunities/new">
                <Button size="sm" className="h-7 text-xs bg-primary text-white hover:bg-primary-hover">
                  <PlusCircle className="h-3.5 w-3.5 mr-1" />
                  Post First Opportunity
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          opportunities.map((opp) => (
            <div
              key={opp.id}
              className="rounded-lg border border-border bg-[#0E131F] p-4.5 transition-all duration-150 hover:border-primary/40 hover:bg-[#121827] space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm text-white">
                      {opp.title}
                    </h3>
                    <span className="rounded bg-white/[0.04] px-1.5 py-0.2 text-[10px] font-semibold uppercase text-foreground-muted border border-border/40">
                      {opp.type}
                    </span>
                    {opp.isActive ? (
                      <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-bold">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/[0.04] text-foreground-subtle px-2 py-0.2 text-[10px]">
                        Closed
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-foreground-muted">
                    {opp.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-foreground-subtle" />
                        {opp.location}
                      </span>
                    )}
                    {opp.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-foreground-subtle" />
                        {opp.duration}
                      </span>
                    )}
                    {opp.stipendRange && (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        {opp.stipendRange}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-foreground-subtle" suppressHydrationWarning>
                      <Calendar className="h-3 w-3" />
                      Closes {new Date(opp.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                    </span>
                  </div>
                </div>

                {/* Pipeline Actions */}
                <div className="shrink-0">
                  <Link href={`/industry/pipeline`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-border bg-white/[0.03] text-foreground hover:text-white hover:bg-white/10"
                    >
                      <span>Manage Pipeline</span>
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Required Skills Badges (Fixed: Clean ≥ symbol instead of raw $\ge$) */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-subtle">
                  Required Competency Thresholds:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {opp.requiredSkills.map((s) => (
                    <span
                      key={s.skill}
                      className="inline-flex items-center gap-1 rounded bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-white border border-border/60"
                    >
                      <span>{s.skill}</span>
                      <span className="text-[10px] font-bold text-primary tabular-nums">
                        ≥ {s.minThreshold}%
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between pt-2.5 border-t border-border/50 text-[11px] text-foreground-muted">
                <div className="flex items-center gap-5">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <strong className="text-white font-semibold">{opp.applicantCount}</strong> Total Applicants
                  </span>
                  <span className="flex items-center gap-1.5">
                    <strong className="text-white font-semibold">{opp.shortlistedCount}</strong> Shortlisted
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <strong className="font-semibold">{opp.offersCount}</strong> Offers Extended
                  </span>
                </div>

                <span className="text-[10px] text-foreground-subtle hidden sm:inline" suppressHydrationWarning>
                  Created {new Date(opp.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
