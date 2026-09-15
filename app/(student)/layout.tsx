import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { StudentAppShell } from "@/components/student/StudentAppShell";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <StudentAppShell user={session.user}>
      {children}
    </StudentAppShell>
  );
}
