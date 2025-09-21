"use client";
import { AdminLayout } from "@/components/admin-layout";
import { FoodItemForm } from "@/components/food-item-form";
import { api } from "@/trpc/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export interface FoodItemFormProps {
	item?: {
		id?: number;
		name: string;
		description: string;
		quantity: number;
		restrictions: string[];
		image?: string;
		price?: number;
	};
	onSubmit: (data: AddFoodItemPageProps) => void;
	onCancel: () => void;
}

export interface AddFoodItemPageProps {
	name: string;
	description?: string;
	availableQty: number;
	restrictions: string[];
	imageUrl?: string;
	price: number;
}

export default function AddFoodItemPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const returnUrl = searchParams.get("returnUrl") || "/admin/food";

	const { mutate: addFood } = api.food.createFoodItem.useMutation();

	const handleSubmit = (data: AddFoodItemPageProps) => {
		addFood(data, {
			onSuccess: () => {
				toast.success("Food item added successfully");
				router.push(returnUrl);
			},
			onError: (error) => {
				toast.error(`Error adding food item: ${error.message}`);
			},
		});
	};

	const handleCancel = () => {
		router.push(returnUrl);
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Add Food Item</h1>
					<p className="text-muted-foreground">
						Create a new food item for the menu
					</p>
				</div>

				<FoodItemForm onSubmit={handleSubmit} onCancel={handleCancel} />
			</div>
		</AdminLayout>
	);
}
