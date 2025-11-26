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

interface MechanismFeedback {
  awareness: string
  motivation: string
  capability: string
  opportunity: string
}

interface OceanScore {
  O: number
  C: number
  E: number
  A: number
  N: number
}

interface BehaviorFeedback {
  id: string
  userId: string
  metric: string
  vt: number
  bt: number
  r: number
  n: number
  contrib: number
  mechanismFeedback: MechanismFeedback
  reason: string
  oceanScore: OceanScore
  createdAt: string
  updatedAt: string
  // Mock fields
  age?: number
  gender?: string
  location?: string
}

interface ApiResponse {
  success: boolean
  message: string
  data: BehaviorFeedback[]
  count: number
}

export function BehaviorFeedbackTable() {
  const [feedbacks, setFeedbacks] = useState<BehaviorFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<BehaviorFeedback | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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

      const response = await fetch("https://green-api.khoav4.com/behavior-feedbacks/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data: ApiResponse = await response.json()

      if (data.success) {
        // Add mock data to feedbacks
        const feedbacksWithMockData = data.data.map((feedback) => ({
          ...feedback,
          age: 25,
          gender: "Male",
          location: "Da Nang, Vietnam"
        }))
        setFeedbacks(feedbacksWithMockData)
      }
    } catch (error) {
      console.error("Error fetching behavior feedbacks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (feedback: BehaviorFeedback) => {
    setSelectedFeedback(feedback)
    setIsDialogOpen(true)
  }

  const getTraitFromReason = (reason: string): string => {
    const match = reason.match(/trait `([OCEAN])`/)
    return match ? match[1] : "N/A"
  }

  const formatPercentage = (value: number): string => {
    return (value * 100).toFixed(2) + "%"
  }

  const formatNumber = (value: any): string => {
    const num = typeof value === 'number' ? value : parseFloat(value)
    return isNaN(num) ? 'N/A' : num.toFixed(2)
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
              <TableHead>User ID</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Metric</TableHead>
              <TableHead>Trait</TableHead>
              <TableHead>VT</TableHead>
              <TableHead>BT</TableHead>
              <TableHead>Correlation (r)</TableHead>
              <TableHead>Contribution</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-muted-foreground">
                  No behavior feedbacks found
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((feedback) => {
                const trait = getTraitFromReason(feedback.reason)
                return (
                  <TableRow key={feedback.id}>
                    <TableCell className="font-mono text-xs">
                      {feedback.userId.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{feedback.age || 'N/A'}</TableCell>
                    <TableCell>{feedback.gender || 'N/A'}</TableCell>
                    <TableCell>{feedback.location || 'N/A'}</TableCell>
                    <TableCell className="font-medium">
                      {feedback.metric.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{trait}</Badge>
                    </TableCell>
                    <TableCell>{formatNumber(feedback.vt)}</TableCell>
                    <TableCell>{formatNumber(feedback.bt)}</TableCell>
                    <TableCell>
                      <span className={feedback.r > 0 ? "text-green-600" : "text-red-600"}>
                        {formatNumber(feedback.r)}
                      </span>
                    </TableCell>
                    <TableCell>{formatPercentage(feedback.contrib)}</TableCell>
                    <TableCell>
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(feedback)}
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
            <DialogTitle>Behavior Feedback Details</DialogTitle>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{selectedFeedback.age || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{selectedFeedback.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedFeedback.location || 'N/A'}</p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">Metric</p>
                  <p className="font-medium">{selectedFeedback.metric.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trait</p>
                  <p className="font-medium">{getTraitFromReason(selectedFeedback.reason)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Value at Time (VT)</p>
                  <p className="font-medium">{formatNumber(selectedFeedback.vt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Baseline (BT)</p>
                  <p className="font-medium">{formatNumber(selectedFeedback.bt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Correlation (r)</p>
                  <p className={`font-medium ${selectedFeedback.r > 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatNumber(selectedFeedback.r)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Normalized Value (n)</p>
                  <p className="font-medium">{formatNumber(selectedFeedback.n)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contribution</p>
                  <p className="font-medium">{formatPercentage(selectedFeedback.contrib)}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <h3 className="font-semibold">Analysis</h3>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{selectedFeedback.reason}</AlertDescription>
                </Alert>
              </div>

              {/* COM-B Mechanism Feedback */}
              <div className="space-y-3">
                <h3 className="font-semibold">COM-B Mechanism Feedback</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">Awareness</Badge>
                      <p className="text-sm flex-1">{selectedFeedback.mechanismFeedback.awareness}</p>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">Motivation</Badge>
                      <p className="text-sm flex-1">{selectedFeedback.mechanismFeedback.motivation}</p>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">Capability</Badge>
                      <p className="text-sm flex-1">{selectedFeedback.mechanismFeedback.capability}</p>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">Opportunity</Badge>
                      <p className="text-sm flex-1">{selectedFeedback.mechanismFeedback.opportunity}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* OCEAN Scores */}
              <div className="space-y-3">
                <h3 className="font-semibold">OCEAN Personality Scores</h3>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(selectedFeedback.oceanScore).map(([trait, score]) => (
                    <div key={trait} className="border rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-2">{trait}</p>
                      <p className="text-2xl font-bold">{(score * 100).toFixed(0)}%</p>
                      <div className="mt-2 w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created At</p>
                  <p className="font-medium">{new Date(selectedFeedback.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Updated At</p>
                  <p className="font-medium">{new Date(selectedFeedback.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
