"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
	Plus,
	Minus,
	ShoppingCart,
	AlertTriangle,
	Calendar,
	Clock,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useAppData } from "@/contexts/DataContext";

interface CartItem {
	foodItemId: string;
	quantity: number;
	priceAtOrder: number;
}

interface InventoryItem {
	id: string;
	maxOrderPerTeam: number | null;
	foodItem: {
		id: string;
		name: string;
		description: string | null;
		price: number;
		imageUrl: string | null;
		availableQty: number;
		isActive: boolean;
		restrictions: string[];
	};
}

export default function TeamOrderPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const { toast } = useToast();
	const [cart, setCart] = useState<Record<string, CartItem>>({});
	const [showOrderPreview, setShowOrderPreview] = useState(false);
	const [isCreatingOrder, setIsCreatingOrder] = useState(false);

	// Use DataContext for order management
	const { createOrder } = useAppData();

	const teamId = session?.user?.id;
	const eventId = session?.user?.eventId;

	// Handle authentication redirect
	useEffect(() => {
		if (status === "loading") return; // Still loading

		if (!session || session.user?.role !== "TEAM" || !session.user?.id) {
			router.push("/team/login");
		}
	}, [session, status, router]);

	// Only make queries if we have the required IDs and user is authenticated as team
	const shouldFetchData =
		!!teamId && !!eventId && session?.user?.role === "TEAM";

	// Get event data
	const { data: event } = api.events.getById.useQuery(
		{ id: eventId as string },
		{ enabled: shouldFetchData },
	);

	// Get event food items (inventory)
	const { data: eventFoodItems = [] } = api.events.getEventFoodItems.useQuery(
		{ eventId: eventId as string },
		{ enabled: shouldFetchData },
	);

	// Get team order history for this event to calculate previously ordered quantities
	const { data: teamOrders = [] } = api.orders.getTeamOrders.useQuery(
		{ teamId: teamId as string },
		{ enabled: shouldFetchData },
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

	// Redirect if not authenticated or not a team (this will be handled by useEffect)
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

	// If no event registered
	if (!eventId || !event) {
		return (
			<TeamLayout>
				<div className="space-y-6">
					<div className="text-center py-12">
						<div className="max-w-md mx-auto">
							<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
								<Calendar className="h-8 w-8 text-muted-foreground" />
							</div>
							<h2 className="text-2xl font-bold text-foreground mb-2">
								No Event Registered
							</h2>
							<p className="text-muted-foreground mb-6">
								Your team is not currently registered for any food ordering
								event. Please contact your administrator to join an active
								event.
							</p>
							<Button
								onClick={() => router.push("/team/dashboard")}
								variant="outline"
							>
								Back to Dashboard
							</Button>
						</div>
					</div>
				</div>
			</TeamLayout>
		);
	}

	// Check if event is active
	const now = new Date();
	const eventEnded = now > new Date(event.endDate);
	const eventNotStarted = now < new Date(event.startDate);

	// Calculate previously ordered quantities for each food item
	const getPreviouslyOrdered = (foodItemId: string): number => {
		return teamOrders
			.filter(
				(order) =>
					order.eventId === eventId && order.orderStatus !== "CANCELLED",
			)
			.reduce((total, order) => {
				const item = order.items.find((item) => item.foodItemId === foodItemId);
				return total + (item?.quantity || 0);
			}, 0);
	};

	const addToCart = (inventoryItem: InventoryItem) => {
		const foodItem = inventoryItem.foodItem;
		const currentQuantity = cart[foodItem.id]?.quantity || 0;
		const previouslyOrdered = getPreviouslyOrdered(foodItem.id);
		const maxAllowed = inventoryItem.maxOrderPerTeam || 999;

		if (
			currentQuantity < foodItem.availableQty &&
			previouslyOrdered + currentQuantity < maxAllowed
		) {
			setCart((prev) => ({
				...prev,
				[foodItem.id]: {
					foodItemId: foodItem.id,
					quantity: currentQuantity + 1,
					priceAtOrder: foodItem.price,
				},
			}));
		}
	};

	const removeFromCart = (foodItemId: string) => {
		const currentQuantity = cart[foodItemId]?.quantity || 0;
		if (currentQuantity > 1) {
			const existingItem = cart[foodItemId];
			if (existingItem) {
				setCart((prev) => ({
					...prev,
					[foodItemId]: {
						foodItemId: foodItemId,
						quantity: currentQuantity - 1,
						priceAtOrder: existingItem.priceAtOrder,
					},
				}));
			}
		} else {
			setCart((prev) => {
				const newCart = { ...prev };
				delete newCart[foodItemId];
				return newCart;
			});
		}
	};

	const getTotalItems = () => {
		return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
	};

	const getTotalPrice = () => {
		return Object.values(cart).reduce(
			(sum, item) => sum + item.quantity * item.priceAtOrder,
			0,
		);
	};

	const getCartItems = () => {
		return Object.values(cart)
			.map((cartItem) => {
				const inventoryItem = eventFoodItems.find(
					(item) => item.foodItemId === cartItem.foodItemId,
				);
				return inventoryItem
					? { ...inventoryItem.foodItem, ...cartItem }
					: null;
			})
			.filter(Boolean);
	};

	const canAddMore = (inventoryItem: InventoryItem) => {
		const foodItem = inventoryItem.foodItem;
		const currentQuantity = cart[foodItem.id]?.quantity || 0;
		const previouslyOrdered = getPreviouslyOrdered(foodItem.id);
		const maxAllowed = inventoryItem.maxOrderPerTeam || 999;

		return (
			currentQuantity < foodItem.availableQty &&
			previouslyOrdered + currentQuantity < maxAllowed &&
			foodItem.isActive
		);
	};

	const placeOrder = async () => {
		if (!teamId || !eventId) return;

		const orderItems = Object.values(cart);
		if (orderItems.length === 0) return;

		try {
			setIsCreatingOrder(true);
			await createOrder({
				teamId,
				eventId,
				items: orderItems,
			});

			toast({
				title: "Order placed successfully!",
				description: "You can track your order status in the order history.",
			});
			setCart({});
			setShowOrderPreview(false);
			router.push("/team/dashboard");
		} catch (error) {
			toast({
				title: "Failed to place order",
				description:
					error instanceof Error ? error.message : "Something went wrong",
				variant: "destructive",
			});
		} finally {
			setIsCreatingOrder(false);
		}
	};

	if (eventNotStarted) {
		return (
			<TeamLayout>
				<div className="space-y-6">
					<div className="text-center py-12">
						<div className="max-w-md mx-auto">
							<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
								<Clock className="h-8 w-8 text-muted-foreground" />
							</div>
							<h2 className="text-2xl font-bold text-foreground mb-2">
								Event Not Started
							</h2>
							<p className="text-muted-foreground mb-6">
								The event "{event.name}" hasn't started yet. Food ordering will
								be available from{" "}
								{new Date(event.startDate).toLocaleDateString()} at{" "}
								{new Date(event.startDate).toLocaleTimeString()}.
							</p>
							<Button
								onClick={() => router.push("/team/dashboard")}
								variant="outline"
							>
								Back to Dashboard
							</Button>
						</div>
					</div>
				</div>
			</TeamLayout>
		);
	}

	if (eventEnded) {
		return (
			<TeamLayout>
				<div className="space-y-6">
					<div className="text-center py-12">
						<div className="max-w-md mx-auto">
							<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
								<Clock className="h-8 w-8 text-muted-foreground" />
							</div>
							<h2 className="text-2xl font-bold text-foreground mb-2">
								Event Ended
							</h2>
							<p className="text-muted-foreground mb-6">
								The event "{event.name}" has ended. Food ordering was available
								until {new Date(event.endDate).toLocaleDateString()} at{" "}
								{new Date(event.endDate).toLocaleTimeString()}.
							</p>
							<Button
								onClick={() => router.push("/team/dashboard")}
								variant="outline"
							>
								Back to Dashboard
							</Button>
						</div>
					</div>
				</div>
			</TeamLayout>
		);
	}

	return (
		<TeamLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-foreground">Order Food</h1>
						<p className="text-muted-foreground">
							{event.name} - Ends {new Date(event.endDate).toLocaleDateString()}{" "}
							at {new Date(event.endDate).toLocaleTimeString()}
						</p>
					</div>
					{getTotalItems() > 0 && (
						<Dialog open={showOrderPreview} onOpenChange={setShowOrderPreview}>
							<DialogTrigger asChild>
								<Button className="gap-2 relative">
									<ShoppingCart className="h-4 w-4" />
									Review Order ({getTotalItems()} items)
									<Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
										{getTotalItems()}
									</Badge>
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-2xl">
								<DialogHeader>
									<DialogTitle>Order Preview</DialogTitle>
									<DialogDescription>
										Review your order details before placing
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 max-h-96 overflow-y-auto">
									{getCartItems().map((item) => {
										if (!item) return null;

										return (
											<div
												key={item.id}
												className="p-4 border rounded-lg space-y-3"
											>
												<div className="flex items-start justify-between">
													<div className="flex items-center gap-4">
														{item.imageUrl ? (
															<Image
																src={item.imageUrl || "/placeholder.svg"}
																alt={item.name}
																width={64}
																height={64}
																className="w-16 h-16 object-cover rounded-md"
															/>
														) : (
															<Badge>No image</Badge>
														)}
														<div>
															<h4 className="font-semibold">{item.name}</h4>
															<p className="text-sm text-muted-foreground">
																{item.price === 0
																	? "Free"
																	: `₹${item.price} each`}
															</p>
															{item.restrictions &&
																item.restrictions.length > 0 && (
																	<div className="flex flex-wrap gap-1 mt-1">
																		{item.restrictions.map(
																			(restriction: string) => (
																				<Badge
																					key={restriction}
																					variant="outline"
																					className="text-xs"
																				>
																					{restriction}
																				</Badge>
																			),
																		)}
																	</div>
																)}
														</div>
													</div>
													<div className="text-right">
														<p className="font-semibold text-lg">
															{item.price === 0
																? "Free"
																: `₹${(item.price * item.quantity).toFixed(2)}`}
														</p>
														<p className="text-sm text-muted-foreground">
															Qty: {item.quantity}
														</p>
													</div>
												</div>
											</div>
										);
									})}
								</div>

								<div className="border-t pt-4 space-y-4">
									<div className="bg-muted/20 rounded-lg p-4">
										<h4 className="font-semibold mb-3">Order Breakdown</h4>
										<div className="space-y-2">
											{getCartItems().map((item) => {
												if (!item) return null;
												return (
													<div
														key={item.id}
														className="flex justify-between text-sm"
													>
														<span>
															{item.name} × {item.quantity}
														</span>
														<span>
															{item.price === 0
																? "Free"
																: `₹${(item.price * item.quantity).toFixed(2)}`}
														</span>
													</div>
												);
											})}
										</div>
										<div className="border-t border-border/50 mt-3 pt-3 flex justify-between items-center">
											<span className="text-lg font-semibold">
												Total Amount:
											</span>
											<span className="text-2xl font-bold text-primary">
												{getTotalPrice() === 0
													? "Free"
													: `₹${getTotalPrice().toFixed(2)}`}
											</span>
										</div>
										<p className="text-xs text-muted-foreground mt-2">
											Payment will be processed manually by admin after order
											confirmation
										</p>
									</div>

									<div className="flex gap-2">
										<Button
											variant="outline"
											onClick={() => setShowOrderPreview(false)}
											className="flex-1"
										>
											Continue Shopping
										</Button>
										<Button
											className="flex-1 gap-2"
											onClick={placeOrder}
											disabled={isCreatingOrder}
										>
											{isCreatingOrder ? "Placing Order..." : "Place Order"}
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					)}
				</div>

				{/* Event Info */}
				<Card className="bg-primary/5 border-primary/20">
					<CardHeader>
						<CardTitle className="text-lg">
							Current Event: {event.name}
						</CardTitle>
						<CardDescription>
							{event.description} • Your team can order up to the specified
							limits per item
						</CardDescription>
					</CardHeader>
				</Card>

				{/* Food Items Grid */}
				{eventFoodItems.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground">
							No food items available for this event.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{eventFoodItems.map((inventoryItem) => {
							const foodItem = inventoryItem.foodItem;
							const cartQuantity = cart[foodItem.id]?.quantity || 0;
							const previouslyOrdered = getPreviouslyOrdered(foodItem.id);
							const totalOrdered = previouslyOrdered + cartQuantity;
							const maxAllowed = inventoryItem.maxOrderPerTeam || 999;
							const remainingForTeam = maxAllowed - totalOrdered;
							const isLowStock = foodItem.availableQty <= 5;
							const isOutOfStock = foodItem.availableQty === 0;
							const isInactive = !foodItem.isActive;

							return (
								<Card
									key={foodItem.id}
									className={cn(
										"hover:shadow-lg transition-all duration-200 hover:-translate-y-1",
										(isOutOfStock || isInactive) && "opacity-60",
									)}
								>
									<CardHeader className="pb-4">
										<div className="relative">
											{foodItem.imageUrl ? (
												<Image
													src={foodItem.imageUrl || "/placeholder.svg"}
													alt={foodItem.name}
													width={400}
													height={160}
													className="w-full h-40 object-cover rounded-md bg-muted"
												/>
											) : (
												<div className="h-40">
													<Badge>No image</Badge>
												</div>
											)}
											{foodItem.restrictions &&
												foodItem.restrictions.length > 0 && (
													<div className="absolute top-2 right-2 bg-background/90 rounded-full p-1">
														<AlertTriangle className="h-4 w-4 text-yellow-500" />
													</div>
												)}
											{isLowStock && !isOutOfStock && (
												<Badge className="absolute top-2 left-2 bg-yellow-500">
													Low Stock
												</Badge>
											)}
											{isOutOfStock && (
												<Badge className="absolute top-2 left-2 bg-destructive">
													Out of Stock
												</Badge>
											)}
											{isInactive && (
												<Badge className="absolute top-2 left-2 bg-muted">
													Inactive
												</Badge>
											)}
											<Badge className="absolute bottom-2 right-2 bg-primary text-primary-foreground">
												{foodItem.price === 0 ? "Free" : `₹${foodItem.price}`}
											</Badge>
										</div>
										<div>
											<CardTitle className="text-lg">{foodItem.name}</CardTitle>
											<CardDescription>{foodItem.description}</CardDescription>
										</div>
									</CardHeader>

									<CardContent className="space-y-4">
										<div className="flex items-center justify-between text-sm">
											<span>Available: {foodItem.availableQty}</span>
											<span>
												Team limit:{" "}
												{inventoryItem.maxOrderPerTeam || "No limit"}
											</span>
										</div>

										{previouslyOrdered > 0 && (
											<div className="text-sm">
												<span className="text-muted-foreground">
													Previously ordered:{" "}
												</span>
												<span className="font-medium">{previouslyOrdered}</span>
												<span className="text-muted-foreground">
													{" "}
													| Limit:{" "}
												</span>
												<span className="font-medium">
													{maxAllowed === 999
														? "No limit"
														: maxAllowed - previouslyOrdered}
												</span>
											</div>
										)}

										{foodItem.restrictions &&
											foodItem.restrictions.length > 0 && (
												<div>
													<span className="text-sm font-medium">Contains:</span>
													<div className="flex flex-wrap gap-1 mt-1">
														{foodItem.restrictions.map((restriction) => (
															<Badge
																key={restriction}
																variant="outline"
																className="text-xs"
															>
																{restriction}
															</Badge>
														))}
													</div>
												</div>
											)}

										{!isOutOfStock && !isInactive && (
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="icon"
														className="h-8 w-8 bg-transparent"
														onClick={() => removeFromCart(foodItem.id)}
														disabled={cartQuantity === 0}
													>
														<Minus className="h-3 w-3" />
													</Button>
													<span className="w-8 text-center font-medium">
														{cartQuantity}
													</span>
													<Button
														variant="outline"
														size="icon"
														className="h-8 w-8 bg-transparent"
														onClick={() => addToCart(inventoryItem)}
														disabled={!canAddMore(inventoryItem)}
													>
														<Plus className="h-3 w-3" />
													</Button>
												</div>
												{/* <div className="text-sm text-muted-foreground">
													{remainingForTeam > 0
														? `${remainingForTeam} remaining`
														: "Limit reached"}
												</div> */}
											</div>
										)}

										{(isOutOfStock || isInactive) && (
											<Button disabled className="w-full">
												{isInactive ? "No longer available" : "Out of Stock"}
											</Button>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}

				{getTotalItems() > 0 && (
					<Card className="sticky bottom-4 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<h3 className="font-semibold">Order Summary</h3>
									<div className="text-sm text-muted-foreground space-y-1">
										<p>
											{getTotalItems()} items • ₹{getTotalPrice().toFixed(2)}{" "}
											total
										</p>
										<div className="flex flex-wrap gap-2">
											{getCartItems()
												.slice(0, 3)
												.map((item) => {
													if (!item) return null;
													return (
														<span
															key={item.id}
															className="text-xs bg-muted px-2 py-1 rounded"
														>
															{item.name} ({item.quantity})
														</span>
													);
												})}
											{getCartItems().length > 3 && (
												<span className="text-xs bg-muted px-2 py-1 rounded">
													+{getCartItems().length - 3} more
												</span>
											)}
										</div>
									</div>
								</div>
								<Button
									size="lg"
									className="gap-2"
									onClick={() => setShowOrderPreview(true)}
								>
									<ShoppingCart className="h-4 w-4" />
									Review Order
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</TeamLayout>
	);
}
