"use client";

import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Check, X } from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useAppData } from "@/contexts/DataContext";

export default function FoodManagement() {
	const {
		foodItems: allFoodItems,
		foodItemsLoading: isLoading,
		refreshFoodItems,
	} = useAppData();

	const [updateIsLoading, setUpdateIsLoading] = useState(false);
	const [editingStock, setEditingStock] = useState<Record<string, number>>({});
	const [confirmDelete, setConfirmDelete] = useState<{
		open: boolean;
		foodId: string;
		foodName: string;
	}>({ open: false, foodId: "", foodName: "" });

	const updateStockMutation = api.food.updateFoodItemStock.useMutation({
		onSuccess: () => {
			toast.success("Stock updated successfully");
			setUpdateIsLoading(false);
			refreshFoodItems();
			// refetch();
		},
		onError: (error) => {
			toast.error(`Failed to update stock: ${error.message}`);
		},
	});

	const deleteFoodMutation = api.food.deleteFoodItem.useMutation({
		onSuccess: () => {
			toast.success("Food item deleted successfully");
			// refetch();
		},
		onError: (error) => {
			toast.error(`Failed to delete food item: ${error.message}`);
		},
	});

	const handleStockUpdate = (foodId: string, newStock: number) => {
		setUpdateIsLoading(true);
		updateStockMutation.mutate({
			id: foodId,
			availableQty: newStock,
		});
		setEditingStock((prev) => {
			const updated = { ...prev };
			delete updated[foodId];
			return updated;
		});
	};

	const handleStockCancel = (foodId: string) => {
		setEditingStock((prev) => {
			const updated = { ...prev };
			delete updated[foodId];
			return updated;
		});
	};

	const handleDeleteConfirm = (foodId: string, foodName: string) => {
		setConfirmDelete({ open: true, foodId, foodName });
	};

	const handleDeleteExecute = () => {
		deleteFoodMutation.mutate({ id: confirmDelete.foodId });
		setConfirmDelete({ open: false, foodId: "", foodName: "" });
	};

	if (isLoading) {
		return (
			<AdminLayout>
				<div>
					<div className="h-4 w-1/4 mb-2 bg-gray-400 rounded animate-pulse"></div>
					<div className="h-6 w-1/2 mb-6 bg-gray-400 rounded animate-pulse"></div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{Array.from({ length: 3 }).map((_, index) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: <its fine>
								key={index}
								className="border border-gray-400 rounded-lg p-4 shadow animate-pulse"
							>
								<div className="h-32 w-full mb-4 bg-gray-400 rounded"></div>
								<div className="h-6 w-3/4 mb-2 bg-gray-400 rounded"></div>
								<div className="h-4 w-full mb-4 bg-gray-400 rounded"></div>
								<div className="h-4 w-1/2 mb-2 bg-gray-400 rounded"></div>
								<div className="h-4 w-1/3 mb-2 bg-gray-400 rounded"></div>
								<div className="h-4 w-1/4 bg-gray-400 rounded"></div>
							</div>
						))}
					</div>
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
							Food & Inventory Management
						</h1>
						<p className="text-muted-foreground">
							Manage food items, quantities, and dietary restrictions
						</p>
					</div>
					<Button className="gap-2" asChild>
						<Link href="/admin/food/add">
							<Plus className="h-4 w-4" />
							Add Food Item
						</Link>
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">Total Items</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{allFoodItems?.length || 0}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">Low Stock</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-destructive">
								{allFoodItems?.filter((item) => item.availableQty <= 5)
									.length || 0}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">
								Out of Stock
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-destructive">
								{allFoodItems?.filter((item) => item.availableQty === 0)
									.length || 0}
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{allFoodItems && allFoodItems.length > 0 ? (
						allFoodItems.map((item) => (
							<Card
								key={item.id}
								className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
							>
								<CardHeader className="pb-4">
									<div className="relative">
										{!item.imageUrl && (
											<div className=" bg-black/70 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1.5 text-xs font-medium text-white shadow-sm">
												<span>No Image</span>
											</div>
										)}
									</div>
									<div>
										<CardTitle className="text-lg">{item.name}</CardTitle>
										<CardDescription>{item.description}</CardDescription>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Quantity:</span>
										{editingStock[item.id] !== undefined ? (
											<div className="flex items-center gap-2">
												<Input
													type="number"
													min="0"
													value={editingStock[item.id]}
													onChange={(e) =>
														setEditingStock((prev) => ({
															...prev,
															[item.id]: parseInt(e.target.value) || 0,
														}))
													}
													className="w-20 h-8"
												/>
												<Button
													size="icon"
													variant="outline"
													className="h-8 w-8"
													onClick={() => {
														const stockValue = editingStock[item.id];
														if (stockValue !== undefined) {
															handleStockUpdate(item.id, stockValue);
														}
													}}
													disabled={updateIsLoading}
												>
													<Check className="h-4 w-4 text-green-600" />
												</Button>
												<Button
													size="icon"
													variant="outline"
													className="h-8 w-8"
													onClick={() => handleStockCancel(item.id)}
												>
													<X className="h-4 w-4 text-red-600" />
												</Button>
											</div>
										) : (
											<Badge
												variant={
													item.availableQty <= 5
														? "destructive"
														: item.availableQty <= 15
															? "secondary"
															: "default"
												}
											>
												{item.availableQty <= 0
													? "Out of Stock"
													: item.availableQty <= 5
														? `Low (${item.availableQty})`
														: item.availableQty}
											</Badge>
										)}
									</div>

									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Price:</span>
										<span className="font-semibold text-green-600">
											{item.price <= 0 ? "Free" : `₹${item.price}`}
										</span>
									</div>

									{item.restrictions.length > 0 && (
										<div>
											<span className="text-sm font-medium">Restrictions:</span>
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

									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											className="flex-1 gap-2 bg-transparent"
											asChild
										>
											<Link href={`/admin/food/${item.id}/edit`}>
												<Edit className="h-3 w-3" />
												Edit
											</Link>
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="flex-1 bg-transparent"
											onClick={() =>
												setEditingStock((prev) => ({
													...prev,
													[item.id]: item.availableQty,
												}))
											}
											disabled={editingStock[item.id] !== undefined}
										>
											Manage Stock
										</Button>
									</div>

									<Button
										variant="outline"
										size="sm"
										className="w-full text-red-600 hover:text-red-700"
										onClick={() => handleDeleteConfirm(item.id, item.name)}
									>
										Delete Item
									</Button>
								</CardContent>
							</Card>
						))
					) : (
						<Card className="col-span-full p-10 flex flex-col items-center justify-center text-center">
							<h3 className="text-xl font-medium mb-2">No food items found</h3>
							<p className="text-muted-foreground max-w-md mb-2">
								Your food inventory is empty. Add new items to manage your
								inventory efficiently.
							</p>
						</Card>
					)}
				</div>
			</div>

			<ConfirmationDialog
				open={confirmDelete.open}
				onOpenChange={(open) => setConfirmDelete((prev) => ({ ...prev, open }))}
				title="Delete Food Item"
				description={`Are you sure you want to delete "${confirmDelete.foodName}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				onConfirm={handleDeleteExecute}
			/>
		</AdminLayout>
	);
}
