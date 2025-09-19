"use client"
import { AdminLayout } from "@/components/admin-layout"
import { TeamForm } from "@/components/team-form"
import { useRouter } from "next/navigation"

export default function AddTeamPage() {
  const router = useRouter()

  const handleSubmit = (data: any) => {
    // Handle form submission
    console.log("Adding team:", data)
    // In a real app, this would make an API call
    router.push("/admin/teams")
  }

  const handleCancel = () => {
    router.push("/admin/teams")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Team</h1>
          <p className="text-muted-foreground">Create a new team for food ordering</p>
        </div>

        <TeamForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </AdminLayout>
  )
}
