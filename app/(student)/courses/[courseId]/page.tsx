// app/(student)/courses/[courseId]/page.tsx
// Interactive In-Portal Course Player with modular lessons and direct 4D Assessment Launch.
// RULE FE-01: Client Component (for active tab and interactive lesson toggling).

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { IN_PORTAL_COURSES } from "@/lib/courses/course-registry";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BookOpen,
  BrainCircuit,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Layers,
  Sparkles,
  ChevronRight,
  AlertCircle,
  FileCode,
  GraduationCap,
} from "lucide-react";

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const course = IN_PORTAL_COURSES.find((c) => c.id === courseId) || IN_PORTAL_COURSES[0];

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const [activeLessonId, setActiveLessonId] = useState<string>(
    allLessons[0]?.id || ""
  );
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  const activeLesson = allLessons.find((l) => l.id === activeLessonId) || allLessons[0];
  const activeModule = course.modules.find((m) =>
    m.lessons.some((l) => l.id === activeLesson?.id)
  );

  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const toggleComplete = (id: string) => {
    setCompletedLessonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const progressPercent = Math.round(
    (completedLessonIds.length / Math.max(allLessons.length, 1)) * 100
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/student/courses">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-foreground-muted">
              <ArrowLeft className="h-3.5 w-3.5" />
              All Courses
            </Button>
          </Link>
          <span className="text-foreground-subtle">/</span>
          <span className="text-xs font-semibold text-foreground truncate max-w-xs">
            {course.title}
          </span>
        </div>

        {/* Assessment CTA */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/assess" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto gap-2 bg-primary text-white hover:bg-primary-hover shadow-xs text-xs h-9">
              <BrainCircuit className="h-4 w-4" />
              Launch 4D Assessment for this Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Player Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2/3: Active Lesson Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-xs overflow-hidden">
            {/* Lesson Title Header */}
            <div className="bg-gradient-to-r from-card via-card to-primary/5 p-6 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  {activeModule?.title.split(":")[0] || "Module"}
                </Badge>
                <span className="text-xs text-foreground-muted flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {activeLesson?.duration}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                {activeLesson?.title}
              </h1>
              <p className="text-sm text-foreground-muted mt-2 leading-relaxed">
                {activeLesson?.content.summary}
              </p>
            </div>

            {/* Lesson Body */}
            <CardContent className="p-6 space-y-6 text-foreground">
              {/* Key Concept Points */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Core Concepts & Key Points
                </h3>
                <div className="space-y-2">
                  {activeLesson?.content.keyPoints.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background-subtle border border-border">
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{pt}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical / Clinical Deep Dive */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  Mechanics & Technical Deep-Dive
                </h3>
                <div className="p-4 rounded-lg bg-card border border-border text-sm leading-relaxed text-foreground-muted">
                  <p>{activeLesson?.content.technicalDeepDive}</p>
                </div>
              </div>

              {/* Code Snippet if applicable */}
              {activeLesson?.content.codeSnippet && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-emerald-500" />
                    Reference Architecture Code / Configuration
                  </h3>
                  <pre className="p-4 rounded-lg bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800">
                    <code>{activeLesson.content.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Trade-Offs & Production/Clinical Considerations */}
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-1.5">
                    <AlertCircle className="h-4 w-4" />
                    4D Rubric Assessment Focus: Architectural & Clinical Trade-offs
                  </div>
                  <p className="text-sm leading-relaxed">
                    {activeLesson?.content.tradeoffsDiscussion}
                  </p>
                </div>
              </div>

              {/* Lesson Footer Navigation & Completion Toggle */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
                <Button
                  variant={completedLessonIds.includes(activeLesson?.id || "") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleComplete(activeLesson?.id || "")}
                  className="gap-2 text-xs w-full sm:w-auto"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {completedLessonIds.includes(activeLesson?.id || "")
                    ? "Completed ✓"
                    : "Mark Lesson as Complete"}
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {prevLesson && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveLessonId(prevLesson.id)}
                      className="gap-1.5 text-xs"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Prev
                    </Button>
                  )}
                  {nextLesson && (
                    <Button
                      size="sm"
                      onClick={() => setActiveLessonId(nextLesson.id)}
                      className="gap-1.5 bg-primary text-white hover:bg-primary-hover text-xs"
                    >
                      Next
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1/3: Curriculum Modules Sidebar & Course Progress */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="border-border shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Course Completion</span>
              <span className="font-bold text-primary">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-2xs text-foreground-subtle">
              {completedLessonIds.length} of {allLessons.length} lessons completed
            </p>
          </Card>

          {/* Module Syllabus List */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Course Curriculum
              </CardTitle>
              <CardDescription className="text-xs">
                {course.modulesCount} Modules · {allLessons.length} Lessons
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 space-y-4">
              {course.modules.map((mod, modIdx) => (
                <div key={mod.id} className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground-muted px-2 uppercase tracking-wide">
                    {mod.title}
                  </h4>

                  <div className="space-y-1">
                    {mod.lessons.map((les) => {
                      const isActive = les.id === activeLessonId;
                      const isDone = completedLessonIds.includes(les.id);
                      return (
                        <button
                          key={les.id}
                          type="button"
                          onClick={() => setActiveLessonId(les.id)}
                          className={`w-full text-left p-2.5 rounded-md flex items-center justify-between transition-all duration-150 text-xs ${
                            isActive
                              ? "bg-primary text-white font-semibold shadow-xs"
                              : "text-foreground-muted hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span
                              className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                                isDone
                                  ? "bg-emerald-500 text-white"
                                  : isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-border text-foreground-subtle"
                              }`}
                            >
                              {isDone ? "✓" : modIdx + 1}
                            </span>
                            <span className="truncate">{les.title}</span>
                          </div>
                          <span className={`text-[10px] shrink-0 ml-2 ${isActive ? "text-white/80" : "text-foreground-subtle"}`}>
                            {les.duration}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Direct Assessment Trigger Box */}
          <Card className="border-border bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 p-5 space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <BrainCircuit className="h-5 w-5 text-primary" />
              Ready to Verify Skills?
            </div>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Launch the live 4D AI adaptive assessment for <strong>{course.domain}</strong>. Score ≥ 75 to earn a verified Skill Badge for your portfolio.
            </p>
            <Link href="/assess" className="block pt-1">
              <Button className="w-full bg-primary text-white hover:bg-primary-hover text-xs h-9 gap-1.5 shadow-xs">
                Start 4D Assessment
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
