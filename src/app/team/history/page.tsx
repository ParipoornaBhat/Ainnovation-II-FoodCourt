import { TeamLayout } from "@/components/team-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, Package } from "lucide-react"

export default function OrderHistoryPage() {
  const orderHistory = [
    {
      id: 1,
      eventName: "Weekly Team Lunch",
      date: "2024-01-15",
      time: "12:30 PM",
      items: [
        { name: "Chicken Sandwich", quantity: 2, price: 12.99, previouslyOrdered: 1 },
        { name: "Caesar Salad", quantity: 1, price: 9.99, previouslyOrdered: 0 },
      ],
      status: "pending",
      paymentStatus: "pending",
      total: 3,
      totalAmount: 35.97,
      orderNotes: "Waiting for admin confirmation",
    },
    {
      id: 2,
      eventName: "Project Milestone Celebration",
      date: "2024-01-10",
      time: "6:00 PM",
      items: [
        { name: "Beef Burger", quantity: 1, price: 18.99, previouslyOrdered: 0 },
        { name: "Fish Tacos", quantity: 2, price: 16.75, previouslyOrdered: 0 },
      ],
      status: "delivered",
      paymentStatus: "paid",
      total: 3,
      totalAmount: 52.49,
      orderNotes: "Order completed successfully",
    },
    {
      id: 3,
      eventName: "Weekly Team Lunch",
      date: "2024-01-08",
      time: "12:45 PM",
      items: [
        { name: "Vegetarian Pasta", quantity: 3, price: 14.5, previouslyOrdered: 0 },
        { name: "Quinoa Bowl", quantity: 1, price: 13.25, previouslyOrdered: 1 },
      ],
      status: "in-progress",
      paymentStatus: "paid",
      total: 4,
      totalAmount: 56.75,
      orderNotes: "Being prepared in kitchen",
    },
    {
      id: 4,
      eventName: "Holiday Celebration",
      date: "2024-01-05",
      time: "1:15 PM",
      items: [{ name: "Chicken Sandwich", quantity: 1, price: 12.99, previouslyOrdered: 0 }],
      status: "cancelled",
      paymentStatus: "refunded",
      total: 1,
      totalAmount: 12.99,
      orderNotes: "Cancelled due to event postponement",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Package className="h-4 w-4 text-yellow-500" />
      default:
        return <Package className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "default"
      case "in-progress":
        return "secondary"
      case "cancelled":
        return "destructive"
      case "pending":
        return "outline"
      default:
        return "outline"
    }
  }

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Payment Pending
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Refunded
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <TeamLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order History</h1>
          <p className="text-muted-foreground">View your past food orders and their status</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">January 2024</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$158</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$36</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>
        </div>

        {/* Order History */}
        <div className="space-y-4">
          {orderHistory.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.toString().padStart(4, "0")}</CardTitle>
                    <CardDescription>{order.eventName}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("-", " ")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {order.date} at {order.time}
                  </span>
                  <span>
                    {order.total} items • ${order.totalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Status:</span>
                  {getPaymentStatusBadge(order.paymentStatus)}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Items Ordered:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted/50 rounded-md p-3">
                        <div>
                          <span className="text-sm font-medium">{item.name}</span>
                          <div className="text-xs text-muted-foreground mt-1">
                            <span>Quantity: {item.quantity}</span>
                            {item.previouslyOrdered > 0 && <span> • Previously ordered: {item.previouslyOrdered}</span>}
                            <span> • ${item.price} each</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            x{item.quantity}
                          </Badge>
                          <div className="text-sm font-medium mt-1">${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.orderNotes && (
                  <div className="bg-muted/30 rounded-md p-3">
                    <span className="text-sm font-medium">Status Note: </span>
                    <span className="text-sm text-muted-foreground">{order.orderNotes}</span>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-lg font-bold">${order.totalAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {orderHistory.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No Orders Yet</CardTitle>
              <CardDescription>You haven't placed any orders yet. Start by ordering some food!</CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </TeamLayout>
  )
}
