// ─── Knowledge Graph ──────────────────────────────────────────────────────────

export interface ConceptNode {
  id: string;
  label: string;
  topicId: string;
  dependencies: string[];
  rubric: {
    correctness: string;
    depth: string;
    tradeoffAwareness: string;
    realWorldApplicability: string;
  };
  importance: number;
}

export interface KnowledgeGraph {
  domain: string;
  displayName: string;
  version: string;
  nodes: ConceptNode[];
}

// ─── Learning Programs ────────────────────────────────────────────────────────

export interface LearningProgram {
  id: string;
  title: string;
  format: string;
  skills: string[];
  duration: string;
  enrollmentLink: string;
  postedById?: string;
  postedBy?: { name: string };
  source?: string;
  isExternal?: boolean;
  createdAt: Date;
}

// ─── Assessment Session ───────────────────────────────────────────────────────

export type NodeStatus = "strong" | "partial" | "weak" | "untested";
export type NextAction =
  | "advance"
  | "followup"
  | "mark_gap_advance"
  | "complete";

export interface NodeEvaluation {
  correctness: number;
  depth: number;
  tradeoffAwareness: number;
  realWorldApplicability: number;
  composite: number;
  status: NodeStatus;
}

export interface LLMEvaluationResponse {
  evaluation: NodeEvaluation;
  next_action: NextAction;
  followup_question: string | null;
  reasoning: string;
}

export interface AssessmentTurn {
  questionText: string;
  conceptNodeId: string;
  turnIndex: number;
  isFollowup: boolean;
}

export interface GapReportData {
  id: string;
  domain: string;
  overallScore: number;
  strongNodes: string[];
  partialNodes: string[];
  weakNodes: string[];
  learningResources: {
    conceptNodeId: string;
    resources: { title: string; url: string }[];
  }[];
}

// ─── Skill Profile ────────────────────────────────────────────────────────────

export interface DomainScore {
  score: number;
  lastUpdated: string;
}

export interface SkillBadge {
  domain: string;
  earned: boolean;
  earnedAt: string | null;
}

export interface ScoreHistoryPoint {
  domain: string;
  score: number;
  recordedAt: string;
  sessionId: string;
}

// ─── Opportunity & Matching ───────────────────────────────────────────────────

export interface RequiredSkill {
  skill: string;
  minThreshold: number;
}

export interface OpportunityMatchResult {
  opportunityId: string;
  matchScore: number;
  metSkills: string[];
  gapSkills: { skill: string; studentScore: number; required: number }[];
}

// ─── Enriched Opportunity (STUDENT feed) ──────────────────────────────────────
/**
 * Enriched opportunity returned by GET /api/opportunities for STUDENT callers.
 * Combines the raw posting fields with server-computed match data.
 */
export interface EnrichedOpportunity {
  id: string;
  type: string;
  title: string;
  description: string;
  requiredSkills: RequiredSkill[];
  location: string | null;
  duration: string | null;
  stipendRange: string | null;
  deadline: string;
  createdAt: string;
  postedBy: { id: string; name: string; institution: string | null };
  matchScore: number;
  metSkills: string[];
  gapSkills: { skill: string; studentScore: number; required: number }[];
}

// ─── Demand & Cohort Analytics ───────────────────────────────────────────────

export type GapSeverity = "HIGH" | "MEDIUM" | "LOW";

export interface SkillGapDataPoint {
  skill: string;
  demandPercent: number;
  supplyPercent: number;
  gap: number;
  severity: GapSeverity;
}

export interface CohortSkillDataPoint {
  department: string;
  domain: string;
  averageScore: number;
  studentCount: number;
}

export interface PlacementProgressStats {
  totalApplications: number;
  underReview: number;
  shortlisted: number;
  interviewScheduled: number;
  selected: number;
  notSelected: number;
  activePostings: number;
  totalStudents: number;
}

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  institution: string | null;
  department: string | null;
  expertise: string | null;
}

// ─── API Response Envelope ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Industry Portal & Candidate Discovery ────────────────────────────────────

export type LongitudinalTrajectory =
  | "STABLE_HIGH"
  | "IMPROVING"
  | "GROWTH_DETECTED"
  | "BASELINE";

export interface LongitudinalSignal {
  trajectory: LongitudinalTrajectory;
  label: string;
  sessionCount: number;
  deltaScore?: number;
  stabilityScore: number;
}

export interface CandidateMatch {
  id: string;
  name: string;
  email: string;
  institution: string | null;
  department: string | null;
  matchScore: number;
  topDomain: string;
  topDomainScore: number;
  metSkills: string[];
  gapSkills: { skill: string; studentScore: number; required: number }[];
  domainScores: Record<string, number>;
  sessionCount: number;
  badges: string[];
  longitudinalSignal: LongitudinalSignal;
}

export interface CandidateDiscoveryQuery {
  skills?: string[];
  minScore?: number;
  domain?: string;
  department?: string;
  institution?: string;
}

export interface OpportunityFormData {
  type:
    | "INTERNSHIP"
    | "JOB"
    | "FDP"
    | "FACULTY_INTERNSHIP"
    | "RESEARCH_PROJECT"
    | "CONSULTANCY"
    | "LEARNING_PROGRAM";
  title: string;
  description: string;
  requiredSkills: RequiredSkill[];
  eligibilityCriteria?: Record<string, unknown>;
  location?: string;
  duration?: string;
  stipendRange?: string;
  deadline: string; // ISO date string
}

export interface OpportunitySummary {
  id: string;
  title: string;
  type: string;
  location: string | null;
  duration: string | null;
  stipendRange: string | null;
  deadline: string;
  isActive: boolean;
  requiredSkills: RequiredSkill[];
  applicantCount: number;
  shortlistedCount: number;
  offersCount: number;
  createdAt: string;
}

export interface PipelineApplicant {
  id: string; // application id
  userId: string;
  studentName: string;
  studentEmail: string;
  institution: string | null;
  department: string | null;
  matchScoreAtApply: number;
  currentMatchScore?: number;
  status:
    | "APPLIED"
    | "UNDER_REVIEW"
    | "SHORTLISTED"
    | "INTERVIEW_SCHEDULED"
    | "SELECTED"
    | "NOT_SELECTED";
  placementStatus:
    | "APPLIED"
    | "REVIEWED"
    | "SHORTLISTED"
    | "INTERVIEW_SCHEDULED"
    | "OFFER_EXTENDED"
    | "JOINED"
    | "REJECTED"
    | null;
  notes: string | null;
  appliedAt: string;
  opportunityId: string;
  opportunityTitle: string;
}

export interface IndustryDashboardMetrics {
  activePostingsCount: number;
  totalApplicationsCount: number;
  shortlistedCandidatesCount: number;
  offersExtendedCount: number;
  recentPostings: OpportunitySummary[];
  recentApplicants: PipelineApplicant[];
}

// ─── Internship Management (M3) ───────────────────────────────────────────────

export interface InternshipProgressLog {
  week: number; // 1-indexed week number
  log: string; // student's weekly progress text
  submittedAt: string; // ISO 8601 date string
}

export interface MentorFeedback {
  rating: number; // 1–5 integer overall rating
  technicalScore: number; // 1–5 integer
  communicationScore: number; // 1–5 integer
  comments: string;
  submittedAt: string; // ISO 8601 date string
}

export interface EligibilityCriteria {
  yearOfStudy?: number[]; // e.g. [2, 3, 4]
  minCGPA?: number; // e.g. 6.5
  institution?: string; // restrict to a named institution or null for open
}

export interface OpportunityPostingData {
  type:
    | "INTERNSHIP"
    | "JOB"
    | "FDP"
    | "FACULTY_INTERNSHIP"
    | "RESEARCH_PROJECT"
    | "CONSULTANCY"
    | "LEARNING_PROGRAM";
  title: string;
  description: string;
  requiredSkills: RequiredSkill[];
  eligibilityCriteria: EligibilityCriteria;
  location?: string;
  duration?: string;
  stipendRange?: string;
  deadline: string; // ISO 8601 date string
}

export interface InternshipRecordData {
  id: string;
  studentId: string;
  studentName: string;
  mentorId: string | null;
  companyName: string;
  role: string;
  startDate: string;
  endDate: string | null;
  isComplete: boolean;
  progressLogs: InternshipProgressLog[];
  mentorFeedback: MentorFeedback | null;
  createdAt: string;
}

export interface ApplicationWithOpportunity {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunityType: string;
  companyName: string;
  status: string;
  placementStatus: string | null;
  matchScoreAtApply: number;
  appliedAt: string;
  updatedAt: string;
}

export interface ApplicantForPipeline {
  applicationId: string;
  studentId: string;
  studentName: string;
  studentInstitution: string | null;
  studentDepartment: string | null;
  matchScoreAtApply: number;
  status: string;
  placementStatus: string | null;
  notes: string | null;
  appliedAt: string;
}

// ─── Student Portal — M4 Types ───────────────────────────────────────────────

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  institution: string | null;
  department: string | null;
  domainScores: Record<string, DomainScore>;
  badges: Record<string, { earned: boolean; earnedAt: string | null }>;
  scoreHistory: ScoreHistoryPoint[];
}

export interface OpportunityWithMatch {
  id: string;
  title: string;
  companyName: string;
  type: string;
  location: string | null;
  duration: string | null;
  stipendRange: string | null;
  deadline: string;
  requiredSkills: RequiredSkill[];
  matchScore: number;
  metSkills: string[];
  gapSkills: { skill: string; studentScore: number; required: number }[];
}

export interface ApplicationWithDetails {
  id: string;
  appliedAt: string;
  status: string;
  placementStatus: string | null;
  matchScoreAtApply: number;
  opportunity: {
    id: string;
    title: string;
    companyName: string;
    type: string;
    location: string | null;
    deadline: string;
  };
}

export interface ProjectEntry {
  title: string;
  description: string;
  githubUrl: string | null;
  skills: string[];
}

export interface InternshipRecordDisplay {
  id: string;
  companyName: string;
  role: string;
  startDate: string;
  endDate: string | null;
  isComplete: boolean;
}

// ─── Assessment session API shapes ───────────────────────────────────────────

export interface StartSessionResult {
  sessionId: string;
  question: string;
  conceptNodeId: string;
  conceptNodeLabel: string;
  turnIndex: number;
  totalNodes: number;
  resumed: boolean;
}

export interface RespondResult {
  question: string | null;
  conceptNodeId: string | null;
  conceptNodeLabel: string | null;
  turnIndex: number;
  totalNodes: number;
  isComplete: boolean;
  reportId: string | null;
}
