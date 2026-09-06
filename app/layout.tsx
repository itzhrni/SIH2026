import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillLedger",
  description: "Academia-Industry Collaboration Portal — SIH 2026 PS 26044",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
