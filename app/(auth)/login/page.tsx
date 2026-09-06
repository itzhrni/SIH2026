"use client";

import { useState, Suspense } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") || "/industry/recruiter-dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function getPortalPathForRole(role?: string) {
    switch (role) {
      case "STUDENT":
        return "/student/dashboard";
      case "INDUSTRY":
        return "/industry/recruiter-dashboard";
      case "ACADEMICIAN":
        return "/acad/opportunity-feed";
      case "INSTITUTIONAL_ADMIN":
        return "/admin/swan-dashboard";
      default:
        return "/student/dashboard";
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoadingRole("custom");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password. Please verify credentials.");
      setLoadingRole(null);
    } else {
      const session = await getSession();
      const destination =
        callbackUrl && !callbackUrl.includes("/login")
          ? callbackUrl
          : getPortalPathForRole(session?.user.role);
      window.location.href = destination;
    }
  }

  async function handleQuickLogin(
    roleEmail: string,
    rolePass: string,
    defaultPath: string,
    roleId: string,
  ) {
    setError(null);
    setLoadingRole(roleId);

    const res = await signIn("credentials", {
      email: roleEmail,
      password: rolePass,
      redirect: false,
    });

    if (res?.error) {
      setError("Failed to authenticate with demo credentials: " + res.error);
      setLoadingRole(null);
    } else {
      window.location.href = defaultPath;
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            SkillLedger
          </h1>
          <p className="text-sm text-foreground-muted">
            Academia-Industry Collaboration &amp; Skill Verification Portal
          </p>
        </div>

        {/* 1-Click Quick Demo Sign In */}
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
              <ShieldCheck className="w-4 h-4" />
              SIH 2026 Judge &amp; Demo Access
            </CardTitle>
            <CardDescription className="text-xs">
              Instant one-click authentication with pre-seeded demo personas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              type="button"
              className="w-full justify-between"
              onClick={() =>
                handleQuickLogin(
                  "recruiter.vikram@techcorp.dev",
                  "Demo@1234",
                  "/industry/recruiter-dashboard",
                  "recruiter",
                )
              }
              disabled={loadingRole !== null}
            >
              <span className="flex items-center gap-2 font-medium">
                <Building2 className="w-4 h-4" />
                Vikram Malhotra (Industry Recruiter)
              </span>
              {loadingRole === "recruiter" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-between bg-card"
              onClick={() =>
                handleQuickLogin(
                  "student.aarav@skillledger.dev",
                  "Demo@1234",
                  "/student/dashboard",
                  "student",
                )
              }
              disabled={loadingRole !== null}
            >
              <span className="flex items-center gap-2 text-foreground-muted">
                <GraduationCap className="w-4 h-4" />
                Aarav Sharma (Demo Student Candidate)
              </span>
              {loadingRole === "student" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 text-foreground-muted" />
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-between bg-card"
              onClick={() =>
                handleQuickLogin(
                  "prof.sharma@aims.edu",
                  "Demo@1234",
                  "/acad/opportunity-feed",
                  "academician",
                )
              }
              disabled={loadingRole !== null}
            >
              <span className="flex items-center gap-2 text-foreground-muted">
                <GraduationCap className="w-4 h-4" />
                Dr. Ananya Sharma (Academician)
              </span>
              {loadingRole === "academician" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 text-foreground-muted" />
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Manual Credentials Sign In */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Custom Credentials</CardTitle>
            <CardDescription className="text-xs">
              Or sign in with another registered account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="recruiter.vikram@techcorp.dev"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={loadingRole !== null}
              >
                {loadingRole === "custom" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background" />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
