"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  ClipboardList,
  Layers,
  Users,
  Building2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  Sparkles,
  ShieldCheck,
  User,
  Settings,
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

export interface IndustryUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  institution?: string | null;
  role?: string | null;
}

interface IndustryAppShellProps {
  children: React.ReactNode;
  user: IndustryUser;
}

const NAV_GROUPS = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/industry/recruiter-dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Post & Manage",
    items: [
      { label: "Post Internship", href: "/industry/post/internship", icon: PlusCircle },
      { label: "Post Job", href: "/industry/post/job", icon: Briefcase },
      { label: "My Postings", href: "/industry/my-postings", icon: ClipboardList },
    ],
  },
  {
    title: "Candidate Recruitment",
    items: [
      { label: "Hiring Pipelines", href: "/industry/pipeline", icon: Layers },
      { label: "Discover Candidates", href: "/industry/candidates", icon: Users },
    ],
  },
];

export function IndustryAppShell({ children, user }: IndustryAppShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const userName = user?.name || "Recruiter";
  const companyName = user?.institution || "Industry Partner";
  const userInitials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "RC";

  const getPageInfo = () => {
    if (pathname.includes("recruiter-dashboard") || pathname === "/industry" || pathname === "/industry/dashboard")
      return { title: "Recruiter Dashboard", category: "Overview" };
    if (pathname.includes("post/internship")) return { title: "Post Internship", category: "Postings" };
    if (pathname.includes("post/job")) return { title: "Post Job", category: "Postings" };
    if (pathname.includes("my-postings") || pathname.includes("opportunities"))
      return { title: "Opportunity Postings", category: "Management" };
    if (pathname.includes("pipeline")) return { title: "Candidate Pipelines", category: "Recruitment" };
    if (pathname.includes("candidates") || pathname.includes("discover"))
      return { title: "Candidate Discovery", category: "Recruitment" };
    return { title: "Industry Portal", category: "Recruitment" };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* PRIMARY NAVIGATION: Collapsible Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border bg-[#0B0F17] transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-[72px]" : "lg:w-60"}`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-border/80 px-3.5">
          <Link
            href="/industry/recruiter-dashboard"
            className="flex items-center gap-2.5 overflow-hidden transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-xs shadow-sm">
              SL
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight text-white">
                    SkillLedger
                  </span>
                  <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-400">
                    Industry
                  </span>
                </div>
                <p className="text-[11px] text-foreground-muted truncate">
                  {companyName}
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
                  (item.href !== "/industry/recruiter-dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`group flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium transition-colors duration-150 ${
                      isActive
                        ? "bg-primary/15 text-white border border-primary/30 shadow-xs"
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
        <div className="border-t border-border/80 p-2 space-y-1 bg-[#090D14]">
          <div
            className={`flex items-center gap-2.5 rounded-md p-1.5 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <Avatar className="h-7 w-7 shrink-0 rounded-md border border-border">
              <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-[11px] font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {userName}
                </p>
                <p className="text-[10px] text-foreground-muted truncate">
                  {companyName}
                </p>
              </div>
            )}

            {!isCollapsed && (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
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
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-60"
        }`}
      >
        {/* TOP UTILITY BAR */}
        <header className="sticky top-0 z-30 flex h-13 items-center justify-between border-b border-border bg-[#0B0F17]/90 px-4 md:px-6 backdrop-blur-md">
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
              <span className="text-foreground-muted font-medium hidden sm:inline">
                {pageInfo.category}
              </span>
              <span className="text-foreground-subtle hidden sm:inline">/</span>
              <span className="font-semibold text-white">
                {pageInfo.title}
              </span>
            </div>
          </div>

          {/* Right: Search / Status / User Dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-52 lg:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
              <input
                type="text"
                placeholder="Search candidates, skills... ⌘K"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-border bg-white/[0.04] py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-foreground-subtle focus:border-primary/50 focus:bg-white/[0.07] focus:outline-none transition-colors"
              />
            </div>

            {/* Recruiter Verified Status */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-medium text-indigo-400">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>Recruiter Verified</span>
            </div>

            {/* User Dropdown with Logout */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full border border-border p-0 hover:bg-white/10"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-xs font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#111827] border-border text-foreground">
                <div className="flex items-center gap-2 p-2 border-b border-border/70">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400 font-bold text-xs">
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{userName}</p>
                    <p className="text-[10px] text-foreground-muted truncate">{companyName}</p>
                  </div>
                </div>

                <DropdownMenuItem asChild>
                  <Link href="/industry/my-postings" className="flex items-center gap-2 text-xs py-2 cursor-pointer">
                    <ClipboardList className="h-3.5 w-3.5 text-foreground-muted" />
                    <span>My Postings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/industry/post/internship" className="flex items-center gap-2 text-xs py-2 cursor-pointer">
                    <PlusCircle className="h-3.5 w-3.5 text-foreground-muted" />
                    <span>Post Internship</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/industry/candidates" className="flex items-center gap-2 text-xs py-2 cursor-pointer">
                    <Users className="h-3.5 w-3.5 text-foreground-muted" />
                    <span>Discover Candidates</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border/70" />

                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
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
