"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Save, Trash2, X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type TeamCredential = {
	id?: string;
	name: string;
	email: string | null;
	password: string | null;
	isNew?: boolean;
};

interface TeamCredentialsModalProps {
	teamId: string;
	teamName: string;
	trigger: React.ReactNode;
}

export const TeamCredentialsModal = ({
	teamId,
	teamName,
	trigger,
}: TeamCredentialsModalProps) => {
	const [open, setOpen] = useState(false);
	const [credentials, setCredentials] = useState<TeamCredential[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Fetch team credentials query
	const {
		data: teamCredentials,
		isLoading: credentialsLoading,
		refetch,
	} = api.teamCredentials.getByTeamId.useQuery({ teamId }, { enabled: open });

	// Mutations for saving and deleting credentials
	const createCredentialMutation = api.teamCredentials.create.useMutation({
		onSuccess: () => {
			refetch();
			toast.success("Credential added successfully");
		},
		onError: (error) => {
			toast.error(`Failed to add credential: ${error.message}`);
		},
	});

	const updateCredentialMutation = api.teamCredentials.update.useMutation({
		onSuccess: () => {
			refetch();
			toast.success("Credential updated successfully");
		},
		onError: (error) => {
			toast.error(`Failed to update credential: ${error.message}`);
		},
	});

	const deleteCredentialMutation = api.teamCredentials.delete.useMutation({
		onSuccess: () => {
			refetch();
			toast.success("Credential removed successfully");
		},
		onError: (error) => {
			toast.error(`Failed to delete credential: ${error.message}`);
		},
	});

	// Load credentials when data is fetched
	useEffect(() => {
		if (teamCredentials) {
			setCredentials(
				teamCredentials.map((cred) => ({
					id: cred.id,
					name: cred.name || `Credential ${cred.id.slice(-4)}`,
					email: cred.email,
					password: cred.password,
				})),
			);
		}
	}, [teamCredentials]);

	const handleAddCredential = () => {
		setCredentials([
			...credentials,
			{
				name: `New Credential ${credentials.length + 1}`,
				email: "",
				password: "",
				isNew: true,
			},
		]);
	};

	const handleRemoveCredential = async (index: number) => {
		const credential = credentials[index];

		if (!credential) return;

		if (credential.id) {
			await deleteCredentialMutation.mutateAsync({ id: credential.id });
		}

		setCredentials(credentials.filter((_, i) => i !== index));
	};

	const handleUpdateCredential = (
		index: number,
		field: "email" | "password",
		value: string,
	) => {
		const updatedCredentials = [...credentials];
		if (updatedCredentials[index]) {
			updatedCredentials[index] = {
				...updatedCredentials[index],
				[field]: value,
			};
			setCredentials(updatedCredentials);
		}
	};

	const handleSaveCredentials = async () => {
		setIsLoading(true);

		try {
			for (const credential of credentials) {
				if (!credential.email && !credential.password) continue;

				if (credential.isNew || !credential.id) {
					await createCredentialMutation.mutateAsync({
						teamId,
						name: credential.name,
						email: credential.email,
						password: credential.password,
					});
				} else {
					await updateCredentialMutation.mutateAsync({
						id: credential.id,
						name: credential.name,
						email: credential.email,
						password: credential.password,
					});
				}
			}

			setOpen(false);
		} catch (error) {
			console.error("Error saving credentials:", error);
			toast.error("Failed to save credentials");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Key className="h-5 w-5" />
						Team Credentials for {teamName}
					</DialogTitle>
					<DialogDescription>
						Manage email and password combinations for this team
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto">
					{credentialsLoading ? (
						<div className="py-4 text-center text-muted-foreground">
							<div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
							Loading credentials...
						</div>
					) : credentials.length === 0 ? (
						<div className="py-8 text-center text-muted-foreground">
							<p>No credentials added yet</p>
							<p className="text-sm">Click "Add Credential" to create one</p>
						</div>
					) : (
						credentials.map((credential, index) => (
							<div
								key={credential.id || index}
								className="flex items-start gap-2 p-3 border rounded-md bg-muted/20"
							>
								<div className="flex-1 grid grid-cols-3 gap-2">
									<div>
										<Input
											placeholder="Name"
											value={credential.name || ""}
											onChange={(e) => {
												const updatedCredentials = [...credentials];
												if (updatedCredentials[index]) {
													updatedCredentials[index] = {
														...updatedCredentials[index],
														name: e.target.value,
													};
													setCredentials(updatedCredentials);
												}
											}}
										/>
									</div>
									<Input
										placeholder="Email"
										value={credential.email || ""}
										onChange={(e) =>
											handleUpdateCredential(index, "email", e.target.value)
										}
									/>
									<div className="flex gap-2">
										<Input
											placeholder="Password"
											type="password"
											value={credential.password || ""}
											onChange={(e) =>
												handleUpdateCredential(
													index,
													"password",
													e.target.value,
												)
											}
										/>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleRemoveCredential(index)}
											className="flex-shrink-0"
										>
											<Trash2 className="h-4 w-4 text-destructive" />
										</Button>
									</div>
								</div>
							</div>
						))
					)}

					<Button
						variant="outline"
						onClick={handleAddCredential}
						className="w-full"
						type="button"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Credential
					</Button>
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button variant="outline" onClick={() => setOpen(false)}>
						<X className="h-4 w-4 mr-2" />
						Cancel
					</Button>
					<Button onClick={handleSaveCredentials} disabled={isLoading}>
						<Save className="h-4 w-4 mr-2" />
						{isLoading ? "Saving..." : "Save Credentials"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);

	//   return (
	//     <Dialog open={open} onOpenChange={setOpen}>
	//       <DialogTrigger asChild>{trigger}</DialogTrigger>
	//       <DialogContent className="sm:max-w-md">
	//         <DialogHeader>
	//           <DialogTitle className="flex items-center gap-2">
	//             <Key className="h-5 w-5" />
	//             Team Credentials for {teamName}
	//           </DialogTitle>
	//           <DialogDescription>
	//             Manage email and password combinations for this team
	//           </DialogDescription>
	//         </DialogHeader>

	//         <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto">
	//           {credentialsLoading ? (
	//             <div className="py-4 text-center text-muted-foreground">
	//               <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
	//               Loading credentials...
	//             </div>
	//           ) : credentials.length === 0 ? (
	//             <div className="py-8 text-center text-muted-foreground">
	//               <p>No credentials added yet</p>
	//               <p className="text-sm">Click "Add Credential" to create one</p>
	//             </div>
	//           ) : (
	//             credentials.map((credential, index) => (
	//               <div key={credential.id || index} className="flex items-start gap-2 p-3 border rounded-md bg-muted/20">
	//                 <div className="flex-1 grid grid-cols-2 gap-2">
	//                   <Input
	//                     placeholder="Email"
	//                     value={credential.email}
	//                     onChange={(e) => handleUpdateCredential(index, 'email', e.target.value)}
	//                   />
	//                   <div className="flex gap-2">
	//                     <Input
	//                       placeholder="Password"
	//                       type="password"
	//                       value={credential.password}
	//                       onChange={(e) => handleUpdateCredential(index, 'password', e.target.value)}
	//                     />
	//                     <Button
	//                       variant="ghost"
	//                       size="icon"
	//                       onClick={() => handleRemoveCredential(index)}
	//                       className="flex-shrink-0"
	//                     >
	//                       <Trash2 className="h-4 w-4 text-destructive" />
	//                     </Button>
	//                   </div>
	//                 </div>
	//               </div>
	//             ))
	//           )}

	//           <Button
	//             variant="outline"
	//             onClick={handleAddCredential}
	//             className="w-full"
	//             type="button"
	//           >
	//             <Plus className="h-4 w-4 mr-2" />
	//             Add Credential
	//           </Button>
	//         </div>

	//         <DialogFooter className="gap-2 sm:gap-0">
	//           <Button variant="outline" onClick={() => setOpen(false)}>
	//             <X className="h-4 w-4 mr-2" />
	//             Cancel
	//           </Button>
	//           <Button onClick={handleSaveCredentials} disabled={isLoading}>
	//             <Save className="h-4 w-4 mr-2" />
	//             {isLoading ? "Saving..." : "Save Credentials"}
	//           </Button>
	//         </DialogFooter>
	//       </DialogContent>
	//     </Dialog>
	//   );
};
