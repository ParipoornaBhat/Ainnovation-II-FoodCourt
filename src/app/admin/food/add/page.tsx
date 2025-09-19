"use client"
import { AdminLayout } from "@/components/admin-layout"
import { FoodItemForm } from "@/components/food-item-form"
import { useRouter } from "next/navigation"

export default function AddFoodItemPage() {
  const router = useRouter()

  const handleSubmit = (data: any) => {
    // Handle form submission
    console.log("Adding food item:", data)
    // In a real app, this would make an API call
    router.push("/admin/food")
  }

  const handleCancel = () => {
    router.push("/admin/food")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Food Item</h1>
          <p className="text-muted-foreground">Create a new food item for the menu</p>
        </div>

        <FoodItemForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </AdminLayout>
  )
}
