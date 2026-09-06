"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiResponse } from "@/types";

const RegisterSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["STUDENT", "INDUSTRY", "ACADEMICIAN", "INSTITUTIONAL_ADMIN"]),
  institution: z.string().optional(),
  department: z.string().optional(),
  expertise: z.string().optional(),
});

type RegisterForm = z.infer<typeof RegisterSchema>;

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Student",
  INDUSTRY: "Industry Partner",
  ACADEMICIAN: "Academician",
  INSTITUTIONAL_ADMIN: "Institutional Admin",
};

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { role: "STUDENT" },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: RegisterForm) {
    setLoading(true);
    setServerError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json: ApiResponse<{ id: string }> = await res.json();
    setLoading(false);

    if (!json.success) {
      setServerError(json.error.message);
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <span className="text-lg font-bold text-primary-foreground">S</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            SkillLedger — SIH 2026 PS 26044
          </p>
        </div>

        <div className="rounded-md border border-border bg-card p-6 shadow-sm">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            id="register-form"
          >
            {serverError && (
              <div className="rounded-md border border-destructive-border bg-destructive-bg px-3 py-2 text-sm text-destructive">
                {serverError}
              </div>
            )}

            {/* Role selector */}
            <div className="space-y-1.5">
              <Label htmlFor="role-select">I am a…</Label>
              <Select
                defaultValue="STUDENT"
                onValueChange={(val) =>
                  setValue("role", val as RegisterForm["role"])
                }
              >
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="Arjun Mehta"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="you@institution.edu"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="institution">Institution / Company</Label>
              <Input
                id="institution"
                placeholder="IIT Madras / TechCorp India"
                {...register("institution")}
              />
            </div>

            {(selectedRole === "STUDENT" || selectedRole === "ACADEMICIAN") && (
              <div className="space-y-1.5">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="Computer Science / Dravyaguna"
                  {...register("department")}
                />
              </div>
            )}

            {selectedRole === "ACADEMICIAN" && (
              <div className="space-y-1.5">
                <Label htmlFor="expertise">Areas of expertise</Label>
                <Input
                  id="expertise"
                  placeholder="Ayurvedic Pharmacology, Medicinal Plant Research"
                  {...register("expertise")}
                />
              </div>
            )}

            <Button
              id="register-submit"
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Creating account…
                </span>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
