"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Briefcase,
  Plus,
  Trash2,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const FormSchema = z.object({
  type: z.enum([
    "INTERNSHIP",
    "JOB",
    "FDP",
    "FACULTY_INTERNSHIP",
    "RESEARCH_PROJECT",
    "CONSULTANCY",
    "LEARNING_PROGRAM",
  ]),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requiredSkills: z
    .array(
      z.object({
        skill: z.string().min(1, "Skill name cannot be empty"),
        minThreshold: z.number().min(10).max(100),
      }),
    )
    .min(1, "Please add at least one required skill"),
  location: z.string().optional(),
  duration: z.string().optional(),
  stipendRange: z.string().optional(),
  deadline: z.string().min(1, "Deadline date is required"),
});

type FormValues = z.infer<typeof FormSchema>;

const PRESET_SKILLS = [
  "Data Structures & Algorithms",
  "System Design",
  "Database Management Systems",
  "Web Development (React / Next.js)",
  "Cloud Architecture (AWS / GCP)",
  "Machine Learning & AI",
  "Operating Systems & Networking",
  "DevOps & CI/CD",
];

export function PostOpportunityForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [customSkillThreshold, setCustomSkillThreshold] = useState(65);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: "JOB",
      title: "",
      description: "",
      requiredSkills: [
        { skill: "Data Structures & Algorithms", minThreshold: 70 },
        { skill: "System Design", minThreshold: 65 },
      ],
      location: "Bengaluru, India (Hybrid)",
      duration: "Full-time",
      stipendRange: "₹14 – 18 LPA",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "requiredSkills",
  });

  const currentType = watch("type");

  const addPresetSkill = (skillName: string) => {
    const existing = fields.some(
      (f) => f.skill.toLowerCase() === skillName.toLowerCase(),
    );
    if (!existing) {
      append({ skill: skillName, minThreshold: 65 });
    }
  };

  const addCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    const existing = fields.some(
      (f) => f.skill.toLowerCase() === customSkillInput.trim().toLowerCase(),
    );
    if (!existing) {
      append({
        skill: customSkillInput.trim(),
        minThreshold: customSkillThreshold,
      });
      setCustomSkillInput("");
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!json.success) {
        setErrorMsg(json.error?.message || "Failed to post opportunity");
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg("Opportunity published successfully! Redirecting...");
      setTimeout(() => {
        router.push("/industry/my-postings");
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred while publishing the posting");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-md border border-destructive-border bg-destructive-bg p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-md border border-success-border bg-success-bg p-3 text-xs text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Basic Role Information */}
      <div className="rounded-md border border-border bg-card p-5 space-y-4">
        <div className="border-b border-border pb-3">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Opportunity Specifics
          </h3>
          <p className="text-xs text-foreground-muted mt-0.5">
            Define the role type, title, and recruitment criteria
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Opportunity Type */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-foreground-muted mb-1.5">
              Opportunity Classification
            </label>
            <select
              {...register("type")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="JOB">Direct Job Placement (Full-time)</option>
              <option value="INTERNSHIP">
                Student Internship (Pre-placement / Stipend)
              </option>
              <option value="LEARNING_PROGRAM">
                Industry Learning Program / Masterclass
              </option>
              <option value="RESEARCH_PROJECT">
                Collaborative Research Project
              </option>
              <option value="FACULTY_INTERNSHIP">
                Faculty Industrial Residency
              </option>
              <option value="FDP">Faculty Development Program (FDP)</option>
              <option value="CONSULTANCY">Industry Consultancy Mandate</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-foreground-muted mb-1.5">
              Role / Program Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Associate Backend Systems Engineer"
              {...register("title")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {errors.title && (
              <p className="text-2xs text-destructive mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
        </div>

        {/* Location, Duration, Stipend, Deadline */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-foreground-muted mb-1.5 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Location
            </label>
            <input
              type="text"
              placeholder="e.g. Remote / Hybrid"
              {...register("location")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-foreground-muted mb-1.5 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Duration
            </label>
            <input
              type="text"
              placeholder="e.g. 6 Months / Permanent"
              {...register("duration")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-foreground-muted mb-1.5 flex items-center gap-1">
              <IndianRupee className="h-3 w-3" /> Compensation / Stipend
            </label>
            <input
              type="text"
              placeholder="e.g. ₹40,000 / mo or ₹14 LPA"
              {...register("stipendRange")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-foreground-muted mb-1.5 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Application Deadline *
            </label>
            <input
              type="date"
              {...register("deadline")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {errors.deadline && (
              <p className="text-2xs text-destructive mt-1">
                {errors.deadline.message}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-foreground-muted mb-1.5">
            Role Description & Expectations *
          </label>
          <textarea
            rows={4}
            placeholder="Describe the responsibilities, project scope, tech stack, and key expectations from candidates..."
            {...register("description")}
            className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.description && (
            <p className="text-2xs text-destructive mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      {/* Structured Skill Requirements & Thresholds */}
      <div className="rounded-md border border-border bg-card p-5 space-y-4">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-warning" />
              Skill Taxonomy & Competency Thresholds
            </h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              Specify skills and minimum assessment scores (0–100%) required for
              candidate matching
            </p>
          </div>
          <span className="text-xs text-foreground-subtle tabular-nums">
            {fields.length} skill{fields.length === 1 ? "" : "s"} defined
          </span>
        </div>

        {/* Preset Quick-Add Pills */}
        <div className="space-y-1.5">
          <span className="text-2xs font-medium uppercase tracking-wider text-foreground-subtle">
            Quick Add from Verified Taxonomy:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_SKILLS.map((skill) => (
              <button
                type="button"
                key={skill}
                onClick={() => addPresetSkill(skill)}
                className="inline-flex items-center gap-1 rounded-sm border border-border bg-background-subtle px-2 py-1 text-xs text-foreground-muted hover:bg-background-muted hover:text-foreground transition-colors"
              >
                <Plus className="h-3 w-3" />
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Skill Input */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-border">
          <input
            type="text"
            placeholder="Add custom required skill (e.g. Distributed Caching, Redis, Kafka)..."
            value={customSkillInput}
            onChange={(e) => setCustomSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomSkill();
              }
            }}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-foreground-muted whitespace-nowrap">
              Min Score:
            </span>
            <input
              type="number"
              min={10}
              max={100}
              value={customSkillThreshold}
              onChange={(e) => setCustomSkillThreshold(Number(e.target.value))}
              className="w-20 rounded-md border border-input bg-background px-2.5 py-2 text-sm tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <span className="text-xs text-foreground-muted">%</span>
            <button
              type="button"
              onClick={addCustomSkill}
              className="rounded-md bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:bg-background-muted transition-colors whitespace-nowrap"
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* Active Required Skills List */}
        <div className="space-y-2 pt-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-background-subtle p-2.5"
            >
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  {...register(`requiredSkills.${index}.skill` as const)}
                  className="font-medium text-sm text-foreground bg-transparent border-none focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xs text-foreground-subtle uppercase">
                    Target:
                  </span>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    {...register(
                      `requiredSkills.${index}.minThreshold` as const,
                      {
                        valueAsNumber: true,
                      },
                    )}
                    className="w-16 rounded-sm border border-input bg-card px-2 py-1 text-xs tabular-nums text-foreground text-center focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <span className="text-xs text-foreground-muted">%</span>
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-foreground-subtle hover:text-destructive transition-colors p-1"
                  title="Remove skill"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {errors.requiredSkills && (
            <p className="text-2xs text-destructive mt-1">
              {errors.requiredSkills.message}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground-muted hover:bg-background-muted hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Publishing Posting..." : "Publish Opportunity"}
        </button>
      </div>
    </form>
  );
}
