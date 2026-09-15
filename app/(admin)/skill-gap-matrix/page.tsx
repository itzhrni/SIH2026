import React from "react";
import { getSkillGapMatrix } from "@/lib/analytics/institution-analytics";
import { SkillGapMatrixView } from "@/components/admin/SkillGapMatrixView";

export const dynamic = "force-dynamic";

export default async function SkillGapMatrixPage() {
  const departments = ["CSE", "IT", "ECE", "EEE", "MECH"];
  const matrix = await getSkillGapMatrix(departments);

  return (
    <SkillGapMatrixView
      matrix={matrix}
      departments={departments}
    />
  );
}
