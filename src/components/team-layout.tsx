"use client"

import type React from "react"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ShoppingCart, History, User, LogOut } from "lucide-react"

interface TeamLayoutProps {
  children: React.ReactNode
}

const teamNavItems = [
  {
    title: "Order Food",
    href: "/team",
    icon: ShoppingCart,
  },
  {
    title: "Order History",
    href: "/team/history",
    icon: History,
  },
  {
    title: "Profile",
    href: "/team/profile",
    icon: User,
  },
]

export function TeamLayout({ children }: TeamLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Team Navigation */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <nav className="flex items-center space-x-6">
              {teamNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "gap-2 transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Button>
                  </Link>
                )
              })}
            </nav>

            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
