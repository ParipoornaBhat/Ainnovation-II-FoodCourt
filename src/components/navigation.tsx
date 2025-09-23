"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
export function Navigation() {
	const { data: session } = useSession();
	const { theme, setTheme } = useTheme();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	return (
		<nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center w-full">
					{/* Logo Section (optional, left-aligned) */}
					<div className="flex items-center min-w-[120px]">
						{/* ...existing code for logo... */}
					</div>

					{/* Navigation Links - Centered */}
					<div className="hidden md:flex flex-1 items-center justify-center space-x-10">
						<Link
							href="/"
							className="ml-32 text-foreground hover:text-primary transition-colors duration-200 font-medium"
						>
							Home
						</Link>
						<Link
							href="/team"
							className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
						>
							Team Portal
						</Link>
						{/* <Link
							href="/admin"
							className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
						>
							Admin Dashboard
						</Link> */}
					</div>

					{/* Right Section - All controls aligned right */}
					<div className="flex items-center justify-end w-full space-x-2">
						{/* ...existing code for right controls... */}
						<div className="hidden md:flex items-center">
							{/* ...existing code for right logo... */}
						</div>
						<div className="hidden md:block">
							<Link href="/quicklink">
								<Button className="bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-500 shadow-lg rounded-lg">
									🔗 Quick Links
								</Button>
							</Link>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setTheme(theme === "light" ? "dark" : "light")}
							className="h-9 w-9 hover:bg-accent hover:text-accent-foreground transition-all duration-200"
						>
							<Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
							<span className="sr-only">Toggle theme</span>
						</Button>
						{/* Always reserve space for logout button */}
						<div className="hidden md:block w-10">
							{session ? (
								<Button
									variant="ghost"
									size="icon"
									onClick={async () => {
										await signOut({ redirect: false });
										document.cookie = [
											"flash_success=You are signed out successfully.",
											"max-age=5",
											"path=/",
										].join("; ");
										window.location.href = "/";
									}}
									className="h-9 w-9 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
								>
									<LogOut className="h-4 w-4 flex-shrink-0" />
								</Button>
							) : (
								<div className="h-9 w-9"></div>
							)}
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden h-9 w-9"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						>
							{isMobileMenuOpen ? (
								<X className="h-4 w-4" />
							) : (
								<Menu className="h-4 w-4" />
							)}
							<span className="sr-only">Toggle menu</span>
						</Button>
					</div>
				</div>

				{/* Mobile Menu */}
				{/* Mobile Menu (Floating Overlay) */}
				<div
					className={cn(
						"fixed inset-x-0 top-16 z-50 md:hidden bg-background shadow-lg border-b transition-all duration-300 ease-in-out",
						isMobileMenuOpen
							? "max-h-screen opacity-100"
							: "max-h-0 opacity-0 pointer-events-none",
					)}
				>
					<div className="py-4 space-y-4 overflow-y-auto max-h-[80vh]">
						<Link
							href="/"
							className="block px-4 py-2 text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-all duration-200"
							onClick={() => setIsMobileMenuOpen(false)}
						>
							Home
						</Link>
						<Link
							href="/team"
							className="block px-4 py-2 text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-all duration-200"
							onClick={() => setIsMobileMenuOpen(false)}
						>
							Team Portal
						</Link>
						{/* <Link
							href="/admin"
							className="block px-4 py-2 text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-all duration-200"
							onClick={() => setIsMobileMenuOpen(false)}
						>
							Admin Dashboard
						</Link> */}

						<Link
							href="/quicklink"
							className="block px-4 py-2 text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-all duration-200"
							onClick={() => setIsMobileMenuOpen(false)}
						>
							Quick Links
						</Link>

						{session ? (
							<Button
								variant="ghost"
								onClick={async () => {
									await signOut({ redirect: false });
									document.cookie = [
										"flash_success=You are signed out successfully.",
										"max-age=5",
										"path=/",
									].join("; ");
									window.location.href = "/";
								}}
								className={cn(
									"w-full justify-start gap-3 h-10 text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground transition-all duration-200",
								)}
								title="Logout"
							>
								<LogOut className="h-4 w-4 flex-shrink-0" /> Logout
							</Button>
						) : null}
					</div>
				</div>
			</div>
		</nav>
	);
}
