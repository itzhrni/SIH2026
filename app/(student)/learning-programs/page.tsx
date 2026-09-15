"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ExternalLink,
  Search,
  Filter,
  Clock,
  Tag,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookmarkCheck,
  TrendingUp,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiResponse } from "@/types";
import { IN_PORTAL_COURSES, type InPortalCourse } from "@/lib/courses/course-registry";

interface CourseProgram {
  id: string;
  title: string;
  format: string;
  skills: string[];
  duration: string;
  enrollmentLink: string;
  postedBy?: { name: string };
  source?: string;
  isExternal?: boolean;
  matchContext?: string;
  progressPercent?: number;
}

export default function LearningProgramsPage() {
  const [programs, setPrograms] = useState<CourseProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "recommended" | "in_progress" | "completed">("all");
  const [filterProvider, setFilterProvider] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState("");

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const params = new URLSearchParams();
        if (filterProvider !== "all") params.set("provider", filterProvider);

        const res = await fetch(`/api/learning-programs?${params}`);
        const json: ApiResponse<CourseProgram[]> = await res.json();

        let loaded: CourseProgram[] = [];

        // 1. Add In-Portal Native Courses first
        const nativeCourses: CourseProgram[] = IN_PORTAL_COURSES.map((c: InPortalCourse) => ({
          id: c.id,
          title: c.title,
          format: "In-Portal Interactive Course",
          skills: c.skills || [c.domain],
          duration: c.duration,
          enrollmentLink: `/courses/${c.id}`,
          postedBy: { name: c.instructor.name },
          isExternal: false,
          source: "In-Portal",
          matchContext: c.domain.toLowerCase().includes("system")
            ? "Closes gap in Distributed Architecture"
            : c.domain.toLowerCase().includes("dsa")
            ? "Matches Software Engineer Pathway"
            : "AYUSH Specialized Curriculum",
          progressPercent: c.id === "distributed-systems-arch" ? 40 : 0,
        }));

        if (json.success) {
          const apiCourses = json.data.map((p, idx) => ({
            ...p,
            matchContext:
              idx === 0
                ? "Matches your ML pathway"
                : idx === 1
                ? "Recommended for: ML Engineer"
                : idx === 2
                ? "Closes a core DSA gap"
                : undefined,
            progressPercent: idx === 0 ? 65 : 0,
          }));
          loaded = [...nativeCourses, ...apiCourses];
        } else {
          loaded = nativeCourses;
        }

        // Fetch opportunity learning programs
        try {
          const oppRes = await fetch(`/api/opportunities?type=LEARNING_PROGRAM`);
          const oppJson = await oppRes.json();
          if (oppJson.success) {
            const adaptedOpps = oppJson.data.map((opp: any) => ({
              id: opp.id,
              title: opp.title,
              format: "Institution Program",
              skills: opp.requiredSkills ? opp.requiredSkills.map((s: any) => s.skill) : [],
              duration: opp.duration || "Self-Paced",
              enrollmentLink: `/opportunities`,
              postedBy: { name: opp.postedBy?.name || "Partner University" },
              isExternal: false,
              source: "Institution",
              matchContext: "Institutional Credit Pathway",
            }));
            loaded = [...loaded, ...adaptedOpps];
          }
        } catch (e) {
          console.error("Failed to fetch opportunity learning programs", e);
        }

        setPrograms(loaded);
      } catch (err) {
        console.error("Failed to fetch learning programs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [filterProvider]);

  // Filter logic
  const filteredPrograms = programs.filter((prog) => {
    const matchesSearch =
      prog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSkill = !selectedSkill || prog.skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase());

    const matchesProvider =
      filterProvider === "all" ||
      (filterProvider === "In-Portal" && !prog.isExternal && prog.source === "In-Portal") ||
      (filterProvider === "Coursera" && prog.source === "Coursera") ||
      (filterProvider === "GeeksforGeeks" && prog.source === "GeeksforGeeks");

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "recommended" && Boolean(prog.matchContext)) ||
      (activeTab === "in_progress" && (prog.progressPercent || 0) > 0 && (prog.progressPercent || 0) < 100) ||
      (activeTab === "completed" && (prog.progressPercent || 0) === 100);

    return matchesSearch && matchesSkill && matchesProvider && matchesTab;
  });

  // Top recommended items (first 3 with matchContext)
  const recommendedItems = programs
    .filter((p) => Boolean(p.matchContext))
    .slice(0, 3);

  // Quick skill tags
  const POPULAR_SKILLS = [
    "system-design",
    "dsa",
    "machine-learning",
    "python",
    "deep-learning",
    "ayurvedic-pharmacology",
  ];

  return (
    <div className="space-y-6">
      {/* 1. COMPACT PAGE HEADER (15-20% viewport max) */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Learning Programs
          </h1>
          <p className="mt-0.5 text-xs text-foreground-muted">
            Build the skills your target roles and verified ledger benchmarks demand.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Interactive Courses</span>
          </Link>
        </div>
      </div>

      {/* 2. COMPACT SEARCH & FILTER CONTROLS */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-[#0E131F] p-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search courses, skills, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-border/80 bg-white/[0.03] py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-foreground-subtle focus:border-primary/50 focus:bg-white/[0.06] focus:outline-none transition-colors"
          />
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: "all", label: "All" },
              { id: "recommended", label: "Recommended" },
              { id: "in_progress", label: "In Progress" },
              { id: "completed", label: "Completed" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-xs"
                  : "text-foreground-muted hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Secondary Provider Filter */}
        <div className="flex items-center gap-2">
          <Select value={filterProvider} onValueChange={setFilterProvider}>
            <SelectTrigger className="h-8 w-[130px] border-border bg-white/[0.03] text-xs">
              <Filter className="h-3 w-3 mr-1.5 text-foreground-muted" />
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent className="bg-[#111827] border-border text-xs">
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="In-Portal">In-Portal</SelectItem>
              <SelectItem value="Coursera">Coursera</SelectItem>
              <SelectItem value="GeeksforGeeks">GeeksforGeeks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 3. RECOMMENDED FOR YOU SECTION (2-3 compact purposeful cards) */}
      {activeTab === "all" && !searchTerm && !selectedSkill && recommendedItems.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold tracking-tight text-white uppercase tracking-wider">
                Recommended For You
              </h2>
            </div>
            <span className="text-[11px] text-foreground-muted">
              Personalized from your 4D assessment gap analysis
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {recommendedItems.map((course) => {
              const isExternal = course.isExternal || course.enrollmentLink.startsWith("http");
              const CardWrapper = isExternal ? "a" : Link;
              const linkProps = isExternal
                ? { href: course.enrollmentLink, target: "_blank", rel: "noopener noreferrer" }
                : { href: course.enrollmentLink };

              return (
                <CardWrapper
                  key={course.id}
                  {...(linkProps as any)}
                  className="group flex flex-col justify-between rounded-lg border border-border bg-[#0E131F] p-4 transition-all duration-150 hover:border-primary/40 hover:bg-[#121827] hover:shadow-sm"
                >
                  <div className="space-y-2.5">
                    {/* Header: Title + External indicator */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-foreground-muted">
                          {course.source || course.postedBy?.name || "SkillLedger"}
                        </p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-foreground-subtle group-hover:text-primary transition-colors" />
                    </div>

                    {/* Skill Chips */}
                    <div className="flex flex-wrap gap-1">
                      {course.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-foreground-muted"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer metadata & reason */}
                  <div className="mt-3 pt-3 border-t border-border/60 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-foreground-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                      </span>
                      {course.matchContext && (
                        <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.2 text-[10px] font-semibold text-primary truncate max-w-[160px]">
                          {course.matchContext}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center text-xs font-medium text-primary group-hover:underline">
                      <span>View course</span>
                      <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </CardWrapper>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. EXPLORE BY SKILL FILTER CHIPS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-foreground-muted shrink-0 text-[11px] mr-1 font-medium">
          Filter by Skill:
        </span>
        <button
          onClick={() => setSelectedSkill("")}
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            selectedSkill === ""
              ? "bg-white/10 text-white"
              : "text-foreground-muted hover:bg-white/5 hover:text-white"
          }`}
        >
          All Skills
        </button>
        {POPULAR_SKILLS.map((skill) => (
          <button
            key={skill}
            onClick={() => setSelectedSkill(selectedSkill === skill ? "" : skill)}
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors whitespace-nowrap ${
              selectedSkill === skill
                ? "bg-primary text-white"
                : "bg-white/[0.04] text-foreground-muted hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            {skill}
          </button>
        ))}
      </div>

      {/* 5. ALL COURSES / FILTERED RESULTS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
            {activeTab === "in_progress"
              ? "Active Learning Programs"
              : activeTab === "completed"
              ? "Completed Courses"
              : "Available Learning Curriculum"}
          </h2>
          <span className="text-[11px] text-foreground-subtle">
            {filteredPrograms.length} {filteredPrograms.length === 1 ? "course" : "courses"}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-foreground-muted">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading tailored learning paths...
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="rounded-lg border border-border bg-[#0E131F] py-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-foreground-subtle mb-2" />
            <p className="text-xs font-semibold text-white">No courses match your filter</p>
            <p className="mt-1 text-[11px] text-foreground-muted">
              Try adjusting your search query or selecting a different skill filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPrograms.map((course) => {
              const isExternal = course.isExternal || course.enrollmentLink.startsWith("http");
              const CardWrapper = isExternal ? "a" : Link;
              const linkProps = isExternal
                ? { href: course.enrollmentLink, target: "_blank", rel: "noopener noreferrer" }
                : { href: course.enrollmentLink };

              return (
                <CardWrapper
                  key={course.id}
                  {...(linkProps as any)}
                  className="group flex flex-col justify-between rounded-lg border border-border bg-[#0E131F] p-4 transition-all duration-150 hover:border-primary/40 hover:bg-[#121827]"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-semibold text-white group-hover:text-primary transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-[11px] text-foreground-muted mt-0.5">
                          {course.source || course.postedBy?.name || "Online Program"}
                        </p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-foreground-subtle group-hover:text-primary" />
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {course.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-foreground-muted"
                        >
                          {skill}
                        </span>
                      ))}
                      {course.skills.length > 3 && (
                        <span className="text-[10px] text-foreground-subtle">
                          +{course.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px]">
                    <span className="text-foreground-muted flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration}
                    </span>
                    <span className="text-xs font-medium text-primary flex items-center gap-1">
                      View course →
                    </span>
                  </div>
                </CardWrapper>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
