import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";

/**
 * NextAuth v4 configuration — Credentials provider with JWT strategy.
 * Session includes: id, email, name, role (from User model).
 *
 * Module augmentation is declared in types/next-auth.d.ts to add
 * id and role to the default Session/JWT types.
 */
export const nextAuthConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "sih_2026_super_secret_jwt_key",
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Lookup user by lowercase email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            passwordHash: true,
          },
        });

        if (!user) return null;

        const isValid = await verifyPassword(
          credentials.password,
          user.passwordHash,
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, persist role and id into the JWT
      if (user) {
        token.id = user.id;
        token.role = (user as { id: string; role: string }).role;
      }
      return token;
    },

    async session({ session, token }) {
      // Expose id and role on session.user
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
