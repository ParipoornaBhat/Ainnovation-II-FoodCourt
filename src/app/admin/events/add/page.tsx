"use client"
import { AdminLayout } from "@/components/admin-layout"
import { EventForm } from "@/components/event-form"
import { useRouter } from "next/navigation"

export default function AddEventPage() {
  const router = useRouter()

  const handleSubmit = (data: any) => {
    // Handle form submission
    console.log("Creating event:", data)
    // In a real app, this would make an API call
    router.push("/admin/events")
  }

  const handleCancel = () => {
    router.push("/admin/events")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Event</h1>
          <p className="text-muted-foreground">Set up a new food ordering event</p>
        </div>

        <EventForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </AdminLayout>
  )
}
