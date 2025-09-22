"use client";

import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Plus,
	Upload,
	Edit,
	Trash2,
	Users,
	ArrowLeft,
	Search,
	MoreVertical,
	Download,
	Key,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState, use } from "react";
import { AddTeamModal } from "@/components/add-team-modal";
import { EditTeamModal } from "@/components/edit-team-modal";
import { TeamCredentialsModal } from "@/components/team-credentials-modal";
import Link from "next/link";
import { api } from "@/trpc/react";
import { useAppData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { generateEventTeamsPDF } from "@/lib/pdf-generator";

interface PageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function EventTeamManagement({ params }: PageProps) {
	const resolvedParams = use(params);
	const eventId = resolvedParams.id;
	const [searchQuery, setSearchQuery] = useState("");

	const { mutateAsync: addTeamToEventFromAvailable } =
		api.teams.addTeamToEventFromAvailable.useMutation();
	// Get data using tRPC and DataContext
	const { getEventById, refreshTeams } = useAppData();
	const event = getEventById(eventId);

	const {
		data: eventTeams,
		isLoading: teamsLoading,
		refetch: refetchEventTeams,
	} = api.teams.getTeamsByEvent.useQuery({ eventId }, { enabled: !!eventId });

	const { data: allTeams } = api.teams.getAll.useQuery();

	const availableTeams =
		allTeams?.filter(
			(team) => !eventTeams?.some((eventTeam) => eventTeam.id === team.id),
		) || [];

	const deleteTeamMutation = api.teams.deleteTeam.useMutation({
		onSuccess: () => {
			toast.success("Team removed successfully!");
			refetchEventTeams();
			refreshTeams();
		},
		onError: (error) => {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			toast.error(`Failed to remove team: ${errorMessage}`);
		},
	});

	const addToEvent = async (teamId: string) => {
		await addTeamToEventFromAvailable({ teamId, eventId });
		refetchEventTeams();
		refreshTeams();
	};
	const filteredEventTeams =
		eventTeams?.filter((team) =>
			team.name.toLowerCase().includes(searchQuery.toLowerCase()),
		) || [];

	const filteredAvailableTeams = availableTeams.filter((team) =>
		team.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleRemoveTeam = async (teamId: string) => {
		if (confirm("Are you sure you want to remove this team from the event?")) {
			await deleteTeamMutation.mutateAsync({ id: teamId });
		}
	};

	const handleDownloadPDF = async () => {
		if (!eventTeams || eventTeams.length === 0) {
			toast.error("No teams found for this event");
			return;
		}

		if (!event) {
			toast.error("Event not found");
			return;
		}

		try {
			toast.loading("Generating PDF...");
			// Map event teams to ensure they match the Team type expected by the PDF generator
			const teamsForPdf = eventTeams.map((team) => ({
				...team,
				eventId: team.eventId || eventId, // Ensure eventId is never null
			}));
			await generateEventTeamsPDF(teamsForPdf, event.name);
			toast.dismiss();
			toast.success("PDF downloaded successfully!");
		} catch (error) {
			toast.dismiss();
			console.error("Error generating PDF:", error);
			toast.error("Failed to generate PDF");
		}
	};

	if (teamsLoading) {
		return (
			<AdminLayout>
				<div className="flex items-center justify-center h-64">
					<p>Loading teams...</p>
				</div>
			</AdminLayout>
		);
	}

	if (!event) {
		return (
			<AdminLayout>
				<div className="flex items-center justify-center h-64">
					<p>Event not found</p>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild>
						<Link href={`/admin/events/${eventId}`}>
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div className="flex-1">
						<h1 className="text-3xl font-bold text-foreground">
							Team Management
						</h1>
						<p className="text-muted-foreground">
							Manage teams for "{event.name}"
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							className="gap-2"
							onClick={handleDownloadPDF}
							disabled={!eventTeams || eventTeams.length === 0}
						>
							<Download className="h-4 w-4" />
							Download PDF
						</Button>
						<Button variant="outline" className="gap-2" asChild>
							<Link href={`/admin/events/${eventId}/teams/bulk-upload`}>
								<Upload className="h-4 w-4" />
								Bulk Add Teams
							</Link>
						</Button>
						<AddTeamModal
							eventId={eventId}
							onTeamAdded={() => {
								// Refresh data here
							}}
						/>
					</div>
				</div>

				{/* Event Info Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Event Overview
						</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="text-center p-4 bg-muted/50 rounded-lg">
							<div className="text-2xl font-bold">
								{eventTeams?.length || 0}
							</div>
							<div className="text-sm text-muted-foreground">Active Teams</div>
						</div>
						<div className="text-center p-4 bg-muted/50 rounded-lg">
							<div className="text-2xl font-bold">
								{eventTeams?.reduce(
									(sum, team) => sum + team._count.orders,
									0,
								) || 0}
							</div>
							<div className="text-sm text-muted-foreground">Total Orders</div>
						</div>
						<div className="text-center p-4 bg-muted/50 rounded-lg">
							<div className="text-2xl font-bold">
								{eventTeams?.filter((team) => team._count.orders > 0).length ||
									0}
							</div>
							<div className="text-sm text-muted-foreground">
								Teams with Orders
							</div>
						</div>
						<div className="text-center p-4 bg-muted/50 rounded-lg">
							<div className="text-2xl font-bold">{availableTeams.length}</div>
							<div className="text-sm text-muted-foreground">
								Available Teams
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="flex items-center gap-4">
					<div className="relative flex-1 max-w-sm">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search teams..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Teams in This Event</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">
										<Checkbox />
									</TableHead>
									<TableHead>Team Name</TableHead>
									<TableHead>Username</TableHead>
									<TableHead>Orders</TableHead>
									<TableHead>Joined Date</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredEventTeams.map((team) => (
									<TableRow key={team.id} className="hover:bg-muted/50">
										<TableCell>
											<Checkbox />
										</TableCell>
										<TableCell className="font-medium">{team.name}</TableCell>
										<TableCell>{team.username}</TableCell>
										<TableCell>{team._count.orders}</TableCell>
										<TableCell>
											{new Date(team.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-1">
												<TeamCredentialsModal
													teamId={team.id}
													teamName={team.name}
													trigger={
														<Button
															variant="ghost"
															size="icon"
															title="Manage Credentials"
														>
															<Key className="h-4 w-4 text-blue-500" />
														</Button>
													}
												/>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreVertical className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<EditTeamModal
															team={{
																id: team.id,
																name: team.name,
																username: team.username,
																eventId: team.eventId ?? "",
															}}
															onTeamUpdated={() => {
																refetchEventTeams();
																refreshTeams();
															}}
															trigger={
																<DropdownMenuItem
																	onSelect={(e) => e.preventDefault()}
																>
																	<Edit className="mr-2 h-4 w-4" />
																	Edit Team
																</DropdownMenuItem>
															}
														/>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-red-600"
															onClick={() => handleRemoveTeam(team.id)}
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Remove from Event
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<TeamCredentialsModal
															teamId={team.id}
															teamName={team.name}
															trigger={
																<DropdownMenuItem
																	onSelect={(e) => e.preventDefault()}
																>
																	<Key className="mr-2 h-4 w-4" />
																	Manage Credentials
																</DropdownMenuItem>
															}
														/>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Available Teams</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">
										<Checkbox />
									</TableHead>
									<TableHead>Team Name</TableHead>
									<TableHead>Username</TableHead>
									<TableHead>Created Date</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredAvailableTeams.map((team) => (
									<TableRow key={team.id} className="hover:bg-muted/50">
										<TableCell>
											<Checkbox />
										</TableCell>
										<TableCell className="font-medium">{team.name}</TableCell>
										<TableCell>{team.username}</TableCell>
										<TableCell>
											{new Date(team.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="outline"
												size="sm"
												onClick={() => addToEvent(team.id)}
											>
												<Plus className="h-3 w-3 mr-1" />
												Add to Event
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
}
