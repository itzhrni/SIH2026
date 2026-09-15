import React from "react";
import { getInternshipAnalytics } from "@/lib/analytics/institution-analytics";
import { InternshipAnalyticsView } from "@/components/admin/InternshipAnalyticsView";

export const dynamic = "force-dynamic";

export default async function InternshipAnalyticsPage() {
  const internshipData = await getInternshipAnalytics();

  return <InternshipAnalyticsView data={internshipData} />;
}
