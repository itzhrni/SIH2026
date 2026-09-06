"use client";

// components/student/StudentShell.tsx
// Client wrapper for student portal navigation and layout.
// Strictly adheres to UI_UX_SPEC.md §4.1, §5.2, §11, and §13.

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BrainCircuit,
  Award,
  Briefcase,
  FileText,
  BadgeCheck,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";

interface StudentShellProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    institution?: string | null;
  };
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assess", label: "Assessments", icon: BrainCircuit },
  { href: "/portfolio", label: "Digital Portfolio", icon: Award },
  { href: "/opportunities", label: "Opportunities", icon: Briefcase },
  { href: "/applications", label: "Applications", icon: FileText },
];

export function StudentShell({ children, user }: StudentShellProps) {
  const pathname = usePathname();

  // In active assessment session (e.g. /assess/cuid...), hide sidebar for focused UI
  const isLiveAssessment =
    pathname.startsWith("/assess/") && pathname !== "/assess";

  const userName = user.name ?? "Student";
  const initials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "ST";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Topbar — h-12 / 48px */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center border-b border-border bg-background px-4 gap-3">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm [background:linear-gradient(135deg,#0067B8,#4F46E5)]">
            <BadgeCheck className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            SkillLedger
          </span>
        </Link>

        <div className="mx-3 h-4 w-px bg-border" />

        {/* Role pill */}
        <span className="rounded-sm border border-border bg-background-muted px-2 py-0.5 text-xs font-medium text-foreground-muted">
          Student
        </span>

        {/* Right side user info */}
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-medium text-foreground block">
              {userName}
            </span>
            {user.institution && (
              <span className="text-2xs text-foreground-subtle block">
                {user.institution}
              </span>
            )}
          </div>
          <Avatar className="h-7 w-7 rounded-sm">
            <AvatarFallback className="rounded-sm bg-primary-subtle text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Sidebar navigation — omitted during live assessment session */}
      {!isLiveAssessment && (
        <aside className="fixed top-12 bottom-0 left-0 w-56 border-r border-border bg-background p-3 flex flex-col justify-between z-40">
          <div className="space-y-1">
            <p className="px-3 pb-1 pt-2 text-2xs font-medium uppercase tracking-wider text-foreground-subtle">
              Navigation
            </p>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
                    isActive
                      ? "font-medium text-primary bg-primary-subtle"
                      : "text-foreground-muted hover:bg-background-muted hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-foreground-muted"}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-border pt-3">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs text-foreground-muted transition-colors duration-150 hover:bg-background-muted hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main content area */}
      <main
        className={`min-h-screen pt-12 transition-all duration-150 ${
          isLiveAssessment ? "px-4 py-6" : "pl-56 px-6 py-6"
        }`}
      >
        <div
          className={
            isLiveAssessment ? "mx-auto max-w-2xl" : "mx-auto max-w-7xl"
          }
        >
          {children}
        </div>
      </main>
    </div>
  );
}
