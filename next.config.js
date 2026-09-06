/** @type {import('next').NextConfig} */
const requiredEnvVars = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "ANTHROPIC_API_KEY",
];

// Validate required environment variables at build/startup
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma", "bcryptjs"],
  },
  images: {
    domains: ["your-supabase-project.supabase.co"],
  },
  async rewrites() {
    return [
      // Industry Routes
      { source: "/industry/recruiter-dashboard", destination: "/recruiter-dashboard" },
      { source: "/industry/post/internship", destination: "/post/internship" },
      { source: "/industry/post/job", destination: "/post/job" },
      { source: "/industry/my-postings", destination: "/my-postings" },
      { source: "/industry/pipeline/:path*", destination: "/pipeline/:path*" },
      { source: "/industry/pipeline", destination: "/pipeline" },
      { source: "/industry/candidates", destination: "/candidates" },
      { source: "/industry/discover", destination: "/candidates" },
      { source: "/industry/opportunities/new", destination: "/opportunities/new" },
      { source: "/industry/home", destination: "/home" },
      { source: "/industry", destination: "/recruiter-dashboard" },

      // Student Routes
      { source: "/student/dashboard", destination: "/dashboard" },
      { source: "/student/assess/:path*", destination: "/assess/:path*" },
      { source: "/student/assess", destination: "/assess" },
      { source: "/student/portfolio", destination: "/portfolio" },
      { source: "/student/opportunities", destination: "/opportunities" },
      { source: "/student/applications", destination: "/applications" },
      { source: "/student/learning-programs", destination: "/learning-programs" },
      { source: "/student", destination: "/dashboard" },

      // Admin Routes
      { source: "/admin/swan-dashboard", destination: "/swan-dashboard" },
      { source: "/admin/dashboard", destination: "/swan-dashboard" },
      { source: "/admin", destination: "/swan-dashboard" },

      // Acad Routes
      { source: "/acad/opportunity-feed", destination: "/opportunity-feed" },
      { source: "/acad/student-applications", destination: "/student-applications" },
      { source: "/acad/profile", destination: "/profile" },
      { source: "/acad", destination: "/opportunity-feed" },
    ];
  },
};

module.exports = nextConfig;
