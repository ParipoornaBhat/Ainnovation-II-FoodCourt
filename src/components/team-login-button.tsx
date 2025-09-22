"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function TeamLoginButton() {
	const { data: session } = useSession();
	const router = useRouter();

	const handleClick = () => {
		if (session?.user?.role === "TEAM") {
			// If team is already logged in, redirect to dashboard
			router.push("/team/dashboard");
		} else {
			// Otherwise redirect to login page
			router.push("/team/login");
		}
	};

	return (
		<Button onClick={handleClick} size="lg" className="text-lg px-8 py-6">
			Team Login <ArrowRight className="ml-2 h-5 w-5" />
		</Button>
	);
}
