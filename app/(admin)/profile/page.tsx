import React from "react";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { User, ShieldCheck, Mail, School, Calendar, Award } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await getServerSession(nextAuthConfig);
  const user = session?.user as { name?: string | null; email?: string | null; institution?: string | null } | undefined;
  const userName = user?.name || "Institution Administrator";
  const userEmail = user?.email || "admin@nit.edu.in";
  const institution = user?.institution || "National Institute of Technology";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-blue-950/60 pb-5">
        <div className="flex items-center gap-2">
          <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
            Account Management
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          Administrator Profile
        </h1>
        <p className="text-xs text-foreground-muted mt-0.5">
          Verified Institutional Administrator Credentials & System Permissions.
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar className="h-16 w-16 rounded-md border-2 border-blue-900/60">
            <AvatarFallback className="bg-blue-600/20 text-blue-400 font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{userName}</h2>
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20">
                INSTITUTIONAL ADMIN
              </span>
            </div>
            <p className="text-xs text-foreground-muted">{institution}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium pt-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Full Analytics & Curriculum Authority</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-blue-950/60 pt-5 text-xs">
          <div className="rounded-md border border-blue-950/60 bg-[#060A14] p-3.5 space-y-1">
            <span className="text-foreground-muted text-[11px] flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-blue-400" />
              Official Email
            </span>
            <p className="font-semibold text-white">{userEmail}</p>
          </div>

          <div className="rounded-md border border-blue-950/60 bg-[#060A14] p-3.5 space-y-1">
            <span className="text-foreground-muted text-[11px] flex items-center gap-1.5">
              <School className="h-3.5 w-3.5 text-blue-400" />
              Affiliated Institution
            </span>
            <p className="font-semibold text-white">{institution}</p>
          </div>

          <div className="rounded-md border border-blue-950/60 bg-[#060A14] p-3.5 space-y-1">
            <span className="text-foreground-muted text-[11px] flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-blue-400" />
              Accreditation Role
            </span>
            <p className="font-semibold text-white">TPO & Head of Institutional Analytics</p>
          </div>

          <div className="rounded-md border border-blue-950/60 bg-[#060A14] p-3.5 space-y-1">
            <span className="text-foreground-muted text-[11px] flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-400" />
              Active Session
            </span>
            <p className="font-semibold text-white">Academic Cycle 2025–2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
