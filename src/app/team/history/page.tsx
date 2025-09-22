"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TeamLayout } from "@/components/team-layout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Package } from "lucide-react";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderHistoryPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const teamId = session?.user?.id;

	// Handle authentication redirect
	useEffect(() => {
		if (status === "loading") return; // Still loading

		if (!session || session.user?.role !== "TEAM" || !session.user?.id) {
			router.push("/team/login");
		}
	}, [session, status, router]);

	// Get team's order history
	const { data: orderHistory = [], isLoading: ordersLoading } =
		api.orders.getTeamOrders.useQuery(
			{ teamId: teamId as string },
			{ enabled: !!teamId && session?.user?.role === "TEAM" },
		);

	// Show loading while checking authentication
	if (status === "loading") {
		return (
			<TeamLayout>
				<div className="space-y-6">
					<div className="text-center py-12">
						<div className="max-w-md mx-auto">
							<div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
							<p className="text-muted-foreground">Loading...</p>
						</div>
					</div>
				</div>
			</TeamLayout>
		);
	}

	// Redirect if not authenticated (this will be handled by useEffect)
	if (!session || session.user?.role !== "TEAM" || !session.user?.id) {
		return (
			<TeamLayout>
				<div className="space-y-6">
					<div className="text-center py-12">
						<div className="max-w-md mx-auto">
							<div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
							<p className="text-muted-foreground">Redirecting to login...</p>
						</div>
					</div>
				</div>
			</TeamLayout>
		);
	}

	// Calculate statistics from real data
	const totalOrders = orderHistory.length;

	const currentDate = new Date();
	const currentMonth = currentDate.getMonth();
	const currentYear = currentDate.getFullYear();

	const thisMonthOrders = orderHistory.filter((order) => {
		const orderDate = new Date(order.placedAt);
		return (
			orderDate.getMonth() === currentMonth &&
			orderDate.getFullYear() === currentYear
		);
	});

	const totalSpentThisMonth = thisMonthOrders.reduce(
		(sum, order) =>
			order.paymentStatus === "paid" ? sum + order.totalAmount : sum,
		0,
	);

	const pendingPayments = orderHistory
		.filter((order) => order.paymentStatus === "pending")
		.reduce((sum, order) => sum + order.totalAmount, 0);

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "CONFIRMED":
				return <Clock className="h-4 w-4 text-blue-500" />;
			case "CANCELLED":
				return <XCircle className="h-4 w-4 text-red-500" />;
			case "PENDING":
				return <Package className="h-4 w-4 text-yellow-500" />;
			default:
				return <Package className="h-4 w-4 text-yellow-500" />;
		}
	};

	const getStatusVariant = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return "default" as const;
			case "CONFIRMED":
				return "secondary" as const;
			case "CANCELLED":
				return "destructive" as const;
			case "PENDING":
				return "outline" as const;
			default:
				return "outline" as const;
		}
	};

	const getPaymentStatusBadge = (paymentStatus: string) => {
		switch (paymentStatus) {
			case "paid":
				return <Badge className="bg-green-500">Paid</Badge>;
			case "pending":
				return (
					<Badge
						variant="outline"
						className="text-yellow-600 border-yellow-600"
					>
						Payment Pending
					</Badge>
				);
			default:
				return <Badge variant="outline">Unknown</Badge>;
		}
	};

	if (ordersLoading) {
		return (
			<TeamLayout>
				<div className="space-y-6">
					{/* Header */}
					<div>
						<h1 className="text-3xl font-bold text-foreground">
							Order History
						</h1>
						<p className="text-muted-foreground">
							View your past food orders and their status
						</p>
					</div>

					{/* Loading Stats */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						{[...Array(4)].map((_, i) => (
							<Card
								key={`loading-stat-${
									// biome-ignore lint/suspicious/noArrayIndexKey: <no need>
									i
								}`}
							>
								<CardHeader className="pb-2">
									<Skeleton className="h-4 w-20" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-8 w-16 mb-2" />
									<Skeleton className="h-3 w-24" />
								</CardContent>
							</Card>
						))}
					</div>

					{/* Loading Orders */}
					<div className="space-y-4">
						{[...Array(3)].map((_, i) => (
							<Card
								key={`loading-order-${
									// biome-ignore lint/suspicious/noArrayIndexKey: <no need>
									i
								}`}
							>
								<CardHeader>
									<Skeleton className="h-6 w-48" />
									<Skeleton className="h-4 w-32" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-32 w-full" />
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</TeamLayout>
		);
	}

	return (
		<TeamLayout>
			<div className="space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold text-foreground">Order History</h1>
					<p className="text-muted-foreground">
						View your past food orders and their status
					</p>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">
								Total Orders
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{totalOrders}</div>
							<p className="text-xs text-muted-foreground">All time</p>
						</CardContent>
					</Card>
					{/* <Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">This Month</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{thisMonthOrders.length}</div>
							<p className="text-xs text-muted-foreground">
								{new Date().toLocaleDateString("en-US", {
									month: "long",
									year: "numeric",
								})}
							</p>
						</CardContent>
					</Card> */}
					{/* <Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">Total Spent</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								₹{totalSpentThisMonth.toFixed(2)}
							</div>
							<p className="text-xs text-muted-foreground">This month</p>
						</CardContent>
					</Card> */}
					{/* <Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">
								Pending Payment
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								₹{pendingPayments.toFixed(2)}
							</div>
							<p className="text-xs text-muted-foreground">Awaiting payment</p>
						</CardContent>
					</Card> */}
				</div>

				{/* Order History */}
				{orderHistory.length === 0 ? (
					<Card className="text-center py-12">
						<CardContent>
							<Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<CardTitle className="mb-2">No Orders Yet</CardTitle>
							<CardDescription>
								You haven't placed any orders yet. Start by ordering some food!
							</CardDescription>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{orderHistory.map((order) => (
							<Card
								key={order.id}
								className="hover:shadow-md transition-shadow duration-200"
							>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="text-lg">
												Order #{order.id}
											</CardTitle>
											<CardDescription>{order.event.name}</CardDescription>
										</div>
										<div className="flex items-center gap-2">
											{getStatusIcon(order.orderStatus)}
											<Badge variant={getStatusVariant(order.orderStatus)}>
												{order.orderStatus.charAt(0).toUpperCase() +
													order.orderStatus.slice(1).replace("-", " ")}
											</Badge>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center justify-between text-sm text-muted-foreground">
										<span>
											{new Date(order.placedAt).toLocaleDateString()} at{" "}
											{new Date(order.placedAt).toLocaleTimeString()}
										</span>
										<span>
											{order.items.length} items
											{/* {order.totalAmount.toFixed(2)} */}
										</span>
									</div>

									{/* <div className="flex items-center justify-between">
										<span className="text-sm font-medium">Payment Status:</span>
										{getPaymentStatusBadge(order.paymentStatus)}
									</div> */}

									<div className="space-y-2">
										<h4 className="font-medium">Items Ordered:</h4>
										<div className="grid grid-cols-1 gap-2">
											{order.items.map((item) => (
												<div
													key={item.id}
													className="flex items-center justify-between bg-muted/50 rounded-md p-3"
												>
													<div>
														<span className="text-sm font-medium">
															{item.foodItem.name}
														</span>
														<div className="text-xs text-muted-foreground mt-1">
															<span>Quantity: {item.quantity}</span>
															{/* <span>
																{" • "}
																{item.priceAtOrder === 0 ? (
																	<Badge color="green">Free</Badge>
																) : (
																	<>₹{item.priceAtOrder} each</>
																)}
															</span> */}
														</div>
													</div>
													{/* <div className="text-right">
														<Badge variant="outline" className="text-xs">
															x{item.quantity}
														</Badge>
														<div className="text-sm font-medium mt-1">
															₹{(item.priceAtOrder * item.quantity).toFixed(2)}
														</div>
													</div> */}
												</div>
											))}
										</div>
									</div>

									{/* <div className="border-t pt-3 flex justify-between items-center">
										<span className="font-semibold">Total Amount:</span>
										<span className="text-lg font-bold">
											₹{order.totalAmount.toFixed(2)}
										</span>
									</div> */}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</TeamLayout>
	);
}
