"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  FileText,
  GraduationCap,
  Building2,
  Users,
  PlusCircle,
  ClipboardList,
  LogOut,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const studentNavItems: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "In-Portal Courses", href: "/student/courses", icon: GraduationCap },
  { label: "Assess Skills", href: "/student/assess", icon: BookOpen },
  { label: "Learning Programs", href: "/student/learning-programs", icon: FileText },
  { label: "Opportunities", href: "/student/opportunities", icon: Briefcase },
  { label: "Applications", href: "/student/applications", icon: FileText },
];

const industryNavItems: NavItem[] = [
  { label: "Dashboard", href: "/industry/recruiter-dashboard", icon: LayoutDashboard },
  { label: "Post Internship", href: "/industry/post/internship", icon: PlusCircle },
  { label: "Post Job", href: "/industry/post/job", icon: Briefcase },
  { label: "My Postings", href: "/industry/my-postings", icon: ClipboardList },
  { label: "Discover Candidates", href: "/industry/discover", icon: Users },
];

const acadNavItems: NavItem[] = [
  { label: "Opportunity Feed", href: "/acad/opportunity-feed", icon: BookOpen },
  { label: "Student Applications", href: "/acad/student-applications", icon: FileText },
];

const adminNavItems: NavItem[] = [
  { label: "SWAN Dashboard", href: "/admin/swan-dashboard", icon: LayoutDashboard },
];

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const role = user?.role || "";
  
  const isLoggedIn = !!role;

  let navItems: NavItem[] = [];
  if (role === "STUDENT") navItems = studentNavItems;
  else if (role === "INDUSTRY") navItems = industryNavItems;
  else if (role === "ACADEMICIAN") navItems = acadNavItems;
  else if (role === "INSTITUTIONAL_ADMIN") navItems = adminNavItems;

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm shadow-sm">
            SL
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-base tracking-tight text-foreground">
              SkillLedger
            </span>
            <span className="ml-2 inline-block text-xs text-foreground-muted">
              National Skill Ledger Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {isLoggedIn && navItems.length > 0 && (
            <>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground-muted hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="mx-2 h-6 w-px bg-border" />
            </>
          )}

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-muted hover:text-foreground"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {getInitials(user?.name)}
                  </div>
                  <span className="hidden sm:inline-block">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="text-xs text-foreground-muted">{user?.email}</p>
                  <p className="mt-1 rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary inline-block">
                    {role.replace("_", " ")}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${role.toLowerCase() === "INDUSTRY" ? "industry" : role.toLowerCase()}/profile`} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" className="text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/industry/recruiter-dashboard">
                <Button size="sm" className="text-xs gap-1.5 shadow-sm">
                  <Building2 className="w-3.5 h-3.5" />
                  Industry Portal
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-muted"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {getInitials(user?.name)}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="text-xs text-foreground-muted">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-xs">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
