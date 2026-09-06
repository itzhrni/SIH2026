// app/(industry)/post/job/page.tsx
// RULE FE-01: Server Component wrapper — delegates to PostingForm (client)
import { PostingForm } from "@/components/opportunities/PostingForm";

export default function PostJobPage() {
  return <PostingForm type="JOB" pageTitle="Post Job Opening" />;
}
