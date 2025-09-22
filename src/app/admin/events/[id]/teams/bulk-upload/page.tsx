"use client";

import { AdminLayout } from "@/components/admin-layout";
import { BulkUploadTeams } from "@/components/bulk-upload-teams";
import { use } from "react";

interface PageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function BulkUploadTeamsPage({ params }: PageProps) {
	const resolvedParams = use(params);
	const eventId = resolvedParams.id;

	return (
		<AdminLayout>
			<BulkUploadTeams
				eventId={eventId}
				onComplete={() => {
					window.location.href = `/admin/events/${eventId}/teams`;
				}}
			/>
		</AdminLayout>
	);
}
