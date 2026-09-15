import React from "react";
import { getPlacementAnalytics } from "@/lib/analytics/institution-analytics";
import { PlacementAnalyticsView } from "@/components/admin/PlacementAnalyticsView";

export const dynamic = "force-dynamic";

export default async function PlacementAnalyticsPage() {
  const placementData = await getPlacementAnalytics();

  return <PlacementAnalyticsView data={placementData} />;
}
