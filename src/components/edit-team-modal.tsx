"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useAppData } from "@/contexts/DataContext";

interface EditTeamModalProps {
	team: {
		id: string;
		name: string;
		username: string;
		eventId: string;
	};
	onTeamUpdated?: () => void;
	trigger?: React.ReactNode;
}

export function EditTeamModal({
	team,
	onTeamUpdated,
	trigger,
}: EditTeamModalProps) {
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: team.name,
		username: team.username,
		password: "",
	});
	const [isLoading, setIsLoading] = useState(false);

	const { refreshTeams } = useAppData();

	const updateTeamMutation = api.teams.updateTeam.useMutation({
		onSuccess: () => {
			toast.success("Team updated successfully!");
			setOpen(false);
			onTeamUpdated?.();
			refreshTeams();
			setFormData({
				name: team.name,
				username: team.username,
				password: "",
			});
		},
		onError: (error: unknown) => {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			toast.error(`Failed to update team: ${errorMessage}`);
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const updateData: {
				name?: string;
				username?: string;
				password?: string;
			} = {};

			// Only include changed fields
			if (formData.name !== team.name) {
				updateData.name = formData.name;
			}
			if (formData.username !== team.username) {
				updateData.username = formData.username;
			}
			if (formData.password.trim()) {
				updateData.password = formData.password;
			}

			if (Object.keys(updateData).length === 0) {
				toast.info("No changes to save");
				setOpen(false);
				return;
			}

			await updateTeamMutation.mutateAsync({
				id: team.id,
				...updateData,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			name: team.name,
			username: team.username,
			password: "",
		});
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(newOpen) => {
				setOpen(newOpen);
				if (!newOpen) {
					resetForm();
				}
			}}
		>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="ghost" size="sm">
						<Edit className="h-4 w-4 mr-2" />
						Edit
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Team</DialogTitle>
					<DialogDescription>
						Update team information. Leave password empty to keep current
						password.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Team Name</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							placeholder="Enter team name"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="username">Username</Label>
						<Input
							id="username"
							value={formData.username}
							onChange={(e) =>
								setFormData({ ...formData, username: e.target.value })
							}
							placeholder="Enter username"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">New Password (optional)</Label>
						<Input
							id="password"
							type="password"
							value={formData.password}
							onChange={(e) =>
								setFormData({ ...formData, password: e.target.value })
							}
							placeholder="Enter new password (leave empty to keep current)"
						/>
					</div>
					<div className="flex gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading || updateTeamMutation.isPending}
							className="flex-1"
						>
							{isLoading || updateTeamMutation.isPending
								? "Updating..."
								: "Update Team"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
