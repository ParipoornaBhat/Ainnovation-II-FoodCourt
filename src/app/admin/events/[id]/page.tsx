"use client";

import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
	Save,
	ArrowLeft,
	Calendar,
	Users,
	Utensils,
	ShoppingCart,
	Trash2,
	RefreshCw,
	Settings,
	Clock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useAppData } from "@/contexts/DataContext";
import { format } from "date-fns";

interface PageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function EventSettings({ params }: PageProps) {
	const resolvedParams = use(params);
	const router = useRouter();
	const { refreshEvents } = useAppData();

	const [formData, setFormData] = useState({
		eventName: "",
		description: "",
		startDate: "",
		endDate: "",
	});
	const [isModified, setIsModified] = useState(false);

	const {
		data: event,
		isLoading,
		refetch,
	} = api.events.getById.useQuery({ id: resolvedParams.id });

	useEffect(() => {
		if (event) {
			setFormData({
				eventName: event.name,
				description: event.description || "",
				startDate: format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm"),
				endDate: format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm"),
			});
		}
	}, [event]);

	const updateEventMutation = api.events.update.useMutation({
		onSuccess: () => {
			toast.success("Event updated successfully");
			setIsModified(false);
			refreshEvents();
			refetch();
		},
		onError: (error) => {
			toast.error(`Failed to update event: ${error.message}`);
		},
	});

	const deleteEventMutation = api.events.delete.useMutation({
		onSuccess: () => {
			toast.success("Event deleted successfully");
			router.push("/admin/events");
			refreshEvents();
		},
		onError: (error) => {
			toast.error(`Failed to delete event: ${error.message}`);
		},
	});

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setIsModified(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!event) return;

		const startDate = new Date(formData.startDate);
		const endDate = new Date(formData.endDate);

		if (endDate <= startDate) {
			toast.error("End date must be after start date");
			return;
		}

		await updateEventMutation.mutateAsync({
			id: event.id,
			eventName: formData.eventName,
			description: formData.description,
			startDate,
			endDate,
		});
	};

	const handleDelete = async () => {
		if (!event) return;
		await deleteEventMutation.mutateAsync({ id: event.id });
	};

	const eventStats = event
		? {
				totalTeams: event.teams?.length || 0,
				totalOrders: event.orders?.length || 0,
				totalRevenue:
					event.orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0,
				foodItems: event.inventory?.inventoryItems?.length || 0,
				activeTeams: event.teams?.length || 0,
			}
		: null;

	if (isLoading) {
		return (
			<AdminLayout>
				<div className="space-y-6">
					<div className="h-8 w-1/3 bg-gray-300 rounded animate-pulse"></div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2">
							<div className="h-96 bg-gray-300 rounded animate-pulse"></div>
						</div>
						<div className="h-64 bg-gray-300 rounded animate-pulse"></div>
					</div>
				</div>
			</AdminLayout>
		);
	}

	if (!event) {
		return (
			<AdminLayout>
				<Card>
					<CardHeader>
						<CardTitle>Event Not Found</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							The event you're looking for doesn't exist or has been deleted.
						</p>
						<Button asChild>
							<Link href="/admin/events">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Events
							</Link>
						</Button>
					</CardContent>
				</Card>
			</AdminLayout>
		);
	}

	const isEventActive =
		new Date() >= new Date(event.startDate) &&
		new Date() <= new Date(event.endDate);
	const isEventPast = new Date() > new Date(event.endDate);

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" asChild>
							<Link href="/admin/events">
								<ArrowLeft className="h-4 w-4" />
							</Link>
						</Button>
						<div>
							<h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
								<Settings className="h-8 w-8" />
								Event Settings
							</h1>
							<p className="text-muted-foreground">
								Configure and manage event details
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Badge
							variant={
								isEventActive
									? "default"
									: isEventPast
										? "destructive"
										: "secondary"
							}
						>
							{isEventActive ? "Active" : isEventPast ? "Ended" : "Upcoming"}
						</Badge>
						<Button variant="outline" onClick={() => refetch()}>
							<RefreshCw className="h-4 w-4 mr-2" />
							Refresh
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Event Details</CardTitle>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="eventName">Event Name</Label>
										<Input
											id="eventName"
											value={formData.eventName}
											onChange={(e) =>
												handleInputChange("eventName", e.target.value)
											}
											placeholder="Enter event name"
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="description">Description</Label>
										<Textarea
											id="description"
											value={formData.description}
											onChange={(e) =>
												handleInputChange("description", e.target.value)
											}
											placeholder="Enter event description (optional)"
											rows={3}
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="startDate">Start Date & Time</Label>
											<Input
												id="startDate"
												type="datetime-local"
												value={formData.startDate}
												onChange={(e) =>
													handleInputChange("startDate", e.target.value)
												}
												required
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="endDate">End Date & Time</Label>
											<Input
												id="endDate"
												type="datetime-local"
												value={formData.endDate}
												onChange={(e) =>
													handleInputChange("endDate", e.target.value)
												}
												required
											/>
										</div>
									</div>

									<div className="flex items-center gap-2 pt-4">
										<Button
											type="submit"
											disabled={!isModified || updateEventMutation.isPending}
											className="flex-1"
										>
											{updateEventMutation.isPending ? (
												<>
													<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
													Saving...
												</>
											) : (
												<>
													<Save className="h-4 w-4 mr-2" />
													Save Changes
												</>
											)}
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Button variant="outline" asChild>
										<Link href={`/admin/events/${event.id}/teams`}>
											<Users className="h-4 w-4 mr-2" />
											Manage Teams
										</Link>
									</Button>
									<Button variant="outline" asChild>
										<Link href={`/admin/events/${event.id}/food`}>
											<Utensils className="h-4 w-4 mr-2" />
											Manage Food Items
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>

						<Card className="border-destructive">
							<CardHeader>
								<CardTitle className="text-destructive">Danger Zone</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<h4 className="font-medium">Delete Event</h4>
										<p className="text-sm text-muted-foreground">
											Permanently delete this event and all associated data.
											This action cannot be undone.
										</p>
									</div>
									<ConfirmationDialog
										title="Delete Event"
										description={`Are you sure you want to delete "${event.name}"? This will permanently delete all teams, orders, and associated data. This action cannot be undone.`}
										onConfirm={handleDelete}
										confirmText="Delete"
										cancelText="Cancel"
										variant="destructive"
									>
										<Button
											variant="destructive"
											disabled={deleteEventMutation.isPending}
										>
											{deleteEventMutation.isPending ? (
												<>
													<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
													Deleting...
												</>
											) : (
												<>
													<Trash2 className="h-4 w-4 mr-2" />
													Delete Event
												</>
											)}
										</Button>
									</ConfirmationDialog>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Event Statistics</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{eventStats && (
									<>
										<div className="grid grid-cols-2 gap-4">
											<div className="text-center p-3 bg-muted/50 rounded-lg">
												<div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
													<Users className="h-3 w-3" />
													<span className="text-xs">Total Teams</span>
												</div>
												<div className="text-xl font-bold">
													{eventStats.totalTeams}
												</div>
											</div>
											<div className="text-center p-3 bg-muted/50 rounded-lg">
												<div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
													<Clock className="h-3 w-3" />
													<span className="text-xs">Active Teams</span>
												</div>
												<div className="text-xl font-bold">
													{eventStats.activeTeams}
												</div>
											</div>
										</div>

										<Separator />

										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2 text-sm">
													<ShoppingCart className="h-4 w-4 text-muted-foreground" />
													<span>Total Orders</span>
												</div>
												<span className="font-medium">
													{eventStats.totalOrders}
												</span>
											</div>

											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2 text-sm">
													<Utensils className="h-4 w-4 text-muted-foreground" />
													<span>Food Items</span>
												</div>
												<span className="font-medium">
													{eventStats.foodItems}
												</span>
											</div>

											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2 text-sm">
													<span className="text-green-600">$</span>
													<span>Total Revenue</span>
												</div>
												<span className="font-medium">
													${eventStats.totalRevenue.toFixed(2)}
												</span>
											</div>
										</div>
									</>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Event Timeline</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<span>Start Date</span>
									</div>
									<p className="text-sm font-medium">
										{new Date(event.startDate).toLocaleString()}
									</p>
								</div>

								<Separator />

								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<span>End Date</span>
									</div>
									<p className="text-sm font-medium">
										{new Date(event.endDate).toLocaleString()}
									</p>
								</div>

								<Separator />

								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span>Duration</span>
									</div>
									<p className="text-sm font-medium">
										{Math.ceil(
											(new Date(event.endDate).getTime() -
												new Date(event.startDate).getTime()) /
												(1000 * 60 * 60 * 24),
										)}{" "}
										days
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}
