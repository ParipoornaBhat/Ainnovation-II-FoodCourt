"use client";

import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
	Eye,
	ChevronDown,
	ChevronRight,
	Utensils,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusType } from "@prisma/client";

export default function OrderManagement() {
	const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);
	const [expandedOrders, setExpandedOrders] = useState<number[]>([]);
	const { toast } = useToast();

	const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

	// Add a function to toggle expanded state of order rows
	const toggleOrderExpand = (orderId: number) => {
		setExpandedOrders((current) =>
			current.includes(orderId)
				? current.filter((id) => id !== orderId)
				: [...current, orderId],
		);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <its fine>
	useEffect(() => {
		const id = setInterval(() => {
			refetchOrders();
		}, 60000);

		setIntervalId(id);

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, []);
	// Get all orders
	const {
		data: allOrders = [],
		isLoading: ordersLoading,
		refetch: refetchOrders,
	} = api.orders.getAllOrders.useQuery();

	// Update order status mutation
	const updateOrderStatusMutation = api.orders.updateOrderStatus.useMutation({
		onSuccess: () => {
			toast({
				title: "Order updated",
				description: "Order status has been updated successfully.",
			});
			refetchOrders();
		},
		onError: (error) => {
			toast({
				title: "Failed to update order",
				description: error.message,
				variant: "destructive",
			});
		},
		onSettled: () => {
			setUpdatingOrder(null);
		},
	});

	// Calculate statistics
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const todayOrders = allOrders.filter((order) => {
		const orderDate = new Date(order.placedAt);
		orderDate.setHours(0, 0, 0, 0);
		return orderDate.getTime() === today.getTime();
	});

	const inProgressOrders = allOrders.filter(
		(order) =>
			order.orderStatus === OrderStatusType.CONFIRMED ||
			order.orderStatus === OrderStatusType.PENDING,
	);

	const deliveredTodayOrders = todayOrders.filter(
		(order) => order.orderStatus === OrderStatusType.COMPLETED,
	);

	const todayRevenue = todayOrders.reduce(
		(sum, order) =>
			order.paymentStatus === "paid" ? sum + order.totalAmount : sum,
		0,
	);

	const pendingPayments = allOrders
		.filter((order) => order.paymentStatus === "PENDING")
		.reduce((sum, order) => sum + order.totalAmount, 0);

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "CONFIRMED":
			case "PENDING":
				return <Clock className="h-4 w-4 text-blue-500" />;
			case "CANCELLED":
				return <XCircle className="h-4 w-4 text-red-500" />;
			default:
				return <AlertCircle className="h-4 w-4 text-yellow-500" />;
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
			default:
				return "outline" as const;
		}
	};

	const getPaymentStatusBadge = (
		paymentStatus: string,
		totalAmount: number,
	) => {
		if (totalAmount === 0) {
			return <Badge className="bg-green-500">Free</Badge>;
		}
		switch (paymentStatus) {
			case "paid":
				return <Badge className="bg-green-500">Paid</Badge>;
			case "pending":
				return (
					<Badge
						variant="outline"
						className="text-yellow-600 border-yellow-600"
					>
						Pending
					</Badge>
				);
			default:
				return <Badge variant="outline">Unknown</Badge>;
		}
	};

	const handlePaymentUpdate = async (orderId: number) => {
		setUpdatingOrder(orderId);
		const order = allOrders.find((o) => o.id === orderId);
		updateOrderStatusMutation.mutate({
			orderId,
			orderStatus:
				(order?.orderStatus as
					| "PENDING"
					| "CONFIRMED"
					| "COMPLETED"
					| "CANCELLED") || "PENDING",
			paymentStatus: "paid",
		});
	};

	const handleOrderStatusUpdate = async (
		orderId: number,
		newStatus: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
	) => {
		setUpdatingOrder(orderId);
		updateOrderStatusMutation.mutate({
			orderId,
			orderStatus: newStatus,
		});
	};

	if (ordersLoading) {
		return (
			<AdminLayout>
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-foreground">
								Order Management
							</h1>
							<p className="text-muted-foreground">
								Track and manage all food orders
							</p>
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
						{[...Array(5)].map((_, i) => (
							<Card
								key={`loading-card-${
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
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{[...Array(5)].map((_, i) => (
									<Skeleton
										key={`loading-row-${
											// biome-ignore lint/suspicious/noArrayIndexKey: <no need>
											i
										}`}
										className="h-16 w-full"
									/>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-foreground">
							Order Management
						</h1>
						<p className="text-muted-foreground">
							Track and manage all food orders
						</p>
					</div>
					<div className="flex items-center space-x-2">
						{/* <Switch id="override-restrictions" />
						<Label
							htmlFor="override-restrictions"
							className="text-sm font-medium"
						>
							Override Quantity Restrictions
						</Label> */}
						<Button
							variant="outline"
							size="sm"
							className="bg-transparent"
							onClick={() => refetchOrders()}
							disabled={ordersLoading}
						>
							{ordersLoading ? "Refreshing..." : "Refresh Data"}
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">
								Today's Orders
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{todayOrders.length}</div>
							<p className="text-xs text-muted-foreground">
								Orders placed today
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">In Progress</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{inProgressOrders.length}
							</div>
							<p className="text-xs text-muted-foreground">Being prepared</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">Completed</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{deliveredTodayOrders.length}
							</div>
							<p className="text-xs text-muted-foreground">Completed today</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">
								Total Revenue
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{todayRevenue.toFixed(2)}rs
							</div>
							<p className="text-xs text-muted-foreground">Today's earnings</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">
								Pending Payments
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{pendingPayments.toFixed(2)}rs
							</div>
							<p className="text-xs text-muted-foreground">Awaiting payment</p>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Recent Orders</CardTitle>
					</CardHeader>
					<CardContent>
						{allOrders.length === 0 ? (
							<div className="text-center py-8">
								<p className="text-muted-foreground">No orders found.</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Order ID</TableHead>
										<TableHead>Team Name</TableHead>
										<TableHead>Team ID</TableHead>

										<TableHead>Event</TableHead>

										<TableHead>Items</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Payment</TableHead>
										<TableHead>Order Time</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{allOrders.map((order) => (
										<React.Fragment key={order.id}>
											<TableRow
												className={`hover:bg-muted/50 cursor-pointer ${expandedOrders.includes(order.id) ? "bg-muted/30" : ""}`}
												onClick={() => toggleOrderExpand(order.id)}
											>
												<TableCell className="font-medium">
													<div className="flex items-center gap-1">
														{expandedOrders.includes(order.id) ? (
															<ChevronDown className="h-4 w-4 text-muted-foreground" />
														) : (
															<ChevronRight className="h-4 w-4 text-muted-foreground" />
														)}
														#{order.id}
													</div>
												</TableCell>
												<TableCell>{order.team.name}</TableCell>
												<TableCell>
													<Badge>{order.team.teamId}</Badge>
												</TableCell>
												<TableCell className="max-w-32 truncate">
													{order.event.name}
												</TableCell>
												<TableCell>
													<Dialog>
														<DialogTrigger asChild>
															<Button
																variant="ghost"
																size="sm"
																className="gap-2"
																onClick={(e) => e.stopPropagation()} // Prevent row click
															>
																<Eye className="h-3 w-3" />
																{order.items.length} items
															</Button>
														</DialogTrigger>
														<DialogContent className="max-w-2xl">
															<DialogHeader>
																<DialogTitle>
																	Order Details - #{order.id}
																</DialogTitle>
																<DialogDescription>
																	{order.team.name} •{" "}
																	{new Date(order.placedAt).toLocaleString()}
																</DialogDescription>
															</DialogHeader>
															<div className="space-y-4">
																{order.items.map((item) => (
																	<div
																		key={item.id}
																		className="flex justify-between items-center p-3 border rounded"
																	>
																		<div>
																			<h4 className="font-medium">
																				{item.foodItem.name}
																			</h4>
																			<p className="text-sm text-muted-foreground">
																				Quantity: {item.quantity}
																			</p>
																			<p className="text-sm text-muted-foreground">
																				{item.priceAtOrder === 0
																					? "Free"
																					: `${item.priceAtOrder}rs each`}
																			</p>
																		</div>
																		<div className="text-right">
																			<p className="font-semibold">
																				{item.priceAtOrder * item.quantity === 0
																					? "Free"
																					: `${(item.priceAtOrder * item.quantity).toFixed(2)}rs`}
																			</p>
																		</div>
																	</div>
																))}
																<div className="border-t pt-4">
																	<div className="flex justify-between items-center">
																		<span className="font-semibold">
																			Total Amount:
																		</span>
																		<span className="text-xl font-bold">
																			{order.totalAmount === 0
																				? "Free"
																				: `${order.totalAmount.toFixed(2)}rs`}
																		</span>
																	</div>
																</div>
															</div>
														</DialogContent>
													</Dialog>
												</TableCell>
												<TableCell className="font-semibold">
													{order.totalAmount === 0
														? "Free"
														: `${order.totalAmount.toFixed(2)}rs`}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														{getStatusIcon(order.orderStatus)}
														<Badge
															variant={getStatusVariant(order.orderStatus)}
														>
															{order.orderStatus.replace("-", " ")}
														</Badge>
													</div>
												</TableCell>
												<TableCell onClick={(e) => e.stopPropagation()}>
													<div className="flex items-center gap-2">
														{getPaymentStatusBadge(
															order.paymentStatus,
															order.totalAmount,
														)}
														{order.paymentStatus === "pending" &&
															order.totalAmount !== 0 && (
																<Button
																	size="sm"
																	variant="outline"
																	className="gap-1 bg-transparent"
																	onClick={(e) => {
																		e.stopPropagation();
																		handlePaymentUpdate(order.id);
																	}}
																	disabled={updatingOrder === order.id}
																>
																	{updatingOrder === order.id
																		? "Updating..."
																		: "Mark Paid"}
																</Button>
															)}
														{order.paymentStatus === "paid" &&
															order.orderStatus !== "COMPLETED" && (
																<Button
																	size="sm"
																	variant="outline"
																	className="gap-1 bg-green-50 border-green-200"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleOrderStatusUpdate(
																			order.id,
																			"COMPLETED",
																		);
																	}}
																	disabled={updatingOrder === order.id}
																>
																	<CheckCircle className="h-3 w-3" />
																	{updatingOrder === order.id
																		? "Updating..."
																		: "Mark Complete"}
																</Button>
															)}
													</div>
												</TableCell>
												<TableCell>
													{new Date(order.placedAt).toLocaleString()}
												</TableCell>
												<TableCell
													className="text-right"
													onClick={(e) => e.stopPropagation()}
												>
													{" "}
													{/* Prevent row click */}
													<Select
														defaultValue={order.orderStatus}
														onValueChange={(value) =>
															handleOrderStatusUpdate(
																order.id,
																value as
																	| "PENDING"
																	| "CONFIRMED"
																	| "COMPLETED"
																	| "CANCELLED",
															)
														}
														disabled={updatingOrder === order.id}
													>
														<SelectTrigger className="w-32">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="PENDING">Pending</SelectItem>
															<SelectItem value="CONFIRMED">
																Confirmed
															</SelectItem>
															<SelectItem value="COMPLETED">
																Completed
															</SelectItem>
															<SelectItem value="CANCELLED">
																Cancelled
															</SelectItem>
														</SelectContent>
													</Select>
												</TableCell>
											</TableRow>

											{expandedOrders.includes(order.id) && (
												<TableRow key={`${order.id}-expanded`}>
													<TableCell colSpan={10} className="p-0 border-t-0">
														<div className="bg-muted/20 p-4 border-t border-dashed">
															<h4 className="font-medium text-sm mb-3">
																Order Items
															</h4>
															<div className="space-y-3">
																{order.items.map((item) => (
																	<div
																		key={item.id}
																		className="flex justify-between items-center p-3 bg-background rounded-md shadow-sm"
																	>
																		<div className="flex items-center gap-3">
																			<div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-full">
																				<Utensils className="h-5 w-5 text-primary" />
																			</div>
																			<div>
																				<h4 className="font-medium">
																					{item.foodItem.name}
																				</h4>
																				<div className="flex gap-3 text-sm text-muted-foreground">
																					<span>Quantity: {item.quantity}</span>
																					<span>
																						{item.priceAtOrder === 0
																							? "Free"
																							: `${item.priceAtOrder}rs each`}
																					</span>
																				</div>
																			</div>
																		</div>
																		<div className="text-right">
																			<p className="font-semibold">
																				{item.priceAtOrder * item.quantity === 0
																					? "Free"
																					: `${(item.priceAtOrder * item.quantity).toFixed(2)}rs`}
																			</p>
																		</div>
																	</div>
																))}

																<div className="flex justify-end pt-3 border-t">
																	<div className="bg-background px-4 py-2 rounded-lg">
																		<div className="flex gap-4 items-center">
																			<span className="text-muted-foreground">
																				Total Amount:
																			</span>
																			<span className="text-lg font-bold">
																				{order.totalAmount === 0
																					? "Free"
																					: `${order.totalAmount.toFixed(2)}rs`}
																			</span>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</TableCell>
												</TableRow>
											)}
										</React.Fragment>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
}
