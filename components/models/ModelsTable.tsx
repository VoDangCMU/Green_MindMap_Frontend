"use client"

import { useState, useEffect } from "react"
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
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Eye } from "lucide-react"

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
  expected: string
  actual: string
  deviation: string
  match: boolean
  level: string
  feedback: string[]
  createdAt: string
  updatedAt: string
  model: Model
}

export function ModelsTable() {
  const [models, setModels] = useState<Model[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [modelFeedbacks, setModelFeedbacks] = useState<Feedback[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      
      const [modelsResponse, feedbacksResponse] = await Promise.all([
        fetch("https://green-api.khoav4.com/models/getAll", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("https://green-api.khoav4.com/models/feedbacks", {
          headers: {
            Authorization: `Bearer ${token}`,
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
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewFeedback = (model: Model) => {
    setSelectedModel(model)
    const modelFeedbackList = feedbacks.filter(
      (feedback) => feedback.model_id === model.id
    )
    setModelFeedbacks(modelFeedbackList)
    setIsDialogOpen(true)
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "critical_mismatch":
        return <Badge variant="destructive">Critical Mismatch</Badge>
      case "warning":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Warning</Badge>
      case "good":
        return <Badge variant="default" className="bg-green-500">Good</Badge>
      default:
        return <Badge variant="secondary">{level}</Badge>
    }
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Model Feedback</DialogTitle>
          </DialogHeader>
          
          {selectedModel && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">OCEAN</p>
                  <p className="font-medium">{selectedModel.ocean}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Behavior</p>
                  <p className="font-medium">{selectedModel.behavior}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{selectedModel.age}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{selectedModel.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedModel.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Keywords</p>
                  <p className="font-medium">{selectedModel.keywords}</p>
                </div>
              </div>

              {modelFeedbacks.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No feedback available for this model.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold">Feedback Records ({modelFeedbacks.length})</h3>
                  {modelFeedbacks.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{feedback.trait_checked}</Badge>
                          {getLevelBadge(feedback.level)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(feedback.createdAt).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Expected</p>
                          <p className="font-medium">{feedback.expected}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Actual</p>
                          <p className="font-medium">{feedback.actual}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Deviation</p>
                          <p className="font-medium text-red-500">{feedback.deviation}%</p>
                        </div>
                      </div>

                      {feedback.feedback && feedback.feedback.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Suggestions:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {feedback.feedback.map((item, index) => (
                              <li key={index} className="text-sm text-muted-foreground">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

