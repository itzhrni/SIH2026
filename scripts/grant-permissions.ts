import { prisma } from "../lib/db";

async function grant() {
  await prisma.$executeRawUnsafe("GRANT USAGE, CREATE ON SCHEMA public TO anon, authenticated, service_role, postgres;");
  await prisma.$executeRawUnsafe("GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role, postgres;");
  await prisma.$executeRawUnsafe("GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role, postgres;");
  await prisma.$executeRawUnsafe("GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role, postgres;");
  await prisma.$executeRawUnsafe("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role, postgres;");
  console.log("✅ Supabase PostgREST permissions granted successfully!");
  process.exit(0);
}

grant().catch((err) => {
  console.error("Grant error:", err);
  process.exit(1);
});
