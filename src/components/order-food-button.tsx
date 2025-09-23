"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function OrderFoodButton() {
	const { data: session } = useSession();
	const router = useRouter();

	const handleClick = () => {
		if (session?.user?.role === "TEAM") {
			router.push("/team/dashboard");
		} else {
			router.push("/team/login");
		}
	};

	return (
		<Button
			onClick={handleClick}
			size="lg"
			className="text-lg px-8 py-6 hover:scale-105 transition-transform duration-200"
		>
			Order Food <ArrowRight className="ml-2 h-5 w-5" />
		</Button>
	);
}
