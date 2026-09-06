import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Role → path prefix mapping
const ROLE_ROUTES: Record<string, string> = {
  "/student": "STUDENT",
  "/industry": "INDUSTRY",
  "/admin": "INSTITUTIONAL_ADMIN",
  "/acad": "ACADEMICIAN",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Find which role-protected prefix this path falls under
  const protectedPrefix = Object.keys(ROLE_ROUTES).find((prefix) =>
    pathname.startsWith(prefix),
  );

  // Path is not role-protected — allow through
  if (!protectedPrefix) return NextResponse.next();

  const requiredRole = ROLE_ROUTES[protectedPrefix];

  // Retrieve JWT token (works with next-auth JWT strategy)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not authenticated → redirect to /login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Wrong role → redirect to /login
  if (token.role !== requiredRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (Next.js image optimisation)
     * - favicon.ico
     * - api/auth (NextAuth routes — must be public)
     * - Public root paths (/, /login, /register)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|api/auth|login|register).*)",
  ],
};
