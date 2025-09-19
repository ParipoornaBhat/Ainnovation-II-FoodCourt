// src/app/layout.tsx
import type { ReactNode } from "react"
import type { Metadata } from "next"
import { Inter, Roboto_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import "@/styles/globals.css"
import { Toaster } from "sonner";
import { FlashToast } from "@/app/_components/Flash-error";

// Load Google Fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "FoodCourt - Corporate Food Ordering",
  description: "Modern food ordering platform for corporate teams",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${robotoMono.variable}`}
    >
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
            <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              className: "mt-11 sm:mt-11 md:mt-10  bg-white text-gray-800 shadow-lg dark:bg-gray-800 dark:text-gray-200",
              style: {
                borderRadius: "8px",
                padding: "16px",
                fontSize: "14px",
              },
            }}
          />
          <FlashToast />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
