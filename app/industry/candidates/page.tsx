import React from "react";
import Link from "next/link";
import { searchCandidates } from "@/lib/matching/candidate-discovery";
import { CandidateDiscoveryTable } from "@/components/opportunities/CandidateDiscoveryTable";
import { Users, Sparkles } from "lucide-react";

export const metadata = {
  title: "Candidate Discovery & Talent Matching | SkillLedger Industry",
  description:
    "Search verified student candidates with competency match ranking and longitudinal performance tracking.",
};

export default async function CandidatesPage() {
  const initialCandidates = await searchCandidates({});

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="border-b border-border pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <Link
                href="/industry/recruiter-dashboard"
                className="hover:text-foreground"
              >
                Industry Portal
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">
                Candidate Discovery
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Candidate Discovery
            </h1>
            <p className="mt-0.5 text-xs text-foreground-muted sm:text-sm">
              Discover students verified by adaptive AI assessments with
              real-time competency matching & longitudinal signals
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background-subtle px-3 py-1.5 text-xs text-foreground-muted">
              <Sparkles className="h-3.5 w-3.5 text-warning" />
              Longitudinal Signal Engine Active
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Table Component */}
      <CandidateDiscoveryTable initialCandidates={initialCandidates} />
    </div>
  );
}
