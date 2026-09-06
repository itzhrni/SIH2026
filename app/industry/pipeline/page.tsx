import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import {
  getPipelineApplicants,
  getRecruiterOpportunities,
} from "@/lib/opportunities/opportunity-service";
import { PlacementPipeline } from "@/components/opportunities/PlacementPipeline";
import { UserCheck } from "lucide-react";

export const metadata = {
  title: "Placement Pipeline Management | SkillLedger Industry",
  description:
    "Manage candidate recruitment stages, shortlists, interview scheduling, and offer extensions.",
};

export default async function PipelinePage() {
  const session = await getServerSession(nextAuthConfig);
  const recruiterId = session?.user?.id || "";

  const [applicants, opportunities] = await Promise.all([
    getPipelineApplicants(recruiterId),
    getRecruiterOpportunities(recruiterId),
  ]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-xs text-foreground-muted">
          <Link href="/industry/dashboard" className="hover:text-foreground">
            Industry Portal
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            Placement Pipeline
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Placement Pipeline
        </h1>
        <p className="mt-0.5 text-xs text-foreground-muted sm:text-sm">
          Track applicants through review, interview rounds, and confirmed
          placement offers with recruiter notes.
        </p>
      </div>

      {/* Placement Pipeline Component */}
      <PlacementPipeline
        initialApplicants={applicants}
        opportunities={opportunities}
      />
    </div>
  );
}
