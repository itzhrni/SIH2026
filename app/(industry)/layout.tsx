import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { IndustryAppShell } from "@/components/industry/IndustryAppShell";

export default async function IndustryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || session.user.role !== "INDUSTRY") {
    redirect("/login");
  }

  return (
    <IndustryAppShell user={session.user}>
      {children}
    </IndustryAppShell>
  );
}
