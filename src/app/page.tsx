"use client";

import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Users, Shield, Utensils } from "lucide-react";
import Link from "next/link";
import { OrderFoodButton } from "@/components/order-food-button";
import { TeamLoginButton } from "@/components/team-login-button";
import QuickLinkButton from "@/components/quicklink-button";
export default function HomePage() {
	return (
		<div className="min-h-screen bg-background">
			
			<QuickLinkButton />
			{/* Hero Section */}
			<section className="relative py-20 px-4">
				<div className="container mx-auto text-center">
					<div className="max-w-4xl mx-auto">
						<h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance animate-fade-in">
							Corporate Food Ordering
							<span className="text-primary block">Made Simple</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
							Streamline your team's food ordering experience with our modern
							platform. Manage events, teams, and orders all in one place.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<OrderFoodButton />
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
							Everything You Need
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Powerful features designed for corporate food management
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
						<Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
							<CardHeader className="text-center">
								<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
									<Users className="h-6 w-6 text-primary" />
								</div>
								<CardTitle>Team Management</CardTitle>
								<CardDescription>
									Organize teams, manage permissions, and track orders
									efficiently
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
									Manage food items, quantities, and dietary restrictions with
									ease
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
									Complete administrative control over events, orders, and
									system settings
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 px-4">
				<div className="container mx-auto text-center">
					<div className="max-w-2xl mx-auto">
						<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
							Ready to Get Started?
						</h2>
						<p className="text-xl text-muted-foreground mb-8">
							Join teams already using FoodCourt for their corporate food
							ordering needs.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<TeamLoginButton />
							<Button
								asChild
								variant="outline"
								size="lg"
								className="text-lg px-8 py-6 bg-transparent"
							>
								<Link href="/admin/login">Admin Login</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
