"use client";

import type { FormEvent } from "react";

import { useState } from "react";
import { AuthLayout } from "@/components/auth-layout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
export default function TeamLoginPage() {
	const router = useRouter();

	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		username: "",
		password: "",
		rememberMe: false,
	});

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		const { username, password } = formData;

		if (!username.trim()) {
			// Replace with your toast/error logic
			alert("Please enter your username.");
			return;
		}

		if (!password.trim()) {
			alert("Please enter your password.");
			return;
		}

		try {
			// Replace signIn with your actual login logic
			const result = await signIn("team-login", {
				username,
				password,
				redirect: false,
			});

			if (result?.error === "CredentialsSignin") {
				alert("Invalid username or password. Please try again.");
			} else if (result?.ok) {
				document.cookie = [
					"flash_success=Login successful!",
					"max-age=10",
					"path=/",
				].join("; ");
				window.location.href = "/team";
			} else {
				alert("An unexpected error occurred. Please try again.");
			}
		} catch (error) {
			console.error("Login error:", error);
			alert("Something went wrong while signing in.");
		}
	};

	return (
		<AuthLayout>
			<Card className="shadow-lg">
				<CardHeader className="text-center space-y-4">
					<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
						<Users className="h-8 w-8 text-primary" />
					</div>
					<div>
						<CardTitle className="text-2xl font-bold">Team Login</CardTitle>
						<CardDescription>
							Access your team's food ordering portal
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<Input
								id="username"
								type="text"
								placeholder="Enter your team username"
								value={formData.username}
								onChange={(e) =>
									setFormData({ ...formData, username: e.target.value })
								}
								required
								className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your team password"
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
									required
									className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>

						<Button type="submit" className="w-full h-11 text-base font-medium">
							Sign In to Team Portal
						</Button>
					</form>

					<div className="mt-6 text-center space-y-4">
						<div className="pt-4 border-t">
							<p className="text-sm text-muted-foreground">
								Need admin access?{" "}
								<Link
									href="/admin/login"
									className="text-primary hover:text-primary/80 transition-colors duration-200"
								>
									Admin Login
								</Link>
							</p>
						</div>
					</div>

					{/* Demo Teams */}
					<div className="mt-6 p-4 bg-muted/50 rounded-lg">
						<h4 className="text-sm font-medium mb-2">Demo Teams:</h4>
						<div className="text-xs text-muted-foreground space-y-1">
							<p>• Use your team username and password</p>
							<p>• Contact admin if you forgot credentials</p>
							<p>• Teams must be registered to an event to order</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</AuthLayout>
	);
}
