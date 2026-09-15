import { AppShell } from "@/components/layout/AppShell";
import {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  FileText,
  GraduationCap,
} from "lucide-react";
import type { NavItem } from "@/components/layout/AppShell";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "In-Portal Courses", href: "/student/courses", icon: GraduationCap },
  { label: "Assess Skills", href: "/student/assess", icon: BookOpen },
  { label: "Learning Programs", href: "/student/learning-programs", icon: FileText },
  { label: "Opportunities", href: "/student/opportunities", icon: Briefcase },
  { label: "Applications", href: "/student/applications", icon: FileText },
  { label: "My Profile", href: "/student/profile", icon: LayoutDashboard },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell title="Student Portal" subtitle="Student" navItems={navItems}>
      {children}
    </AppShell>
  );
}
