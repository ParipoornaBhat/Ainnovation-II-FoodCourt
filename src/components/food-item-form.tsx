"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Plus } from "lucide-react"

interface FoodItemFormProps {
  item?: {
    id?: number
    name: string
    description: string
    quantity: number
    restrictions: string[]
    image?: string
  }
  onSubmit: (data: any) => void
  onCancel: () => void
}

const commonRestrictions = ["Gluten", "Dairy", "Nuts", "Soy", "Fish", "Shellfish", "Eggs", "Vegetarian", "Vegan"]

export function FoodItemForm({ item, onSubmit, onCancel }: FoodItemFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    quantity: item?.quantity || 0,
    restrictions: item?.restrictions || [],
    image: item?.image || "",
  })

  const [customRestriction, setCustomRestriction] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const toggleRestriction = (restriction: string) => {
    setFormData((prev) => ({
      ...prev,
      restrictions: prev.restrictions.includes(restriction)
        ? prev.restrictions.filter((r) => r !== restriction)
        : [...prev.restrictions, restriction],
    }))
  }

  const addCustomRestriction = () => {
    if (customRestriction.trim() && !formData.restrictions.includes(customRestriction.trim())) {
      setFormData((prev) => ({
        ...prev,
        restrictions: [...prev.restrictions, customRestriction.trim()],
      }))
      setCustomRestriction("")
    }
  }

  const removeRestriction = (restriction: string) => {
    setFormData((prev) => ({
      ...prev,
      restrictions: prev.restrictions.filter((r) => r !== restriction),
    }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{item ? "Edit Food Item" : "Add New Food Item"}</CardTitle>
        <CardDescription>
          {item ? "Update the food item details" : "Create a new food item for the menu"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Chicken Sandwich"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Available *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the food item, ingredients, preparation method..."
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <div className="flex items-center gap-4">
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="Image URL or upload an image"
              />
              <Button type="button" variant="outline" className="gap-2 bg-transparent">
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image || "/placeholder.svg"}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-md border"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=128&width=128"
                  }}
                />
              </div>
            )}
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-4">
            <Label>Dietary Restrictions & Allergens</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {commonRestrictions.map((restriction) => (
                <div key={restriction} className="flex items-center space-x-2">
                  <Checkbox
                    id={restriction}
                    checked={formData.restrictions.includes(restriction)}
                    onCheckedChange={() => toggleRestriction(restriction)}
                  />
                  <Label htmlFor={restriction} className="text-sm font-normal">
                    {restriction}
                  </Label>
                </div>
              ))}
            </div>

            {/* Custom Restrictions */}
            <div className="space-y-2">
              <Label>Add Custom Restriction</Label>
              <div className="flex gap-2">
                <Input
                  value={customRestriction}
                  onChange={(e) => setCustomRestriction(e.target.value)}
                  placeholder="Enter custom restriction"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomRestriction())}
                />
                <Button type="button" onClick={addCustomRestriction} variant="outline" className="bg-transparent">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Selected Restrictions */}
            {formData.restrictions.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Restrictions:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.restrictions.map((restriction) => (
                    <Badge key={restriction} variant="secondary" className="gap-1">
                      {restriction}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeRestriction(restriction)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              {item ? "Update Food Item" : "Add Food Item"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
