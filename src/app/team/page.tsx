"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeamPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "loading") return; // Still loading

		if (status === "unauthenticated") {
			// Not logged in, redirect to login
			router.push("/team/login");
			return;
		}

		if (session?.user?.role === "TEAM") {
			// Team user, redirect to dashboard
			router.push("/team/dashboard");
			return;
		}

		if (session?.user?.role === "ADMIN") {
			// Admin user, redirect to admin dashboard
			router.push("/admin");
			return;
		}

		// Fallback to login if no role found
		router.push("/team/login");
	}, [session, status, router]);

	// Show loading while redirecting
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center space-y-4">
				<div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
				<p className="text-muted-foreground">Redirecting...</p>
			</div>
		</div>
	);
}
