import type React from "react"
import { Navigation } from "@/components/navigation"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
