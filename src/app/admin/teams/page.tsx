"use client";

import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Plus,
	Upload,
	Edit,
	Trash2,
	Users,
	Search,
	MoreHorizontal,
	Eye,
	Clock,
	DollarSign,
	ShoppingCart,
	RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useAppData } from "@/contexts/DataContext";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EditTeamModal } from "@/components/edit-team-modal";
import { formatDistanceToNow } from "date-fns";

type SortField = "name" | "event" | "orders" | "lastOrder";
type SortDirection = "asc" | "desc";

export default function TeamManagement() {
	const { teams, events, refreshTeams, refreshAll } = useAppData();
	const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [eventFilter, setEventFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [sortField, setSortField] = useState<SortField>("name");
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
	const [showOrderHistory, setShowOrderHistory] = useState<string | null>(null);

	const teamStatsQuery = api.teams.getTeamStats.useQuery();

	const deleteTeamMutation = api.teams.deleteTeam.useMutation({
		onSuccess: () => {
			toast.success("Team deleted successfully");
			refreshTeams();
		},
		onError: (error) => {
			toast.error(`Failed to delete team: ${error.message}`);
		},
	});

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedTeams(teams.map((team) => team.id));
		} else {
			setSelectedTeams([]);
		}
	};

	const handleSelectTeam = (teamId: string, checked: boolean) => {
		if (checked) {
			setSelectedTeams([...selectedTeams, teamId]);
		} else {
			setSelectedTeams(selectedTeams.filter((id) => id !== teamId));
		}
	};

	const handleDeleteTeam = async (teamId: string) => {
		await deleteTeamMutation.mutateAsync({ id: teamId });
		setSelectedTeams(selectedTeams.filter((id) => id !== teamId));
	};

	const filteredAndSortedTeams = useMemo(() => {
		const filtered = teams.filter((team) => {
			const matchesSearch =
				team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				team.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
				team.event?.name.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesEvent =
				eventFilter === "all" || team.eventId === eventFilter;

			// Since teams no longer have expiration dates, all teams are considered active
			const matchesStatus = statusFilter === "all" || statusFilter === "active";

			return matchesSearch && matchesEvent && matchesStatus;
		});

		filtered.sort((a, b) => {
			let aValue: string | number | Date;
			let bValue: string | number | Date;

			switch (sortField) {
				case "name":
					aValue = a.name.toLowerCase();
					bValue = b.name.toLowerCase();
					break;
				case "event":
					aValue = a.event?.name.toLowerCase() || "";
					bValue = b.event?.name.toLowerCase() || "";
					break;
				case "orders":
					aValue = a._count.orders;
					bValue = b._count.orders;
					break;
				case "lastOrder":
					aValue = a.orders[0]?.placedAt || new Date(0);
					bValue = b.orders[0]?.placedAt || new Date(0);
					break;
				default:
					return 0;
			}

			if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
			if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
			return 0;
		});

		return filtered;
	}, [teams, searchTerm, eventFilter, statusFilter, sortField, sortDirection]);

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const getTeamStatus = () => {
		return "active";
	};

	const getTeamStatusBadge = () => {
		const status = getTeamStatus();
		return <Badge variant="default">{status}</Badge>;
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-foreground">
							Team Management
						</h1>
						<p className="text-muted-foreground">
							Manage teams and their access to the ordering system
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							className="gap-2 bg-transparent"
							onClick={refreshAll}
						>
							<RefreshCw className="h-4 w-4" />
							Refresh
						</Button>
						<Button variant="outline" className="gap-2 bg-transparent" asChild>
							<Link href="/admin/teams/bulk">
								<Upload className="h-4 w-4" />
								Add Multiple Teams
							</Link>
						</Button>
						<Button className="gap-2" asChild>
							<Link href="/admin/teams/add">
								<Plus className="h-4 w-4" />
								Add Team
							</Link>
						</Button>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Teams</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{teamStatsQuery.data?.totalTeams ?? teams.length}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Active Teams
							</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{teams.length}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Teams with Orders
							</CardTitle>
							<ShoppingCart className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{teamStatsQuery.data?.teamsWithOrders ??
									teams.filter((t) => t._count.orders > 0).length}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Orders
							</CardTitle>
							<DollarSign className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{teams.reduce((sum, team) => sum + team._count.orders, 0)}
							</div>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="flex-1">
								<div className="relative">
									<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search teams, usernames, or events..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-9"
									/>
								</div>
							</div>
							<Select value={eventFilter} onValueChange={setEventFilter}>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder="Filter by event" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Events</SelectItem>
									{events.map((event) => (
										<SelectItem key={event.id} value={event.id}>
											{event.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-[150px]">
									<SelectValue placeholder="Filter by status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="expired">Expired</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Teams Table */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>Teams ({filteredAndSortedTeams.length})</CardTitle>
							<div className="flex gap-2">
								{selectedTeams.length > 0 && (
									<ConfirmationDialog
										title="Delete Selected Teams"
										description={`Are you sure you want to delete ${selectedTeams.length} team(s)? This action cannot be undone.`}
										onConfirm={() => {
											selectedTeams.forEach((teamId) =>
												handleDeleteTeam(teamId),
											);
											setSelectedTeams([]);
										}}
										variant="destructive"
									>
										<Button variant="outline" size="sm">
											<Trash2 className="h-4 w-4 mr-2" />
											Delete Selected ({selectedTeams.length})
										</Button>
									</ConfirmationDialog>
								)}
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">
										<Checkbox
											checked={
												selectedTeams.length ===
													filteredAndSortedTeams.length &&
												filteredAndSortedTeams.length > 0
											}
											onCheckedChange={handleSelectAll}
										/>
									</TableHead>
									<TableHead
										className="cursor-pointer hover:bg-muted/50"
										onClick={() => handleSort("name")}
									>
										Team Name{" "}
										{sortField === "name" &&
											(sortDirection === "asc" ? "↑" : "↓")}
									</TableHead>
									<TableHead>Username</TableHead>
									<TableHead
										className="cursor-pointer hover:bg-muted/50"
										onClick={() => handleSort("event")}
									>
										Event{" "}
										{sortField === "event" &&
											(sortDirection === "asc" ? "↑" : "↓")}
									</TableHead>
									<TableHead
										className="cursor-pointer hover:bg-muted/50"
										onClick={() => handleSort("orders")}
									>
										Orders{" "}
										{sortField === "orders" &&
											(sortDirection === "asc" ? "↑" : "↓")}
									</TableHead>
									<TableHead>Status</TableHead>
									<TableHead
										className="cursor-pointer hover:bg-muted/50"
										onClick={() => handleSort("lastOrder")}
									>
										Last Order{" "}
										{sortField === "lastOrder" &&
											(sortDirection === "asc" ? "↑" : "↓")}
									</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredAndSortedTeams.map((team) => (
									<TableRow key={team.id} className="hover:bg-muted/50">
										<TableCell>
											<Checkbox
												checked={selectedTeams.includes(team.id)}
												onCheckedChange={(checked) =>
													handleSelectTeam(team.id, checked as boolean)
												}
											/>
										</TableCell>
										<TableCell className="font-medium">{team.name}</TableCell>
										<TableCell className="text-muted-foreground">
											{team.username}
										</TableCell>
										<TableCell>
											<Badge variant="outline">
												{team.event?.name || "No Event"}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<span>{team._count.orders}</span>
												{team._count.orders > 0 && (
													<Button
														variant="ghost"
														size="sm"
														className="h-6 w-6 p-0"
														onClick={() =>
															setShowOrderHistory(
																showOrderHistory === team.id ? null : team.id,
															)
														}
													>
														<Eye className="h-3 w-3" />
													</Button>
												)}
											</div>
										</TableCell>
										<TableCell>{getTeamStatusBadge()}</TableCell>
										<TableCell>
											{team.orders[0] ? (
												<span className="text-sm text-muted-foreground">
													{formatDistanceToNow(
														new Date(team.orders[0].placedAt),
														{ addSuffix: true },
													)}
												</span>
											) : (
												<span className="text-sm text-muted-foreground">
													Never
												</span>
											)}
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreHorizontal className="h-4 w-4" />
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
															refreshTeams();
														}}
														trigger={
															<DropdownMenuItem
																onSelect={(e) => e.preventDefault()}
															>
																<Edit className="h-4 w-4 mr-2" />
																Edit Team
															</DropdownMenuItem>
														}
													/>
													<DropdownMenuItem
														onClick={() =>
															setShowOrderHistory(
																showOrderHistory === team.id ? null : team.id,
															)
														}
													>
														<Eye className="h-4 w-4 mr-2" />
														View Orders
													</DropdownMenuItem>
													<ConfirmationDialog
														title="Delete Team"
														description={`Are you sure you want to delete "${team.name}"? This action cannot be undone.`}
														onConfirm={() => handleDeleteTeam(team.id)}
														variant="destructive"
													>
														<DropdownMenuItem
															onSelect={(e) => e.preventDefault()}
														>
															<Trash2 className="h-4 w-4 mr-2" />
															Delete Team
														</DropdownMenuItem>
													</ConfirmationDialog>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						{/* Order History Modal */}
						{showOrderHistory && (
							<Dialog
								open={!!showOrderHistory}
								onOpenChange={() => setShowOrderHistory(null)}
							>
								<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
									<DialogHeader>
										<DialogTitle>
											Order History -{" "}
											{teams.find((t) => t.id === showOrderHistory)?.name}
										</DialogTitle>
									</DialogHeader>
									<div className="space-y-4">
										{teams
											.find((t) => t.id === showOrderHistory)
											?.orders.map((order) => (
												<Card key={order.id}>
													<CardHeader className="pb-3">
														<div className="flex items-center justify-between">
															<div>
																<p className="font-medium">
																	Order #{order.id}
																</p>
																<p className="text-sm text-muted-foreground">
																	{new Date(order.placedAt).toLocaleString()}
																</p>
															</div>
															<div className="text-right">
																<p className="font-bold">
																	${order.totalAmount.toFixed(2)}
																</p>
																<Badge
																	variant={
																		order.orderStatus === "COMPLETED"
																			? "default"
																			: "secondary"
																	}
																>
																	{order.orderStatus}
																</Badge>
															</div>
														</div>
													</CardHeader>
													<CardContent>
														<div className="space-y-2">
															{order?.items?.map((item) => (
																<div
																	key={item.id}
																	className="flex items-center justify-between"
																>
																	<div className="flex items-center gap-3">
																		<span className="font-medium">
																			{item.foodItem?.name}
																		</span>
																		<span className="text-muted-foreground">
																			x{item.quantity}
																		</span>
																	</div>
																	<span className="font-medium">
																		${item.priceAtOrder.toFixed(2)}
																	</span>
																</div>
															))}
														</div>
													</CardContent>
												</Card>
											))}
									</div>
								</DialogContent>
							</Dialog>
						)}

						{filteredAndSortedTeams.length === 0 && (
							<div className="text-center py-8 text-muted-foreground">
								No teams found matching your filters.
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
}
