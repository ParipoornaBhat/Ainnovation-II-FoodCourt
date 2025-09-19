import { TeamLayout } from "@/components/team-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, LogOut, Settings } from "lucide-react"

export default function TeamProfilePage() {
  const teamInfo = {
    name: "Development Team Alpha",
    members: 8,
    joinDate: "2023-06-15",
    totalOrders: 45,
    activeEvents: 2,
    lastOrder: "2024-01-15",
  }

  const recentActivity = [
    {
      action: "Placed order",
      details: "3 items for Weekly Team Lunch",
      date: "2024-01-15",
    },
    {
      action: "Joined event",
      details: "Holiday Celebration",
      date: "2024-01-10",
    },
    {
      action: "Updated profile",
      details: "Team information updated",
      date: "2024-01-05",
    },
  ]

  return (
    <TeamLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Team Profile</h1>
            <p className="text-muted-foreground">Manage your team information and settings</p>
          </div>
          <Button variant="destructive" className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Team Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Information
              </CardTitle>
              <CardDescription>Your team details and statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Team Name</label>
                  <p className="text-lg font-semibold">{teamInfo.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Team Members</label>
                  <p className="text-lg font-semibold">{teamInfo.members} members</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <p className="text-lg font-semibold">{teamInfo.joinDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Order</label>
                  <p className="text-lg font-semibold">{teamInfo.lastOrder}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Settings className="h-4 w-4" />
                  Edit Team Information
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamInfo.totalOrders}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamInfo.activeEvents}</div>
                <p className="text-xs text-muted-foreground">Currently participating</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Team Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="text-sm">Active</Badge>
                <p className="text-xs text-muted-foreground mt-1">Good standing</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your team's recent actions and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.date}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Account Actions</CardTitle>
            <CardDescription>Manage your team account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Logout from all devices</p>
                <p className="text-sm text-muted-foreground">Sign out from all active sessions</p>
              </div>
              <Button variant="outline" className="bg-transparent">
                Logout All
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Request account deletion</p>
                <p className="text-sm text-muted-foreground">Permanently delete your team account</p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TeamLayout>
  )
}
