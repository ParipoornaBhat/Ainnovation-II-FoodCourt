"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useAppData } from "@/contexts/DataContext";

interface AddTeamModalProps {
	eventId: string;
	onTeamAdded?: () => void;
	trigger?: React.ReactNode;
}

export function AddTeamModal({
	eventId,
	onTeamAdded,
	trigger,
}: AddTeamModalProps) {
	const [open, setOpen] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const { refreshTeams } = useAppData();
	const [formData, setFormData] = useState({
		name: "",
		username: "",
		password: "",
	});

	// Initialize with default values when modal opens
	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
	};

	const addTeamMutation = api.teams.addToEvent.useMutation({
		onSuccess: () => {
			toast.success("Team added successfully!");
			setOpen(false);
			setFormData({
				name: "",
				username: "",
				password: "",
			});
			onTeamAdded?.();
		},
		onError: (error: unknown) => {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			toast.error(`Failed to add team: ${errorMessage}`);
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.name.trim()) {
			toast.error("Team name is required");
			return;
		}
		if (!formData.username.trim()) {
			toast.error("Username is required");
			return;
		}
		if (!formData.password.trim()) {
			toast.error("Password is required");
			return;
		}

		await addTeamMutation.mutateAsync(
			{
				eventId,
				name: formData.name.trim(),
				username: formData.username.trim(),
				password: formData.password,
			},
			{
				onSuccess: () => {
					toast.success("Team added successfully!");
					refreshTeams();
				},
			},
		);
	};

	const generatePassword = () => {
		const chars =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const length = 8;
		let password = "";
		for (let i = 0; i < length; i++) {
			password += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		setFormData((prev) => ({ ...prev, password }));
	};

	const defaultTrigger = (
		<Button className="gap-2">
			<Plus className="h-4 w-4" />
			Add Team to Event
		</Button>
	);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add Team to Event</DialogTitle>
					<DialogDescription>
						Create a new team and add them to this event. Team members will use
						these credentials to access the food ordering system.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid gap-4">
						<div className="space-y-2">
							<Label htmlFor="name">Team Name</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, name: e.target.value }))
								}
								placeholder="e.g., Development Team Alpha"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<Input
								id="username"
								value={formData.username}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, username: e.target.value }))
								}
								placeholder="e.g., dev_team_alpha"
								required
							/>
							<p className="text-xs text-muted-foreground">
								Username must be unique across all teams
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="flex gap-2">
								<div className="relative flex-1">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										value={formData.password}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												password: e.target.value,
											}))
										}
										placeholder="Enter password"
										required
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="absolute right-0 top-0 h-full px-3"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>
								<Button
									type="button"
									variant="outline"
									onClick={generatePassword}
								>
									Generate
								</Button>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={addTeamMutation.isPending}>
							{addTeamMutation.isPending ? "Adding..." : "Add Team"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
