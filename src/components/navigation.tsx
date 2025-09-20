"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Menu, X, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react"
export function Navigation() {
  const { theme, setTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session } = useSession()
  const role = session?.user.role
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-8">
            {/* Left Logo - Kyndryl */}
            <div className="flex items-center">
              <div className="h-8 w-24 bg-gradient-to-r from-primary to-secondary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">Kyndryl</span>
              </div>
            </div>

            {/* Center Logo - Nmamit Nitte */}
            <div className="hidden md:flex items-center">
              <div className="h-10 w-32 bg-muted rounded-lg flex items-center justify-center border">
                <span className="text-foreground font-semibold">Nmamit Nitte</span>
              </div>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
              Home
            </Link>
            <Link
              href="/team"
              className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Team Portal
            </Link>
            <Link
              href="/admin"
              className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Admin Dashboard
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Right Logo - Microsoft */}
            <div className="hidden md:flex items-center">
              <div className="h-8 w-24 bg-secondary rounded flex items-center justify-center">
                <span className="text-secondary-foreground font-bold text-sm">Microsoft</span>
              </div>
            </div>

            {/* Theme Toggle */}
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

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="py-4 space-y-4 border-t">
            {/* Center Logo - Mobile */}
            <div className="flex justify-center mb-4">
              <div className="h-10 w-32 bg-muted rounded-lg flex items-center justify-center border">
                <span className="text-foreground font-semibold">Nmamit Nitte</span>
              </div>
            </div>

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
            <Link
              href="/admin"
              className="block px-4 py-2 text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Admin Dashboard
            </Link>
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
                      title={ "Logout"}
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                     
                    </Button>

            {/* Right Logo - Mobile */}
            <div className="flex justify-center pt-4">
              <div className="h-8 w-24 bg-secondary rounded flex items-center justify-center">
                <span className="text-secondary-foreground font-bold text-sm">Microsoft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
