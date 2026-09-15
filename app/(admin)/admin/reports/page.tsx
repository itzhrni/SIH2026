import React from "react";
import { getInstitutionalReports } from "@/lib/analytics/institution-analytics";
import { ReportsView } from "@/components/admin/ReportsView";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await getInstitutionalReports();

  return <ReportsView reports={reports} />;
}
