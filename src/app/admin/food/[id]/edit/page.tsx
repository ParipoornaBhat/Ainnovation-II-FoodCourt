"use client";

import { AdminLayout } from "@/components/admin-layout";
import { FoodItemForm } from "@/components/food-item-form";
import { api } from "@/trpc/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { AddFoodItemPageProps } from "@/app/admin/food/add/page";
import { useAppData } from "@/contexts/DataContext";

export default function EditFoodItemPage() {
	const router = useRouter();
	const params = useParams();
	const { refreshFoodItems } = useAppData();
	const searchParams = useSearchParams();
	const foodId = params.id as string;
	const returnUrl = searchParams.get("returnUrl") || "/admin/food";

	const { data: foodItem, isLoading } = api.food.getFoodItemById.useQuery({
		id: foodId,
	});

	const { mutate: updateFood } = api.food.updateFoodItem.useMutation();

	const handleSubmit = (data: AddFoodItemPageProps) => {
		updateFood(
			{
				id: foodId,
				name: data.name,
				description: data.description,
				price: data.price,
				imageUrl: data.imageUrl,
				restrictions: data.restrictions,
			},
			{
				onSuccess: () => {
					toast.success("Food item updated successfully");
					refreshFoodItems();
					router.push(returnUrl);
				},
				onError: (error) => {
					toast.error(`Error updating food item: ${error.message}`);
				},
			},
		);
	};

	const handleCancel = () => {
		router.push(returnUrl);
	};

	if (isLoading) {
		return (
			<AdminLayout>
				<div className="space-y-6">
					<div className="flex items-center gap-4">
						<Button variant="outline" size="icon" onClick={() => router.back()}>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<div>
							<div className="h-8 w-48 bg-muted rounded animate-pulse" />
							<div className="h-4 w-32 bg-muted rounded animate-pulse mt-2" />
						</div>
					</div>
					<div className="w-full max-w-2xl mx-auto">
						<div className="h-96 bg-muted rounded-lg animate-pulse" />
					</div>
				</div>
			</AdminLayout>
		);
	}

	if (!foodItem) {
		return (
			<AdminLayout>
				<div className="space-y-6">
					<div className="flex items-center gap-4">
						<Button variant="outline" size="icon" onClick={() => router.back()}>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<div>
							<h1 className="text-3xl font-bold text-foreground">
								Food Item Not Found
							</h1>
							<p className="text-muted-foreground">
								The requested food item could not be found
							</p>
						</div>
					</div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-3xl font-bold text-foreground">
							Edit Food Item
						</h1>
						<p className="text-muted-foreground">
							Update food item details (stock managed separately)
						</p>
					</div>
				</div>

				<FoodItemForm
					item={{
						id: parseInt(foodId),
						name: foodItem.name,
						description: foodItem.description || "",
						quantity: foodItem.availableQty,
						restrictions: foodItem.restrictions,
						image: foodItem.imageUrl || undefined,
						price: foodItem.price,
					}}
					onSubmit={handleSubmit}
					onCancel={handleCancel}
				/>
			</div>
		</AdminLayout>
	);
}
