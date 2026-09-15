import React from "react";
import { getCurriculumIntelligence } from "@/lib/analytics/institution-analytics";
import { CurriculumIntelligenceView } from "@/components/admin/CurriculumIntelligenceView";

export const dynamic = "force-dynamic";

export default async function CurriculumIntelligencePage() {
  const items = await getCurriculumIntelligence();

  return <CurriculumIntelligenceView items={items} />;
}
