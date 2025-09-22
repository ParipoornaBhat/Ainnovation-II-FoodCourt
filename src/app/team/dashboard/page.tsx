"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TeamLayout } from "@/components/team-layout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	CalendarDays,
	Clock,
	Users,
	ShoppingCart,
	AlertCircle,
	History,
	User,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";

export default function TeamDashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [currentTime, setCurrentTime] = useState(new Date());

	// Update time every minute
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 60000);
		return () => clearInterval(timer);
	}, []);

	// Redirect if not authenticated
	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/team/login");
		}
	}, [status, router]);

	// Get team's event data
	const { data: teamEvent, isLoading: eventLoading } =
		api.events.getById.useQuery(
			{ id: session?.user?.eventId || "" },
			{ enabled: !!session?.user?.eventId },
		);

	// Get team's order history
	const { data: orderHistory } = api.teams.getTeamOrderHistory.useQuery(
		{ teamId: session?.user?.id || "" },
		{ enabled: !!session?.user?.id },
	);

	if (status === "loading" || eventLoading) {
		return (
			<TeamLayout>
				<div className="flex items-center justify-center h-64">
					<div className="text-center space-y-4">
						<div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
						<p className="text-muted-foreground">Loading dashboard...</p>
					</div>
				</div>
			</TeamLayout>
		);
	}

	if (!session?.user) {
		return null;
	}

	const hasEvent = !!session.user.eventId && !!teamEvent;
	const eventInProgress =
		hasEvent &&
		teamEvent &&
		new Date(teamEvent.startDate) <= currentTime &&
		new Date(teamEvent.endDate) >= currentTime;

	const eventUpcoming =
		hasEvent && teamEvent && new Date(teamEvent.startDate) > currentTime;

	const eventEnded =
		hasEvent && teamEvent && new Date(teamEvent.endDate) < currentTime;

	const recentOrders = orderHistory?.slice(0, 3) || [];
	const totalOrders = orderHistory?.length || 0;
	const totalSpent =
		orderHistory?.reduce((sum, order) => sum + order.totalAmount, 0) || 0;

	return (
		<TeamLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="space-y-2">
					<h1 className="text-3xl font-bold text-foreground">
						Welcome back, {session.user.teamName}!
					</h1>
					<p className="text-muted-foreground">
						Manage your team orders and track your event participation
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Orders
							</CardTitle>
							<ShoppingCart className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{totalOrders}</div>
							<p className="text-xs text-muted-foreground">
								{hasEvent ? "for this event" : "all time"}
							</p>
						</CardContent>
					</Card>

					{/* <Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Spent</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">₹{totalSpent.toFixed(2)}</div>
							<p className="text-xs text-muted-foreground">
								{hasEvent ? "for this event" : "all time"}
							</p>
						</CardContent>
					</Card> */}

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Team Status</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">Active</div>
							<p className="text-xs text-muted-foreground">
								{hasEvent ? "Registered for event" : "No event assigned"}
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Event Status Card */}
				{!hasEvent && (
					<Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
						<CardHeader>
							<div className="flex items-center gap-3">
								<AlertCircle className="h-6 w-6 text-amber-600" />
								<div>
									<CardTitle className="text-amber-900 dark:text-amber-100">
										No Event Registered
									</CardTitle>
									<CardDescription className="text-amber-700 dark:text-amber-200">
										Your team is not currently registered for any events
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
								Contact your admin to register your team for upcoming food
								events. Once registered, you'll be able to place orders and
								manage your team's food preferences.
							</p>
							<div className="flex gap-2">
								<Button variant="outline" asChild>
									<Link href="/team/profile">View Team Profile</Link>
								</Button>
								<Button variant="outline" asChild>
									<Link href="/team/history">Order History</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{hasEvent && teamEvent && (
					<Card
						className={`border-2 ${
							eventInProgress
								? "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800"
								: eventUpcoming
									? "border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800"
									: "border-gray-200 bg-gray-50 dark:bg-gray-950/20 dark:border-gray-800"
						}`}
					>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<CalendarDays
										className={`h-6 w-6 ${
											eventInProgress
												? "text-green-600"
												: eventUpcoming
													? "text-blue-600"
													: "text-gray-600"
										}`}
									/>
									<div>
										<CardTitle className="text-xl">{teamEvent.name}</CardTitle>
										<CardDescription>{teamEvent.description}</CardDescription>
									</div>
								</div>
								<Badge
									variant={
										eventInProgress
											? "default"
											: eventUpcoming
												? "secondary"
												: "outline"
									}
								>
									{eventInProgress
										? "Active"
										: eventUpcoming
											? "Upcoming"
											: "Ended"}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">
										<strong>Start:</strong>{" "}
										{new Date(teamEvent.startDate).toLocaleString()}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">
										<strong>End:</strong>{" "}
										{new Date(teamEvent.endDate).toLocaleString()}
									</span>
								</div>
							</div>

							{eventInProgress && (
								<div className="flex gap-2">
									<Button
										asChild
										className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200"
									>
										<Link href="/team/order">
											<ShoppingCart className="h-4 w-4 mr-2" />
											Order Food Now
										</Link>
									</Button>
									<Button variant="outline" asChild>
										<Link href="/team/history">View Orders</Link>
									</Button>
								</div>
							)}

							{eventUpcoming && (
								<div className="text-sm text-blue-700 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
									<p className="font-medium">Event starts soon!</p>
									<p>Food ordering will be available once the event begins.</p>
								</div>
							)}

							{eventEnded && (
								<div className="text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-900/30 p-3 rounded-lg">
									<p className="font-medium">Event has ended</p>
									<p>
										Thank you for participating! Check your order history below.
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				)}

				{/* Stats Grid */}

				{/* Recent Orders */}
				{recentOrders.length > 0 && (
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Recent Orders</CardTitle>
									<CardDescription>Your latest food orders</CardDescription>
								</div>
								<Button variant="outline" asChild>
									<Link href="/team/history">
										<History className="h-4 w-4 mr-2" />
										View All
									</Link>
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recentOrders.map((order) => (
									<div
										key={order.id}
										className="flex items-center justify-between p-3 border rounded-lg"
									>
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">Order #{order.id}</span>
												<Badge
													variant={
														order.orderStatus === "COMPLETED"
															? "default"
															: order.orderStatus === "CONFIRMED"
																? "secondary"
																: order.orderStatus === "CANCELLED"
																	? "destructive"
																	: "outline"
													}
												>
													{order.orderStatus}
												</Badge>
											</div>
											<div className="text-sm text-muted-foreground">
												{order.items?.length || 0} items •{" "}
												{new Date(order.placedAt).toLocaleDateString()}
											</div>
										</div>
										{/* <div className="text-right">
											<div className="font-medium">
												₹{order.totalAmount.toFixed(2)}
											</div>
											<div className="text-sm text-muted-foreground">
												{order.paymentStatus === "paid" ? "Paid" : "Pending"}
											</div>
										</div> */}
										<div className="text-right"></div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Quick Actions */}
				{/* <Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>Common tasks for your team</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<Button variant="outline" asChild className="h-auto p-4">
								<Link
									href="/team/history"
									className="flex flex-col items-center gap-2"
								>
									<History className="h-6 w-6" />
									<span>Order History</span>
								</Link>
							</Button>

							{eventInProgress && (
								<Button
									asChild
									className="h-auto p-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200"
								>
									<Link
										href="/team/order"
										className="flex flex-col items-center gap-2"
									>
										<ShoppingCart className="h-6 w-6" />
										<span>Order Food</span>
									</Link>
								</Button>
							)}

							<Button variant="outline" asChild className="h-auto p-4">
								<Link
									href="/team/login"
									className="flex flex-col items-center gap-2"
								>
									<AlertCircle className="h-6 w-6" />
									<span>Support</span>
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card> */}
			</div>
		</TeamLayout>
	);
}
