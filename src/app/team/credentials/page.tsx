"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TeamLayout } from "@/components/team-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, Copy, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface TeamCredential {
	id: string;
	email: string | null;
	password: string | null;
	name: string;
}

export default function TeamCredentialsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [credentials, setCredentials] = useState<TeamCredential[]>([]);
	const [loading, setLoading] = useState(true);
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const teamId = session?.user?.id;

	const { data: teamCredentials, isLoading } =
		api.teamCredentials.getByTeamId.useQuery(
			{ teamId: teamId || "" },
			{ enabled: !!teamId },
		);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/team/login");
		}
	}, [status, router]);

	useEffect(() => {
		if (teamCredentials) {
			setCredentials(teamCredentials);
			setLoading(false);
		}
	}, [teamCredentials]);

	const copyToClipboard = (text: string | null, id: string) => {
		if (!text) return;

		navigator.clipboard
			.writeText(text)
			.then(() => {
				setCopiedId(id);
				toast.success("Copied to clipboard!");

				setTimeout(() => {
					setCopiedId(null);
				}, 2000);
			})
			.catch((err) => {
				console.error("Failed to copy: ", err);
				toast.error("Failed to copy to clipboard");
			});
	};

	if (status === "loading" || isLoading) {
		return (
			<TeamLayout>
				<div className="flex items-center justify-center h-64">
					<div className="text-center space-y-4">
						<div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
						<p className="text-muted-foreground">Loading credentials...</p>
					</div>
				</div>
			</TeamLayout>
		);
	}

	if (!session?.user) {
		return null;
	}

	return (
		<TeamLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<Button variant="outline" size="icon" asChild>
								<Link href="/team/dashboard">
									<ArrowLeft className="h-4 w-4" />
								</Link>
							</Button>
							<h1 className="text-2xl font-bold text-foreground">
								Team Credentials
							</h1>
						</div>
						<p className="text-muted-foreground">
							Your team's access credentials for event resources
						</p>
					</div>
				</div>

				<Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/10 dark:border-blue-900/40">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Key className="h-5 w-5 text-blue-600" />
							Credentials for {session.user.teamName}
						</CardTitle>
					</CardHeader>
					<CardContent>
						{credentials.length === 0 ? (
							<div className="text-center py-8">
								<p className="text-lg font-medium">No credentials available</p>
								<p className="text-sm text-muted-foreground">
									Your team doesn't have any credentials assigned yet.
								</p>
							</div>
						) : (
							<div className="space-y-4">
								<div className="grid grid-cols-3 gap-4 font-medium text-sm text-muted-foreground p-2">
									<div>Name</div>
									<div>Email</div>
									<div>Password</div>
								</div>
								<div className="divide-y">
									{credentials.map((credential) => (
										<div
											key={credential.id}
											className="grid grid-cols-3 gap-4 py-4"
										>
											<div className="font-medium truncate">
												{credential.name || "Unnamed"}
											</div>
											<div className="flex items-center gap-2">
												<span className="truncate">
													{credential.email || "N/A"}
												</span>
												{credential.email && (
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6"
														onClick={() =>
															copyToClipboard(
																credential.email,
																`email-${credential.id}`,
															)
														}
													>
														{copiedId === `email-${credential.id}` ? (
															<Check className="h-3.5 w-3.5 text-green-600" />
														) : (
															<Copy className="h-3.5 w-3.5 text-muted-foreground" />
														)}
													</Button>
												)}
											</div>
											<div className="flex items-center gap-2">
												<span className="truncate font-mono">
													{credential.password ? "••••••••" : "N/A"}
												</span>
												{credential.password && (
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6"
														onClick={() =>
															copyToClipboard(
																credential.password,
																`password-${credential.id}`,
															)
														}
													>
														{copiedId === `password-${credential.id}` ? (
															<Check className="h-3.5 w-3.5 text-green-600" />
														) : (
															<Copy className="h-3.5 w-3.5 text-muted-foreground" />
														)}
													</Button>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4 text-sm">
							<p className="font-medium text-amber-800 dark:text-amber-200">
								Important Note
							</p>
							<p className="text-amber-700 dark:text-amber-300/80 mt-1">
								These credentials are for accessing event-specific resources.
								Keep them secure and do not share them with other teams.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</TeamLayout>
	);
}
