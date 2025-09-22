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
	DollarSign,
	Eye,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function OrderManagement() {
	const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);

	const orders = [
		{
			id: 1,
			teamName: "Development Team Alpha",
			items: [
				{
					name: "Chicken Sandwich",
					quantity: 2,
					price: 12.99,
					previouslyOrdered: 1,
				},
				{
					name: "Caesar Salad",
					quantity: 1,
					price: 9.99,
					previouslyOrdered: 0,
				},
			],
			status: "pending",
			orderTime: "2024-01-15 12:30",
			total: 3,
			totalAmount: 35.97,
			paymentStatus: "pending",
		},
		{
			id: 2,
			teamName: "Marketing Squad",
			items: [
				{
					name: "Vegetarian Pasta",
					quantity: 3,
					price: 14.5,
					previouslyOrdered: 0,
				},
				{
					name: "Quinoa Bowl",
					quantity: 2,
					price: 13.25,
					previouslyOrdered: 1,
				},
			],
			status: "delivered",
			orderTime: "2024-01-15 12:15",
			total: 5,
			totalAmount: 70.0,
			paymentStatus: "paid",
		},
		{
			id: 3,
			teamName: "Design Team",
			items: [
				{ name: "Fish Tacos", quantity: 4, price: 16.75, previouslyOrdered: 0 },
			],
			status: "pending",
			orderTime: "2024-01-15 12:45",
			total: 4,
			totalAmount: 67.0,
			paymentStatus: "pending",
		},
		{
			id: 4,
			teamName: "QA Engineers",
			items: [
				{
					name: "Beef Burger",
					quantity: 2,
					price: 18.99,
					previouslyOrdered: 0,
				},
				{
					name: "Caesar Salad",
					quantity: 2,
					price: 9.99,
					previouslyOrdered: 1,
				},
			],
			status: "cancelled",
			orderTime: "2024-01-15 11:30",
			total: 4,
			totalAmount: 57.96,
			paymentStatus: "refunded",
		},
		{
			id: 5,
			teamName: "Product Management",
			items: [
				{
					name: "Quinoa Bowl",
					quantity: 3,
					price: 13.25,
					previouslyOrdered: 2,
				},
			],
			status: "in-progress",
			orderTime: "2024-01-15 13:00",
			total: 3,
			totalAmount: 39.75,
			paymentStatus: "pending",
		},
	];

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "delivered":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "in-progress":
				return <Clock className="h-4 w-4 text-blue-500" />;
			case "cancelled":
				return <XCircle className="h-4 w-4 text-red-500" />;
			default:
				return <AlertCircle className="h-4 w-4 text-yellow-500" />;
		}
	};

	const getStatusVariant = (status: string) => {
		switch (status) {
			case "delivered":
				return "default";
			case "in-progress":
				return "secondary";
			case "cancelled":
				return "destructive";
			default:
				return "outline";
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
						Pending
					</Badge>
				);
			case "refunded":
				return (
					<Badge variant="outline" className="text-blue-600 border-blue-600">
						Refunded
					</Badge>
				);
			default:
				return <Badge variant="outline">Unknown</Badge>;
		}
	};

	const handlePaymentUpdate = async (
		orderId: number,
		newPaymentStatus: string,
	) => {
		setUpdatingOrder(orderId);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// In real app, would update the order in state/database
		console.log(
			`Updated order ${orderId} payment status to ${newPaymentStatus}`,
		);

		setUpdatingOrder(null);
	};

	const handleOrderStatusUpdate = async (
		orderId: number,
		newStatus: string,
	) => {
		setUpdatingOrder(orderId);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// In real app, would update the order in state/database
		console.log(`Updated order ${orderId} status to ${newStatus}`);

		setUpdatingOrder(null);
	};

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
						<Switch id="override-restrictions" />
						<Label
							htmlFor="override-restrictions"
							className="text-sm font-medium"
						>
							Override Quantity Restrictions
						</Label>
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
							<div className="text-2xl font-bold">89</div>
							<p className="text-xs text-muted-foreground">
								+12% from yesterday
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">In Progress</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">23</div>
							<p className="text-xs text-muted-foreground">Being prepared</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">Delivered</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">61</div>
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
							<div className="text-2xl font-bold">$2,847</div>
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
							<div className="text-2xl font-bold">$142</div>
							<p className="text-xs text-muted-foreground">Awaiting payment</p>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Recent Orders</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Order ID</TableHead>
									<TableHead>Team Name</TableHead>
									<TableHead>Items</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Payment</TableHead>
									<TableHead>Order Time</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{orders.map((order) => (
									<TableRow key={order.id} className="hover:bg-muted/50">
										<TableCell className="font-medium">
											#{order.id.toString().padStart(4, "0")}
										</TableCell>
										<TableCell>{order.teamName}</TableCell>
										<TableCell>
											<Dialog>
												<DialogTrigger asChild>
													<Button variant="ghost" size="sm" className="gap-2">
														<Eye className="h-3 w-3" />
														{order.total} items
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>
															Order Details - #
															{order.id.toString().padStart(4, "0")}
														</DialogTitle>
														<DialogDescription>
															{order.teamName} • {order.orderTime}
														</DialogDescription>
													</DialogHeader>
													<div className="space-y-4">
														{order.items.map((item) => (
															<div
																key={item.name}
																className="flex justify-between items-center p-3 border rounded"
															>
																<div>
																	<h4 className="font-medium">{item.name}</h4>
																	<p className="text-sm text-muted-foreground">
																		Previously ordered: {item.previouslyOrdered}{" "}
																		| Current order: {item.quantity}
																	</p>
																	<p className="text-sm text-muted-foreground">
																		Total ordered:{" "}
																		{item.previouslyOrdered + item.quantity}
																	</p>
																</div>
																<div className="text-right">
																	<p className="font-semibold">
																		${(item.price * item.quantity).toFixed(2)}
																	</p>
																	<p className="text-sm text-muted-foreground">
																		${item.price} each
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
																	${order.totalAmount.toFixed(2)}
																</span>
															</div>
														</div>
													</div>
												</DialogContent>
											</Dialog>
										</TableCell>
										<TableCell className="font-semibold">
											${order.totalAmount.toFixed(2)}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												{getStatusIcon(order.status)}
												<Badge variant={getStatusVariant(order.status)}>
													{order.status.replace("-", " ")}
												</Badge>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												{getPaymentStatusBadge(order.paymentStatus)}
												{order.paymentStatus === "pending" && (
													<Button
														size="sm"
														variant="outline"
														className="gap-1 bg-transparent"
														onClick={() =>
															handlePaymentUpdate(order.id, "paid")
														}
														disabled={updatingOrder === order.id}
													>
														<DollarSign className="h-3 w-3" />
														{updatingOrder === order.id
															? "Updating..."
															: "Mark Paid"}
													</Button>
												)}
												{order.paymentStatus === "paid" &&
													order.status !== "delivered" && (
														<Button
															size="sm"
															variant="outline"
															className="gap-1 bg-green-50 border-green-200"
															onClick={() =>
																handleOrderStatusUpdate(order.id, "delivered")
															}
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
										<TableCell>{order.orderTime}</TableCell>
										<TableCell className="text-right">
											<Select
												defaultValue={order.status}
												onValueChange={(value) =>
													handleOrderStatusUpdate(order.id, value)
												}
												disabled={updatingOrder === order.id}
											>
												<SelectTrigger className="w-32">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="pending">Pending</SelectItem>
													<SelectItem value="in-progress">
														In Progress
													</SelectItem>
													<SelectItem value="delivered">Delivered</SelectItem>
													<SelectItem value="cancelled">Cancelled</SelectItem>
												</SelectContent>
											</Select>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
}
