// app/(student)/courses/page.tsx
// In-Portal Course Catalog Page delivering curriculum directly on the platform.
// RULE FE-01: Server Component.

import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { IN_PORTAL_COURSES } from "@/lib/courses/course-registry";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  BrainCircuit,
  Clock,
  Layers,
  ArrowRight,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Users,
} from "lucide-react";

export default async function CoursesPage() {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user) {
    redirect("/login");
  }

  const engineeringCourses = IN_PORTAL_COURSES.filter((c) => c.category === "ENGINEERING");
  const ayushCourses = IN_PORTAL_COURSES.filter((c) => c.category === "AYUSH");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            In-Portal Interactive Courses
          </h1>
          <p className="mt-0.5 text-xs text-foreground-muted">
            Study native curriculum directly inside SkillLedger with linked 4D assessment checkpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/assess">
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs"
            >
              <BrainCircuit className="h-3.5 w-3.5" />
              <span>4D Skill Assessments</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Engineering Curricula Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
              Engineering & Computer Science Curricula
            </h2>
          </div>
          <span className="text-[11px] text-foreground-subtle">
            {engineeringCourses.length} Courses Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {engineeringCourses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group flex flex-col justify-between rounded-lg border border-border bg-[#0E131F] p-5 transition-all duration-150 hover:border-primary/40 hover:bg-[#121827]"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider">
                      {course.level}
                    </span>
                    <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors mt-1.5 leading-snug">
                      {course.title}
                    </h3>
                  </div>
                  <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                </div>

                <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {course.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-foreground-muted border border-border/40"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-3 text-foreground-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-foreground-subtle" />
                    {course.duration}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-foreground-subtle" />
                    {course.modulesCount} Modules
                  </span>
                </div>

                <span className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
                  <span>Start Learning</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AYUSH Curricula Section */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
              National AYUSH Grid Curricula (Ministry of Ayush)
            </h2>
          </div>
          <span className="text-[11px] text-foreground-subtle">
            {ayushCourses.length} Courses Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ayushCourses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group flex flex-col justify-between rounded-lg border border-border bg-[#0E131F] p-5 transition-all duration-150 hover:border-emerald-500/40 hover:bg-[#121827]"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider">
                      {course.level}
                    </span>
                    <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors mt-1.5 leading-snug">
                      {course.title}
                    </h3>
                  </div>
                  <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                </div>

                <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {course.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-foreground-muted border border-border/40"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-3 text-foreground-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-foreground-subtle" />
                    {course.duration}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-foreground-subtle" />
                    {course.modulesCount} Modules
                  </span>
                </div>

                <span className="text-xs font-semibold text-emerald-400 group-hover:underline flex items-center gap-1">
                  <span>Start Learning</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
