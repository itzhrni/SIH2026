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
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
    serverComponentsExternalPackages: ["@prisma/client", "prisma", "bcryptjs"],
  },
  images: {
    domains: ["your-supabase-project.supabase.co"],
  },
};

module.exports = nextConfig;
