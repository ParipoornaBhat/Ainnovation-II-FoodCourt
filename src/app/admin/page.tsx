"use client";

import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Calendar,
	Users,
	Utensils,
	ClipboardList,
	RefreshCw,
	ShoppingCart,
} from "lucide-react";
import { useAppData } from "@/contexts/DataContext";
import { useMemo } from "react";
import { startOfDay, endOfDay } from "date-fns";
import Link from "next/link";

export default function AdminDashboard() {
	const { events, teams, foodItems, refreshAll } = useAppData();

	const dashboardStats = useMemo(() => {
		const now = new Date();

		const activeEvents = events.filter(
			(event) =>
				new Date(event.startDate) <= now && new Date(event.endDate) >= now,
		);

		const upcomingEvents = events.filter((event) => {
			const startDate = new Date(event.startDate);
			const sevenDaysFromNow = new Date(
				now.getTime() + 7 * 24 * 60 * 60 * 1000,
			);
			return startDate > now && startDate <= sevenDaysFromNow;
		});

		const activeTeams = teams.length <= 0 ? 0 : teams.length;

		const todayStart = startOfDay(now);
		const todayEnd = endOfDay(now);
		const todaysOrders = teams.reduce((total, team) => {
			return (
				total +
				team.orders.filter((order) => {
					const orderDate = new Date(order.placedAt);
					return orderDate >= todayStart && orderDate <= todayEnd;
				}).length
			);
		}, 0);

		const totalRevenue = teams.reduce((total, team) => {
			return (
				total +
				team.orders.reduce(
					(teamTotal, order) => teamTotal + order.totalAmount,
					0,
				)
			);
		}, 0);

		const lowStockItems = foodItems.filter(
			(item) => item.availableQty !== null && item.availableQty < 10,
		);

		const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
		const recentOrders = teams
			.flatMap((team) =>
				team.orders
					.filter((order) => new Date(order.placedAt) > twentyFourHoursAgo)
					.map((order) => ({ ...order, teamName: team.name })),
			)
			.sort(
				(a, b) =>
					new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
			);

		return {
			activeEvents: activeEvents.length,
			upcomingEvents: upcomingEvents.length,
			totalEvents: events.length,
			activeTeams: activeTeams,
			totalTeams: teams.length,
			totalFoodItems: foodItems.length,
			lowStockCount: lowStockItems.length,
			todaysOrders,
			totalRevenue,
			recentOrders: recentOrders.slice(0, 5),
			lowStockItems: lowStockItems.slice(0, 3),
		};
	}, [events, teams, foodItems]);

	return (
		<AdminLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
						<p className="text-muted-foreground">
							Overview of your food ordering system
						</p>
					</div>
					<Button variant="outline" onClick={refreshAll}>
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh All
					</Button>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<Card className="hover:shadow-md transition-shadow duration-200">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Active Events
							</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{dashboardStats.activeEvents}
							</div>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow duration-200">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Teams</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{dashboardStats.activeTeams}
							</div>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow duration-200">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Food Items</CardTitle>
							<Utensils className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{dashboardStats.totalFoodItems}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Orders
							</CardTitle>
							<ShoppingCart className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{teams.reduce((total, team) => total + team._count.orders, 0)}
							</div>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<Button variant="outline" asChild>
								<Link href="/admin/events/add">
									<Calendar className="h-4 w-4 mr-2" />
									Create Event
								</Link>
							</Button>
							<Button variant="outline" asChild>
								<Link href="/admin/teams">
									<Users className="h-4 w-4 mr-2" />
									Manage Teams
								</Link>
							</Button>
							<Button variant="outline" asChild>
								<Link href="/admin/food">
									<Utensils className="h-4 w-4 mr-2" />
									Manage Food
								</Link>
							</Button>
							<Button variant="outline" asChild>
								<Link href="/admin/orders">
									<ClipboardList className="h-4 w-4 mr-2" />
									View Orders
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
}
