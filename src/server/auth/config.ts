import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/server/db";
import { compare } from "bcryptjs";
// --- Type augmentation ---
declare module "next-auth" {
	interface Session {
		user: {
			id?: string;
			teamName: string;
			username?: string;
			eventId?: string | null;
			eventName?: string | null;
			role: string;
			permissions: string[];
			email?: string | null;
			emailVerified?: Date | null;
		};
	}

	interface User {
		id?: string;
		teamName: string;
		username?: string;
		eventId?: string | null;
		eventName?: string | null;
		role: string;
		permissions: string[];
		email?: string | null;
	}
}

export const authConfig: NextAuthConfig = {
	providers: [
		// ✅ Team login (username + password)
		CredentialsProvider({
			id: "team-login",
			name: "Team Login",
			credentials: {
				username: { label: "Username", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const username =
					typeof credentials?.username === "string"
						? credentials.username.trim()
						: "";
				const password =
					typeof credentials?.password === "string" ? credentials.password : "";

				if (!username || !password) return null;

				// ✅ Check in DB if this team exists with username
				const team = await db.team.findUnique({
					where: {
						username: username,
					},
					include: {
						event: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				});

				if (!team) return null;

				// ✅ Compare hashed password
				const isValid = await compare(password, team.password);
				if (!isValid) return null;

				return {
					id: team.id,
					teamName: team.name,
					username: team.username,
					eventId: team.eventId,
					eventName: team.event?.name || null,
					role: "TEAM",
					permissions: ["order:create", "order:view"],
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
							{ name: identifier }, // Assuming username is stored in `name`
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
					permissions: ["admin:all"], // Add permissions if needed
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
				token.username = user.username;
				token.eventId = user.eventId;
				token.eventName = user.eventName;
				token.role = user.role;
				token.permissions = user.permissions;
			}
			return token;
		},

		async session({ session, token }) {
			session.user = {
				id: token.id as string,
				teamName: token.teamName as string,
				username: token.username as string,
				eventId: token.eventId as string | null,
				eventName: token.eventName as string | null,
				role: token.role as string,
				permissions: token.permissions as string[],
				email: (token.email as string) ?? "",
				emailVerified: token.emailVerified
					? new Date(token.emailVerified as string)
					: null,
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
