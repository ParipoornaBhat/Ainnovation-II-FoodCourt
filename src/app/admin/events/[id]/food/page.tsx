"use client";

import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Plus,
	ArrowLeft,
	Search,
	Utensils,
	AlertTriangle,
	Check,
	X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import Link from "next/link";

export default function EventFoodManagement() {
	const params = useParams();
	const router = useRouter();
	const eventId = params.id as string;
	const [searchQuery, setSearchQuery] = useState("");

	const [addFoodMutationIsLoading, setAddFoodMutationIsLoading] =
		useState(false);
	const [removeFoodIsLoading, setRemoveFoodIsLoading] = useState(false);
	const [updateInventoryIsLoading, setUpdateInventoryIsLoading] =
		useState(false);

	const [allocatingItems, setAllocatingItems] = useState<
		Record<string, number | undefined>
	>({});
	const [editingMaxOrder, setEditingMaxOrder] = useState<
		Record<string, number | undefined>
	>({});
	const [confirmRemove, setConfirmRemove] = useState<{
		open: boolean;
		inventoryItemId: string;
		itemName: string;
	}>({ open: false, inventoryItemId: "", itemName: "" });

	// Real tRPC queries
	const { data: event } = api.events.getById.useQuery({ id: eventId });
	const { data: allocatedFoodItems = [], refetch: refetchAllocated } =
		api.events.getEventFoodItems.useQuery({ eventId });
	const { data: availableFoodItems = [], refetch: refetchAvailable } =
		api.events.getAvailableFoodItems.useQuery({ eventId });

	const addFoodMutation = api.events.addFoodToEvent.useMutation({
		onSuccess: () => {
			refetchAllocated();
			refetchAvailable();
			setAddFoodMutationIsLoading(false);
			toast.success("Food item allocated to event successfully");
		},
		onError: (error) => {
			toast.error(`Failed to allocate food: ${error.message}`);
		},
	});

	const removeFoodMutation = api.events.removeFoodFromEvent.useMutation({
		onSuccess: () => {
			refetchAllocated();
			refetchAvailable();
			setRemoveFoodIsLoading(false);
			toast.success("Food item removed from event");
		},
		onError: (error) => {
			toast.error(`Failed to remove food: ${error.message}`);
		},
	});

	const updateInventoryMutation = api.events.updateInventoryItem.useMutation({
		onSuccess: () => {
			refetchAllocated();
			refetchAvailable();
			setUpdateInventoryIsLoading(false);
			toast.success("Max order limit updated");
		},
		onError: (error) => {
			toast.error(`Failed to update: ${error.message}`);
		},
	});

	const filteredAllocatedItems = allocatedFoodItems.filter(
		(item) =>
			item.foodItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.foodItem.description
				?.toLowerCase()
				.includes(searchQuery.toLowerCase()),
	);

	const filteredAvailableItems = availableFoodItems.filter(
		(item) =>
			item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.description?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleAddFood = (foodId: string, maxOrderPerTeam?: number) => {
		if (maxOrderPerTeam === 0) {
			toast.error("Max order per team cannot be 0. Leave empty for no limit.");
			return;
		}
		setAddFoodMutationIsLoading(true);
		addFoodMutation.mutate({
			foodId,
			eventId,
			maxOrderPerTeam,
		});
		setAllocatingItems((prev) => ({ ...prev, [foodId]: undefined }));
	};

	const handleRemoveFood = (inventoryItemId: string, itemName: string) => {
		setConfirmRemove({ open: true, inventoryItemId, itemName });
	};

	const handleRemoveConfirm = () => {
		setRemoveFoodIsLoading(true);
		removeFoodMutation.mutate({
			inventoryItemId: confirmRemove.inventoryItemId,
		});
		setConfirmRemove({ open: false, inventoryItemId: "", itemName: "" });
	};

	const handleUpdateInventoryItem = (
		inventoryItemId: string,
		maxOrderPerTeam?: number,
	) => {
		if (maxOrderPerTeam === 0) {
			toast.error("Max order per team cannot be 0. Leave empty for no limit.");
			return;
		}

		setUpdateInventoryIsLoading(true);

		updateInventoryMutation.mutate({
			inventoryItemId,
			maxOrderPerTeam,
		});
		setEditingMaxOrder((prev) => {
			const updated = { ...prev };
			delete updated[inventoryItemId];
			return updated;
		});
	};

	const handleMaxOrderCancel = (inventoryItemId: string) => {
		setEditingMaxOrder((prev) => {
			const updated = { ...prev };
			delete updated[inventoryItemId];
			return updated;
		});
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div className="flex-1">
						<h1 className="text-3xl font-bold text-foreground">
							Food Management
						</h1>
						<p className="text-muted-foreground">
							Allocate food items for "{event?.name || "Event"}"
						</p>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Utensils className="h-5 w-5" />
							Food Allocation Overview
						</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="text-center p-4 bg-muted/50 rounded-lg">
							<div className="text-2xl font-bold">
								{allocatedFoodItems.length}
							</div>
							<div className="text-sm text-muted-foreground">
								Allocated Items
							</div>
						</div>
						<div className="text-center p-4 bg-muted/50 rounded-lg">
							<div className="text-2xl font-bold">
								{allocatedFoodItems.reduce(
									(sum, item) => sum + item.foodItem.availableQty,
									0,
								)}
							</div>
							<div className="text-sm text-muted-foreground">Total Items</div>
						</div>
						<div className="text-center p-4 bg-muted/50 rounded-lg">
							<div className="text-2xl font-bold">
								{allocatedFoodItems
									.reduce(
										(sum, item) =>
											sum + item.foodItem.availableQty * item.foodItem.price,
										0,
									)
									.toFixed(2)}
								rs
							</div>
							<div className="text-sm text-muted-foreground">Total Value</div>
						</div>
						<div className="text-center p-4 bg-muted/50 rounded-lg">
							<div className="text-2xl font-bold">
								{availableFoodItems.length}
							</div>
							<div className="text-sm text-muted-foreground">
								Non Allocated Items
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="flex items-center gap-4">
					<div className="relative flex-1 max-w-sm">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search food items..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Food Items for This Event</CardTitle>
					</CardHeader>
					<CardContent>
						{filteredAllocatedItems.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredAllocatedItems.map((inventoryItem) => (
									<Card
										key={inventoryItem.id}
										className="hover:shadow-lg transition-all duration-200"
									>
										<CardHeader className="pb-4">
											<div className="relative">
												{inventoryItem.foodItem.imageUrl ? (
													<div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
														<span className="text-sm text-muted-foreground">
															{inventoryItem.foodItem.name}
														</span>
													</div>
												) : (
													<div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
														<span className="text-sm text-muted-foreground">
															No Image
														</span>
													</div>
												)}
												<div className="absolute top-2 left-2">
													<Badge variant="default" className="bg-green-500">
														<Check className="h-3 w-3 mr-1" />
														Allocated
													</Badge>
												</div>
											</div>
											<div>
												<CardTitle className="text-lg">
													{inventoryItem.foodItem.name}
												</CardTitle>
												<p className="text-sm text-muted-foreground">
													{inventoryItem.foodItem.description ||
														"No description"}
												</p>
											</div>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="grid grid-cols-2 gap-4">
												<div>
													<Label className="text-xs text-muted-foreground">
														Available Stock
													</Label>
													<div className="font-semibold">
														{inventoryItem.foodItem.availableQty}
													</div>
												</div>
												<div>
													<Label className="text-xs text-muted-foreground">
														Price
													</Label>
													<div className="font-semibold text-green-600">
														{inventoryItem.foodItem.price <= 0
															? "Free"
															: `${inventoryItem.foodItem.price}rs`}
													</div>
												</div>
											</div>

											<div className="space-y-2">
												<Label className="text-sm">Max Order Per Team</Label>
												{editingMaxOrder[inventoryItem.id] !== undefined ? (
													<div className="flex items-center gap-2">
														<Input
															type="number"
															value={editingMaxOrder[inventoryItem.id] || ""}
															onChange={(e) => {
																const value = e.target.value
																	? parseInt(e.target.value)
																	: undefined;
																setEditingMaxOrder((prev) => ({
																	...prev,
																	[inventoryItem.id]: value,
																}));
															}}
															placeholder="No limit"
															min={1}
															max={inventoryItem.foodItem.availableQty}
															className="flex-1"
														/>
														<Button
															size="icon"
															variant="outline"
															className="h-8 w-8"
															onClick={() => {
																const value = editingMaxOrder[inventoryItem.id];
																if (value !== undefined) {
																	handleUpdateInventoryItem(
																		inventoryItem.id,
																		value,
																	);
																}
															}}
															disabled={updateInventoryIsLoading}
														>
															<Check className="h-4 w-4 text-green-600" />
														</Button>
														<Button
															size="icon"
															variant="outline"
															className="h-8 w-8"
															onClick={() =>
																handleMaxOrderCancel(inventoryItem.id)
															}
														>
															<X className="h-4 w-4 text-red-600" />
														</Button>
													</div>
												) : (
													<div className="flex items-center gap-2">
														<Input
															type="number"
															defaultValue={inventoryItem.maxOrderPerTeam || ""}
															placeholder="No limit"
															min={1}
															max={inventoryItem.foodItem.availableQty}
															className="flex-1"
															onFocus={() =>
																setEditingMaxOrder((prev) => ({
																	...prev,
																	[inventoryItem.id]:
																		inventoryItem.maxOrderPerTeam ?? undefined,
																}))
															}
															readOnly
														/>
														<Button
															size="sm"
															variant="outline"
															onClick={() =>
																setEditingMaxOrder((prev) => ({
																	...prev,
																	[inventoryItem.id]:
																		inventoryItem.maxOrderPerTeam ?? undefined,
																}))
															}
														>
															Edit
														</Button>
													</div>
												)}
											</div>

											{inventoryItem.foodItem.restrictions.length > 0 && (
												<div>
													<Label className="text-sm text-muted-foreground">
														Restrictions
													</Label>
													<div className="flex flex-wrap gap-1 mt-1">
														{inventoryItem.foodItem.restrictions.map(
															(restriction) => (
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
												</div>
											)}

											<div className="flex gap-2 pt-2">
												<Button
													variant="outline"
													size="sm"
													className="text-red-600 hover:text-red-700 w-full"
													onClick={() =>
														handleRemoveFood(
															inventoryItem.id,
															inventoryItem.foodItem.name,
														)
													}
													disabled={removeFoodIsLoading}
												>
													<X className="h-3 w-3 mr-1" />
													{removeFoodIsLoading ? "Removing..." : "Remove"}
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<div className="text-center py-8">
								<p className="text-muted-foreground">
									No food items allocated to this event yet.
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<div className="flex items-center justify-between">
						<CardHeader>
							<CardTitle>Available Food Items</CardTitle>
						</CardHeader>
						<Button className="mr-4" asChild>
							<Link
								href={`/admin/food/add?returnUrl=${encodeURIComponent(`/admin/events/${eventId}/food`)}`}
							>
								<Plus className="h-4 w-4" />
								Add New Food Item
							</Link>
						</Button>
					</div>
					<CardContent>
						{filteredAvailableItems.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredAvailableItems.map((item) => (
									<Card
										key={item.id}
										className="hover:shadow-lg transition-all duration-200 border-dashed"
									>
										<CardHeader className="pb-4">
											<div className="relative">
												{item.imageUrl ? (
													<div className="w-full h-32 bg-muted rounded-md flex items-center justify-center opacity-75">
														<span className="text-sm text-muted-foreground">
															{item.name}
														</span>
													</div>
												) : (
													<div className="w-full h-32 bg-muted rounded-md flex items-center justify-center opacity-75">
														<span className="text-sm text-muted-foreground">
															No Image
														</span>
													</div>
												)}
												{item.restrictions.length > 0 && (
													<div className="absolute top-2 right-2">
														<AlertTriangle className="h-5 w-5 text-yellow-500" />
													</div>
												)}
											</div>
											<div>
												<CardTitle className="text-lg">{item.name}</CardTitle>
												<p className="text-sm text-muted-foreground">
													{item.description || "No description"}
												</p>
											</div>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="grid grid-cols-2 gap-4">
												<div>
													<Label className="text-xs text-muted-foreground">
														Available Stock
													</Label>
													<div className="font-semibold">
														{item.availableQty}
													</div>
												</div>
												<div>
													<Label className="text-xs text-muted-foreground">
														Price
													</Label>
													<div className="font-semibold">
														{item.price <= 0 ? "Free" : `${item.price}rs`}
													</div>
												</div>
											</div>

											<div className="space-y-2">
												<Label className="text-sm">
													Max Order Per Team (Optional)
												</Label>
												<Input
													type="number"
													placeholder="No limit"
													min={1}
													max={item.availableQty}
													className="w-full"
													value={allocatingItems[item.id] || ""}
													onChange={(e) => {
														const value = e.target.value
															? parseInt(e.target.value)
															: undefined;
														setAllocatingItems((prev) => ({
															...prev,
															[item.id]: value,
														}));
													}}
												/>
											</div>

											{item.restrictions.length > 0 && (
												<div>
													<Label className="text-sm text-muted-foreground">
														Restrictions
													</Label>
													<div className="flex flex-wrap gap-1 mt-1">
														{item.restrictions.map((restriction) => (
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

											<Button
												className="w-full gap-2"
												onClick={() =>
													handleAddFood(item.id, allocatingItems[item.id])
												}
												disabled={addFoodMutationIsLoading}
											>
												<Plus className="h-3 w-3" />
												{addFoodMutationIsLoading
													? "Adding..."
													: "Add to Event"}
											</Button>
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<div className="text-center py-8">
								<p className="text-muted-foreground">
									All available food items have been allocated to this event.
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<ConfirmationDialog
				open={confirmRemove.open}
				onOpenChange={(open) => setConfirmRemove((prev) => ({ ...prev, open }))}
				title="Remove Food Item"
				description={`Are you sure you want to remove "${confirmRemove.itemName}" from this event? Teams will no longer be able to order this item.`}
				confirmText="Remove"
				cancelText="Cancel"
				variant="destructive"
				onConfirm={handleRemoveConfirm}
			/>
		</AdminLayout>
	);
}
