import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const SECRET = process.env.NEXTAUTH_SECRET || "sih_2026_super_secret_jwt_key";

// Role → path prefix mapping
const ROLE_ROUTES: Record<string, string> = {
  "/student": "STUDENT",
  "/dashboard": "STUDENT",
  "/assess": "STUDENT",
  "/portfolio": "STUDENT",
  "/opportunities": "STUDENT",
  "/applications": "STUDENT",
  "/learning-programs": "STUDENT",
  "/industry": "INDUSTRY",
  "/recruiter-dashboard": "INDUSTRY",
  "/pipeline": "INDUSTRY",
  "/candidates": "INDUSTRY",
  "/my-postings": "INDUSTRY",
  "/post": "INDUSTRY",
  "/admin": "INSTITUTIONAL_ADMIN",
  "/swan-dashboard": "INSTITUTIONAL_ADMIN",
  "/acad": "ACADEMICIAN",
  "/opportunity-feed": "ACADEMICIAN",
  "/student-applications": "ACADEMICIAN",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Find which role-protected prefix this path falls under
  const protectedPrefix = Object.keys(ROLE_ROUTES).find(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );

  // Path is not role-protected — allow through
  if (!protectedPrefix) return NextResponse.next();

  const requiredRole = ROLE_ROUTES[protectedPrefix];

  // Retrieve JWT token (works with next-auth JWT strategy across all environments)
  const token =
    (await getToken({
      req: request,
      secret: SECRET,
      cookieName: "next-auth.session-token",
    })) ||
    (await getToken({
      req: request,
      secret: SECRET,
    }));

  // Not authenticated → redirect to /login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Wrong role → redirect to /login
  if (token.role !== requiredRole) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/auth|login|register|$).*)",
  ],
};
