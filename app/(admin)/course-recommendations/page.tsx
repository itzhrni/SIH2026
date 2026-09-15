import React from "react";
import { getCourseRecommendations } from "@/lib/analytics/institution-analytics";
import { CourseRecommendationsView } from "@/components/admin/CourseRecommendationsView";

export const dynamic = "force-dynamic";

export default async function CourseRecommendationsPage() {
  const recommendations = await getCourseRecommendations();

  return <CourseRecommendationsView recommendations={recommendations} />;
}
