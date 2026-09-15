"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Building,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { UserProfileData, ApiResponse } from "@/types";

const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  institution: z.string().min(2, "Institution is required"),
  department: z.string().min(2, "Department is required"),
  expertise: z.string().min(5, "Please specify your areas of expertise"),
});

type ProfileFormValues = z.infer<typeof ProfileSchema>;

export default function AcadProfilePage() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    success: boolean;
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        const json: ApiResponse<UserProfileData> = await res.json();
        if (json.success) {
          setProfile(json.data);
          reset({
            name: json.data.name,
            institution: json.data.institution || "",
            department: json.data.department || "",
            expertise: json.data.expertise || "",
          });
        }
      } catch (err) {
        console.error("[AcadProfile] Failed to load:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [reset]);

  async function onSubmit(data: ProfileFormValues) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json: ApiResponse<UserProfileData> = await res.json();

      if (json.success) {
        setProfile(json.data);
        setMessage({ success: true, text: "Profile updated successfully." });
      } else {
        setMessage({
          success: false,
          text: json.error.message || "Failed to update profile.",
        });
      }
    } catch {
      setMessage({ success: false, text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="border-b border-blue-950/60 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <User className="h-3.5 w-3.5" />
          <span>Academician Portal · Faculty Credentials</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          Faculty Profile & Research Expertise
        </h1>
        <p className="text-xs text-foreground-muted mt-0.5">
          Maintain your verified institutional affiliation, departmental background, and areas of research for FDP and industry consultancy evaluations.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 rounded-lg border border-blue-900/30 bg-[#0C1427] p-6">
          <Skeleton className="h-6 w-1/3 bg-white/5" />
          <Skeleton className="h-10 w-full bg-white/5" />
          <Skeleton className="h-10 w-full bg-white/5" />
          <Skeleton className="h-20 w-full bg-white/5" />
        </div>
      ) : (
        <div className="rounded-lg border border-blue-900/30 bg-[#0C1427] p-6 shadow-sm">
          {message && (
            <div
              className={`mb-5 flex items-center gap-2 rounded-md border p-3 text-xs ${
                message.success
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {message.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="acad-name" className="text-xs font-semibold text-white">Full Name & Title</Label>
              <Input
                id="acad-name"
                {...register("name")}
                placeholder="Dr. Priya Sharma"
                className="h-9 bg-[#060A14] border-blue-950/60 text-xs text-white placeholder:text-foreground-subtle focus:border-primary"
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acad-email" className="text-xs font-semibold text-white">Institutional Email Address</Label>
              <Input
                id="acad-email"
                value={profile?.email || ""}
                disabled
                className="h-9 bg-[#060A14]/50 border-blue-950/40 text-xs text-foreground-muted"
              />
              <p className="text-[11px] text-foreground-subtle">
                Email is tied to your verified university credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="acad-institution" className="text-xs font-semibold text-white">
                  Institution / University
                </Label>
                <Input
                  id="acad-institution"
                  {...register("institution")}
                  placeholder="All India Institute of Ayurveda / IIT"
                  className="h-9 bg-[#060A14] border-blue-950/60 text-xs text-white placeholder:text-foreground-subtle focus:border-primary"
                />
                {errors.institution && (
                  <p className="text-xs text-destructive">
                    {errors.institution.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="acad-dept" className="text-xs font-semibold text-white">Department</Label>
                <Input
                  id="acad-dept"
                  {...register("department")}
                  placeholder="Computer Science / Dravyaguna"
                  className="h-9 bg-[#060A14] border-blue-950/60 text-xs text-white placeholder:text-foreground-subtle focus:border-primary"
                />
                {errors.department && (
                  <p className="text-xs text-destructive">
                    {errors.department.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acad-expertise" className="text-xs font-semibold text-white">
                Areas of Research & Teaching Expertise
              </Label>
              <Textarea
                id="acad-expertise"
                rows={4}
                {...register("expertise")}
                placeholder="e.g. Distributed Computing, Deep Learning, Cloud Architectures, AYUSH Clinical Pharmacology"
                className="bg-[#060A14] border-blue-950/60 text-xs text-white placeholder:text-foreground-subtle focus:border-primary"
              />
              {errors.expertise && (
                <p className="text-xs text-destructive">
                  {errors.expertise.message}
                </p>
              )}
              <p className="text-[11px] text-foreground-subtle">
                Keywords and research domain summaries are matched against industry consultancy requirements.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="h-9 bg-primary px-5 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving Changes...
                  </span>
                ) : (
                  "Save Faculty Profile"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
