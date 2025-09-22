"use client";

import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Plus,
	Calendar,
	Clock,
	Users,
	Utensils,
	Settings,
	MoreVertical,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useAppData } from "@/contexts/DataContext";

export default function EventManagement() {
	const { events, eventsLoading: isLoading } = useAppData();

	if (isLoading) {
		return (
			<AdminLayout>
				<div>
					<div className="h-4 w-1/4 mb-2 bg-gray-400 rounded animate-pulse"></div>
					<div className="h-6 w-1/2 mb-6 bg-gray-400 rounded animate-pulse"></div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{Array.from({ length: 3 }).map((_, index) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: <its fine>
								key={index}
								className="border border-gray-400 rounded-lg p-4 shadow animate-pulse"
							>
								<div className="h-6 w-3/4 mb-2 bg-gray-400 rounded"></div>
								<div className="h-4 w-full mb-4 bg-gray-400 rounded"></div>
								<div className="h-4 w-1/2 mb-2 bg-gray-400 rounded"></div>
								<div className="h-4 w-1/3 mb-2 bg-gray-400 rounded"></div>
								<div className="h-4 w-1/4 bg-gray-400 rounded"></div>
							</div>
						))}
					</div>
				</div>
			</AdminLayout>
		);
	}
	return (
		<AdminLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-foreground">
							Event Management
						</h1>
						<p className="text-muted-foreground">
							Create and manage food ordering events
						</p>
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
					{events && events.length > 0 ? (
						events.map((event) => (
							<Card
								key={event.id}
								className="hover:shadow-lg transition-shadow"
							>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<CardTitle className="text-lg font-semibold">
												{event.name}
											</CardTitle>
											<CardDescription className="text-sm text-muted-foreground">
												{event.description || "No description provided"}
											</CardDescription>
										</div>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="h-8 w-8">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem asChild>
													<Link href={`/admin/events/${event.id}`}>
														<Settings className="mr-2 h-4 w-4" />
														Event Settings
													</Link>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem asChild>
													<Link href={`/admin/events/${event.id}/teams`}>
														<Users className="mr-2 h-4 w-4" />
														Manage Teams
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/admin/events/${event.id}/food`}>
														<Utensils className="mr-2 h-4 w-4" />
														Manage Food
													</Link>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Calendar className="h-4 w-4" />
										<span>
											{new Date(event.startDate).toLocaleDateString()} -{" "}
											{new Date(event.endDate).toLocaleDateString()}
										</span>
									</div>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Clock className="h-4 w-4" />
										<span>
											{new Date(event.startDate).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}{" "}
											-{" "}
											{new Date(event.endDate).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</div>

									{/* Event Stats */}
									<div className="grid grid-cols-2 gap-4 pt-2">
										<div className="text-center p-3 bg-muted/50 rounded-lg">
											<div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
												<Users className="h-3 w-3" />
												<span className="text-xs">Teams</span>
											</div>
											<div className="text-lg font-semibold">
												{event.teamCount || 0}
											</div>
										</div>
										<div className="text-center p-3 bg-muted/50 rounded-lg">
											<div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
												<Utensils className="h-3 w-3" />
												<span className="text-xs">Food Items</span>
											</div>
											<div className="text-lg font-semibold">
												{event.foodItemCount || 0}
											</div>
										</div>
									</div>

									<div className="flex gap-2 pt-2">
										<Button
											variant="outline"
											size="sm"
											className="flex-1"
											asChild
										>
											<Link href={`/admin/events/${event.id}/teams`}>
												<Users className="h-3 w-3 mr-1" />
												Teams
											</Link>
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="flex-1"
											asChild
										>
											<Link href={`/admin/events/${event.id}/food`}>
												<Utensils className="h-3 w-3 mr-1" />
												Food
											</Link>
										</Button>
									</div>

									<div className="flex items-center justify-between pt-2 border-t">
										<span className="text-sm text-muted-foreground">
											Orders
										</span>
										<Badge variant="secondary">{event.orderCount || 0}</Badge>
									</div>
								</CardContent>
							</Card>
						))
					) : (
						<div className="col-span-full">
							<Card className="border-dashed">
								<CardHeader className="text-center">
									<Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<CardTitle>No Events Found</CardTitle>
									<CardDescription>
										Create your first event to start managing teams and food
										ordering
									</CardDescription>
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
					)}
				</div>
			</div>
		</AdminLayout>
	);
}
