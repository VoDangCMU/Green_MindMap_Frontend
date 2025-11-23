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

  const [locations, setLocations] = useState<string[]>([])
  const [selectedAddress, setSelectedAddress] = useState("")
  const [selectedGender, setSelectedGender] = useState("")
  const [loadingLocs, setLoadingLocs] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await getUsers();
        const users: User[] = Array.isArray(response.data) ? response.data : response.data?.data || []

        const uniqueLocations = Array.from(new Set(
          users
            .filter((user) => user.location && user.location.trim() !== "")
            .map((user) => user.location.trim())
        )).sort()

        setLocations(uniqueLocations)
      } catch (e) {
        console.error("Failed to fetch locations:", e)
        toast({
          title: "Error",
          description: "Failed to fetch locations",
          variant: "destructive",
        })
        setLocations([])
      } finally {
        setLoadingLocs(false)
      }
    }
    fetchLocations()
  }, [toast])

  const handleGenerate = async () => {
    const min = Number.parseInt(minAge, 10);
    const max = Number.parseInt(maxAge, 10);
    const pct = Number.parseInt(percentage, 10);
    if (!selectedAddress) {
      toast({
        title: "Missing Location",
        description: "Please select a location.",
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
      const payload = { minAge: min, maxAge: max, address: selectedAddress, percentage: pct, gender: selectedGender || null }

      const created = await createSurveyScenario(payload);
      toast({ title: "Scenario Created", description: "Tạo scenario thành công." })
      setMinAge("")
      setMaxAge("")
      setPercentage("")
      setSelectedAddress("")
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
            <Select
              value={selectedAddress}
              onValueChange={setSelectedAddress}
              disabled={loadingLocs || locations.length === 0}
            >
              <SelectTrigger id="location" className="h-10 w-full">
                <SelectValue
                  placeholder="Select location"
                />
              </SelectTrigger>
              <SelectContent>
                {locations.length === 0 ? (
                  <SelectItem value="__none" disabled>No locations</SelectItem>
                ) : (
                  locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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

        <Button onClick={handleGenerate} className="h-11 w-full text-base font-medium shadow-sm">
          <Plus className="mr-2 h-5 w-5" />
          Generate Scenario
        </Button>
      </CardContent>
    </Card>
  )
}
