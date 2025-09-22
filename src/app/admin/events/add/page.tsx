"use client";
import { AdminLayout } from "@/components/admin-layout";
import { EventForm } from "@/components/event-form";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EventFormData {
	name: string;
	description?: string;
	startDate: string;
	endDate: string;
}

export default function AddEventPage() {
	const router = useRouter();
	const { mutate: eventsMutation } = api.events.create.useMutation();

	const handleSubmit = (data: EventFormData) => {
		eventsMutation(
			{
				eventName: data.name,
				description: data.description,
				startDate: new Date(data.startDate),
				endDate: new Date(data.endDate),
			},
			{
				onSuccess: () => {
					toast.success("Event created successfully");
					router.push("/admin/events");
				},
				onError: (error) => {
					toast.error(`Failed to create event: ${error.message}`);
				},
			},
		);
	};

	const handleCancel = () => {
		router.push("/admin/events");
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold text-foreground">
						Create New Event
					</h1>
					<p className="text-muted-foreground">
						Set up a new food ordering event
					</p>
				</div>

				<EventForm onSubmit={handleSubmit} onCancel={handleCancel} />
			</div>
		</AdminLayout>
	);
}
