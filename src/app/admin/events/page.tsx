import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"

export default function EventManagement() {
  const events = [
    {
      id: 1,
      name: "Weekly Team Lunch",
      startDate: "2024-01-15",
      endDate: "2024-01-19",
      status: "active",
      teams: 12,
      orders: 45,
    },
    {
      id: 2,
      name: "Holiday Celebration",
      startDate: "2024-01-20",
      endDate: "2024-01-20",
      status: "upcoming",
      teams: 8,
      orders: 0,
    },
    {
      id: 3,
      name: "Project Milestone Dinner",
      startDate: "2024-01-10",
      endDate: "2024-01-10",
      status: "completed",
      teams: 5,
      orders: 23,
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Event Management</h1>
            <p className="text-muted-foreground">Create and manage food ordering events</p>
          </div>
          <Button className="gap-2" asChild>
            <Link href="/admin/events/add">
              <Plus className="h-4 w-4" />
              Create New Event
            </Link>
          </Button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                  <Badge
                    variant={
                      event.status === "active" ? "default" : event.status === "upcoming" ? "secondary" : "outline"
                    }
                  >
                    {event.status}
                  </Badge>
                </div>
                <CardDescription>
                  {event.startDate === event.endDate
                    ? `Date: ${event.startDate}`
                    : `${event.startDate} - ${event.endDate}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{event.teams} teams</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{event.orders} orders</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Event Form Placeholder */}
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Create Your First Event</CardTitle>
            <CardDescription>Events help organize food ordering for specific time periods or occasions</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="gap-2" asChild>
              <Link href="/admin/events/add">
                <Plus className="h-4 w-4" />
                Create New Event
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
