"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Building,
  Calendar,
  MapPin,
  Clock,
  IndianRupee,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { ApiResponse } from "@/types";

interface OpportunityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string | null;
  duration: string | null;
  stipendRange: string | null;
  deadline: string;
  postedBy: {
    id: string;
    name: string;
    institution: string | null;
  };
  requiredSkills: Array<{ skill: string; minThreshold: number }>;
}

const TYPE_LABELS: Record<string, string> = {
  FDP: "Faculty Development Program",
  FACULTY_INTERNSHIP: "Faculty Internship",
  RESEARCH_PROJECT: "Research Collaboration",
  CONSULTANCY: "Consultancy",
  LEARNING_PROGRAM: "Industry Learning Program",
};

const ACAD_TYPES = [
  "ALL",
  "FDP",
  "FACULTY_INTERNSHIP",
  "RESEARCH_PROJECT",
  "CONSULTANCY",
  "LEARNING_PROGRAM",
];

export default function AcadOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [selectedType, setSelectedType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    id: string;
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const res = await fetch("/api/opportunities");
        const json: ApiResponse<OpportunityItem[]> = await res.json();
        if (json.success) {
          setOpportunities(json.data);
        }
      } catch (err) {
        console.error("[AcadOpportunities] Failed to load:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOpportunities();
  }, []);

  async function handleApply(opportunityId: string) {
    setApplyingId(opportunityId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchScoreAtApply: 85 }), // Standard academic profile match
      });
      const json: ApiResponse<{ id: string }> = await res.json();

      if (json.success) {
        setFeedback({
          id: opportunityId,
          success: true,
          message:
            "Application submitted successfully using your Academician profile.",
        });
      } else {
        setFeedback({
          id: opportunityId,
          success: false,
          message: json.error.message || "Failed to submit application.",
        });
      }
    } catch {
      setFeedback({
        id: opportunityId,
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setApplyingId(null);
    }
  }

  // Filter opportunities
  const filtered = opportunities.filter((item) => {
    const matchesType = selectedType === "ALL" || item.type === selectedType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.postedBy.institution &&
        item.postedBy.institution
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Academician Opportunities
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse industry-sponsored Faculty Development Programs (FDP),
          consultancy opportunities, faculty internships, and collaborative
          research projects.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {ACAD_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors duration-150 ease-in-out ${
                selectedType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {type === "ALL" ? "All Opportunities" : TYPE_LABELS[type] || type}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>
      </div>

      {/* Opportunity Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-md border border-border bg-card p-5"
            >
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="mt-2 h-4 w-1/4" />
              <Skeleton className="mt-4 h-16 w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-md border border-dashed border-border bg-card p-6 text-center">
          <Briefcase className="h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-semibold text-foreground">
            No opportunities found
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search criteria or filter type.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-md border border-border bg-card p-5 shadow-sm transition-colors duration-150 ease-in-out"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-foreground">
                      {item.title}
                    </h2>
                    <Badge
                      variant="secondary"
                      className="rounded-sm text-[10px]"
                    >
                      {TYPE_LABELS[item.type] || item.type}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building className="h-3.5 w-3.5" />
                    <span>
                      {item.postedBy.institution || item.postedBy.name}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleApply(item.id)}
                  disabled={applyingId === item.id}
                >
                  {applyingId === item.id ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Applying…
                    </span>
                  ) : (
                    "Apply with Academic Profile"
                  )}
                </Button>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>

              {/* Meta details */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {item.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{item.location}</span>
                  </div>
                )}
                {item.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{item.duration}</span>
                  </div>
                )}
                {item.stipendRange && (
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5" />
                    <span>{item.stipendRange}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Deadline: {new Date(item.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Feedback alert */}
              {feedback && feedback.id === item.id && (
                <div
                  className={`mt-3 flex items-center gap-2 rounded-sm border p-2.5 text-xs ${
                    feedback.success
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                  }`}
                >
                  {feedback.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
