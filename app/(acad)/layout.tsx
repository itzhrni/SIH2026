import { AppShell } from "@/components/layout/AppShell";
import { Briefcase, FileText, User } from "lucide-react";
import type { NavItem } from "@/components/layout/AppShell";

const navItems: NavItem[] = [
  {
    label: "Opportunity Feed",
    href: "/acad/opportunity-feed",
    icon: Briefcase,
  },
  {
    label: "Student Applications",
    href: "/acad/student-applications",
    icon: FileText,
  },
  { label: "Profile", href: "/acad/profile", icon: User },
];

export default function AcadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      title="Academician Portal"
      subtitle="Academician"
      navItems={navItems}
    >
      {children}
    </AppShell>
  );
}
