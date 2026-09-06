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
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
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

    router.push("/industry/dashboard");
    router.refresh();
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {pageTitle}
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          Required skill fields map directly to the platform taxonomy for
          automated matching.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Core details card */}
        <div className="rounded-md border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold text-foreground">
              Posting Details
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Title */}
            <div>
              <Label
                htmlFor="title"
                className="text-sm font-medium text-foreground-muted mb-1 block"
              >
                Role Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="e.g. Backend Engineering Intern"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label
                htmlFor="description"
                className="text-sm font-medium text-foreground-muted mb-1 block"
              >
                Job Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe the role, responsibilities, and what the intern/candidate will work on..."
                className="min-h-[140px] resize-y"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Row: location, duration, stipend, deadline */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label
                  htmlFor="location"
                  className="text-sm font-medium text-foreground-muted mb-1 block"
                >
                  Location
                </Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="e.g. Bangalore / Remote"
                />
              </div>
              <div>
                <Label
                  htmlFor="duration"
                  className="text-sm font-medium text-foreground-muted mb-1 block"
                >
                  Duration
                </Label>
                <Input
                  id="duration"
                  {...register("duration")}
                  placeholder="e.g. 2 months"
                />
              </div>
              <div>
                <Label
                  htmlFor="stipendRange"
                  className="text-sm font-medium text-foreground-muted mb-1 block"
                >
                  Stipend Range
                </Label>
                <Input
                  id="stipendRange"
                  {...register("stipendRange")}
                  placeholder="e.g. ₹10,000–₹15,000/month"
                />
              </div>
              <div>
                <Label
                  htmlFor="deadline"
                  className="text-sm font-medium text-foreground-muted mb-1 block"
                >
                  Application Deadline{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input id="deadline" type="date" {...register("deadline")} />
                {errors.deadline && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.deadline.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Required skills card */}
        <div className="rounded-md border border-border bg-card">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Required Skills
              </h2>
              <p className="text-xs text-foreground-muted mt-0.5">
                Map skills to the platform taxonomy — used for automated
                candidate matching.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={() => append({ skill: "", minThreshold: 60 })}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Add Skill
            </Button>
          </div>
          <div className="p-4 space-y-3">
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
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select domain…" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOMAINS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.requiredSkills?.[index]?.skill && (
                    <p className="mt-0.5 text-xs text-destructive">
                      {errors.requiredSkills[index]?.skill?.message}
                    </p>
                  )}
                </div>
                <div className="w-36">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    {...register(`requiredSkills.${index}.minThreshold`, {
                      valueAsNumber: true,
                    })}
                    placeholder="Min score (0–100)"
                    className="h-9 text-sm"
                  />
                  {errors.requiredSkills?.[index]?.minThreshold && (
                    <p className="mt-0.5 text-xs text-destructive">
                      {errors.requiredSkills[index]?.minThreshold?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0 text-foreground-subtle hover:text-destructive"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {errors.requiredSkills?.root && (
              <p className="text-xs text-destructive">
                {errors.requiredSkills.root.message}
              </p>
            )}
            {errors.requiredSkills?.message && (
              <p className="text-xs text-destructive">
                {errors.requiredSkills.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Eligibility card */}
        <div className="rounded-md border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold text-foreground">
              Eligibility Criteria
            </h2>
            <p className="text-xs text-foreground-muted mt-0.5">
              Optional — leave blank for open eligibility.
            </p>
          </div>
          <div className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label
                htmlFor="minCGPA"
                className="text-sm font-medium text-foreground-muted mb-1 block"
              >
                Minimum CGPA
              </Label>
              <Input
                id="minCGPA"
                type="number"
                step="0.1"
                min={0}
                max={10}
                {...register("eligibilityCriteria.minCGPA", {
                  valueAsNumber: true,
                })}
                placeholder="e.g. 6.5"
              />
            </div>
            <div>
              <Label
                htmlFor="institution"
                className="text-sm font-medium text-foreground-muted mb-1 block"
              >
                Restrict to Institution
              </Label>
              <Input
                id="institution"
                {...register("eligibilityCriteria.institution")}
                placeholder="e.g. IIT Madras (leave blank for all)"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        {serverError && (
          <div className="rounded-md border border-destructive-border bg-destructive-bg px-4 py-3">
            <p className="text-sm text-destructive">{serverError}</p>
          </div>
        )}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="gap-1.5 bg-primary text-white hover:bg-primary-hover"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing…
              </>
            ) : (
              "Publish Posting"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
