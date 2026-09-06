/**
 * prisma/seed.ts — SkillLedger Demo Seed
 *
 * DEMO RULE: This script is idempotent — safe to run multiple times.
 * Strategy: Delete all existing demo data (by known emails) then re-insert.
 *
 * Run with: pnpm db:seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  log: ["error"],
});

// ─── Constants ────────────────────────────────────────────────────────────────

const DEMO_PASSWORD = "Demo@1234";
const SALT_ROUNDS = 10;

const DEMO_EMAILS = {
  // Students (from PROMPT_FOR_ANTIGRAVITY_PHASE2 spec)
  aarav: "student.aarav@skillledger.dev",
  priya: "student.priya@skillledger.dev",
  rohan: "student.rohan@skillledger.dev",
  // Industry
  vikram: "recruiter.vikram@techcorp.dev",
  // Academician
  ananya: "prof.sharma@aims.edu",
  // Admin
  admin: "admin@swan.gov.in",
};

// DSA graph snapshot (abbreviated — conforming to KnowledgeGraph interface)
const DSA_GRAPH_SNAPSHOT = {
  domain: "dsa",
  displayName: "Data Structures & Algorithms",
  version: "1.0.0",
  nodes: [
    {
      id: "arrays",
      label: "Arrays & Strings",
      topicId: "linear-structures",
      dependencies: [],
      rubric: {
        correctness: "Can the student implement array operations correctly?",
        depth:
          "Does the student understand cache locality and memory trade-offs?",
        tradeoffAwareness: "Can the student compare arrays vs linked lists?",
        realWorldApplicability:
          "Can the student apply sliding window patterns?",
      },
      importance: 1.0,
    },
    {
      id: "hash-tables",
      label: "Hash Tables",
      topicId: "lookup-structures",
      dependencies: ["arrays"],
      rubric: {
        correctness:
          "Can the student explain hashing and collision resolution?",
        depth: "Does the student understand amortised O(1)?",
        tradeoffAwareness: "Hash map vs sorted map trade-offs?",
        realWorldApplicability:
          "Can the student solve LRU cache with hash map?",
      },
      importance: 0.95,
    },
    {
      id: "dynamic-programming",
      label: "Dynamic Programming",
      topicId: "algorithmic-paradigms",
      dependencies: ["arrays"],
      rubric: {
        correctness:
          "Can the student define recurrences and implement memoisation?",
        depth: "Does the student understand state space design?",
        tradeoffAwareness: "Top-down vs bottom-up trade-offs?",
        realWorldApplicability: "Can the student apply DP to knapsack or LCS?",
      },
      importance: 0.95,
    },
  ],
};

// System Design graph snapshot
const SYSTEM_DESIGN_GRAPH_SNAPSHOT = {
  domain: "system-design",
  displayName: "System Design & Architecture",
  version: "1.0.0",
  nodes: [
    {
      id: "load-balancing",
      label: "Load Balancing",
      topicId: "scalability",
      dependencies: [],
      rubric: {
        correctness:
          "Can the student explain round-robin and consistent hashing?",
        depth: "Does the student understand L4 vs L7 load balancers?",
        tradeoffAwareness: "Consistent hashing vs round-robin trade-offs?",
        realWorldApplicability:
          "Can the student design a load-balanced API gateway?",
      },
      importance: 0.9,
    },
    {
      id: "caching-strategies",
      label: "Caching Strategies",
      topicId: "performance",
      dependencies: ["load-balancing"],
      rubric: {
        correctness:
          "Can the student describe cache-aside and write-through patterns?",
        depth:
          "Does the student understand eviction policies and cache stampede?",
        tradeoffAwareness: "Redis vs Memcached? In-process vs distributed?",
        realWorldApplicability:
          "Can the student design cache layers for a social feed?",
      },
      importance: 0.95,
    },
    {
      id: "microservices",
      label: "Microservices Architecture",
      topicId: "architectural-patterns",
      dependencies: ["load-balancing", "caching-strategies"],
      rubric: {
        correctness:
          "Can the student decompose a monolith and explain API gateways?",
        depth:
          "Does the student understand service discovery and circuit breakers?",
        tradeoffAwareness: "Monolith vs microservices operational overhead?",
        realWorldApplicability:
          "Can the student design a ride-hailing microservices system?",
      },
      importance: 1.0,
    },
  ],
};

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting SkillLedger demo seed...\n");

  // ── Step 1: Hash demo password ──────────────────────────────────────────────
  console.log("🔐 Hashing demo password...");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  // ── Step 2: Purge existing demo data (idempotency) ─────────────────────────
  console.log("🗑️  Purging existing demo accounts...");
  const demoEmailList = Object.values(DEMO_EMAILS);

  // Cascade deletes handle child records via FK constraints
  await prisma.user.deleteMany({
    where: { email: { in: demoEmailList } },
  });
  console.log("   ✓ Existing demo records purged\n");

  // ── Step 3: Create all demo users ──────────────────────────────────────────
  console.log("👥 Creating demo users...");

  const aarav = await prisma.user.create({
    data: {
      email: DEMO_EMAILS.aarav,
      name: "Aarav Sharma",
      passwordHash,
      role: "STUDENT",
      institution: "IIT Madras",
      department: "Computer Science",
    },
  });

  const priya = await prisma.user.create({
    data: {
      email: DEMO_EMAILS.priya,
      name: "Priya Patel",
      passwordHash,
      role: "STUDENT",
      institution: "PSG College of Technology",
      department: "Information Technology",
    },
  });

  const rohan = await prisma.user.create({
    data: {
      email: DEMO_EMAILS.rohan,
      name: "Rohan Verma",
      passwordHash,
      role: "STUDENT",
      institution: "Amrita University",
      department: "Computer Science",
    },
  });

  const vikram = await prisma.user.create({
    data: {
      email: DEMO_EMAILS.vikram,
      name: "Vikram Malhotra",
      passwordHash,
      role: "INDUSTRY",
      institution: "TechCorp Labs",
    },
  });

  const ananya = await prisma.user.create({
    data: {
      email: DEMO_EMAILS.ananya,
      name: "Dr. Ananya Sharma",
      passwordHash,
      role: "ACADEMICIAN",
      institution: "All India Institute of Ayurveda",
      department: "Computer Science & Engineering",
      expertise: "Machine Learning, Data Structures, Competitive Programming",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: DEMO_EMAILS.admin,
      name: "SWAN Institutional Admin",
      passwordHash,
      role: "INSTITUTIONAL_ADMIN",
      institution: "SWAN Atal Innovation Mission",
    },
  });

  console.log(`   ✓ Aarav Sharma (STUDENT)           — ${aarav.email}`);
  console.log(`   ✓ Priya Patel (STUDENT)             — ${priya.email}`);
  console.log(`   ✓ Rohan Verma (STUDENT)             — ${rohan.email}`);
  console.log(`   ✓ Vikram Malhotra (INDUSTRY)        — ${vikram.email}`);
  console.log(`   ✓ Dr. Ananya Sharma (ACADEMICIAN)   — ${ananya.email}`);
  console.log(`   ✓ SWAN Admin (INSTITUTIONAL_ADMIN)  — ${adminUser.email}\n`);

  const dbTotalUsers = await prisma.user.count();
  if (dbTotalUsers > demoEmailList.length) {
    console.warn(`⚠️  Found ${dbTotalUsers - demoEmailList.length} non-demo user(s). Seed is clean — demo accounts recreated.`);
  }

  // ── Step 4: Completed Assessment Sessions ──────────────────────────────────
  console.log("📝 Creating assessment sessions...");

  const aaravDsaSession = await prisma.assessmentSession.create({
    data: {
      userId: aarav.id,
      domain: "dsa",
      status: "completed",
      currentNodeId: null,
      turnIndex: 9,
      graphSnapshot: DSA_GRAPH_SNAPSHOT,
      nodeResults: {
        arrays: {
          correctness: 0.92,
          depth: 0.88,
          tradeoffAwareness: 0.85,
          realWorldApplicability: 0.9,
          composite: 0.89,
          status: "strong",
          questionAsked:
            "Explain the sliding window technique and give an example problem.",
          answerGiven:
            "The sliding window technique maintains a contiguous subarray...",
        },
        "hash-tables": {
          correctness: 0.88,
          depth: 0.82,
          tradeoffAwareness: 0.9,
          realWorldApplicability: 0.85,
          composite: 0.86,
          status: "strong",
          questionAsked: "How does chaining handle hash collisions?",
          answerGiven: "Chaining uses a linked list at each bucket...",
        },
        "dynamic-programming": {
          correctness: 0.78,
          depth: 0.72,
          tradeoffAwareness: 0.68,
          realWorldApplicability: 0.75,
          composite: 0.73,
          status: "partial",
          questionAsked: "Solve the 0/1 knapsack problem using DP.",
          answerGiven: "We create a 2D DP table where dp[i][w] represents...",
        },
      },
      completedAt: new Date("2026-08-10T11:30:00Z"),
      createdAt: new Date("2026-08-10T10:00:00Z"),
    },
  });

  const aaravSdSession = await prisma.assessmentSession.create({
    data: {
      userId: aarav.id,
      domain: "system-design",
      status: "completed",
      currentNodeId: null,
      turnIndex: 9,
      graphSnapshot: SYSTEM_DESIGN_GRAPH_SNAPSHOT,
      nodeResults: {
        "load-balancing": {
          correctness: 0.95,
          depth: 0.88,
          tradeoffAwareness: 0.92,
          realWorldApplicability: 0.9,
          composite: 0.91,
          status: "strong",
          questionAsked:
            "Compare consistent hashing with round-robin for a stateful service.",
          answerGiven:
            "Consistent hashing minimises key remapping when nodes are added...",
        },
        "caching-strategies": {
          correctness: 0.82,
          depth: 0.78,
          tradeoffAwareness: 0.85,
          realWorldApplicability: 0.8,
          composite: 0.81,
          status: "strong",
          questionAsked: "Explain cache-aside vs write-through patterns.",
          answerGiven: "Cache-aside (lazy loading) reads from cache first...",
        },
        microservices: {
          correctness: 0.72,
          depth: 0.65,
          tradeoffAwareness: 0.7,
          realWorldApplicability: 0.68,
          composite: 0.69,
          status: "partial",
          questionAsked:
            "What is the circuit breaker pattern and when do you use it?",
          answerGiven: "The circuit breaker prevents cascading failures...",
        },
      },
      completedAt: new Date("2026-08-15T14:00:00Z"),
      createdAt: new Date("2026-08-15T12:30:00Z"),
    },
  });

  const priyaDsaSession = await prisma.assessmentSession.create({
    data: {
      userId: priya.id,
      domain: "dsa",
      status: "completed",
      currentNodeId: null,
      turnIndex: 6,
      graphSnapshot: DSA_GRAPH_SNAPSHOT,
      nodeResults: {
        arrays: {
          correctness: 0.7,
          depth: 0.62,
          tradeoffAwareness: 0.6,
          realWorldApplicability: 0.65,
          composite: 0.64,
          status: "partial",
          questionAsked:
            "Implement a two-pointer approach for finding pairs summing to K.",
          answerGiven: "We sort the array then use left and right pointers...",
        },
        "hash-tables": {
          correctness: 0.55,
          depth: 0.48,
          tradeoffAwareness: 0.5,
          realWorldApplicability: 0.52,
          composite: 0.51,
          status: "partial",
          questionAsked: "What happens when two keys hash to the same bucket?",
          answerGiven: "A collision occurs and we handle it with chaining...",
        },
        "dynamic-programming": {
          correctness: 0.35,
          depth: 0.3,
          tradeoffAwareness: 0.28,
          realWorldApplicability: 0.32,
          composite: 0.31,
          status: "weak",
          questionAsked: "Explain overlapping subproblems with an example.",
          answerGiven:
            "Dynamic programming breaks problems into smaller parts...",
        },
      },
      completedAt: new Date("2026-08-12T16:00:00Z"),
      createdAt: new Date("2026-08-12T15:00:00Z"),
    },
  });

  console.log(`   ✓ Aarav — DSA session (completed, score ~82)`);
  console.log(`   ✓ Aarav — System Design session (completed, score ~74)`);
  console.log(`   ✓ Priya — DSA session (completed, score ~58)\n`);

  // ── Step 5: Gap Reports ────────────────────────────────────────────────────
  console.log("📊 Creating gap reports...");

  await prisma.gapReport.create({
    data: {
      sessionId: aaravDsaSession.id,
      userId: aarav.id,
      domain: "dsa",
      strongNodes: ["arrays", "hash-tables"],
      partialNodes: ["dynamic-programming"],
      weakNodes: [],
      overallScore: 82.5,
      generatedAt: new Date("2026-08-10T11:35:00Z"),
    },
  });

  await prisma.gapReport.create({
    data: {
      sessionId: aaravSdSession.id,
      userId: aarav.id,
      domain: "system-design",
      strongNodes: ["load-balancing", "caching-strategies"],
      partialNodes: ["microservices"],
      weakNodes: [],
      overallScore: 74.0,
      generatedAt: new Date("2026-08-15T14:05:00Z"),
    },
  });

  await prisma.gapReport.create({
    data: {
      sessionId: priyaDsaSession.id,
      userId: priya.id,
      domain: "dsa",
      strongNodes: [],
      partialNodes: ["arrays", "hash-tables"],
      weakNodes: ["dynamic-programming"],
      overallScore: 57.5,
      generatedAt: new Date("2026-08-12T16:05:00Z"),
    },
  });

  console.log("   ✓ Aarav DSA gap report (strong: arrays, hash-tables)");
  console.log(
    "   ✓ Aarav System Design gap report (strong: load-balancing, caching)",
  );
  console.log("   ✓ Priya DSA gap report (weak: dynamic-programming)\n");

  // ── Step 6: Skill Profiles ─────────────────────────────────────────────────
  console.log("🎯 Creating skill profiles...");

  const aaravProfile = await prisma.skillProfile.create({
    data: {
      userId: aarav.id,
      domainScores: {
        dsa: { score: 82.5, lastUpdated: "2026-08-10T11:35:00Z" },
        "system-design": { score: 74.0, lastUpdated: "2026-08-15T14:05:00Z" },
      },
      badges: {
        dsa: { earned: true, earnedAt: "2026-08-10T11:35:00Z" },
        "system-design": { earned: false, earnedAt: null },
      },
    },
  });

  const priyaProfile = await prisma.skillProfile.create({
    data: {
      userId: priya.id,
      domainScores: {
        dsa: { score: 57.5, lastUpdated: "2026-08-12T16:05:00Z" },
      },
      badges: {
        dsa: { earned: false, earnedAt: null },
      },
    },
  });

  const rohanProfile = await prisma.skillProfile.create({
    data: {
      userId: rohan.id,
      domainScores: {
        "core-cs": { score: 41.0, lastUpdated: "2026-07-20T10:00:00Z" },
      },
      badges: {
        "core-cs": { earned: false, earnedAt: null },
      },
    },
  });

  console.log("   ✓ Aarav profile (DSA: 82.5 🏅, System Design: 74.0)");
  console.log("   ✓ Priya profile (DSA: 57.5)");
  console.log("   ✓ Rohan profile (Core CS: 41.0)\n");

  // ── Step 7: Skill Score History ────────────────────────────────────────────
  console.log("📈 Creating skill score history...");

  // Aarav — 3 checkpoints across two domains
  await prisma.skillScoreHistory.createMany({
    data: [
      {
        profileId: aaravProfile.id,
        domain: "dsa",
        score: 55.0,
        sessionId: "hist-aarav-dsa-1",
        recordedAt: new Date("2026-06-15T10:00:00Z"),
      },
      {
        profileId: aaravProfile.id,
        domain: "dsa",
        score: 70.0,
        sessionId: "hist-aarav-dsa-2",
        recordedAt: new Date("2026-07-20T10:00:00Z"),
      },
      {
        profileId: aaravProfile.id,
        domain: "dsa",
        score: 82.5,
        sessionId: aaravDsaSession.id,
        recordedAt: new Date("2026-08-10T11:35:00Z"),
      },
      {
        profileId: aaravProfile.id,
        domain: "system-design",
        score: 58.0,
        sessionId: "hist-aarav-sd-1",
        recordedAt: new Date("2026-07-25T10:00:00Z"),
      },
      {
        profileId: aaravProfile.id,
        domain: "system-design",
        score: 74.0,
        sessionId: aaravSdSession.id,
        recordedAt: new Date("2026-08-15T14:05:00Z"),
      },
    ],
  });

  // Priya — 3 checkpoints
  await prisma.skillScoreHistory.createMany({
    data: [
      {
        profileId: priyaProfile.id,
        domain: "dsa",
        score: 38.0,
        sessionId: "hist-priya-dsa-1",
        recordedAt: new Date("2026-07-01T10:00:00Z"),
      },
      {
        profileId: priyaProfile.id,
        domain: "dsa",
        score: 49.0,
        sessionId: "hist-priya-dsa-2",
        recordedAt: new Date("2026-07-28T10:00:00Z"),
      },
      {
        profileId: priyaProfile.id,
        domain: "dsa",
        score: 57.5,
        sessionId: priyaDsaSession.id,
        recordedAt: new Date("2026-08-12T16:05:00Z"),
      },
    ],
  });

  // Rohan — 3 checkpoints
  await prisma.skillScoreHistory.createMany({
    data: [
      {
        profileId: rohanProfile.id,
        domain: "core-cs",
        score: 25.0,
        sessionId: "hist-rohan-cs-1",
        recordedAt: new Date("2026-06-10T10:00:00Z"),
      },
      {
        profileId: rohanProfile.id,
        domain: "core-cs",
        score: 33.0,
        sessionId: "hist-rohan-cs-2",
        recordedAt: new Date("2026-07-05T10:00:00Z"),
      },
      {
        profileId: rohanProfile.id,
        domain: "core-cs",
        score: 41.0,
        sessionId: "hist-rohan-cs-3",
        recordedAt: new Date("2026-07-20T10:00:00Z"),
      },
    ],
  });

  console.log("   ✓ Aarav: 5 score checkpoints (DSA ×3, System Design ×2)");
  console.log("   ✓ Priya: 3 score checkpoints (DSA ×3)");
  console.log("   ✓ Rohan: 3 score checkpoints (Core CS ×3)\n");

  // ── Step 8: Opportunities ──────────────────────────────────────────────────
  console.log("💼 Creating opportunity postings...");

  const internship1 = await prisma.opportunity.create({
    data: {
      postedById: vikram.id,
      type: "INTERNSHIP",
      title: "Full Stack Developer Intern",
      description:
        "Join TechCorp Labs as a Full Stack Developer Intern. You will work on our flagship SaaS product, contributing to React frontends and Node.js APIs. Strong DSA fundamentals required. Exposure to system design concepts is a plus.",
      requiredSkills: [
        { skill: "dsa", minThreshold: 60 },
        { skill: "system-design", minThreshold: 45 },
      ],
      eligibilityCriteria: {
        yearOfStudy: [2, 3, 4],
        minCGPA: 6.5,
      },
      location: "Bengaluru (Hybrid)",
      duration: "3 months",
      stipendRange: "₹20,000–₹25,000/month",
      deadline: new Date("2026-10-31T23:59:59Z"),
      isActive: true,
      skillsExtracted: ["dsa", "system-design"],
    },
  });

  const internship2 = await prisma.opportunity.create({
    data: {
      postedById: vikram.id,
      type: "INTERNSHIP",
      title: "AI Research Intern",
      description:
        "TechCorp Labs AI Research division is hiring research interns to work on NLP and computer vision projects. Strong ML fundamentals and hands-on experience with PyTorch or TensorFlow required.",
      requiredSkills: [
        { skill: "ml", minThreshold: 65 },
        { skill: "dsa", minThreshold: 55 },
      ],
      eligibilityCriteria: {
        yearOfStudy: [3, 4],
        minCGPA: 7.5,
      },
      location: "Remote",
      duration: "6 months",
      stipendRange: "₹30,000–₹40,000/month",
      deadline: new Date("2026-11-15T23:59:59Z"),
      isActive: true,
      skillsExtracted: ["ml", "dsa"],
    },
  });

  const job1 = await prisma.opportunity.create({
    data: {
      postedById: vikram.id,
      type: "JOB",
      title: "Junior Backend Engineer",
      description:
        "TechCorp Labs is hiring Junior Backend Engineers for its platform team. You will design and build scalable APIs, work with PostgreSQL and Redis, and participate in system design reviews. Strong DSA and system design knowledge required.",
      requiredSkills: [
        { skill: "dsa", minThreshold: 70 },
        { skill: "system-design", minThreshold: 60 },
        { skill: "core-cs", minThreshold: 55 },
      ],
      eligibilityCriteria: {
        minCGPA: 7.0,
      },
      location: "Bengaluru",
      duration: "Full-time",
      stipendRange: "₹12–18 LPA",
      deadline: new Date("2026-12-31T23:59:59Z"),
      isActive: true,
      skillsExtracted: ["dsa", "system-design", "core-cs"],
    },
  });

  const job2 = await prisma.opportunity.create({
    data: {
      postedById: vikram.id,
      type: "JOB",
      title: "Data Analyst",
      description:
        "Join TechCorp Labs as a Data Analyst. Analyse product metrics, build dashboards, and work with the data science team on predictive models. Proficiency in SQL, Python, and basic ML required.",
      requiredSkills: [
        { skill: "ml", minThreshold: 50 },
        { skill: "core-cs", minThreshold: 45 },
      ],
      eligibilityCriteria: {
        minCGPA: 6.0,
      },
      location: "Hyderabad (On-site)",
      duration: "Full-time",
      stipendRange: "₹8–12 LPA",
      deadline: new Date("2026-12-15T23:59:59Z"),
      isActive: true,
      skillsExtracted: ["ml", "core-cs"],
    },
  });

  const research1 = await prisma.opportunity.create({
    data: {
      postedById: vikram.id,
      type: "RESEARCH_PROJECT",
      title: "Healthcare NLP Research Collaboration",
      description:
        "TechCorp Labs and AIIMS are collaborating on an NLP system for clinical notes parsing. Looking for researchers with strong ML and system design backgrounds to work on transformer-based clinical NLP models.",
      requiredSkills: [
        { skill: "ml", minThreshold: 70 },
        { skill: "system-design", minThreshold: 50 },
      ],
      eligibilityCriteria: {
        yearOfStudy: [4],
        minCGPA: 8.0,
      },
      location: "New Delhi (On-site)",
      duration: "12 months",
      stipendRange: "₹35,000/month + conference funding",
      deadline: new Date("2026-10-01T23:59:59Z"),
      isActive: true,
      skillsExtracted: ["ml", "system-design"],
    },
  });

  const learning1 = await prisma.opportunity.create({
    data: {
      postedById: vikram.id,
      type: "LEARNING_PROGRAM",
      title: "Distributed Systems Masterclass",
      description:
        "A 6-week intensive learning program on distributed systems, covering consensus algorithms, distributed databases, and cloud-native architecture. Taught by TechCorp Labs engineers. Certification provided on completion.",
      requiredSkills: [
        { skill: "system-design", minThreshold: 40 },
        { skill: "core-cs", minThreshold: 40 },
      ],
      eligibilityCriteria: {
        yearOfStudy: [2, 3, 4],
      },
      location: "Online",
      duration: "6 weeks",
      stipendRange: "Free + ₹5,000 completion bonus",
      deadline: new Date("2026-09-30T23:59:59Z"),
      isActive: true,
      skillsExtracted: ["system-design", "core-cs"],
    },
  });

  console.log("   ✓ Full Stack Developer Intern (INTERNSHIP)");
  console.log("   ✓ AI Research Intern (INTERNSHIP)");
  console.log("   ✓ Junior Backend Engineer (JOB)");
  console.log("   ✓ Data Analyst (JOB)");
  console.log("   ✓ Healthcare NLP Research (RESEARCH_PROJECT)");
  console.log("   ✓ Distributed Systems Masterclass (LEARNING_PROGRAM)\n");

  // ── Step 9: Applications ───────────────────────────────────────────────────
  console.log("📬 Creating applications...");

  // Aarav — Applied to Full Stack Intern (match ~78%) and shortlisted for Backend job
  await prisma.application.create({
    data: {
      userId: aarav.id,
      opportunityId: internship1.id,
      status: "APPLIED",
      matchScoreAtApply: 78.2,
      appliedAt: new Date("2026-08-20T10:00:00Z"),
    },
  });

  await prisma.application.create({
    data: {
      userId: aarav.id,
      opportunityId: job1.id,
      status: "SHORTLISTED",
      placementStatus: "SHORTLISTED",
      matchScoreAtApply: 81.5,
      notes:
        "Strong DSA fundamentals. System Design slightly below threshold — schedule technical round.",
      appliedAt: new Date("2026-08-22T10:00:00Z"),
    },
  });

  // Priya — Applied to Distributed Systems Masterclass
  await prisma.application.create({
    data: {
      userId: priya.id,
      opportunityId: learning1.id,
      status: "APPLIED",
      matchScoreAtApply: 52.0,
      appliedAt: new Date("2026-08-25T10:00:00Z"),
    },
  });

  // Rohan — Applied to Distributed Systems Masterclass
  await prisma.application.create({
    data: {
      userId: rohan.id,
      opportunityId: learning1.id,
      status: "APPLIED",
      matchScoreAtApply: 38.0,
      appliedAt: new Date("2026-08-26T10:00:00Z"),
    },
  });

  console.log("   ✓ Aarav → Full Stack Intern (APPLIED, match 78.2%)");
  console.log(
    "   ✓ Aarav → Junior Backend Engineer (SHORTLISTED, match 81.5%)",
  );
  console.log(
    "   ✓ Priya → Distributed Systems Masterclass (APPLIED, match 52.0%)",
  );
  console.log(
    "   ✓ Rohan → Distributed Systems Masterclass (APPLIED, match 38.0%)\n",
  );

  // ── Step 10: Internship Records ────────────────────────────────────────────
  console.log("🏢 Creating internship records...");

  // Active internship — Priya at TechCorp Labs (ongoing)
  await prisma.internshipRecord.create({
    data: {
      studentId: priya.id,
      mentorId: vikram.id,
      companyName: "TechCorp Labs",
      role: "Frontend Developer Intern",
      startDate: new Date("2026-07-01T00:00:00Z"),
      endDate: null,
      isComplete: false,
      progressLogs: [
        {
          week: 1,
          log: "Completed onboarding, set up development environment, and reviewed existing codebase. Started working on the user authentication module.",
          submittedAt: "2026-07-07T18:00:00Z",
        },
        {
          week: 2,
          log: "Implemented login/register forms with React Hook Form and Zod validation. Added error handling and loading states. PR reviewed and merged.",
          submittedAt: "2026-07-14T18:00:00Z",
        },
        {
          week: 3,
          log: "Working on dashboard analytics components using Recharts. Facing challenges with responsive chart sizing — resolved using ResizeObserver pattern.",
          submittedAt: "2026-07-21T18:00:00Z",
        },
      ],
    },
  });

  // Completed internship — Aarav at TechCorp Labs (past)
  await prisma.internshipRecord.create({
    data: {
      studentId: aarav.id,
      mentorId: vikram.id,
      companyName: "TechCorp Labs",
      role: "Backend Engineering Intern",
      startDate: new Date("2026-05-01T00:00:00Z"),
      endDate: new Date("2026-07-31T00:00:00Z"),
      isComplete: true,
      progressLogs: [
        {
          week: 1,
          log: "Set up the microservices scaffold. Implemented the user service with JWT authentication.",
          submittedAt: "2026-05-07T18:00:00Z",
        },
        {
          week: 4,
          log: "Implemented Redis caching layer for the product catalogue. Reduced API latency from 800ms to 120ms on repeated requests.",
          submittedAt: "2026-05-28T18:00:00Z",
        },
        {
          week: 8,
          log: "Completed the notification service using message queues. Added Prometheus metrics instrumentation. All tasks delivered ahead of schedule.",
          submittedAt: "2026-06-25T18:00:00Z",
        },
        {
          week: 13,
          log: "Final presentation delivered to the platform team. Documented all APIs and created a runbook for the services built.",
          submittedAt: "2026-07-31T16:00:00Z",
        },
      ],
      mentorFeedback: {
        rating: 5,
        technicalScore: 5,
        communicationScore: 4,
        comments:
          "Aarav is one of the best interns we have had. His Redis caching implementation saved us significant infrastructure costs. Strong system design intuition for his experience level. Highly recommended for a full-time offer.",
        submittedAt: "2026-07-31T17:00:00Z",
      },
    },
  });

  console.log("   ✓ Priya — Active intern at TechCorp Labs (3 weekly logs)");
  console.log(
    "   ✓ Aarav — Completed intern at TechCorp Labs (4 weekly logs + mentor feedback)\n",
  );

  // ── Summary ────────────────────────────────────────────────────────────────
  const totalUsers = await prisma.user.count();
  const totalSessions = await prisma.assessmentSession.count();
  const totalOpps = await prisma.opportunity.count();
  const totalApps = await prisma.application.count();

  console.log("✅ Seed complete!\n");
  console.log("📋 Database summary:");
  console.log(`   Users:                ${totalUsers}`);
  console.log(`   Assessment sessions:  ${totalSessions}`);
  console.log(`   Opportunities:        ${totalOpps}`);
  console.log(`   Applications:         ${totalApps}`);
  console.log("\n🔑 Demo login credentials:");
  console.log("   Email: student.aarav@skillledger.dev  | Password: Demo@1234");
  console.log("   Email: student.priya@skillledger.dev  | Password: Demo@1234");
  console.log("   Email: student.rohan@skillledger.dev  | Password: Demo@1234");
  console.log("   Email: recruiter.vikram@techcorp.dev  | Password: Demo@1234");
  console.log("   Email: prof.sharma@aims.edu           | Password: Demo@1234");
  console.log("   Email: admin@swan.gov.in              | Password: Demo@1234");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
