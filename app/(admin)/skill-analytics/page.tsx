import React from "react";
import { getSkillHealthAnalytics } from "@/lib/analytics/institution-analytics";
import { SkillAnalyticsView } from "@/components/admin/SkillAnalyticsView";

export const dynamic = "force-dynamic";

export default async function SkillAnalyticsPage() {
  const skills = await getSkillHealthAnalytics();
  const categories = ["ALL", "Core CS", "Data & AI", "Cloud & DevOps", "Web Development", "System Design", "Embedded & IoT"];

  return (
    <SkillAnalyticsView
      skills={skills}
      categories={categories}
    />
  );
}
