"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { TeamLoginButton } from "@/components/team-login-button";
export default function HomePage() {
	return (
		<div className="flex flex-col min-h-screen bg-background">
			<main className="flex-grow flex flex-col">
				<section className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
					<h1 className="text-4xl md:text-6xl font-bold text-foreground mb-8 text-balance">
						Food Ordering
					</h1>

					<div className="mt-6">
						<TeamLoginButton />
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="py-6 px-4 border-t">
				<div className="container mx-auto text-center">
					<Link
						href="https://finiteloop.club"
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-muted-foreground flex items-center justify-center gap-1"
					>
						<p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
							Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" />{" "}
							by FLC
						</p>
					</Link>
				</div>
			</footer>
		</div>
	);
}
