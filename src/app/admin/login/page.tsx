"use client"

import type { FormEvent } from "react"
import { redirect, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import {toast} from "sonner"
  
import { useState } from "react"
import { AuthLayout } from "@/components/auth-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  })

    const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  const { username, password } = formData;

  if (!username.trim()) {
    toast.error("Please enter your username or email.");
    return;
  }

  if (!password.trim()) {
    toast.error("Please enter your password.");
    return;
  }

  try {
    const result = await signIn("admin-login", {
      identifier: username, // <- changed from userId to identifier
      password,
      redirect: false,
    });

    if (result?.error === "CredentialsSignin") {
      toast.error("Invalid username/email or password. Please try again.");
    } else if (result?.ok) {
      document.cookie = [
        "flash_success=Login successful!",
        "max-age=10",
        "path=/",
      ].join("; ");
      window.location.href = "/admin"; 
      console.log("Login successful, redirecting to /admin");
    } else {
      toast.error("An unexpected error occurred. Please try again.");
    }
  } catch (err) {
    toast.error("Something went wrong while signing in.");
  }
};


  return (
    <AuthLayout>
      <Card className="shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>Access the administrative dashboard</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  
                  className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            

            <Button type="submit" className="w-full h-11 text-base font-medium">
              Sign In to Admin Panel
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
          

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Need team access?{" "}
                <Link href="/team/login" className="text-primary hover:text-primary/80 transition-colors duration-200">
                  Team Login
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
