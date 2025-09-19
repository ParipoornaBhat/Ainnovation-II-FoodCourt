"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Users } from "lucide-react"

interface TeamFormProps {
  team?: {
    id?: number
    name: string
    members: number
    description?: string
  }
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function TeamForm({ team, onSubmit, onCancel }: TeamFormProps) {
  const [formData, setFormData] = useState({
    name: team?.name || "",
    members: team?.members || 1,
    description: team?.description || "",
    password: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {team ? "Edit Team" : "Add New Team"}
        </CardTitle>
        <CardDescription>
          {team ? "Update the team information" : "Create a new team for food ordering"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name *</Label>
            <Input
              id="teamName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Development Team Alpha"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="members">Number of Members *</Label>
            <Input
              id="members"
              type="number"
              min="1"
              value={formData.members}
              onChange={(e) => setFormData({ ...formData, members: Number.parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the team..."
              rows={3}
            />
          </div>

          {!team && (
            <div className="space-y-2">
              <Label htmlFor="password">Team Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Set a password for team login"
                required={!team}
              />
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              {team ? "Update Team" : "Add Team"}
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
