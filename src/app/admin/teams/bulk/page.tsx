"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useRouter } from "next/navigation"

export default function BulkTeamUploadPage() {
  const router = useRouter()

  const handleSubmit = (teams: any[]) => {
    // Handle bulk team upload
    console.log("Uploading teams:", teams)
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
          <h1 className="text-3xl font-bold text-foreground">Bulk Team Upload</h1>
          <p className="text-muted-foreground">Upload multiple teams at once using CSV format</p>
        </div>

      </div>
    </AdminLayout>
  )
}
