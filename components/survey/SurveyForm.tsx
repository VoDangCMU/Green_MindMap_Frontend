"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useScenarioStore } from "@/store/useScenarioStore"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"

const LOCATIONS = ["All Locations", "Đà Nẵng", "Hà Nội", "TP.HCM"]

export function SurveyForm() {
  const { generateScenario } = useScenarioStore()
  const { toast } = useToast()
  const [minAge, setMinAge] = useState("18")
  const [maxAge, setMaxAge] = useState("25")
  const [location, setLocation] = useState("")
  const [percentage, setPercentage] = useState("50")

  const handleGenerate = () => {
    const min = Number.parseInt(minAge)
    const max = Number.parseInt(maxAge)
    const pct = Number.parseInt(percentage)

    // Validation
    if (!location) {
      toast({
        title: "Missing Location",
        description: "Please select a location.",
        variant: "destructive",
      })
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

    if (pct < 1 || pct > 100) {
      toast({
        title: "Invalid Percentage",
        description: "Percentage must be between 1 and 100.",
        variant: "destructive",
      })
      return
    }

    generateScenario(min, max, location, pct / 100, "")

    toast({
      title: "Scenario Created",
      description: "Your demographic scenario has been generated successfully.",
    })

    // Reset form
    setMinAge("18")
    setMaxAge("25")
    setLocation("")
    setPercentage("50")
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Create Demographic Scenario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="minAge" className="text-sm font-medium">
              Min Age
            </Label>
            <Input
              id="minAge"
              type="number"
              min="10"
              max="100"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              placeholder="18"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAge" className="text-sm font-medium">
              Max Age
            </Label>
            <Input
              id="maxAge"
              type="number"
              min="10"
              max="100"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              placeholder="25"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">
              Location
            </Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location" className="h-10">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentage" className="text-sm font-medium">
              Distribution Percentage (%)
            </Label>
            <Input
              id="percentage"
              type="number"
              min="1"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="50"
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
