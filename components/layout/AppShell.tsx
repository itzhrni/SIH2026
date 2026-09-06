import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  children: React.ReactNode;
}

// Server component — no 'use client' directive
export function AppShell({
  title,
  subtitle,
  navItems,
  children,
}: SidebarProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-border bg-background-subtle">
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-sm font-bold text-primary-foreground">
            S
          </div>
          <div>
            <p className="text-sm font-semibold leading-none text-foreground">
              SkillLedger
            </p>
            <p className="mt-0.5 text-[10px] leading-none text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-foreground transition-colors duration-150 ease-in-out hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3">
          <p className="text-[11px] text-muted-foreground">{title}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
