"use client";

import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Users, Shield, Utensils, Heart, Calendar } from "lucide-react";
import Link from "next/link";
import { TeamLoginButton } from "@/components/team-login-button";
import QuickLinkButton from "@/components/quicklink-button";
export default function HomePage() {
	return (
		<div className="flex flex-col min-h-screen bg-background">
			<main className="flex-grow">
				<QuickLinkButton />

				<section className="relative py-20 px-4 bg-gradient-to-b from-background to-muted/20">
					<div className="container mx-auto text-center">
						<div className="max-w-4xl mx-auto">
							<h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance animate-fade-in">
								Food Ordering
								<span className="text-primary block">Made Simple</span>
							</h1>
							<p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
								Streamline your team's food ordering experience with our modern
								platform
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<TeamLoginButton />
								<Button
									asChild
									variant="outline"
									size="lg"
									className="text-lg px-8 py-6 hover:scale-105 transition-transform duration-200 bg-transparent"
								>
									<Link href="/admin">Admin Dashboard</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section className="py-20 px-4 bg-muted/30">
					<div className="container mx-auto">
						<div className="text-center mb-16">
							<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
								Platform Features
							</h2>
							<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
								Everything you need for efficient food management
							</p>
						</div>

						<div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
							<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
								<CardHeader className="text-center">
									<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
										<Users className="h-6 w-6 text-primary" />
									</div>
									<CardTitle>Team Management</CardTitle>
									<CardDescription>
										Organize teams and manage permissions efficiently
									</CardDescription>
								</CardHeader>
							</Card>

							<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
								<CardHeader className="text-center">
									<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
										<Utensils className="h-6 w-6 text-primary" />
									</div>
									<CardTitle>Food Inventory</CardTitle>
									<CardDescription>
										Manage food items and dietary restrictions with ease
									</CardDescription>
								</CardHeader>
							</Card>

							<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
								<CardHeader className="text-center">
									<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
										<Calendar className="h-6 w-6 text-primary" />
									</div>
									<CardTitle>Event Planning</CardTitle>
									<CardDescription>
										Schedule and coordinate food for events
									</CardDescription>
								</CardHeader>
							</Card>

							<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
								<CardHeader className="text-center">
									<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
										<Shield className="h-6 w-6 text-primary" />
									</div>
									<CardTitle>Admin Control</CardTitle>
									<CardDescription>
										Complete control over system settings and operations
									</CardDescription>
								</CardHeader>
							</Card>
						</div>
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
