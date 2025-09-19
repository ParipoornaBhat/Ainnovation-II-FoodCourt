import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { adminAccounts } from "@/lib/admin"; // ✅ import admin metadata
import { db } from "@/server/db";
import { compare } from "bcryptjs";
// --- Type augmentation ---
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      teamName: string;
      role: string;
      permissions: string[];
      email?: string | null;
      emailVerified?: Date | null;
    };
  }

  interface User {
    id?: string;
    teamName: string;
    role: string;
    permissions: string[];
    email?: string | null;
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    // ✅ Team login (teamName only)
   CredentialsProvider({
  id: "team-login",
  name: "Team Login",
  credentials: {
    teamName: { label: "Team Name", type: "text" },
  },
  async authorize(credentials) {
    const teamName =
      typeof credentials?.teamName === "string"
        ? credentials.teamName.trim()
        : "";

    if (!teamName) return null;

    // ✅ Check in DB if this team exists
    const team = await db.team.findFirst({
      where: {
        name: teamName,
      },
    });

    if (!team) return null;

    return {
      id: team.id,
      teamName: team.name,
      role: "TEAM",
      permissions: [], // add if needed
    };
  },
}),

    // ✅ Admin login (userId + password + specific permissions)
 CredentialsProvider({
  id: "team-login",
  name: "Team Login",
  credentials: {
    teamName: { label: "Team Name", type: "text" },
  },
  async authorize(credentials) {
    const teamName =
      typeof credentials?.teamName === "string"
        ? credentials.teamName.trim()
        : "";

    if (!teamName) return null;

    // ✅ Check in DB if this team exists
    const team = await db.team.findFirst({
      where: {
        name: teamName,
      },
    });

    if (!team) return null;

    return {
      id: team.id,
      teamName: team.name,
      role: "TEAM",
      permissions: [], // add if needed
    };
  },
}),

    // ✅ Admin login (userId + password + specific permissions)
 CredentialsProvider({
  id: "admin-login",
  name: "Admin Login",
  credentials: {
    identifier: { label: "Email or Username", type: "text" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const identifier =
      typeof credentials?.identifier === "string"
        ? credentials.identifier.trim()
        : "";
    const password =
      typeof credentials?.password === "string" ? credentials.password : "";
    console.log({ identifier, password });
    if (!identifier || !password) return null;

    // ✅ Check in DB if an admin exists by email OR username
    const admin = await db.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { name: identifier } // Assuming username is stored in `name`
        ],
      },
    });

    if (!admin) return null;

    // ✅ Compare hashed password
    const isValid = await compare(password, admin.password || "");
    if (!isValid) return null;

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: "ADMIN",
      teamName: "", // Admins may not have a teamName
      permissions: [], // Add permissions if needed
    };
  },
}),

  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.teamName = user.teamName;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        teamName: token.teamName as string,
        role: token.role as string,
        permissions: token.permissions as string[],
        email: (token.email as string) ?? "",
        emailVerified: token.emailVerified ? new Date(token.emailVerified as string) : null,
      };
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/",
      },
    },
  },

  trustHost: true,
};
