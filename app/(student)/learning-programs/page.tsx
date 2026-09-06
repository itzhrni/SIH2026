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
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiResponse } from "@/types";

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
  createdAt?: Date;
}

export default function LearningProgramsPage() {
  const [programs, setPrograms] = useState<CourseProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProvider, setFilterProvider] = useState("all");
  const [filterSkill, setFilterSkill] = useState("");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const params = new URLSearchParams();
        if (filterProvider !== "all") params.set("provider", filterProvider);
        if (filterSkill) params.set("skills", filterSkill);

        // Fetch from original API (includes external ones like Coursera, GeeksforGeeks)
        const res = await fetch(`/api/learning-programs?${params}`);
        const json: ApiResponse<CourseProgram[]> = await res.json();
        
        let loadedPrograms: CourseProgram[] = [];
        let hasError = false;

        if (json.success) {
          loadedPrograms = [...json.data];
        } else {
          hasError = true;
          if (json.error?.code === "UNAUTHORIZED") {
            setError("Sign in to view learning programs");
          } else {
            setError(json.error?.message || "Failed to fetch programs");
          }
        }

        // Fetch LEARNING_PROGRAM from Opportunities model
        if (!hasError) {
          try {
            const oppRes = await fetch(`/api/opportunities?type=LEARNING_PROGRAM`);
            const oppJson = await oppRes.json();
            if (oppJson.success) {
              const adaptedOpps = oppJson.data.map((opp: any) => ({
                id: opp.id,
                title: opp.title,
                format: "Institution Program",
                skills: opp.requiredSkills ? opp.requiredSkills.map((s: any) => s.skill) : [],
                duration: opp.duration || "N/A",
                enrollmentLink: `/opportunities/${opp.id}`,
                postedBy: { name: opp.postedBy?.name || "Institution" },
                isExternal: false,
              }));
              loadedPrograms = [...loadedPrograms, ...adaptedOpps];
            }
          } catch (e) {
            console.error("Failed to fetch opportunity learning programs", e);
          }
        }

        if (!hasError) {
          setPrograms(loadedPrograms);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch learning programs:", err);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [filterProvider, filterSkill]);

  const filteredPrograms = programs.filter(
    (prog) =>
      prog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.skills.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  const providers = ["all", "Coursera", "GeeksforGeeks"];
  const availableSkills = [
    "python",
    "machine-learning",
    "dsa",
    "system-design",
    "react",
    "deep-learning",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <BookOpen className="h-12 w-12 text-foreground-muted" />
          <p className="text-foreground text-lg">{error}</p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-md bg-primary/10">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Learning Programs
                </h1>
                <p className="text-foreground-muted">
                  Explore courses from Coursera, GeeksforGeeks, and your
                  institution
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                  <Input
                    placeholder="Search courses or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={filterProvider}
                  onValueChange={setFilterProvider}
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    <SelectItem value="Coursera">Coursera</SelectItem>
                    <SelectItem value="GeeksforGeeks">GeeksforGeeks</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSkill} onValueChange={setFilterSkill}>
                  <SelectTrigger className="w-[180px]">
                    <Tag className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Skills</SelectItem>
                    {availableSkills.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredPrograms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-foreground-muted mb-4" />
              <p className="text-foreground-muted text-lg">
                No learning programs found
              </p>
              <p className="text-foreground-muted text-sm mt-1">
                Try adjusting your filters or search terms
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrograms.map((program) => (
              <Card
                key={program.id}
                className="flex flex-col hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">
                        {program.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {program.format}
                        {program.postedBy && <> · {program.postedBy.name}</>}
                      </CardDescription>
                    </div>
                    {program.isExternal && (
                      <Badge variant="outline" className="gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {program.source}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {program.skills.slice(0, 4).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {program.skills.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{program.skills.length - 4} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-foreground-muted mt-auto">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{program.duration}</span>
                    </div>
                    {program.isExternal && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>External</span>
                      </div>
                    )}
                  </div>
                  <Button asChild variant="default" className="w-full mt-2">
                    <a
                      href={program.enrollmentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Enroll Now
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
