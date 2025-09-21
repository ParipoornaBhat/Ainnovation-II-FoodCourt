"use client";

import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useState } from "react";

export default function EventTeamManagement() {
	const params = useParams();
	const router = useRouter();
	const eventId = params.id as string;
	const [searchQuery, setSearchQuery] = useState("");

	// Mock data - replace with actual tRPC queries
	const event = {
		id: eventId,
		name: "Team Lunch Event",
		description: "Monthly team lunch gathering",
		startDate: new Date("2025-09-22T12:00:00"),
		endDate: new Date("2025-09-22T14:00:00"),
	};

	const eventTeams = [
		{
			id: 1,
			name: "Development Team Alpha",
			members: 8,
			status: "active",
			joinedAt: "2024-01-10",
			orders: 12,
		},
		{
			id: 2,
			name: "Marketing Squad",
			members: 5,
			status: "active",
			joinedAt: "2024-01-12",
			orders: 8,
		},
		{
			id: 4,
			name: "QA Engineers",
			members: 4,
			status: "active",
			joinedAt: "2024-01-14",
			orders: 6,
		},
	];

	const availableTeams = [
		{ id: 3, name: "Design Team", members: 6, status: "available" },
		{ id: 5, name: "Product Management", members: 3, status: "available" },
		{ id: 6, name: "DevOps Team", members: 4, status: "available" },
	];

	const filteredEventTeams = eventTeams.filter((team) =>
		team.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const filteredAvailableTeams = availableTeams.filter((team) =>
		team.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<AdminLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
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
						<Button variant="outline" className="gap-2">
							<Upload className="h-4 w-4" />
							Bulk Add Teams
						</Button>
						<Button className="gap-2">
							<Plus className="h-4 w-4" />
							Add Team to Event
						</Button>
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
							<div className="text-2xl font-bold">{eventTeams.length}</div>
							<div className="text-sm text-muted-foreground">Active Teams</div>
						</div>
						<div className="text-center p-4 bg-muted/50 rounded-lg">
							<div className="text-2xl font-bold">
								{eventTeams.reduce((sum, team) => sum + team.members, 0)}
							</div>
							<div className="text-sm text-muted-foreground">Total Members</div>
						</div>
						<div className="text-center p-4 bg-muted/50 rounded-lg">
							<div className="text-2xl font-bold">
								{eventTeams.reduce((sum, team) => sum + team.orders, 0)}
							</div>
							<div className="text-sm text-muted-foreground">Total Orders</div>
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
									<TableHead>Members</TableHead>
									<TableHead>Orders</TableHead>
									<TableHead>Joined Date</TableHead>
									<TableHead>Status</TableHead>
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
										<TableCell>{team.members}</TableCell>
										<TableCell>{team.orders}</TableCell>
										<TableCell>{team.joinedAt}</TableCell>
										<TableCell>
											<Badge variant="default">{team.status}</Badge>
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem>
														<Edit className="mr-2 h-4 w-4" />
														View Details
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem className="text-red-600">
														<Trash2 className="mr-2 h-4 w-4" />
														Remove from Event
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
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
									<TableHead>Members</TableHead>
									<TableHead>Status</TableHead>
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
										<TableCell>{team.members}</TableCell>
										<TableCell>
											<Badge variant="secondary">{team.status}</Badge>
										</TableCell>
										<TableCell className="text-right">
											<Button variant="outline" size="sm">
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
