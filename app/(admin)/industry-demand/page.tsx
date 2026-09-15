import React from "react";
import { getIndustryDemandVsSupply } from "@/lib/analytics/institution-analytics";
import { IndustryDemandView } from "@/components/admin/IndustryDemandView";

export const dynamic = "force-dynamic";

export default async function IndustryDemandPage() {
  const demandData = await getIndustryDemandVsSupply();

  return <IndustryDemandView data={demandData} />;
}
