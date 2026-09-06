// app/(industry)/pipeline/[postingId]/page.tsx
// RULE FE-01: Server Component — server data fetch + delegates to PipelineTable (client)
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PipelineTable } from "@/components/opportunities/PipelineTable";

interface PageProps {
  params: { postingId: string };
}

export default async function PipelinePage({ params }: PageProps) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || session.user.role !== "INDUSTRY") redirect("/login");

  const { postingId } = params;

  // Load posting + all applications — verify ownership (RULE DB-04)
  const posting = await prisma.opportunity.findUnique({
    where: { id: postingId },
    select: {
      id: true,
      title: true,
      type: true,
      postedById: true,
      applications: {
        select: {
          id: true,
          status: true,
          placementStatus: true,
          matchScoreAtApply: true,
          notes: true,
          appliedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              institution: true,
              department: true,
            },
          },
        },
        orderBy: { matchScoreAtApply: "desc" },
      },
    },
  });

  if (!posting) notFound();

  // Ownership guard
  if (posting.postedById !== session.user.id) {
    redirect("/industry/dashboard");
  }

  const applicants = posting.applications.map((app) => ({
    applicationId: app.id,
    studentId: app.user.id,
    studentName: app.user.name,
    studentInstitution: app.user.institution,
    studentDepartment: app.user.department,
    matchScoreAtApply: app.matchScoreAtApply,
    status: app.status,
    placementStatus: app.placementStatus ?? null,
    notes: app.notes ?? null,
    appliedAt: app.appliedAt.toISOString(),
  }));

  const isJobPosting = posting.type === "JOB";

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle mb-1">
          Pipeline · {posting.type}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {posting.title}
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          {applicants.length} applicant{applicants.length !== 1 ? "s" : ""} ·
          ranked by match score
        </p>
      </div>

      <PipelineTable
        applicants={applicants}
        isJobPosting={isJobPosting}
        postingId={postingId}
      />
    </div>
  );
}
