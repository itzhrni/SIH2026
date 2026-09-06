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
} from "lucide-react";

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
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="border-b border-border pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <Link
                href="/industry/dashboard"
                className="hover:text-foreground"
              >
                Industry Portal
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">Opportunities</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Opportunity Postings
            </h1>
            <p className="mt-0.5 text-xs text-foreground-muted sm:text-sm">
              All active recruitment listings and applicant engagement stats
            </p>
          </div>

          <Link
            href="/industry/opportunities/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-xs transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Post New Opportunity
          </Link>
        </div>
      </div>

      {/* Postings List */}
      <div className="space-y-4">
        {opportunities.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-card p-12 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-foreground-subtle" />
            <h3 className="mt-2 text-base font-semibold text-foreground">
              No opportunities published yet
            </h3>
            <p className="mt-1 text-xs text-foreground-muted max-w-sm mx-auto">
              Get started by creating your first job posting, internship
              program, or faculty development mandate.
            </p>
            <div className="mt-4">
              <Link
                href="/industry/opportunities/new"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Post First Opportunity
              </Link>
            </div>
          </div>
        ) : (
          opportunities.map((opp) => (
            <div
              key={opp.id}
              className="rounded-md border border-border bg-card p-5 transition-colors hover:border-border-strong space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground">
                      {opp.title}
                    </h3>
                    <span className="inline-flex items-center rounded-sm bg-background-muted px-2 py-0.5 text-2xs font-semibold uppercase text-foreground-muted border border-border">
                      {opp.type}
                    </span>
                    {opp.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-sm bg-success-bg px-1.5 py-0.2 text-2xs font-semibold text-success border border-success-border">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-sm bg-background-muted px-1.5 py-0.2 text-2xs font-medium text-foreground-subtle">
                        Closed
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-muted mt-1.5">
                    {opp.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {opp.location}
                      </span>
                    )}
                    {opp.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {opp.duration}
                      </span>
                    )}
                    {opp.stipendRange && (
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {opp.stipendRange}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Closes {new Date(opp.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Pipeline Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/industry/pipeline`}
                    className="inline-flex items-center gap-1 rounded-md bg-primary-subtle px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                  >
                    Manage Pipeline <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Required Skills Badges */}
              <div className="space-y-1">
                <span className="text-2xs font-medium uppercase tracking-wider text-foreground-subtle">
                  Required Competency Thresholds:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {opp.requiredSkills.map((s) => (
                    <span
                      key={s.skill}
                      className="inline-flex items-center rounded-sm bg-background-subtle px-2 py-0.5 text-xs font-medium text-foreground border border-border"
                    >
                      {s.skill}{" "}
                      <span className="ml-1 text-2xs text-foreground-muted font-bold">
                        $\ge${s.minThreshold}%
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-foreground-muted">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <strong>{opp.applicantCount}</strong> Total Applicants
                  </span>
                  <span className="flex items-center gap-1.5">
                    <strong>{opp.shortlistedCount}</strong> Shortlisted
                  </span>
                  <span className="flex items-center gap-1.5 text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <strong>{opp.offersCount}</strong> Offers Extended
                  </span>
                </div>

                <span className="text-2xs text-foreground-subtle">
                  Created {new Date(opp.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
