"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Eye } from "lucide-react"

// Interfaces based on API response
interface Segment {
  id: string
  name: string
  location: string
  ageRange: string
  gender: string
}

interface Feedback {
  id: string
  model_id: string
  segment_id: string
  user_id: string
  trait_checked: string
  expected: number
  actual: number
  deviation: number
  engagement: number
  match: boolean
  level: string
  feedback: string[]
  mechanismFeedbacks: any[]
  segment: Segment
}

interface Model {
  id: string
  ocean: string
  behavior: string
  age: string
  location: string
  gender: string
  keywords: string
}

interface ApiResponse {
  feedbacks: Feedback[]
  model: Model
}

interface ChartDataPoint {
  id: string
  subContext: string
  age: string
  location: string
  gender: string
  engagement: number
  engagementDisplay: number
  engagementOriginal: number
  level: string
  recommendation: string
  feedback: string[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://green-api.khoav4.com"

// Score is 0-10 scale
const getScoreColor = (score: number): string => {
  if (score >= 7) return "#22c55e" // Green
  if (score >= 5) return "#eab308" // Yellow
  return "#ef4444" // Red
}

const getRecommendation = (score: number): string => {
  if (score >= 7) return "Keep Current Strategy"
  if (score >= 5) return "Optimize with ML Enhancement"
  return "Critical - Switch to Digital/Social Media Strategy"
}

const getRecommendationStatus = (score: number) => {
  if (score >= 7) {
    return {
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      text: "Keep Strategy",
      variant: "default" as const,
      className: "bg-green-500",
    }
  }
  if (score >= 5) {
    return {
      icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      text: "Optimize",
      variant: "outline" as const,
      className: "border-yellow-500 text-yellow-500",
    }
  }
  return {
    icon: <XCircle className="h-4 w-4 text-red-500" />,
    text: "Change Strategy",
    variant: "destructive" as const,
    className: "",
  }
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataPoint
    const score = data.engagementOriginal

    return (
      <div className="bg-popover border rounded-lg p-3 shadow-lg max-w-xs">
        <p className="font-semibold text-sm">{data.subContext}</p>
        <div className="mt-2 space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Score: </span>
            <span
              className="font-medium"
              style={{ color: getScoreColor(score) }}
            >
              {score.toFixed(1)}
            </span>
          </p>
          <p>
            <span className="text-muted-foreground">Age: </span>
            {data.age}
          </p>
          <p>
            <span className="text-muted-foreground">Location: </span>
            {data.location}
          </p>
        </div>
        <div className="mt-2 pt-2 border-t">
          <p className="text-xs font-medium" style={{ color: getScoreColor(score) }}>
            💡 {getRecommendation(score)}
          </p>
        </div>
        {data.feedback && data.feedback.length > 0 && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs text-muted-foreground">Suggestions:</p>
            <ul className="list-disc list-inside text-xs mt-1">
              {data.feedback.slice(0, 2).map((item, idx) => (
                <li key={idx} className="truncate">{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }
  return null
}

// MOCK DATA - TODO: Remove after testing
const MOCK_FEEDBACKS: Feedback[] = [
  {
    id: "mock-1",
    model_id: "mock",
    segment_id: "seg-1",
    user_id: "user-1",
    trait_checked: "A",
    expected: 0.7,
    actual: 0.8,
    deviation: 0.1,
    engagement: 0.8,
    match: true,
    level: "good",
    feedback: ["User shows strong engagement", "Positive response"],
    mechanismFeedbacks: [],
    segment: {
      id: "seg-1",
      name: "26-Da Nang-Male",
      location: "Da Nang",
      ageRange: "26",
      gender: "Male",
    },
  },
  {
    id: "mock-2",
    model_id: "mock",
    segment_id: "seg-2",
    user_id: "user-2",
    trait_checked: "A",
    expected: 0.6,
    actual: 0.9,
    deviation: 0.3,
    engagement: 0.9,
    match: true,
    level: "excellent",
    feedback: ["Excellent engagement score"],
    mechanismFeedbacks: [],
    segment: {
      id: "seg-2",
      name: "29-Quang Nam-Female",
      location: "Quang Nam",
      ageRange: "29",
      gender: "Female",
    },
  },
  {
    id: "mock-3",
    model_id: "mock",
    segment_id: "seg-3",
    user_id: "user-3",
    trait_checked: "A",
    expected: 0.7,
    actual: 0.5,
    deviation: 0.2,
    engagement: 0.5,
    match: false,
    level: "warning",
    feedback: ["Moderate engagement", "Needs optimization"],
    mechanismFeedbacks: [],
    segment: {
      id: "seg-3",
      name: "20-Hue-Male",
      location: "Hue",
      ageRange: "20",
      gender: "Male",
    },
  },
  {
    id: "mock-4",
    model_id: "mock",
    segment_id: "seg-4",
    user_id: "user-4",
    trait_checked: "A",
    expected: 0.8,
    actual: 0.2,
    deviation: 0.6,
    engagement: 0.2,
    match: false,
    level: "critical_mismatch",
    feedback: ["Very low engagement - Critical!", "Switch to Digital Strategy"],
    mechanismFeedbacks: [],
    segment: {
      id: "seg-4",
      name: "25-Quang Nam-Male",
      location: "Quang Nam",
      ageRange: "25",
      gender: "Male",
    },
  },
  {
    id: "mock-5",
    model_id: "mock",
    segment_id: "seg-5",
    user_id: "user-5",
    trait_checked: "A",
    expected: 0.6,
    actual: 0.65,
    deviation: 0.05,
    engagement: 0.65,
    match: true,
    level: "good",
    feedback: ["Good engagement", "Room for improvement"],
    mechanismFeedbacks: [],
    segment: {
      id: "seg-5",
      name: "35-Da Nang-Female",
      location: "Da Nang",
      ageRange: "35",
      gender: "Female",
    },
  },
]

export default function ModelVerifyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const modelId = params.id as string

  const [model, setModel] = useState<Model | null>(null)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [modelId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("access_token")

      if (!token) {
        setError("No access token found. Please login again.")
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/models/${modelId}/feedbacks`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`)
      }

      const data: ApiResponse = await response.json()

      setModel(data.model)
      // Use MOCK_FEEDBACKS if API returns empty feedbacks (for testing)
      const apiFeedbacks = data.feedbacks || []
      setFeedbacks(apiFeedbacks.length > 0 ? apiFeedbacks : MOCK_FEEDBACKS)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setIsModalOpen(true)
  }

  // Transform feedbacks to chart data
  // Check if engagement is 0-1 scale or 0-10 scale and convert accordingly
  const chartData: ChartDataPoint[] = feedbacks.map((feedback, index) => {
    // If engagement > 1, assume it's already 0-10 scale, otherwise convert from 0-1
    const engagementScore = feedback.engagement > 1 ? feedback.engagement : feedback.engagement * 10
    return {
      id: feedback.id,
      subContext: feedback.segment?.name || `${feedback.segment?.ageRange}-${feedback.segment?.location}-${feedback.segment?.gender}`,
      age: feedback.segment?.ageRange || "",
      location: feedback.segment?.location || "",
      gender: feedback.segment?.gender || "",
      engagement: index, // Y position (categorical index)
      engagementDisplay: 10 - engagementScore, // Reverse: 10 becomes 0, 0 becomes 10
      engagementOriginal: engagementScore, // Keep original for display (0-10 scale)
      level: feedback.level,
      recommendation: getRecommendation(engagementScore),
      feedback: feedback.feedback,
    }
  })

  const getOceanFullName = (trait: string): string => {
    const names: Record<string, string> = {
      O: "Openness",
      C: "Conscientiousness",
      E: "Extraversion",
      A: "Agreeableness",
      N: "Neuroticism",
    }
    return names[trait] || trait
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchData} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!model) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Model not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Model Verification</h1>
          <p className="text-muted-foreground">
            Analyze engagement scores and recommendations
          </p>
        </div>
      </div>

      {/* Section 1: Model Info Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {model.ocean}
            </Badge>
            <span>{getOceanFullName(model.ocean)}</span>
          </CardTitle>
          <CardDescription>Model Information & Current Strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Behavior</p>
              <p className="font-medium">{model.behavior}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Target Age</p>
              <p className="font-medium">{model.age}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Target Gender</p>
              <p className="font-medium">{model.gender}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{model.location}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm text-muted-foreground">Keywords (Current Strategy)</p>
              <p className="font-medium">{model.keywords}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Scatter Plot Chart with 2 columns (Red at 10, Blue at 0) */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Score Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 60)}>
              <ScatterChart
                margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="engagementDisplay"
                  name="Engagement Score"
                  domain={[0, 10]}
                  tickCount={11}
                  tickFormatter={(value) => `${10 - value}`}
                  label={{
                    value: "Engagement Score (10 → 0)",
                    position: "bottom",
                    offset: 0,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="engagement"
                  name="Index"
                  hide={true}
                  domain={[-0.5, chartData.length - 0.5]}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Red bar at position 10 (display 0) - Critical */}
                <ReferenceLine
                  x={0}
                  stroke="#ef4444"
                  strokeWidth={4}
                  label={{
                    value: "10",
                    position: "top",
                    fill: "#ef4444",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />

                {/* Blue bar at position 0 (display 10) - Best */}
                <ReferenceLine
                  x={10}
                  stroke="#3b82f6"
                  strokeWidth={4}
                  label={{
                    value: "0",
                    position: "top",
                    fill: "#3b82f6",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />

                <Scatter
                  name="Engagement Points"
                  data={chartData}
                  fill="#8884d8"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getScoreColor(entry.engagementOriginal)}
                      stroke={getScoreColor(entry.engagementOriginal)}
                      strokeWidth={2}
                      r={8}
                    />
                  ))}
                  <LabelList
                    dataKey="subContext"
                    position="right"
                    offset={12}
                    style={{ fontSize: 11, fontWeight: 500 }}
                  />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No feedback data available for chart
            </div>
          )}

          {/* Legend for colors */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-sm">Score ≥ 7: Keep Strategy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="text-sm">Score 5-7: Optimize</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm">Score &lt; 5: Change Strategy</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Detailed Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Details</CardTitle>
          <CardDescription>
            Complete list of feedback records with AI recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sub-context</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>AI Recommendation</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No feedbacks found
                    </TableCell>
                  </TableRow>
                ) : (
                  feedbacks.map((feedback) => {
                    const score = feedback.engagement > 1 ? feedback.engagement : feedback.engagement * 10
                    const status = getRecommendationStatus(score)

                    return (
                      <TableRow key={feedback.id}>
                        <TableCell className="font-medium">
                          {feedback.segment?.name || `${feedback.segment?.ageRange}-${feedback.segment?.location}-${feedback.segment?.gender}`}
                        </TableCell>
                        <TableCell>{feedback.segment?.ageRange || "-"}</TableCell>
                        <TableCell>{feedback.segment?.location || "-"}</TableCell>
                        <TableCell>{feedback.segment?.gender || "-"}</TableCell>
                        <TableCell>
                          <span
                            className="font-semibold"
                            style={{ color: getScoreColor(score) }}
                          >
                            {score.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              feedback.level === "critical_mismatch"
                                ? "destructive"
                                : feedback.level === "excellent" || feedback.level === "good" || feedback.match
                                ? "default"
                                : "secondary"
                            }
                          >
                            {feedback.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {status.icon}
                            <Badge variant={status.variant} className={status.className}>
                              {status.text}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewFeedback(feedback)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Segment Feedback Details
            </DialogTitle>
            <DialogDescription>
              {selectedFeedback?.segment?.name || "Segment feedback information"}
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-6">
              {/* Segment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Segment Name</p>
                  <p className="font-medium">{selectedFeedback.segment?.name || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedFeedback.segment?.location || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Age Range</p>
                  <p className="font-medium">{selectedFeedback.segment?.ageRange || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{selectedFeedback.segment?.gender || "-"}</p>
                </div>
              </div>

              {/* Score Metrics */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Score Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Trait Checked</p>
                    <Badge variant="outline">{selectedFeedback.trait_checked}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Expected</p>
                    <p className="font-medium">{selectedFeedback.expected?.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Actual</p>
                    <p className="font-medium">{selectedFeedback.actual?.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Deviation</p>
                    <p className={`font-medium ${selectedFeedback.deviation > 0.2 ? "text-red-500" : "text-green-500"}`}>
                      {selectedFeedback.deviation?.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Engagement</p>
                    <p className="font-medium" style={{ color: getScoreColor(selectedFeedback.engagement > 1 ? selectedFeedback.engagement : selectedFeedback.engagement * 10) }}>
                      {(selectedFeedback.engagement > 1 ? selectedFeedback.engagement : selectedFeedback.engagement * 10).toFixed(1)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Match</p>
                    <Badge variant={selectedFeedback.match ? "default" : "destructive"}>
                      {selectedFeedback.match ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Level</p>
                    <Badge
                      variant={
                        selectedFeedback.level === "critical_mismatch"
                          ? "destructive"
                          : selectedFeedback.level === "excellent" || selectedFeedback.level === "good"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedFeedback.level}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Feedback List */}
              {selectedFeedback.feedback && selectedFeedback.feedback.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Feedback</h4>
                  <ul className="space-y-2">
                    {selectedFeedback.feedback.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mechanism Feedbacks */}
              {selectedFeedback.mechanismFeedbacks && selectedFeedback.mechanismFeedbacks.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Mechanism Feedbacks</h4>
                  <div className="space-y-2">
                    {selectedFeedback.mechanismFeedbacks.map((mf: any, idx: number) => (
                      <div key={idx} className="p-3 bg-muted rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap">
                          {typeof mf === "string" ? mf : JSON.stringify(mf, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendation */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">AI Recommendation</h4>
                <div className="flex items-center gap-2">
                  {getRecommendationStatus(selectedFeedback.engagement > 1 ? selectedFeedback.engagement : selectedFeedback.engagement * 10).icon}
                  <span className="font-medium" style={{ color: getScoreColor(selectedFeedback.engagement > 1 ? selectedFeedback.engagement : selectedFeedback.engagement * 10) }}>
                    {getRecommendation(selectedFeedback.engagement > 1 ? selectedFeedback.engagement : selectedFeedback.engagement * 10)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
