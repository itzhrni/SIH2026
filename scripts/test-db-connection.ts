import { prisma } from "../lib/db";

async function testConnection() {
  try {
    const result = await prisma.$queryRaw<
      [{ version: string }]
    >`SELECT version()`;
    console.log(`✅ Supabase DB connection successful!`);
    console.log(`   PostgreSQL version: ${result[0].version}`);

    // Verify we can query the users table
    const userCount = await prisma.user.count();
    console.log(`   Users in database: ${userCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Supabase DB connection FAILED!");
    console.error("");
    console.error("Troubleshooting steps:");
    console.error("  1. Verify DATABASE_URL in .env.local is correct");
    console.error(
      "  2. Check that your Supabase project is running (not paused)",
    );
    console.error(
      "  3. Verify your IP is not blocked by Supabase firewall rules",
    );
    console.error(
      "  4. Try pinging the Supabase host: ping aws-0-[region].pooler.supabase.com",
    );
    console.error(
      "  5. Check if the connection string uses the PgBouncer port (6543 for pooler, 5432 for direct)",
    );
    console.error(
      "  6. Verify DATABASE_URL ends with ?pgbouncer=true for runtime queries",
    );
    console.error("");
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

testConnection();
