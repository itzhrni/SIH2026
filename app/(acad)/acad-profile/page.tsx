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
    <div className="max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Academician Profile & Onboarding
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Maintain your academic credentials, departmental affiliation, and
          research expertise.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 rounded-md border border-border bg-card p-6">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <div className="rounded-md border border-border bg-card p-6 shadow-sm">
          {message && (
            <div
              className={`mb-5 flex items-center gap-2 rounded-sm border p-3 text-xs ${
                message.success
                  ? "border-success/30 bg-success/10 text-success"
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
              <Label htmlFor="acad-name">Full Name</Label>
              <Input
                id="acad-name"
                {...register("name")}
                placeholder="Dr. Priya Sharma"
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acad-email">Email Address</Label>
              <Input
                id="acad-email"
                value={profile?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-[11px] text-muted-foreground">
                Email is tied to your institutional account.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="acad-institution">
                  Institution / University
                </Label>
                <div className="relative">
                  <Input
                    id="acad-institution"
                    {...register("institution")}
                    placeholder="All India Institute of Ayurveda"
                  />
                </div>
                {errors.institution && (
                  <p className="text-xs text-destructive">
                    {errors.institution.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="acad-dept">Department</Label>
                <div className="relative">
                  <Input
                    id="acad-dept"
                    {...register("department")}
                    placeholder="Dravyaguna / Computer Science"
                  />
                </div>
                {errors.department && (
                  <p className="text-xs text-destructive">
                    {errors.department.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acad-expertise">
                Areas of Research & Teaching Expertise
              </Label>
              <Textarea
                id="acad-expertise"
                rows={4}
                {...register("expertise")}
                placeholder="e.g. Ayurvedic Pharmacology, Medicinal Plant Research, Clinical Ayurveda, Phytochemistry"
              />
              {errors.expertise && (
                <p className="text-xs text-destructive">
                  {errors.expertise.message}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground">
                Free-text expertise description surfaced during FDP and
                consultancy evaluations.
              </p>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Saving Changes…
                  </span>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
