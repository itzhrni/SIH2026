// components/portfolio/SkillBadge.tsx
import React from "react";
import { BadgeCheck, Lock } from "lucide-react";

interface SkillBadgeProps {
  domain: string;
  displayName?: string;
  earned?: boolean;
}

const DOMAIN_LABELS: Record<string, string> = {
  dsa: "Data Structures & Algorithms",
  "system-design": "System Design",
  "machine-learning": "Machine Learning",
  ml: "Machine Learning",
  "core-cs": "Core CS Subjects",
  "ayurvedic-pharmacology": "Ayurvedic Pharmacology",
  "clinical-practice": "Clinical Practice",
};

export function SkillBadge({
  domain,
  displayName,
  earned = true,
}: SkillBadgeProps) {
  const label = displayName ?? DOMAIN_LABELS[domain] ?? domain.toUpperCase();

  if (!earned) {
    return (
      <div className="inline-flex items-center gap-2 rounded-sm border border-dashed border-border px-2.5 py-1.5 text-xs text-foreground-subtle">
        <Lock className="h-3.5 w-3.5 text-foreground-subtle" />
        <span>{label} — not yet earned</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-semibold text-white [background:linear-gradient(135deg,#0067B8,#4F46E5)]">
      <BadgeCheck className="h-3.5 w-3.5 text-white" />
      <span>Verified · {label}</span>
    </div>
  );
}
