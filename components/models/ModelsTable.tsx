"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, Plus, X } from "lucide-react"

interface Model {
  id: string
  ocean: string
  behavior: string
  age: string
  location: string
  gender: string
  keywords: string
  createdAt: string
  updatedAt: string
}

interface Feedback {
  id: string
  model_id: string
  user_id: string
  trait_checked: string
  expected: number
  actual: number
  deviation: number
  engagement: number
  match: boolean
  level: string
  feedback: string[]
  createdAt: string
  updatedAt: string
}

export function ModelsTable() {
  const router = useRouter()
  const [models, setModels] = useState<Model[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  // Create model states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [formData, setFormData] = useState({
    ocean: "",
    behavior: "",
    ageRange: "18-30",
    genders: [] as string[],
    locations: [] as string[],
    urban: false,
    setting: "",
    event: "",
  })
  const [newLocation, setNewLocation] = useState("")

  const ageRangeOptions = [
    "0-17",
    "18-30",
    "30-50",
    "50-65",
    "65+",
  ]

  const genderOptions = [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
    { value: "other", label: "Khác" },
  ]

  const oceanOptions = ["O", "C", "E", "A", "N"]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("access_token")

      if (!token) {
        console.error("No access token found")
        setLoading(false)
        return
      }

      const [modelsResponse, feedbacksResponse] = await Promise.all([
        fetch("https://green-api.khoav4.com/models/getAll", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("https://green-api.khoav4.com/models/feedbacks", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ])

      const modelsData = await modelsResponse.json()
      const feedbacksData = await feedbacksResponse.json()

      if (modelsData.success) {
        setModels(modelsData.data)
      }

      // Handle both array response and object with data property
      if (Array.isArray(feedbacksData)) {
        setFeedbacks(feedbacksData)
      } else if (feedbacksData.data && Array.isArray(feedbacksData.data)) {
        setFeedbacks(feedbacksData.data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateModel = async () => {
    try {
      setCreateLoading(true)
      const token = localStorage.getItem("access_token")

      if (!token) {
        console.error("No access token found")
        return
      }

      const payload = {
        ocean: formData.ocean,
        behavior: formData.behavior,
        context: {
          population: {
            age_range: formData.ageRange,
            gender: formData.genders,
            locations: formData.locations,
            urban: formData.urban,
          },
          setting: formData.setting,
          event: formData.event,
        },
      }

      const response = await fetch("https://green-api.khoav4.com/models/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        setIsCreateDialogOpen(false)
        resetForm()
        fetchData() // Refresh the table
      } else {
        console.error("Error creating model:", result)
      }
    } catch (error) {
      console.error("Error creating model:", error)
    } finally {
      setCreateLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      ocean: "",
      behavior: "",
      ageRange: "18-30",
      genders: [],
      locations: [],
      urban: false,
      setting: "",
      event: "",
    })
    setNewLocation("")
  }

  const handleAddLocation = () => {
    if (newLocation.trim() && !formData.locations.includes(newLocation.trim())) {
      setFormData({
        ...formData,
        locations: [...formData.locations, newLocation.trim()],
      })
      setNewLocation("")
    }
  }

  const handleRemoveLocation = (location: string) => {
    setFormData({
      ...formData,
      locations: formData.locations.filter((l) => l !== location),
    })
  }

  const handleGenderToggle = (gender: string) => {
    if (formData.genders.includes(gender)) {
      setFormData({
        ...formData,
        genders: formData.genders.filter((g) => g !== gender),
      })
    } else {
      setFormData({
        ...formData,
        genders: [...formData.genders, gender],
      })
    }
  }

  const handleViewFeedback = (model: Model) => {
    router.push(`/dashboard/models-verify/${model.id}`)
  }

  const getModelFeedbackCount = (modelId: string) => {
    return feedbacks.filter((feedback) => feedback.model_id === modelId).length
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Model
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OCEAN</TableHead>
              <TableHead>Behavior</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Keywords</TableHead>
              <TableHead>Feedbacks</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No models found
                </TableCell>
              </TableRow>
            ) : (
              models.map((model) => {
                const feedbackCount = getModelFeedbackCount(model.id)
                return (
                  <TableRow key={model.id}>
                    <TableCell>
                      <Badge variant="outline">{model.ocean}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {model.behavior}
                    </TableCell>
                    <TableCell>{model.age}</TableCell>
                    <TableCell>{model.gender}</TableCell>
                    <TableCell>{model.location}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {model.keywords}
                    </TableCell>
                    <TableCell>
                      {feedbackCount > 0 ? (
                        <Badge variant="secondary">{feedbackCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground">No feedback</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewFeedback(model)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Model Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Model</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* OCEAN Selection */}
            <div className="space-y-2">
              <Label htmlFor="ocean">OCEAN Trait</Label>
              <Select
                value={formData.ocean}
                onValueChange={(value) => setFormData({ ...formData, ocean: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select OCEAN trait" />
                </SelectTrigger>
                <SelectContent>
                  {oceanOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option} - {option === "O" ? "Openness" : option === "C" ? "Conscientiousness" : option === "E" ? "Extraversion" : option === "A" ? "Agreeableness" : "Neuroticism"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Behavior */}
            <div className="space-y-2">
              <Label htmlFor="behavior">Behavior</Label>
              <Textarea
                id="behavior"
                placeholder="Nhập hành vi (vd: tham gia giữ gìn vệ sinh môi trường sống)"
                value={formData.behavior}
                onChange={(e) => setFormData({ ...formData, behavior: e.target.value })}
                rows={3}
              />
            </div>

            {/* Context Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold">Context</h3>

              {/* Population */}
              <div className="space-y-4 p-3 border rounded-lg bg-muted/30">
                <h4 className="text-sm font-medium">Population</h4>

                {/* Age Range */}
                <div className="space-y-2">
                  <Label>Age Range</Label>
                  <Select
                    value={formData.ageRange}
                    onValueChange={(value) => setFormData({ ...formData, ageRange: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageRangeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Multi-select */}
                <div className="space-y-2">
                  <Label>Gender (có thể chọn nhiều)</Label>
                  <div className="flex flex-wrap gap-2">
                    {genderOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                          formData.genders.includes(option.value)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => handleGenderToggle(option.value)}
                      >
                        <Checkbox
                          checked={formData.genders.includes(option.value)}
                          onCheckedChange={() => handleGenderToggle(option.value)}
                        />
                        <span className="text-sm">{option.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Locations Multi-input */}
                <div className="space-y-2">
                  <Label>Locations (có thể nhập nhiều)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập địa điểm (vd: Quang Nam)"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddLocation()
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={handleAddLocation}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.locations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.locations.map((location) => (
                        <Badge key={location} variant="secondary" className="flex items-center gap-1">
                          {location}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => handleRemoveLocation(location)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Urban Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="urban"
                    checked={formData.urban}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, urban: checked as boolean })
                    }
                  />
                  <Label htmlFor="urban" className="cursor-pointer">
                    Urban (Thành thị)
                  </Label>
                </div>
              </div>

              {/* Setting */}
              <div className="space-y-2">
                <Label htmlFor="setting">Setting</Label>
                <Input
                  id="setting"
                  placeholder="Nhập setting (vd: làm sạch nguồn nước)"
                  value={formData.setting}
                  onChange={(e) => setFormData({ ...formData, setting: e.target.value })}
                />
              </div>

              {/* Event */}
              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Input
                  id="event"
                  placeholder="Nhập event (vd: Ngày Chủ nhật xanh tại khu dân cư nông thôn)"
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateModel}
              disabled={createLoading || !formData.ocean || !formData.behavior}
            >
              {createLoading ? "Creating..." : "Create Model"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
