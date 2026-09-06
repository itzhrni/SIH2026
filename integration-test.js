/**
 * Integration Test Script
 * Tests all M3-M6 endpoints against running dev server
 */

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";
let passed = 0;
let failed = 0;
const results = [];

function log(test, status, details) {
  const result = { test, status, details };
  results.push(result);
  console.log(`[${status}] ${test} - ${details}`);
  if (status === "PASS") passed++;
  else failed++;
}

async function testRegister() {
  console.log("\n=== TESTING: Registration ===");
  try {
    const userPayload = {
      name: "Integration Test User",
      email: `inttest_${Date.now()}@example.com`,
      password: "Demo@1234",
      role: "STUDENT",
    };
    const res = await fetch(`${BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userPayload),
    });
    const data = await res.json();
    if (data.success && data.data.id) {
      log("Register", "PASS", `Created user ${data.data.id} (${userPayload.email})`);
      return { ...data.data, email: userPayload.email, password: userPayload.password };
    } else {
      log("Register", "FAIL", JSON.stringify(data));
      return null;
    }
  } catch (err) {
    log("Register", "FAIL", err.message);
    return null;
  }
}

async function testLogin(session) {
  console.log(`\n=== TESTING: Login (${session.email}) ===`);
  try {
    // 1. Fetch CSRF token
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const { csrfToken } = await csrfRes.json();
    const rawCsrfCookie = csrfRes.headers.get("set-cookie") || "";
    const csrfCookie = rawCsrfCookie.split(";")[0];

    // 2. Submit credentials to NextAuth callback
    const res = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: csrfCookie,
      },
      body: new URLSearchParams({
        csrfToken,
        email: session.email,
        password: session.password || "Demo@1234",
        json: "true",
      }),
    });

    const setCookie = res.headers.get("set-cookie") || "";
    const tokenMatch = setCookie.match(/next-auth\.session-token=([^;]+)/);
    if (tokenMatch) {
      const cookie = `next-auth.session-token=${tokenMatch[1]}`;
      log("Login", "PASS", `Session authenticated for ${session.email}`);
      return { ...session, cookie };
    } else {
      log("Login", "FAIL", `No session token returned in set-cookie (status ${res.status})`);
      return null;
    }
  } catch (err) {
    log("Login", "FAIL", err.message);
    return null;
  }
}

async function testUserProfile(session) {
  console.log("\n=== TESTING: User Profile ===");
  try {
    const res = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { Cookie: session.cookie },
    });
    const data = await res.json();
    if (data.success && data.data.email === session.email) {
      log("User Profile", "PASS", `Retrieved profile for ${data.data.name}`);
      return true;
    } else {
      log("User Profile", "FAIL", JSON.stringify(data));
      return false;
    }
  } catch (err) {
    log("User Profile", "FAIL", err.message);
    return false;
  }
}

async function testOpportunitiesFeed(session) {
  console.log("\n=== TESTING: Opportunities Feed ===");
  try {
    const res = await fetch(`${BASE_URL}/api/opportunities`, {
      headers: { Cookie: session.cookie },
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      log(
        "Opportunities Feed",
        "PASS",
        `Loaded ${data.data.length} opportunities`,
      );
      return data.data;
    } else {
      log("Opportunities Feed", "FAIL", JSON.stringify(data));
      return [];
    }
  } catch (err) {
    log("Opportunities Feed", "FAIL", err.message);
    return [];
  }
}

async function testAssessmentStart(session) {
  console.log("\n=== TESTING: Assessment Start ===");
  try {
    const res = await fetch(`${BASE_URL}/api/assess/start`, {
      method: "POST",
      headers: {
        Cookie: session.cookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domain: "dsa" }),
    });
    const data = await res.json();
    if (data.success && data.data.sessionId) {
      log("Assessment Start", "PASS", `Session ${data.data.sessionId} created with question: "${data.data.question.slice(0, 50)}..."`);
      return data.data;
    } else {
      log("Assessment Start", "FAIL", JSON.stringify(data));
      return null;
    }
  } catch (err) {
    log("Assessment Start", "FAIL", err.message);
    return null;
  }
}

async function testAssessmentRespond(session, startResult) {
  console.log("\n=== TESTING: Assessment Respond ===");
  try {
    const res = await fetch(`${BASE_URL}/api/assess/respond`, {
      method: "POST",
      headers: {
        Cookie: session.cookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: startResult.sessionId,
        conceptNodeId: startResult.conceptNodeId,
        question: startResult.question,
        turnIndex: startResult.turnIndex,
        answer: "Arrays store elements contiguously in memory allowing O(1) random access, but resizing requires O(n) reallocation.",
      }),
    });
    const data = await res.json();
    if (data.success) {
      log(
        "Assessment Respond",
        "PASS",
        `Response evaluated, turn: ${data.data.turnIndex}, isComplete: ${data.data.isComplete}`,
      );
      return data.data;
    } else {
      log("Assessment Respond", "FAIL", JSON.stringify(data));
      return null;
    }
  } catch (err) {
    log("Assessment Respond", "FAIL", err.message);
    return null;
  }
}

async function testApplications(session) {
  console.log("\n=== TESTING: Applications ===");
  try {
    const res = await fetch(`${BASE_URL}/api/applications`, {
      headers: { Cookie: session.cookie },
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      log("Applications", "PASS", `Loaded ${data.data.length} applications`);
      return data.data;
    } else {
      log("Applications", "FAIL", JSON.stringify(data));
      return [];
    }
  } catch (err) {
    log("Applications", "FAIL", err.message);
    return [];
  }
}

async function testCandidateDiscovery() {
  console.log("\n=== TESTING: Candidate Discovery ===");
  try {
    // Log in as industry recruiter
    const recruiterSession = await testLogin({
      email: "recruiter.vikram@techcorp.dev",
      password: "Demo@1234",
    });

    if (!recruiterSession) {
      log("Candidate Discovery", "FAIL", "Could not authenticate recruiter");
      return [];
    }

    const res = await fetch(`${BASE_URL}/api/candidates?skills=dsa`, {
      headers: { Cookie: recruiterSession.cookie },
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      log(
        "Candidate Discovery",
        "PASS",
        `Found ${data.data.length} candidates for recruiter`,
      );
      return data.data;
    } else {
      log("Candidate Discovery", "FAIL", JSON.stringify(data));
      return [];
    }
  } catch (err) {
    log("Candidate Discovery", "FAIL", err.message);
    return [];
  }
}

async function testLearningPrograms(session) {
  console.log("\n=== TESTING: Learning Programs ===");
  try {
    const res = await fetch(`${BASE_URL}/api/learning-programs`, {
      headers: { Cookie: session.cookie },
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      log("Learning Programs", "PASS", `Loaded ${data.data.length} programs`);
      return data.data;
    } else {
      log("Learning Programs", "FAIL", JSON.stringify(data));
      return [];
    }
  } catch (err) {
    log("Learning Programs", "FAIL", err.message);
    return [];
  }
}

async function testInternshipTracker() {
  console.log("\n=== TESTING: Internship Tracker ===");
  try {
    // Log in as Priya (who has seeded internship records)
    const priyaSession = await testLogin({
      email: "student.priya@skillledger.dev",
      password: "Demo@1234",
    });

    if (!priyaSession) {
      log("Internship Tracker", "FAIL", "Could not authenticate Priya");
      return false;
    }

    const res = await fetch(`${BASE_URL}/api/internships`, {
      headers: { Cookie: priyaSession.cookie },
    });
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      const internshipId = data.data[0].id;
      const trackerRes = await fetch(
        `${BASE_URL}/api/internships/${internshipId}/tracker`,
        {
          headers: { Cookie: priyaSession.cookie },
        },
      );
      const trackerData = await trackerRes.json();
      if (trackerData.success) {
        log(
          "Internship Tracker",
          "PASS",
          `Loaded tracker for ${trackerData.data.companyName}`,
        );
        return true;
      } else {
        log("Internship Tracker", "FAIL", JSON.stringify(trackerData));
        return false;
      }
    } else {
      log("Internship Tracker", "SKIP", "No internships found");
      return null;
    }
  } catch (err) {
    log("Internship Tracker", "FAIL", err.message);
    return false;
  }
}

async function testAdminAnalytics() {
  console.log("\n=== TESTING: Admin Analytics ===");
  const adminSession = await testLogin({
    email: "admin@swan.gov.in",
    password: "Demo@1234",
  });

  if (!adminSession) {
    log("Admin Analytics", "FAIL", "Could not login as admin");
    return;
  }

  try {
    // Test cohort analytics
    const cohortRes = await fetch(`${BASE_URL}/api/analytics/cohort`, {
      headers: { Cookie: adminSession.cookie },
    });
    const cohortData = await cohortRes.json();
    if (cohortData.success) {
      log(
        "Cohort Analytics",
        "PASS",
        `Loaded ${cohortData.data.length} data points`,
      );
    } else {
      log("Cohort Analytics", "FAIL", JSON.stringify(cohortData));
    }

    // Test demand analytics
    const demandRes = await fetch(`${BASE_URL}/api/analytics/demand`, {
      headers: { Cookie: adminSession.cookie },
    });
    const demandData = await demandRes.json();
    if (demandData.success) {
      log(
        "Demand Analytics",
        "PASS",
        `Loaded ${demandData.data.length} skill gaps`,
      );
    } else {
      log("Demand Analytics", "FAIL", JSON.stringify(demandData));
    }

    // Test placement analytics
    const placementRes = await fetch(`${BASE_URL}/api/analytics/placement`, {
      headers: { Cookie: adminSession.cookie },
    });
    const placementData = await placementRes.json();
    if (placementData.success) {
      log(
        "Placement Analytics",
        "PASS",
        `Total applications: ${placementData.data.totalApplications}`,
      );
    } else {
      log("Placement Analytics", "FAIL", JSON.stringify(placementData));
    }
  } catch (err) {
    log("Admin Analytics", "FAIL", err.message);
  }
}

async function runAllTests() {
  console.log("🚀 Starting Integration Tests...\n");

  // Step 1: Register and login a test user
  const session = await testRegister();
  if (!session) {
    console.log("\n❌ Registration failed. Aborting tests.");
    return;
  }

  const loggedSession = await testLogin(session);
  if (!loggedSession) {
    console.log("\n❌ Login failed. Aborting tests.");
    return;
  }

  // Step 2: Test core features
  await testUserProfile(loggedSession);
  await testOpportunitiesFeed(loggedSession);
  await testApplications(loggedSession);

  // Step 3: Test assessment flow
  const assessmentSession = await testAssessmentStart(loggedSession);
  if (assessmentSession) {
    await testAssessmentRespond(loggedSession, assessmentSession);
  }

  // Step 4: Test candidate discovery & learning programs
  await testCandidateDiscovery();
  await testLearningPrograms(loggedSession);

  // Step 5: Test admin features
  await testAdminAnalytics();

  // Step 6: Test internship tracker
  await testInternshipTracker();

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("TEST SUMMARY");
  console.log("=".repeat(50));
  console.log(`Total: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log("=".repeat(50));

  if (failed > 0) {
    console.log("\nFailed tests:");
    results
      .filter((r) => r.status === "FAIL")
      .forEach((r) => {
        console.log(`  - ${r.test}: ${r.details}`);
      });
  }

  // Write results to file
  require("fs").writeFileSync(
    "integration-test-results.json",
    JSON.stringify(results, null, 2),
  );
  console.log("\n📄 Results written to integration-test-results.json");
}

runAllTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
