"use client"

import type React from "react"

import { useState } from "react"
import { AuthLayout } from "@/components/auth-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Users, CheckCircle, HelpCircle } from "lucide-react"
import Link from "next/link"

export default function TeamForgotPasswordPage() {
  const [teamName, setTeamName] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle forgot password logic here
    console.log("Forgot password for team:", teamName)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <AuthLayout>
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Request Submitted</CardTitle>
              <CardDescription>Your password reset request has been sent to administrators</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertDescription>
                A password reset request for team <strong>{teamName}</strong> has been submitted. An administrator will
                contact you with new credentials within 24 hours.
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                For urgent access, please contact your system administrator directly.
              </p>
              <Button variant="outline" onClick={() => setIsSubmitted(false)} className="bg-transparent">
                Try Different Team
              </Button>
            </div>

            <div className="pt-4 border-t text-center">
              <Link
                href="/team/login"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Card className="shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Reset Team Password</CardTitle>
            <CardDescription>Request new credentials for your team</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                type="text"
                placeholder="Enter your team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertDescription>
                Team password resets require administrator approval. You will be contacted with new credentials within
                24 hours.
              </AlertDescription>
            </Alert>

            <Button type="submit" className="w-full h-11 text-base font-medium">
              Request Password Reset
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/team/login"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
