import React from "react";
import { getStudentReadinessAnalytics } from "@/lib/analytics/institution-analytics";
import { StudentReadinessView } from "@/components/admin/StudentReadinessView";

export const dynamic = "force-dynamic";

export default async function StudentReadinessPage() {
  const readinessData = await getStudentReadinessAnalytics("ALL");
  const departments = ["ALL", "CSE", "IT", "ECE", "EEE", "MECH"];

  return (
    <StudentReadinessView
      initialData={readinessData}
      departments={departments}
    />
  );
}
