// components/opportunities/PostingForm.tsx
// RULE FE-01: "use client" — uses React Hook Form + state
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2, Loader2, Sparkles, Building2, MapPin, Calendar } from "lucide-react";
import type { OpportunityType } from "@prisma/client";

// Domains matching KnowledgeGraph.domain values
const DOMAINS = [
  { value: "dsa", label: "Data Structures & Algorithms" },
  { value: "system-design", label: "System Design" },
  { value: "machine-learning", label: "Machine Learning" },
  { value: "core-cs", label: "Core CS Subjects" },
  { value: "ayurvedic-pharmacology", label: "Ayurvedic Pharmacology" },
  { value: "clinical-practice", label: "Clinical Practice" },
];

const PostingSchema = z.object({
  title: z.string().min(1, "Role title is required").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().optional(),
  duration: z.string().optional(),
  stipendRange: z.string().optional(),
  deadline: z.string().min(1, "Deadline is required"),
  requiredSkills: z
    .array(
      z.object({
        skill: z.string().min(1, "Select a domain"),
        minThreshold: z
          .number({ invalid_type_error: "Enter a number" })
          .min(0)
          .max(100),
      }),
    )
    .min(1, "Add at least one required skill"),
  eligibilityCriteria: z.object({
    minCGPA: z
      .number({ invalid_type_error: "Enter a number" })
      .min(0)
      .max(10)
      .optional(),
    institution: z.string().optional(),
  }),
});

type PostingFormValues = z.infer<typeof PostingSchema>;

interface PostingFormProps {
  type: OpportunityType;
  pageTitle: string;
}

export function PostingForm({ type, pageTitle }: PostingFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PostingFormValues>({
    resolver: zodResolver(PostingSchema),
    defaultValues: {
      requiredSkills: [{ skill: "", minThreshold: 60 }],
      eligibilityCriteria: {},
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "requiredSkills",
  });

  const onSubmit = async (values: PostingFormValues) => {
    setServerError(null);
    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        ...values,
        deadline: new Date(values.deadline).toISOString(),
        eligibilityCriteria: {
          ...(values.eligibilityCriteria.minCGPA !== undefined
            ? { minCGPA: values.eligibilityCriteria.minCGPA }
            : {}),
          ...(values.eligibilityCriteria.institution
            ? { institution: values.eligibilityCriteria.institution }
            : {}),
        },
      }),
    });

    const json = await res.json();
    if (!json.success) {
      setServerError(json.error.message);
      return;
    }

    router.push("/industry/my-postings");
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {pageTitle}
        </h1>
        <p className="text-xs text-foreground-muted mt-0.5">
          Required skill thresholds map directly to the platform 4D taxonomy for automated student matching.
        </p>
      </div>

      {serverError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Core details card */}
        <div className="rounded-lg border border-border bg-[#0E131F] p-5 space-y-4">
          <div className="border-b border-border/80 pb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Posting Details
            </h2>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label
                htmlFor="title"
                className="text-xs font-semibold text-white mb-1 block"
              >
                Role Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="e.g. Distributed Systems Engineer / Backend Intern"
                className="bg-white/[0.03] border-border text-white placeholder:text-foreground-subtle h-9 text-xs"
              />
              {errors.title && (
                <p className="mt-1 text-[11px] text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label
                htmlFor="description"
                className="text-xs font-semibold text-white mb-1 block"
              >
                Role & Project Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe project responsibilities, technical challenges, and team expectations..."
                className="min-h-[120px] bg-white/[0.03] border-border text-white placeholder:text-foreground-subtle text-xs resize-y"
              />
              {errors.description && (
                <p className="mt-1 text-[11px] text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Row: location, duration, stipend, deadline */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label
                  htmlFor="location"
                  className="text-xs font-semibold text-white mb-1 block"
                >
                  Location
                </Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="e.g. Bangalore / Remote"
                  className="bg-white/[0.03] border-border text-white placeholder:text-foreground-subtle h-9 text-xs"
                />
              </div>
              <div>
                <Label
                  htmlFor="duration"
                  className="text-xs font-semibold text-white mb-1 block"
                >
                  Duration
                </Label>
                <Input
                  id="duration"
                  {...register("duration")}
                  placeholder="e.g. 3 months"
                  className="bg-white/[0.03] border-border text-white placeholder:text-foreground-subtle h-9 text-xs"
                />
              </div>
              <div>
                <Label
                  htmlFor="stipendRange"
                  className="text-xs font-semibold text-white mb-1 block"
                >
                  Stipend Range / Compensation
                </Label>
                <Input
                  id="stipendRange"
                  {...register("stipendRange")}
                  placeholder="e.g. ₹20,000–₹30,000/month"
                  className="bg-white/[0.03] border-border text-white placeholder:text-foreground-subtle h-9 text-xs"
                />
              </div>
              <div>
                <Label
                  htmlFor="deadline"
                  className="text-xs font-semibold text-white mb-1 block"
                >
                  Application Deadline{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  {...register("deadline")}
                  className="bg-white/[0.03] border-border text-white h-9 text-xs"
                />
                {errors.deadline && (
                  <p className="mt-1 text-[11px] text-destructive">
                    {errors.deadline.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Required skills card */}
        <div className="rounded-lg border border-border bg-[#0E131F] p-5 space-y-4">
          <div className="border-b border-border/80 pb-2 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
                Required Competency Thresholds
              </h2>
              <p className="text-xs text-foreground-muted mt-0.5">
                Evaluated against verified 4D assessment scores (0–100%) for matching candidates.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 text-xs border-border bg-white/[0.03] text-foreground hover:text-white hover:bg-white/10"
              onClick={() => append({ skill: "", minThreshold: 60 })}
            >
              <PlusCircle className="h-3 w-3 text-primary" />
              <span>Add Skill</span>
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3">
                <div className="flex-1">
                  <Select
                    onValueChange={(val) =>
                      setValue(`requiredSkills.${index}.skill`, val, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="h-9 text-xs bg-[#111827] border-border text-white">
                      <SelectValue placeholder="Select domain taxonomy…" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-border text-white z-50 shadow-2xl">
                      {DOMAINS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.requiredSkills?.[index]?.skill && (
                    <p className="mt-0.5 text-[11px] text-destructive">
                      {errors.requiredSkills[index]?.skill?.message}
                    </p>
                  )}
                </div>
                <div className="w-40">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    {...register(`requiredSkills.${index}.minThreshold`, {
                      valueAsNumber: true,
                    })}
                    placeholder="Min score (≥ %)"
                    className="h-9 text-xs bg-white/[0.03] border-border text-white"
                  />
                  {errors.requiredSkills?.[index]?.minThreshold && (
                    <p className="mt-0.5 text-[11px] text-destructive">
                      {errors.requiredSkills[index]?.minThreshold?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0 text-foreground-subtle hover:text-destructive hover:bg-destructive/10"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility card */}
        <div className="rounded-lg border border-border bg-[#0E131F] p-5 space-y-4">
          <div className="border-b border-border/80 pb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Eligibility Criteria (Optional)
            </h2>
            <p className="text-xs text-foreground-muted mt-0.5">
              Leave blank for open eligibility across all institutions.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label
                htmlFor="minCGPA"
                className="text-xs font-semibold text-white mb-1 block"
              >
                Minimum CGPA (0–10)
              </Label>
              <Input
                id="minCGPA"
                type="number"
                step="0.1"
                min={0}
                max={10}
                {...register("eligibilityCriteria.minCGPA", {
                  setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
                })}
                placeholder="e.g. 7.5"
                className="bg-white/[0.03] border-border text-white placeholder:text-foreground-subtle h-9 text-xs"
              />
            </div>
            <div>
              <Label
                htmlFor="institution"
                className="text-xs font-semibold text-white mb-1 block"
              >
                Restrict to Institution
              </Label>
              <Input
                id="institution"
                {...register("eligibilityCriteria.institution")}
                placeholder="e.g. IIT Madras (leave blank for all)"
                className="bg-white/[0.03] border-border text-white placeholder:text-foreground-subtle h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 text-xs border-border bg-white/[0.03] hover:bg-white/10"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="h-9 gap-1.5 bg-primary px-4 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish Opportunity"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
