"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
	Upload,
	FileText,
	CheckCircle,
	AlertCircle,
	ArrowLeft,
	Download,
	Users,
	Key,
	User,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/trpc/react";

interface BulkUploadTeamsProps {
	eventId: string;
	onComplete?: () => void;
}

interface CSVRow {
	[key: string]: string;
}

interface MappedTeam {
	id: string;
	name: string;
	username: string;
	password: string;
	selected: boolean;
	status: "valid" | "invalid" | "duplicate";
	errors: string[];
}

const REQUIRED_FIELDS = ["name", "username", "password"] as const;
type RequiredField = (typeof REQUIRED_FIELDS)[number];

const FIELD_LABELS: Record<RequiredField, string> = {
	name: "Team Name",
	username: "Username",
	password: "Password",
};

export function BulkUploadTeams({ eventId, onComplete }: BulkUploadTeamsProps) {
	const [step, setStep] = useState<
		"upload" | "mapping" | "preview" | "uploading"
	>("upload");
	const [csvData, setCsvData] = useState<CSVRow[]>([]);
	const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
	const [fieldMapping, setFieldMapping] = useState<
		Record<RequiredField, string>
	>({
		name: "",
		username: "",
		password: "",
	});
	const [mappedTeams, setMappedTeams] = useState<MappedTeam[]>([]);
	const [uploadProgress, setUploadProgress] = useState(0);

	// Get existing usernames to check for duplicates
	const { data: existingTeams } = api.teams.getAll.useQuery();
	const existingUsernames =
		existingTeams?.map((team) => team.username.toLowerCase()) || [];

	const bulkAddMutation = api.teams.bulkAddToEvent.useMutation({
		onSuccess: () => {
			toast.success("Teams added successfully!");
			onComplete?.();
		},
		onError: (error: unknown) => {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			toast.error(`Failed to add teams: ${errorMessage}`);
		},
	});

	const handleFileUpload = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			if (!file.name.endsWith(".csv")) {
				toast.error("Please upload a CSV file");
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				const text = e.target?.result as string;
				const lines = text.split("\n").filter((line) => line.trim());

				if (lines.length < 2) {
					toast.error(
						"CSV file must contain at least a header row and one data row",
					);
					return;
				}

				const headers =
					lines[0]?.split(",").map((h) => h.trim().replace(/"/g, "")) || [];
				const data = lines.slice(1).map((line) => {
					const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
					const row: CSVRow = {};
					headers.forEach((header, index) => {
						row[header] = values[index] || "";
					});
					return row;
				});

				setCsvHeaders(headers);
				setCsvData(data);
				setStep("mapping");
				toast.success(`Loaded ${data.length} rows from CSV`);
			};

			reader.readAsText(file);
		},
		[],
	);

	const validateTeams = useCallback(() => {
		const teams: MappedTeam[] = csvData.map((row, index) => {
			const team: Partial<MappedTeam> = {
				id: `team-${index}`,
				selected: true,
				status: "valid",
				errors: [],
			};

			// Map fields
			REQUIRED_FIELDS.forEach((field) => {
				const csvColumn = fieldMapping[field];
				if (csvColumn && row[csvColumn]) {
					team[field] = row[csvColumn].trim();
				} else {
					team.errors?.push(`Missing ${FIELD_LABELS[field]}`);
				}
			});

			// Validate required fields
			if (!team.name) team.errors?.push("Team name is required");
			if (!team.username) team.errors?.push("Username is required");
			if (!team.password) team.errors?.push("Password is required");

			// Check for duplicate usernames
			if (team.username) {
				const isExistingDuplicate = existingUsernames.includes(
					team.username.toLowerCase(),
				);
				const isCsvDuplicate = csvData.some((otherRow, otherIndex) => {
					if (otherIndex === index) return false;
					const otherUsername = fieldMapping.username
						? otherRow[fieldMapping.username]?.trim().toLowerCase()
						: "";
					return otherUsername === team.username?.toLowerCase();
				});

				if (isExistingDuplicate) {
					team.errors?.push("Username already exists in the system");
				} else if (isCsvDuplicate) {
					team.errors?.push("Duplicate username in CSV");
				}
			}

			team.status = team.errors?.length ? "invalid" : "valid";

			return team as MappedTeam;
		});

		setMappedTeams(teams);
		setStep("preview");
	}, [csvData, fieldMapping, existingUsernames]);

	const handleBulkUpload = async () => {
		const selectedTeams = mappedTeams.filter(
			(team) => team.selected && team.status === "valid",
		);

		if (selectedTeams.length === 0) {
			toast.error("No valid teams selected for upload");
			return;
		}

		setStep("uploading");
		setUploadProgress(0);

		try {
			await bulkAddMutation.mutateAsync({
				eventId,
				teams: selectedTeams.map((team) => ({
					name: team.name,
					username: team.username,
					password: team.password,
				})),
			});
			setUploadProgress(100);
		} catch (error: unknown) {
			console.error("Upload failed:", error);
			setStep("preview");
		}
	};

	const toggleTeamSelection = (teamId: string) => {
		setMappedTeams((teams) =>
			teams.map((team) =>
				team.id === teamId ? { ...team, selected: !team.selected } : team,
			),
		);
	};

	const toggleAllSelection = () => {
		const validTeams = mappedTeams.filter((team) => team.status === "valid");
		const allValidSelected = validTeams.every((team) => team.selected);

		setMappedTeams((teams) =>
			teams.map((team) => ({
				...team,
				selected: team.status === "valid" ? !allValidSelected : team.selected,
			})),
		);
	};

	const selectedCount = mappedTeams.filter(
		(team) => team.selected && team.status === "valid",
	).length;
	const validCount = mappedTeams.filter(
		(team) => team.status === "valid",
	).length;
	const invalidCount = mappedTeams.filter(
		(team) => team.status === "invalid",
	).length;

	const downloadSampleCSV = () => {
		const sampleData = [
			["Team Name", "Username", "Password"],
			["Development Team Alpha", "dev_alpha", "secure123"],
			["Marketing Squad", "marketing_squad", "market456"],
			["QA Engineers", "qa_team", "quality789"],
		];

		const csvContent = sampleData
			.map((row) => row.map((cell) => `"${cell}"`).join(","))
			.join("\n");
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "sample_teams.csv";
		a.click();
		URL.revokeObjectURL(url);
	};

	if (step === "upload") {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild>
						<Link href={`/admin/events/${eventId}/teams`}>
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold">Bulk Add Teams</h1>
						<p className="text-muted-foreground">
							Upload a CSV file to add multiple teams at once
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Upload className="h-5 w-5" />
								Upload CSV File
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
								<FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<div className="space-y-2">
									<p className="text-sm text-muted-foreground">
										Select a CSV file to upload
									</p>
									<Input
										type="file"
										accept=".csv"
										onChange={handleFileUpload}
										className="max-w-xs mx-auto"
									/>
								</div>
							</div>
							<Button
								variant="outline"
								onClick={downloadSampleCSV}
								className="w-full"
							>
								<Download className="h-4 w-4 mr-2" />
								Download Sample CSV
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>CSV Format Requirements</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<Users className="h-5 w-5 text-blue-600 mt-0.5" />
									<div>
										<p className="font-medium">Team Name</p>
										<p className="text-sm text-muted-foreground">
											Unique name for the team
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<User className="h-5 w-5 text-green-600 mt-0.5" />
									<div>
										<p className="font-medium">Username</p>
										<p className="text-sm text-muted-foreground">
											Unique login username
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Key className="h-5 w-5 text-orange-600 mt-0.5" />
									<div>
										<p className="font-medium">Password</p>
										<p className="text-sm text-muted-foreground">
											Team login password
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (step === "mapping") {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button
						variant="outline"
						size="icon"
						onClick={() => setStep("upload")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-3xl font-bold">Map CSV Columns</h1>
						<p className="text-muted-foreground">
							Match your CSV columns to the required fields
						</p>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Column Mapping</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{REQUIRED_FIELDS.map((field) => (
								<div key={field} className="space-y-2">
									<Label htmlFor={field}>{FIELD_LABELS[field]} *</Label>
									<Select
										value={fieldMapping[field]}
										onValueChange={(value) =>
											setFieldMapping((prev) => ({ ...prev, [field]: value }))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select CSV column" />
										</SelectTrigger>
										<SelectContent>
											{csvHeaders.map((header) => (
												<SelectItem key={header} value={header}>
													{header}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							))}
						</div>

						<Separator />

						<div className="space-y-4">
							<h3 className="text-lg font-medium">CSV Preview</h3>
							<div className="border rounded-lg overflow-hidden">
								<Table>
									<TableHeader>
										<TableRow>
											{csvHeaders.slice(0, 5).map((header) => (
												<TableHead key={header}>{header}</TableHead>
											))}
											{csvHeaders.length > 5 && (
												<TableHead>... +{csvHeaders.length - 5} more</TableHead>
											)}
										</TableRow>
									</TableHeader>
									<TableBody>
										{csvData.slice(0, 3).map((row, index) => (
											<TableRow
												key={`preview-row-${
													// biome-ignore lint/suspicious/noArrayIndexKey: <no need to fix>
													index
												}`}
											>
												{csvHeaders.slice(0, 5).map((header) => (
													<TableCell key={header} className="max-w-32 truncate">
														{row[header]}
													</TableCell>
												))}
												{csvHeaders.length > 5 && <TableCell>...</TableCell>}
											</TableRow>
										))}
										{csvData.length > 3 && (
											<TableRow>
												<TableCell
													colSpan={Math.min(csvHeaders.length, 6)}
													className="text-center text-muted-foreground"
												>
													... +{csvData.length - 3} more rows
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						</div>

						<div className="flex gap-2">
							<Button
								onClick={validateTeams}
								disabled={
									!REQUIRED_FIELDS.every((field) => fieldMapping[field])
								}
								className="flex-1"
							>
								Continue to Preview
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (step === "preview") {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button
						variant="outline"
						size="icon"
						onClick={() => setStep("mapping")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div className="flex-1">
						<h1 className="text-3xl font-bold">Review Teams</h1>
						<p className="text-muted-foreground">
							Review and select teams to add to the event
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							onClick={handleBulkUpload}
							disabled={selectedCount === 0 || bulkAddMutation.isPending}
						>
							Add {selectedCount} Teams
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card>
						<CardContent className="pt-6">
							<div className="text-center">
								<div className="text-2xl font-bold text-green-600">
									{validCount}
								</div>
								<div className="text-sm text-muted-foreground">Valid Teams</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-center">
								<div className="text-2xl font-bold text-red-600">
									{invalidCount}
								</div>
								<div className="text-sm text-muted-foreground">
									Invalid Teams
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-center">
								<div className="text-2xl font-bold text-blue-600">
									{selectedCount}
								</div>
								<div className="text-sm text-muted-foreground">Selected</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span>Teams to Add</span>
							<Button
								variant="outline"
								size="sm"
								onClick={toggleAllSelection}
								disabled={validCount === 0}
							>
								{validCount > 0 &&
								mappedTeams
									.filter((t) => t.status === "valid")
									.every((t) => t.selected)
									? "Deselect All Valid"
									: "Select All Valid"}
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">
										<Checkbox
											checked={
												validCount > 0 &&
												mappedTeams
													.filter((t) => t.status === "valid")
													.every((t) => t.selected)
											}
											onCheckedChange={toggleAllSelection}
											disabled={validCount === 0}
										/>
									</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Team Name</TableHead>
									<TableHead>Username</TableHead>
									<TableHead>Issues</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{mappedTeams.map((team) => (
									<TableRow key={team.id}>
										<TableCell>
											<Checkbox
												checked={team.selected}
												onCheckedChange={() => toggleTeamSelection(team.id)}
												disabled={team.status === "invalid"}
											/>
										</TableCell>
										<TableCell>
											<Badge
												variant={
													team.status === "valid" ? "default" : "destructive"
												}
												className="gap-1"
											>
												{team.status === "valid" ? (
													<CheckCircle className="h-3 w-3" />
												) : (
													<AlertCircle className="h-3 w-3" />
												)}
												{team.status}
											</Badge>
										</TableCell>
										<TableCell className="font-medium">{team.name}</TableCell>
										<TableCell>{team.username}</TableCell>
										<TableCell>
											{team.errors.length > 0 && (
												<div className="space-y-1">
													{team.errors.map((error, errorIndex) => (
														<div
															key={`error-${team.id}-${errorIndex}`}
															className="text-xs text-red-600"
														>
															{error}
														</div>
													))}
												</div>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (step === "uploading") {
		return (
			<div className="space-y-6">
				<div className="text-center space-y-4">
					<h1 className="text-3xl font-bold">Adding Teams...</h1>
					<p className="text-muted-foreground">
						Please wait while we add {selectedCount} teams to the event
					</p>
					<div className="max-w-md mx-auto">
						<Progress value={uploadProgress} className="h-2" />
						<p className="text-sm text-muted-foreground mt-2">
							{uploadProgress}% complete
						</p>
					</div>
				</div>
			</div>
		);
	}

	return null;
}
