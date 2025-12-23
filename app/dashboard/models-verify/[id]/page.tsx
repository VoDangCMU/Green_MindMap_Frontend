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
  expected: number | string
  actual: number | string
  deviation: number | string
  engagement: number | string
  match: boolean
  level: string
  feedback: string[]
  mechanismFeedbacks: any[]
  segment: Segment
  created_at?: string
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
  segmentId: string
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
  feedbackCount: number
}

// Group feedbacks by segment
interface GroupedFeedback {
  segmentId: string
  segment: Segment
  feedbacks: Feedback[]
  latestFeedback: Feedback
  totalCount: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://green-api.khoav4.com"

// Helper function to safely format numbers
const formatNumber = (value: any, decimals: number = 2): string => {
  if (value === null || value === undefined || value === "") return "-"
  const num = typeof value === "number" ? value : parseFloat(String(value))
  if (isNaN(num)) return "-"
  return num.toFixed(decimals)
}

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
          <p>
            <span className="text-muted-foreground">Total Feedbacks: </span>
            <Badge variant="secondary" className="ml-1">{data.feedbackCount}</Badge>
          </p>
        </div>
        <div className="mt-2 pt-2 border-t">
          <p className="text-xs font-medium" style={{ color: getScoreColor(score) }}>
            💡 {getRecommendation(score)}
          </p>
        </div>
        {data.feedback && data.feedback.length > 0 && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs text-muted-foreground">Latest Suggestions:</p>
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

export default function ModelVerifyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const modelId = params.id as string

  const [model, setModel] = useState<Model | null>(null)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state - now holds multiple feedbacks for a segment
  const [selectedSegmentFeedbacks, setSelectedSegmentFeedbacks] = useState<Feedback[] | null>(null)
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
      setFeedbacks(data.feedbacks || [])
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  // Group feedbacks by segment_id
  const groupedFeedbacks: GroupedFeedback[] = Object.values(
    feedbacks.reduce((acc, feedback) => {
      const segmentId = feedback.segment_id
      if (!acc[segmentId]) {
        acc[segmentId] = {
          segmentId,
          segment: feedback.segment,
          feedbacks: [],
          latestFeedback: feedback,
          totalCount: 0,
        }
      }
      acc[segmentId].feedbacks.push(feedback)
      acc[segmentId].totalCount++

      // Update latest feedback (assuming latest is last in array or has newest created_at)
      if (feedback.created_at && acc[segmentId].latestFeedback.created_at) {
        if (new Date(feedback.created_at) > new Date(acc[segmentId].latestFeedback.created_at)) {
          acc[segmentId].latestFeedback = feedback
        }
      } else {
        // If no created_at, take the last one
        acc[segmentId].latestFeedback = feedback
      }

      return acc
    }, {} as Record<string, GroupedFeedback>)
  )

  const handleViewSegmentFeedbacks = (segmentFeedbacks: Feedback[]) => {
    setSelectedSegmentFeedbacks(segmentFeedbacks)
    setIsModalOpen(true)
  }

  // Transform grouped feedbacks to chart data - only show latest state per segment
  const chartData: ChartDataPoint[] = groupedFeedbacks.map((group, index) => {
    const latestFeedback = group.latestFeedback
    const engagementScore = latestFeedback.engagement > 1 ? latestFeedback.engagement : latestFeedback.engagement * 10
    return {
      id: latestFeedback.id,
      segmentId: group.segmentId,
      subContext: latestFeedback.segment?.name || `${latestFeedback.segment?.ageRange}-${latestFeedback.segment?.location}-${latestFeedback.segment?.gender}`,
      age: latestFeedback.segment?.ageRange || "",
      location: latestFeedback.segment?.location || "",
      gender: latestFeedback.segment?.gender || "",
      engagement: index, // Y position (categorical index)
      engagementDisplay: 10 - engagementScore, // Reverse: 10 becomes 0, 0 becomes 10
      engagementOriginal: engagementScore, // Keep original for display (0-10 scale)
      level: latestFeedback.level,
      recommendation: getRecommendation(engagementScore),
      feedback: latestFeedback.feedback,
      feedbackCount: group.totalCount,
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

      {/* Section 2: Scatter Plot Chart - Latest State per Segment */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Score Analysis (Latest State per Segment)</CardTitle>
          <CardDescription>
            Showing the most recent feedback state for each segment
          </CardDescription>
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
                      r={30}
                    />
                  ))}
                  <LabelList
                    dataKey="subContext"
                    position="right"
                    offset={30}
                    style={{ fontSize: 13, fontWeight: 500 }}
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

      {/* Section 3: Grouped Data Table by Segment */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Details by Segment</CardTitle>
          <CardDescription>
            Each row represents a segment with its latest feedback state. Click View to see all feedbacks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Segment</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Latest Score</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>AI Recommendation</TableHead>
                  <TableHead>Feedbacks</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedFeedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No feedbacks found
                    </TableCell>
                  </TableRow>
                ) : (
                  groupedFeedbacks.map((group) => {
                    const latestFeedback = group.latestFeedback
                    const score = latestFeedback.engagement > 1 ? latestFeedback.engagement : latestFeedback.engagement * 10
                    const status = getRecommendationStatus(score)

                    return (
                      <TableRow key={group.segmentId}>
                        <TableCell className="font-medium">
                          {latestFeedback.segment?.name || `${latestFeedback.segment?.ageRange}-${latestFeedback.segment?.location}-${latestFeedback.segment?.gender}`}
                        </TableCell>
                        <TableCell>{latestFeedback.segment?.ageRange || "-"}</TableCell>
                        <TableCell>{latestFeedback.segment?.location || "-"}</TableCell>
                        <TableCell>{latestFeedback.segment?.gender || "-"}</TableCell>
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
                              latestFeedback.level === "critical_mismatch"
                                ? "destructive"
                                : latestFeedback.level === "excellent" || latestFeedback.level === "good" || latestFeedback.match
                                ? "default"
                                : "secondary"
                            }
                          >
                            {latestFeedback.level}
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
                          <Badge variant="outline">
                            {group.totalCount} {group.totalCount === 1 ? 'feedback' : 'feedbacks'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewSegmentFeedbacks(group.feedbacks)}
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
        </CardContent>
      </Card>

      {/* Segment Feedbacks Modal - Shows all feedbacks for selected segment */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              All Feedbacks for Segment
            </DialogTitle>
            <DialogDescription>
              {selectedSegmentFeedbacks && selectedSegmentFeedbacks.length > 0
                ? `${selectedSegmentFeedbacks[0].segment?.name || "Segment"} - Total: ${selectedSegmentFeedbacks.length} feedbacks`
                : "Segment feedback information"}
            </DialogDescription>
          </DialogHeader>

          {selectedSegmentFeedbacks && selectedSegmentFeedbacks.length > 0 && (
            <div className="space-y-6">
              {/* Segment Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Segment Name</p>
                  <p className="font-medium">{selectedSegmentFeedbacks[0].segment?.name || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedSegmentFeedbacks[0].segment?.location || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Age Range</p>
                  <p className="font-medium">{selectedSegmentFeedbacks[0].segment?.ageRange || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{selectedSegmentFeedbacks[0].segment?.gender || "-"}</p>
                </div>
              </div>

              {/* All Feedbacks for this Segment */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Feedback History</h4>

                {selectedSegmentFeedbacks.map((feedback, index) => {
                  const score = feedback.engagement > 1 ? feedback.engagement : feedback.engagement * 10

                  return (
                    <div key={feedback.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold">
                          Feedback #{selectedSegmentFeedbacks.length - index}
                          {index === 0 && <Badge className="ml-2" variant="default">Latest</Badge>}
                        </h5>
                        {feedback.created_at && (
                          <span className="text-sm text-muted-foreground">
                            {new Date(feedback.created_at).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Score Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Trait Checked</p>
                          <Badge variant="outline" className="text-xs">{feedback.trait_checked}</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Expected</p>
                          <p className="text-sm font-medium">{formatNumber(feedback.expected)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Actual</p>
                          <p className="text-sm font-medium">{formatNumber(feedback.actual)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Deviation</p>
                          <p className={`text-sm font-medium ${feedback.deviation > 0.2 ? "text-red-500" : "text-green-500"}`}>
                            {formatNumber(feedback.deviation)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Engagement</p>
                          <p className="text-sm font-medium" style={{ color: getScoreColor(score) }}>
                            {formatNumber(score, 1)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Match</p>
                          <Badge variant={feedback.match ? "default" : "destructive"} className="text-xs">
                            {feedback.match ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Level</p>
                          <Badge
                            variant={
                              feedback.level === "critical_mismatch"
                                ? "destructive"
                                : feedback.level === "excellent" || feedback.level === "good"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {feedback.level}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Recommendation</p>
                          <div className="flex items-center gap-1">
                            {getRecommendationStatus(score).icon}
                            <span className="text-xs font-medium" style={{ color: getScoreColor(score) }}>
                              {getRecommendationStatus(score).text}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Feedback Messages */}
                      {feedback.feedback && feedback.feedback.length > 0 && (
                        <div className="pt-3 border-t">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Suggestions:</p>
                          <ul className="space-y-1">
                            {feedback.feedback.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-muted-foreground">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Mechanism Feedbacks */}
                      {feedback.mechanismFeedbacks && feedback.mechanismFeedbacks.length > 0 && (
                        <div className="pt-3 border-t">
                          <p className="text-xs font-semibold text-muted-foreground mb-3">Mechanism Feedbacks:</p>
                          <div className="space-y-3">
                            {feedback.mechanismFeedbacks.map((mf: any, idx: number) => {
                              // Parse the mechanism feedback if it's a string
                              const mechanismData = typeof mf === "string" ? JSON.parse(mf) : mf

                              return (
                                <div key={idx} className="border rounded-lg p-3 bg-card space-y-3">
                                  {/* Metric Type Header */}
                                  {mechanismData.metricType && (
                                    <div className="flex items-center gap-2 pb-2 border-b">
                                      <Badge variant="outline" className="font-mono text-xs">
                                        {mechanismData.metricType}
                                      </Badge>
                                    </div>
                                  )}

                                  {/* Individual Mechanism Feedbacks */}
                                  {mechanismData.mechanismFeedbacks && mechanismData.mechanismFeedbacks.length > 0 && (
                                    <div className="space-y-2">
                                      {mechanismData.mechanismFeedbacks.map((item: any, itemIdx: number) => (
                                        <div key={item.id || itemIdx} className="p-2 rounded bg-muted/50 space-y-1.5">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                            {item.awareness && (
                                              <div className="flex items-start gap-2">
                                                <span className="font-semibold text-muted-foreground min-w-[80px]">Awareness:</span>
                                                <span>{item.awareness}</span>
                                              </div>
                                            )}
                                            {item.motivation && (
                                              <div className="flex items-start gap-2">
                                                <span className="font-semibold text-muted-foreground min-w-[80px]">Motivation:</span>
                                                <span>{item.motivation}</span>
                                              </div>
                                            )}
                                            {item.capability && (
                                              <div className="flex items-start gap-2">
                                                <span className="font-semibold text-muted-foreground min-w-[80px]">Capability:</span>
                                                <span>{item.capability}</span>
                                              </div>
                                            )}
                                            {item.opportunity && (
                                              <div className="flex items-start gap-2">
                                                <span className="font-semibold text-muted-foreground min-w-[80px]">Opportunity:</span>
                                                <span>{item.opportunity}</span>
                                              </div>
                                            )}
                                          </div>
                                          {item.createdAt && (
                                            <div className="text-xs text-muted-foreground pt-1 border-t">
                                              {new Date(item.createdAt).toLocaleString()}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
