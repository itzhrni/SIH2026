import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { AcadAppShell } from "@/components/acad/AcadAppShell";

export default async function AcadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user) {
    redirect("/login");
  }

  return <AcadAppShell user={session.user}>{children}</AcadAppShell>;
}

