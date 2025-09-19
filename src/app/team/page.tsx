"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"
import { TeamLayout } from "@/components/team-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, ShoppingCart, AlertTriangle, DollarSign } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function TeamOrderPage() {
  const [cart, setCart] = useState<Record<number, number>>({})
  const [showOrderPreview, setShowOrderPreview] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const foodItems = [
    {
      id: 1,
      name: "Chicken Sandwich",
      description: "Grilled chicken with fresh vegetables and mayo",
      image: "/classic-chicken-sandwich.png",
      available: 25,
      maxPerTeam: 5,
      price: 12.99,
      restrictions: ["Gluten"],
      previouslyOrdered: 2, // Added previously ordered count
    },
    {
      id: 2,
      name: "Vegetarian Pasta",
      description: "Fresh pasta with seasonal vegetables and herbs",
      image: "/vegetarian-pasta.png",
      available: 40,
      maxPerTeam: 8,
      price: 14.5,
      restrictions: [],
      previouslyOrdered: 0,
    },
    {
      id: 3,
      name: "Caesar Salad",
      description: "Classic caesar with croutons and parmesan cheese",
      image: "/caesar-salad.png",
      available: 5,
      maxPerTeam: 2,
      price: 9.99,
      restrictions: ["Dairy"],
      previouslyOrdered: 1,
    },
    {
      id: 4,
      name: "Fish Tacos",
      description: "Fresh fish with cabbage slaw and lime",
      image: "/fish-tacos.jpg",
      available: 18,
      maxPerTeam: 4,
      price: 16.75,
      restrictions: ["Fish"],
      previouslyOrdered: 0,
    },
    {
      id: 5,
      name: "Quinoa Bowl",
      description: "Healthy quinoa with mixed vegetables and dressing",
      image: "/colorful-quinoa-bowl.png",
      available: 30,
      maxPerTeam: 6,
      price: 13.25,
      restrictions: [],
      previouslyOrdered: 3,
    },
    {
      id: 6,
      name: "Beef Burger",
      description: "Juicy beef patty with classic toppings",
      image: "/beef-burger.png",
      available: 2,
      maxPerTeam: 1,
      price: 18.99,
      restrictions: ["Gluten", "Dairy"],
      previouslyOrdered: 0,
    },
  ]

  const addToCart = (itemId: number) => {
    const item = foodItems.find((f) => f.id === itemId)
    if (!item) return

    const currentQuantity = cart[itemId] || 0
    if (currentQuantity < item.maxPerTeam && currentQuantity < item.available) {
      setCart((prev) => ({
        ...prev,
        [itemId]: currentQuantity + 1,
      }))
    }
  }

  const removeFromCart = (itemId: number) => {
    const currentQuantity = cart[itemId] || 0
    if (currentQuantity > 0) {
      setCart((prev) => ({
        ...prev,
        [itemId]: currentQuantity - 1,
      }))
    }
  }

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
  }

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((sum, [itemId, quantity]) => {
      const item = foodItems.find((f) => f.id === Number.parseInt(itemId))
      return sum + (item ? item.price * quantity : 0)
    }, 0)
  }

  const getCartItems = () => {
    return Object.entries(cart)
      .filter(([_, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => {
        const item = foodItems.find((f) => f.id === Number.parseInt(itemId))
        return item ? { ...item, quantity } : null
      })
      .filter(Boolean)
  }

  const canAddMore = (item: (typeof foodItems)[0]) => {
    const currentQuantity = cart[item.id] || 0
    return currentQuantity < item.maxPerTeam && currentQuantity < item.available
  }

  const placeOrder = async () => {
    setIsPlacingOrder(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Clear cart after successful order
    setCart({})
    setShowOrderPreview(false)
    setIsPlacingOrder(false)

    // Show success message (in real app, would redirect or show toast)
    alert("Order placed successfully! You can track its status in Order History.")
  }

  return (
    <TeamLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Order Food</h1>
            <p className="text-muted-foreground">Weekly Team Lunch Event - Ends in 2 hours</p>
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
                  <DialogDescription>Review your order details before placing</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {getCartItems().map((item) => {
                    if (!item) return null
                    const totalOrdered = item.previouslyOrdered + item.quantity
                    const remaining = item.maxPerTeam - totalOrdered
                    const availableAfterOrder = item.available - item.quantity

                    return (
                      <div key={item.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                              <h4 className="font-semibold">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">${item.price} each</p>
                              {item.restrictions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.restrictions.map((restriction) => (
                                    <Badge key={restriction} variant="outline" className="text-xs">
                                      {restriction}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>

                        <div className="bg-muted/30 rounded-md p-3 space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Previously ordered:</span>
                              <span className="ml-2 font-medium">{item.previouslyOrdered}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Adding now:</span>
                              <span className="ml-2 font-medium text-primary">+{item.quantity}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total after order:</span>
                              <span className="ml-2 font-medium">
                                {totalOrdered}/{item.maxPerTeam}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Team limit remaining:</span>
                              <span
                                className={cn(
                                  "ml-2 font-medium",
                                  remaining <= 0 ? "text-destructive" : "text-green-600",
                                )}
                              >
                                {remaining}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border/50">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Available in stock:</span>
                              <span className="font-medium">
                                {item.available} → {availableAfterOrder} after your order
                              </span>
                            </div>
                          </div>

                          {remaining <= 0 && (
                            <Badge variant="destructive" className="text-xs">
                              Team limit reached
                            </Badge>
                          )}
                          {availableAfterOrder <= 5 && availableAfterOrder > 0 && (
                            <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
                              Low stock after order
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Order Breakdown</h4>
                    <div className="space-y-2">
                      {getCartItems().map((item) => {
                        if (!item) return null
                        return (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="border-t border-border/50 mt-3 pt-3 flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-2xl font-bold text-primary">${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Payment will be processed manually by admin after order confirmation
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowOrderPreview(false)} className="flex-1">
                      Continue Shopping
                    </Button>
                    <Button className="flex-1 gap-2" onClick={placeOrder} disabled={isPlacingOrder}>
                      <DollarSign className="h-4 w-4" />
                      {isPlacingOrder ? "Placing Order..." : "Place Order (Manual Payment)"}
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
            <CardTitle className="text-lg">Current Event: Weekly Team Lunch</CardTitle>
            <CardDescription>
              Order deadline: Today at 2:00 PM • Your team can order up to the specified limits per item
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Food Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodItems.map((item) => {
            const cartQuantity = cart[item.id] || 0
            const totalOrdered = item.previouslyOrdered + cartQuantity
            const remainingForTeam = item.maxPerTeam - totalOrdered
            const isLowStock = item.available <= 5
            const isOutOfStock = item.available === 0

            return (
              <Card
                key={item.id}
                className={cn(
                  "hover:shadow-lg transition-all duration-200 hover:-translate-y-1",
                  isOutOfStock && "opacity-60",
                )}
              >
                <CardHeader className="pb-4">
                  <div className="relative">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-40 object-cover rounded-md bg-muted"
                    />
                    {item.restrictions.length > 0 && (
                      <div className="absolute top-2 right-2 bg-background/90 rounded-full p-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      </div>
                    )}
                    {isLowStock && !isOutOfStock && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500">Low Stock</Badge>
                    )}
                    {isOutOfStock && <Badge className="absolute top-2 left-2 bg-destructive">Out of Stock</Badge>}
                    <Badge className="absolute bottom-2 right-2 bg-primary text-primary-foreground">
                      ${item.price}
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Available: {item.available}</span>
                    <span>Team limit: {item.maxPerTeam}</span>
                  </div>

                  {item.previouslyOrdered > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Previously ordered: </span>
                      <span className="font-medium">{item.previouslyOrdered}</span>
                      <span className="text-muted-foreground"> | Remaining: </span>
                      <span className="font-medium">{item.maxPerTeam - item.previouslyOrdered}</span>
                    </div>
                  )}

                  {item.restrictions.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Contains:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.restrictions.map((restriction) => (
                          <Badge key={restriction} variant="outline" className="text-xs">
                            {restriction}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isOutOfStock && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => removeFromCart(item.id)}
                          disabled={cartQuantity === 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{cartQuantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => addToCart(item.id)}
                          disabled={!canAddMore(item) || totalOrdered >= item.maxPerTeam}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {remainingForTeam > 0 ? `${remainingForTeam} remaining` : "Limit reached"}
                      </div>
                    </div>
                  )}

                  {isOutOfStock && (
                    <Button disabled className="w-full">
                      Out of Stock
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {getTotalItems() > 0 && (
          <Card className="sticky bottom-4 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">Order Summary</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      {getTotalItems()} items • ${getTotalPrice().toFixed(2)} total
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getCartItems()
                        .slice(0, 3)
                        .map((item) => {
                          if (!item) return null
                          return (
                            <span key={item.id} className="text-xs bg-muted px-2 py-1 rounded">
                              {item.name} ({item.quantity})
                            </span>
                          )
                        })}
                      {getCartItems().length > 3 && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">+{getCartItems().length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button size="lg" className="gap-2" onClick={() => setShowOrderPreview(true)}>
                  <ShoppingCart className="h-4 w-4" />
                  Review Order
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TeamLayout>
  )
}
