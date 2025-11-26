"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useScenarioStore } from "@/store/useScenarioStore"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"
import { createSurveyScenario } from "@/lib/survey"
import { apiGet, getUsers } from "@/lib/auth"

interface User {
  id: string
  username: string
  email: string
  fullName: string
  gender: string
  location: string
  role: string
  dateOfBirth: string
  createdAt: string
  updatedAt: string
  bigFive: any
}

interface SurveyFormProps {
  onScenarioCreated?: () => void
}

export function SurveyForm({ onScenarioCreated }: SurveyFormProps) {
  const { generateScenario } = useScenarioStore()
  const { toast } = useToast()

  const [minAge, setMinAge] = useState("")
  const [maxAge, setMaxAge] = useState("")
  const [percentage, setPercentage] = useState("")
  const [location, setLocation] = useState("")
  const [selectedGender, setSelectedGender] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleGenerate = async () => {
    const min = Number.parseInt(minAge, 10);
    const max = Number.parseInt(maxAge, 10);
    const pct = Number.parseInt(percentage, 10);
    if (!location || location.trim() === "") {
      toast({
        title: "Missing Location",
        description: "Please enter a location.",
        variant: "destructive",
      })
      return
    }

    if (Number.isNaN(min) || Number.isNaN(max)) {
      toast({ title: "Invalid Age", description: "Ages must be numbers.", variant: "destructive" })
      return
    }

    if (min < 10 || max > 100) {
      toast({
        title: "Invalid Age Range",
        description: "Age must be between 10 and 100.",
        variant: "destructive",
      })
      return
    }

    if (min >= max) {
      toast({
        title: "Invalid Age Range",
        description: "Minimum age must be less than maximum age.",
        variant: "destructive",
      })
      return
    }

    if (Number.isNaN(pct) || pct < 1 || pct > 100) {
      toast({
        title: "Invalid Percentage",
        description: "Percentage must be between 1 and 100.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        minAge: min,
        maxAge: max,
        location: location.trim(),
        percentage: pct,
        gender: selectedGender || null,
        questionIds: [] // Initialize with empty array, questions will be selected later
      }

      const created = await createSurveyScenario(payload);
      toast({ title: "Scenario Created", description: "Tạo scenario thành công." })
      setMinAge("")
      setMaxAge("")
      setPercentage("")
      setLocation("")
      setSelectedGender("")

      if (onScenarioCreated) {
        onScenarioCreated()
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to create scenario. Please try again.",
        variant: "destructive",
      })
      console.error("Failed to generate scenario:", e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Create Demographic Scenario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="minAge" className="text-sm font-medium">Min Age</Label>
            <Input
              id="minAge"
              type="number"
              min="10"
              max="100"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              placeholder="Enter minimum age"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAge" className="text-sm font-medium">Max Age</Label>
            <Input
              id="maxAge"
              type="number"
              min="10"
              max="100"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              placeholder="Enter maximum age"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">Location</Label>
            <Input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
            <Select
              value={selectedGender}
              onValueChange={setSelectedGender}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentage" className="text-sm font-medium">Distribution Percentage (%)</Label>
            <Input
              id="percentage"
              type="number"
              min="1"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="Enter percentage"
              className="h-10"
            />
          </div>

        </div>

        <Button
          onClick={handleGenerate}
          className="h-11 w-full text-base font-medium shadow-sm"
          disabled={submitting}
        >
          <Plus className="mr-2 h-5 w-5" />
          {submitting ? "Creating..." : "Generate Scenario"}
        </Button>
      </CardContent>
    </Card>
  )
}
