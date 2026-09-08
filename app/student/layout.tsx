import { AppShell } from "@/components/layout/AppShell";
import {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  FileText,
  GraduationCap,
  Award,
} from "lucide-react";
import type { NavItem } from "@/components/layout/AppShell";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Assess Skills", href: "/student/assess", icon: BookOpen },
  { label: "Digital Portfolio", href: "/student/portfolio", icon: Award },
  {
    label: "Learning Programs",
    href: "/student/learning-programs",
    icon: GraduationCap,
  },
  { label: "Opportunities", href: "/student/opportunities", icon: Briefcase },
  { label: "Applications", href: "/student/applications", icon: FileText },
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
