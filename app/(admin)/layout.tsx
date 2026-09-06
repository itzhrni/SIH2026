import { AppShell } from "@/components/layout/AppShell";
import { LayoutDashboard } from "lucide-react";
import type { NavItem } from "@/components/layout/AppShell";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/swan-dashboard", icon: LayoutDashboard },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell title="Institutional Admin" subtitle="Admin" navItems={navItems}>
      {children}
    </AppShell>
  );
}
