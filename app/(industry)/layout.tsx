// app/(industry)/layout.tsx
// RULE FE-01: Server Component — no hooks, no events
import Link from "next/link";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  Briefcase,
  ClipboardList,
} from "lucide-react";

export default async function IndustryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || session.user.role !== "INDUSTRY") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Topbar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-12 items-center border-b border-border bg-card px-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-foreground">
            SkillLedger
          </span>
          <span className="rounded-sm bg-primary-subtle px-1.5 py-0.5 text-2xs font-medium uppercase tracking-wider text-primary">
            Industry
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-foreground-muted">
            {session.user.name}
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-subtle text-xs font-semibold text-primary">
            {session.user.name?.charAt(0).toUpperCase() ?? "I"}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 top-12 w-56 border-r border-border bg-background-subtle pt-4">
        <nav className="flex flex-col gap-0.5 px-2">
          <p className="px-3 pb-1 pt-2 text-2xs font-medium uppercase tracking-wider text-foreground-subtle">
            Overview
          </p>
          <Link
            href="/industry/recruiter-dashboard"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors duration-150 hover:bg-background-muted hover:text-foreground"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span>Dashboard</span>
          </Link>

          <p className="px-3 pb-1 pt-4 text-2xs font-medium uppercase tracking-wider text-foreground-subtle">
            Post
          </p>
          <Link
            href="/industry/post/internship"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors duration-150 hover:bg-background-muted hover:text-foreground"
          >
            <PlusCircle className="h-4 w-4 shrink-0" />
            <span>Post Internship</span>
          </Link>
          <Link
            href="/industry/post/job"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors duration-150 hover:bg-background-muted hover:text-foreground"
          >
            <Briefcase className="h-4 w-4 shrink-0" />
            <span>Post Job</span>
          </Link>
          <Link
            href="/industry/my-postings"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors duration-150 hover:bg-background-muted hover:text-foreground"
          >
            <ClipboardList className="h-4 w-4 shrink-0" />
            <span>My Postings</span>
          </Link>

          <p className="px-3 pb-1 pt-4 text-2xs font-medium uppercase tracking-wider text-foreground-subtle">
            Recruitment
          </p>
          <Link
            href="/industry/recruiter-dashboard"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors duration-150 hover:bg-background-muted hover:text-foreground"
          >
            <ClipboardList className="h-4 w-4 shrink-0" />
            <span>My Pipelines</span>
          </Link>
          <Link
            href="/industry/discover"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors duration-150 hover:bg-background-muted hover:text-foreground"
          >
            <Users className="h-4 w-4 shrink-0" />
            <span>Discover Candidates</span>
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="ml-56 flex-1 overflow-y-auto pt-12">
        <div className="px-6 py-5">{children}</div>
      </main>
    </div>
  );
}
