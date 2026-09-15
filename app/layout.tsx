import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillLedger",
  description: "Academia-Industry Collaboration Portal — SIH 2026 PS 26044",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(nextAuthConfig);
  
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">

        <div className="relative flex min-h-screen flex-col">
          <Navbar user={session?.user} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
