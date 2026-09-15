"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const isPortalOrAuth =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/assess") ||
    pathname.startsWith("/learning-programs") ||
    pathname.startsWith("/opportunities") ||
    pathname.startsWith("/applications") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/portfolio") ||
    pathname.startsWith("/industry") ||
    pathname.startsWith("/recruiter-dashboard") ||
    pathname.startsWith("/pipeline") ||
    pathname.startsWith("/candidates") ||
    pathname.startsWith("/my-postings") ||
    pathname.startsWith("/post") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/swan-dashboard") ||
    pathname.startsWith("/acad") ||
    pathname.startsWith("/opportunity-feed") ||
    pathname.startsWith("/student-applications");

  if (isPortalOrAuth) return null;
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Left - Branding */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10 text-xs font-bold text-primary">
              SL
            </div>
            <span className="text-sm font-semibold text-foreground">
              SkillLedger
            </span>
          </div>

          {/* Center - Links */}
          <nav className="flex items-center gap-4 text-xs text-foreground-muted">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <a
              href="https://simpeg.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              SIH 2026
            </a>
          </nav>

          {/* Right - Copyright */}
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>
              SIH 2026 · PS 26044 · Built with Next.js & Prisma
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-4 border-t border-border pt-4 text-center text-[11px] text-foreground-subtle">
          <p>
            Academia-Industry Collaboration & Skill Verification Portal ·{" "}
            <span className="text-foreground-muted">
              Smart India Hackathon 2026
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
