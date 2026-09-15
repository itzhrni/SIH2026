// app/(student)/courses/page.tsx
// In-Portal Course Catalog Page delivering curriculum directly on the platform.
// RULE FE-01: Server Component.

import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { nextAuthConfig } from "@/lib/auth/next-auth-config";
import { IN_PORTAL_COURSES } from "@/lib/courses/course-registry";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Hero Header */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-card via-card to-primary/5 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Direct Portal Delivery (No External Redirects)
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              In-Portal Interactive Courses
            </h1>
            <p className="text-sm sm:text-base text-foreground-muted max-w-2xl">
              Learn curriculum modules directly inside SkillLedger, review technical and clinical trade-offs, and launch linked 4D AI assessments to earn verified Skill Badges.
            </p>
          </div>

          <Link href="/assess">
            <Button className="gap-2 bg-primary text-white hover:bg-primary-hover shadow-xs h-10 px-5">
              <BrainCircuit className="h-4 w-4" />
              Live 4D Assessments
            </Button>
          </Link>
        </div>
      </div>

      {/* Course Categories Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border bg-card p-5 shadow-xs border-l-4 border-l-primary">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Engineering & Computer Science</h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                Distributed Systems, Data Structures, Cloud Architecture, and High-Scale APIs
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-5 shadow-xs border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">National AYUSH Grid Curricula</h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                Ayurvedic Pharmacology (Dravya Guna, Rasa Shastra) & Standardized Clinical Practice
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">All In-Portal Courses ({IN_PORTAL_COURSES.length})</h2>
          <span className="text-xs text-foreground-muted">Self-paced with verified 4D rubric badges</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {IN_PORTAL_COURSES.map((course) => (
            <Card
              key={course.id}
              className="border-border hover:border-primary/40 transition-all duration-200 shadow-xs flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div
                  className={`h-2 w-full ${
                    course.category === "ENGINEERING"
                      ? "bg-gradient-to-r from-primary to-indigo-500"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500"
                  }`}
                />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={`text-2xs font-semibold uppercase ${
                            course.category === "ENGINEERING"
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                          }`}
                        >
                          {course.category}
                        </Badge>
                        <Badge variant="outline" className="text-2xs text-foreground-muted">
                          {course.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold text-foreground pt-1">
                        {course.title}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-xs text-foreground-muted leading-relaxed line-clamp-2 pt-1">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pb-4">
                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {course.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-border bg-background-subtle px-2 py-0.5 text-2xs font-medium text-foreground-muted"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Course Metadata */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-background-subtle border border-border text-center">
                    <div>
                      <span className="text-2xs text-foreground-subtle block">Duration</span>
                      <span className="text-xs font-bold text-foreground flex items-center justify-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3 text-primary" />
                        {course.duration.split(" ")[0]} wks
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-foreground-subtle block">Curriculum</span>
                      <span className="text-xs font-bold text-foreground flex items-center justify-center gap-1 mt-0.5">
                        <Layers className="h-3 w-3 text-indigo-500" />
                        {course.modulesCount} Modules
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-foreground-subtle block">Verification</span>
                      <span className="text-xs font-bold text-foreground flex items-center justify-center gap-1 mt-0.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        4D Badge
                      </span>
                    </div>
                  </div>

                  {/* Instructor Note */}
                  <div className="flex items-center gap-2 text-xs text-foreground-muted pt-1">
                    <Users className="h-3.5 w-3.5 text-foreground-subtle shrink-0" />
                    <span className="truncate">
                      Instructor: <strong className="text-foreground">{course.instructor.name}</strong> ({course.instructor.institution})
                    </span>
                  </div>
                </CardContent>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-border flex items-center gap-3 mt-2 bg-card">
                <Link href={`/student/courses/${course.id}`} className="flex-1">
                  <Button className="w-full gap-1.5 bg-primary text-white hover:bg-primary-hover text-xs h-9">
                    <BookOpen className="h-3.5 w-3.5" />
                    Open Course
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Link href="/assess">
                  <Button variant="outline" size="sm" className="text-xs h-9 gap-1" title="Take AI assessment for this course">
                    <BrainCircuit className="h-3.5 w-3.5 text-primary" />
                    Test Now
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
