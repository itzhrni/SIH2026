// app/(industry)/post/internship/page.tsx
// RULE FE-01: Server Component wrapper — delegates to PostingForm (client)
import { PostingForm } from "@/components/opportunities/PostingForm";

export default function PostInternshipPage() {
  return <PostingForm type="INTERNSHIP" pageTitle="Post Internship" />;
}
