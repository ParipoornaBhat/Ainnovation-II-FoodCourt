import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, AlertTriangle, ImageIcon } from "lucide-react"
import Link from "next/link"

export default function FoodManagement() {
  const foodItems = [
    {
      id: 1,
      name: "Chicken Sandwich",
      description: "Grilled chicken with fresh vegetables",
      quantity: 25,
      restrictions: ["Gluten"],
      image: "/classic-chicken-sandwich.png",
    },
    {
      id: 2,
      name: "Vegetarian Pasta",
      description: "Fresh pasta with seasonal vegetables",
      quantity: 40,
      restrictions: [],
      image: "/vegetarian-pasta.png",
    },
    {
      id: 3,
      name: "Caesar Salad",
      description: "Classic caesar with croutons and parmesan",
      quantity: 5,
      restrictions: ["Dairy"],
      image: "/caesar-salad.png",
    },
    {
      id: 4,
      name: "Fish Tacos",
      description: "Fresh fish with cabbage slaw",
      quantity: 18,
      restrictions: ["Fish"],
      image: "/fish-tacos.jpg",
    },
    {
      id: 5,
      name: "Quinoa Bowl",
      description: "Healthy quinoa with mixed vegetables",
      quantity: 30,
      restrictions: [],
      image: "/colorful-quinoa-bowl.png",
    },
    {
      id: 6,
      name: "Beef Burger",
      description: "Juicy beef patty with classic toppings",
      quantity: 2,
      restrictions: ["Gluten", "Dairy"],
      image: "/beef-burger.png",
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Food & Inventory Management</h1>
            <p className="text-muted-foreground">Manage food items, quantities, and dietary restrictions</p>
          </div>
          <Button className="gap-2" asChild>
            <Link href="/admin/food/add">
              <Plus className="h-4 w-4" />
              Add Food Item
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">3</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
            </CardContent>
          </Card>
        </div>

        {/* Food Items Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="relative">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-md bg-muted"
                  />
                  {item.restrictions.length > 0 && (
                    <div className="absolute top-2 right-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
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
                  <Badge variant={item.quantity <= 5 ? "destructive" : item.quantity <= 15 ? "secondary" : "default"}>
                    {item.quantity} available
                  </Badge>
                </div>

                {item.restrictions.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Restrictions:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.restrictions.map((restriction) => (
                        <Badge key={restriction} variant="outline" className="text-xs">
                          {restriction}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Manage Stock
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Item Placeholder */}
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Add New Food Item</CardTitle>
            <CardDescription>Create new food items with images, descriptions, and dietary information</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="gap-2" asChild>
              <Link href="/admin/food/add">
                <Plus className="h-4 w-4" />
                Add Food Item
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
