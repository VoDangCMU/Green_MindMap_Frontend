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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Eye, Plus, X, Pencil, Check } from "lucide-react"
import { OCEAN_DATA, type OceanKey } from "@/lib/ocean-data"

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://green-api.khoav4.com"

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

  // Behavior editing states
  const [isEditingBehavior, setIsEditingBehavior] = useState(false)
  const [editBehaviorValue, setEditBehaviorValue] = useState("")
  const [behaviorPopoverOpen, setBehaviorPopoverOpen] = useState(false)

  const ageRangeOptions = [
    "0-17",
    "18-30",
    "30-50",
    "50-65",
    "65+",
  ]

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ]

  const oceanOptions = ["O", "C", "E", "A", "N"]

  // Get behaviors based on selected OCEAN
  const getAvailableBehaviors = () => {
    if (!formData.ocean || !OCEAN_DATA[formData.ocean as OceanKey]) {
      return []
    }
    return OCEAN_DATA[formData.ocean as OceanKey].behaviors
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Reset behavior when OCEAN changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, behavior: "" }))
    setIsEditingBehavior(false)
    setEditBehaviorValue("")
  }, [formData.ocean])

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
        fetch(`${API_URL}/models/getAll`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_URL}/models/feedbacks`, {
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

      const response = await fetch(`${API_URL}/models/create`, {
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
        fetchData()
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
    setIsEditingBehavior(false)
    setEditBehaviorValue("")
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

  const handleSelectBehavior = (behavior: string) => {
    setFormData({ ...formData, behavior })
    setEditBehaviorValue(behavior)
    setBehaviorPopoverOpen(false)
  }

  const handleStartEditBehavior = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditingBehavior(true)
    setEditBehaviorValue(formData.behavior)
  }

  const handleConfirmEditBehavior = () => {
    if (editBehaviorValue.trim()) {
      setFormData({ ...formData, behavior: editBehaviorValue.trim() })
    }
    setIsEditingBehavior(false)
    setBehaviorPopoverOpen(false)
  }

  const handleCancelEditBehavior = () => {
    setIsEditingBehavior(false)
    setEditBehaviorValue(formData.behavior)
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

            {/* Behavior Selection with Edit */}
            <div className="space-y-2">
              <Label>Behavior</Label>
              <Popover open={behaviorPopoverOpen} onOpenChange={setBehaviorPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-auto min-h-10 py-2"
                    disabled={!formData.ocean}
                  >
                    <span className="text-left truncate flex-1">
                      {formData.behavior || (formData.ocean ? "Select behavior..." : "Select OCEAN first")}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0" align="start">
                  {isEditingBehavior ? (
                    <div className="p-3 space-y-3">
                      <Label className="text-sm font-medium">Edit Behavior</Label>
                      <Input
                        value={editBehaviorValue}
                        onChange={(e) => setEditBehaviorValue(e.target.value)}
                        placeholder="Enter custom behavior..."
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleConfirmEditBehavior()
                          } else if (e.key === "Escape") {
                            handleCancelEditBehavior()
                          }
                        }}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEditBehavior}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleConfirmEditBehavior}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-1">
                      {getAvailableBehaviors().map((behavior, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between px-3 py-2 hover:bg-muted cursor-pointer group"
                        >
                          <span
                            className="flex-1 text-sm"
                            onClick={() => handleSelectBehavior(behavior)}
                          >
                            {behavior}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditBehaviorValue(behavior)
                              setIsEditingBehavior(true)
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      {getAvailableBehaviors().length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No behaviors available for this OCEAN trait
                        </div>
                      )}
                      <div className="border-t mt-1 pt-1">
                        <div
                          className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer text-primary"
                          onClick={() => {
                            setEditBehaviorValue("")
                            setIsEditingBehavior(true)
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          <span className="text-sm">Add custom behavior</span>
                        </div>
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              {formData.behavior && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {formData.behavior}
                </p>
              )}
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
                  <Label>Gender (multiple selection)</Label>
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
                  <Label>Locations (multiple entries)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter location (e.g., Quang Nam)"
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
                    Urban Area
                  </Label>
                </div>
              </div>

              {/* Setting */}
              <div className="space-y-2">
                <Label htmlFor="setting">Setting</Label>
                <Input
                  id="setting"
                  placeholder="Enter setting (e.g., water cleaning)"
                  value={formData.setting}
                  onChange={(e) => setFormData({ ...formData, setting: e.target.value })}
                />
              </div>

              {/* Event */}
              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Input
                  id="event"
                  placeholder="Enter event (e.g., Green Sunday in rural area)"
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
