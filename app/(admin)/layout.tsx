import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { AdminAppShell } from "@/components/admin/AdminAppShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    redirect("/login");
  }

  return (
    <AdminAppShell user={session.user}>
      {children}
    </AdminAppShell>
  );
}

