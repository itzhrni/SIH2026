import React from "react";
import Link from "next/link";
import { PostOpportunityForm } from "@/components/opportunities/PostOpportunityForm";

export const metadata = {
  title: "Post New Opportunity | SkillLedger Industry",
  description:
    "Create and publish job, internship, and learning program postings with competency thresholds.",
};

export default function NewOpportunityPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-xs text-foreground-muted">
          <Link
            href="/industry/recruiter-dashboard"
            className="hover:text-foreground"
          >
            Industry Portal
          </Link>
          <span>/</span>
          <Link
            href="/industry/my-postings"
            className="hover:text-foreground"
          >
            Opportunities
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">New Posting</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Publish Opportunity
        </h1>
        <p className="mt-0.5 text-xs text-foreground-muted sm:text-sm">
          Define job openings, internship mandates, and industry programs with
          structured skill requirements.
        </p>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl">
        <PostOpportunityForm />
      </div>
    </div>
  );
}
