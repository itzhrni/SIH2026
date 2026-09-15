"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  GraduationCap,
  Activity,
  TrendingUp,
  TableProperties,
  BookOpenCheck,
  Sparkles,
  Briefcase,
  Building2,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  School,
  FileText,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AdminUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  institution?: string | null;
  role?: string | null;
}

interface AdminAppShellProps {
  children: React.ReactNode;
  user?: AdminUser;
}

const NAV_GROUPS = [
  {
    title: "Executive Intelligence",
    items: [
      { label: "Overview", href: "/admin/swan-dashboard", icon: LayoutDashboard },
      { label: "Student Readiness", href: "/admin/student-readiness", icon: GraduationCap },
      { label: "Skill Health & Drift", href: "/admin/skill-analytics", icon: Activity },
    ],
  },
  {
    title: "Demand & Curriculum",
    items: [
      { label: "Industry Demand", href: "/admin/industry-demand", icon: TrendingUp },
      { label: "Skill Gap Matrix", href: "/admin/skill-gap-matrix", icon: TableProperties },
      { label: "Curriculum Intelligence", href: "/admin/curriculum-intelligence", icon: BookOpenCheck },
      { label: "Course Interventions", href: "/admin/course-recommendations", icon: Sparkles },
    ],
  },
  {
    title: "Outcomes & Placement",
    items: [
      { label: "Placement Analytics", href: "/admin/placement-analytics", icon: Briefcase },
      { label: "Internship Analytics", href: "/admin/internship-analytics", icon: Building2 },
      { label: "Reports & Exports", href: "/admin/reports", icon: FileSpreadsheet },
    ],
  },
];

export function AdminAppShell({ children, user }: AdminAppShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const userName = user?.name || "Institution Admin";
  const institutionName = user?.institution || "National Institute of Technology";
  const userInitials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "IA";

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
    } catch (err) {
      console.error("Sign out error", err);
    } finally {
      window.location.href = "/login";
    }
  };

  const getPageInfo = () => {
    if (pathname.includes("swan-dashboard") || pathname === "/admin")
      return { title: "Executive Overview", category: "Analytics" };
    if (pathname.includes("student-readiness"))
      return { title: "Student Placement Readiness", category: "Cohort Intel" };
    if (pathname.includes("skill-analytics"))
      return { title: "Skill Health & Mastery Drift", category: "Competency" };
    if (pathname.includes("industry-demand"))
      return { title: "Industry Demand vs Supply", category: "Market Alignment" };
    if (pathname.includes("skill-gap-matrix"))
      return { title: "Skill Gap Matrix (Department × Skill)", category: "Diagnostics" };
    if (pathname.includes("curriculum-intelligence"))
      return { title: "Curriculum & Syllabus Intelligence", category: "Academics" };
    if (pathname.includes("course-recommendations"))
      return { title: "Targeted Course Interventions", category: "Action Plan" };
    if (pathname.includes("placement-analytics"))
      return { title: "Placement Funnel & Conversion", category: "Outcomes" };
    if (pathname.includes("internship-analytics"))
      return { title: "Internship & Industry Projects", category: "Experiential" };
    if (pathname.includes("reports"))
      return { title: "Accreditation & Audit Reports", category: "Compliance" };
    if (pathname.includes("settings"))
      return { title: "Institution Configuration", category: "Settings" };
    if (pathname.includes("profile"))
      return { title: "Administrator Profile", category: "Settings" };
    return { title: "Institution Portal", category: "Administration" };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-[#060A14] text-foreground flex">
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* PRIMARY NAVIGATION: Collapsible Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-blue-950/40 bg-[#080E1C] transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"}`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-blue-950/60 px-3.5">
          <Link
            href="/admin/swan-dashboard"
            className="flex items-center gap-2.5 overflow-hidden transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-sm">
              SL
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight text-white">
                    SkillLedger
                  </span>
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-blue-400">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-foreground-muted truncate">
                  {institutionName}
                </p>
              </div>
            )}
          </Link>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted hover:bg-white/5 hover:text-white transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="flex lg:hidden h-7 w-7 items-center justify-center rounded-md text-foreground-muted hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Main Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground-subtle">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin/swan-dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`group flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium transition-colors duration-150 ${
                      isActive
                        ? "bg-primary/20 text-white border border-primary/40 shadow-xs"
                        : "text-foreground-muted hover:bg-white/5 hover:text-white"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-primary"
                          : "text-foreground-muted group-hover:text-white"
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Utility & Profile Section with Logout */}
        <div className="border-t border-blue-950/60 p-2 space-y-1 bg-[#060A14]">
          <div
            className={`flex items-center gap-2.5 rounded-md p-1.5 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <Avatar className="h-7 w-7 shrink-0 rounded-md border border-blue-900/40">
              <AvatarFallback className="bg-blue-500/20 text-blue-400 text-[11px] font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {userName}
                </p>
                <p className="text-[10px] text-foreground-muted truncate">
                  TPO & Analytics
                </p>
              </div>
            )}

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="h-7 w-7 shrink-0 flex items-center justify-center rounded text-foreground-muted hover:bg-white/10 hover:text-destructive transition-colors"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE WRAPPER */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ease-in-out ${
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
        }`}
      >
        {/* TOP UTILITY BAR */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-blue-950/60 bg-[#080E1C]/90 px-4 md:px-6 backdrop-blur-md">
          {/* Left: Mobile Toggle & Context Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="flex lg:hidden h-8 w-8 items-center justify-center rounded-md border border-border text-foreground-muted hover:text-white"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-foreground-muted font-medium hidden sm:flex">
                <School className="h-3.5 w-3.5 text-blue-400" />
                <span>{institutionName}</span>
              </div>
              <span className="text-foreground-subtle hidden sm:inline">/</span>
              <span className="text-foreground-muted font-medium hidden sm:inline">
                {pageInfo.category}
              </span>
              <span className="text-foreground-subtle hidden sm:inline">/</span>
              <span className="font-semibold text-white">
                {pageInfo.title}
              </span>
            </div>
          </div>

          {/* Right: Search / Institutional Status / User Dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-52 lg:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
              <input
                type="text"
                placeholder="Search skills, depts, reports... ⌘K"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-blue-950/60 bg-white/[0.04] py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-foreground-subtle focus:border-primary/50 focus:bg-white/[0.07] focus:outline-none transition-colors"
              />
            </div>

            {/* Institution Verified Status */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-400">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>AICTE & NBA Ready</span>
            </div>

            {/* User Dropdown with Settings & Logout */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full border border-blue-900/40 p-0 hover:bg-white/10"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-blue-500/20 text-blue-400 text-xs font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 bg-[#0A1227] border-blue-900/40 text-foreground">
                <div className="flex items-center gap-2 p-2 border-b border-blue-950/80">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/20 text-blue-400 font-bold text-xs">
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{userName}</p>
                    <p className="text-[10px] text-foreground-muted truncate">{institutionName}</p>
                  </div>
                </div>

                <DropdownMenuItem asChild>
                  <Link href="/admin/swan-dashboard" className="flex items-center gap-2 text-xs py-2 cursor-pointer">
                    <LayoutDashboard className="h-3.5 w-3.5 text-foreground-muted" />
                    <span>Executive Overview</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/reports" className="flex items-center gap-2 text-xs py-2 cursor-pointer">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-foreground-muted" />
                    <span>Generate Reports</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="flex items-center gap-2 text-xs py-2 cursor-pointer">
                    <Settings className="h-3.5 w-3.5 text-foreground-muted" />
                    <span>Institution Settings</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-blue-950/80" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xs py-2 text-destructive cursor-pointer hover:bg-destructive/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* MAIN BODY: Desktop-first, max-w-7xl centered */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
