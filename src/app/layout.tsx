// src/app/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import "@/styles/globals.css";
import { Toaster } from "sonner";
import { FlashToast } from "@/app/_components/Flash-error";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "@/trpc/react";
import { DataProvider } from "@/contexts/DataContext";
import { Navigation } from "@/components/navigation";

// Load Google Fonts
const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

const robotoMono = Roboto_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	title: "FoodCourt - Corporate Food Ordering",
	description: "Modern food ordering platform for corporate teams",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${inter.variable} ${robotoMono.variable}`}
		>
			<head>
				<title>Hackathon FoodCourt</title>
				<link rel="icon" href="/N.png" type="image/png" />
				{/* You can also add meta tags here if needed */}
			</head>
			<body className="font-sans antialiased">
				<Suspense fallback={null}>
					<TRPCReactProvider>
						<SessionProvider>
							<DataProvider>
								<ThemeProvider
									attribute="class"
									defaultTheme="light"
									enableSystem
									disableTransitionOnChange
								>
									{" "}
									<FlashToast />
									<Navigation />
									{children}
								</ThemeProvider>
							</DataProvider>
						</SessionProvider>
						<Toaster
							position="top-right"
							richColors
							closeButton
							toastOptions={{
								className:
									"mt-11 sm:mt-11 md:mt-10  bg-white text-gray-800 shadow-lg dark:bg-gray-800 dark:text-gray-200",
								style: {
									borderRadius: "8px",
									padding: "16px",
									fontSize: "14px",
								},
							}}
						/>
					</TRPCReactProvider>
				</Suspense>
			</body>
		</html>
	);
}
