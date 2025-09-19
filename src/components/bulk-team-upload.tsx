"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Download, Users, AlertCircle } from "lucide-react"

interface BulkTeamUploadProps {
  onSubmit: (teams: any[]) => void
  onCancel: () => void
}

export function BulkTeamUpload({ onSubmit, onCancel }: BulkTeamUploadProps) {
  const [csvData, setCsvData] = useState("")
  const [parsedTeams, setParsedTeams] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const sampleCSV = `Team Name,Members,Description,Password
Development Team Alpha,8,Frontend and backend developers,dev123
Marketing Squad,5,Marketing and communications team,marketing456
Design Team,6,UI/UX designers and graphic artists,design789`

  const parseCSV = () => {
    const lines = csvData.trim().split("\n")
    if (lines.length < 2) {
      setErrors(["CSV must have at least a header row and one data row"])
      return
    }

    const headers = lines[0].split(",").map((h) => h.trim())
    const expectedHeaders = ["Team Name", "Members", "Description", "Password"]

    if (!expectedHeaders.every((header) => headers.includes(header))) {
      setErrors([`CSV must include headers: ${expectedHeaders.join(", ")}`])
      return
    }

    const teams: any[] = []
    const newErrors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())
      if (values.length !== headers.length) {
        newErrors.push(`Row ${i + 1}: Incorrect number of columns`)
        continue
      }

      const team = {
        name: values[headers.indexOf("Team Name")],
        members: Number.parseInt(values[headers.indexOf("Members")]) || 0,
        description: values[headers.indexOf("Description")],
        password: values[headers.indexOf("Password")],
      }

      if (!team.name || !team.password) {
        newErrors.push(`Row ${i + 1}: Team name and password are required`)
        continue
      }

      if (team.members <= 0) {
        newErrors.push(`Row ${i + 1}: Members must be greater than 0`)
        continue
      }

      teams.push(team)
    }

    setErrors(newErrors)
    setParsedTeams(teams)
  }

  const handleSubmit = () => {
    if (parsedTeams.length > 0 && errors.length === 0) {
      onSubmit(parsedTeams)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([sampleCSV], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "team_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Team Upload
        </CardTitle>
        <CardDescription>Upload multiple teams using CSV format</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <h4 className="font-medium">Need a template?</h4>
            <p className="text-sm text-muted-foreground">Download a CSV template with the correct format</p>
          </div>
          <Button variant="outline" onClick={downloadTemplate} className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </div>

        {/* CSV Input */}
        <div className="space-y-2">
          <Label htmlFor="csvData">CSV Data</Label>
          <Textarea
            id="csvData"
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder={`Paste your CSV data here or use this format:\n\n${sampleCSV}`}
            rows={10}
            className="font-mono text-sm"
          />
        </div>

        {/* Parse Button */}
        <Button onClick={parseCSV} variant="outline" className="w-full bg-transparent">
          Parse CSV Data
        </Button>

        {/* Errors */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Please fix the following errors:</p>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Parsed Teams Preview */}
        {parsedTeams.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <h4 className="font-medium">Parsed Teams ({parsedTeams.length})</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
              {parsedTeams.map((team, index) => (
                <Card key={index} className="p-3">
                  <div className="space-y-1">
                    <p className="font-medium">{team.name}</p>
                    <p className="text-sm text-muted-foreground">{team.members} members</p>
                    {team.description && <p className="text-sm text-muted-foreground">{team.description}</p>}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <Button onClick={handleSubmit} disabled={parsedTeams.length === 0 || errors.length > 0} className="flex-1">
            Upload {parsedTeams.length} Teams
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
