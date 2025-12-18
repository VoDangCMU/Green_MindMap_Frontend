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
  Legend,
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

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

interface MechanismFeedback {
  awareness: string
  motivation: string
  capability: string
  opportunity: string
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
  mechanismFeedbacks: MechanismFeedback[]
  createdAt: string
  updatedAt: string
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
  level: string
  recommendation: string
  feedback: string[]
}

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
    const score = data.engagementDisplay

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

export default function ModelVerifyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const modelId = params.id as string

  const [model, setModel] = useState<Model | null>(null)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (modelId) {
      fetchData()
    }
  }, [modelId])

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
        const foundModel = modelsData.data.find((m: Model) => m.id === modelId)
        setModel(foundModel || null)
      }

      let feedbackList: Feedback[] = []
      if (Array.isArray(feedbacksData)) {
        feedbackList = feedbacksData
      } else if (feedbacksData.data && Array.isArray(feedbacksData.data)) {
        feedbackList = feedbacksData.data
      }

      const modelFeedbacks = feedbackList.filter((f) => f.model_id === modelId)
      setFeedbacks(modelFeedbacks)

      // Transform feedbacks to chart data
      const transformedData: ChartDataPoint[] = modelFeedbacks.map((feedback, index) => {
        const engagementScore = feedback.engagement * 10 // Convert to 0-10 scale
        const subContext = `${feedback.model?.age || "N/A"}-${feedback.model?.location || "N/A"}-${feedback.model?.gender || "N/A"}`

        return {
          id: feedback.id,
          subContext,
          age: feedback.model?.age || "N/A",
          location: feedback.model?.location || "N/A",
          gender: feedback.model?.gender || "N/A",
          engagement: index, // Y position (categorical index)
          engagementDisplay: engagementScore,
          level: feedback.level,
          recommendation: getRecommendation(engagementScore),
          feedback: feedback.feedback || [],
        }
      })

      setChartData(transformedData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!model) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">Model not found</p>
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
              <p className="font-medium">{model.age || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Target Gender</p>
              <p className="font-medium">{model.gender || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{model.location || "N/A"}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm text-muted-foreground">Keywords (Current Strategy)</p>
              <p className="font-medium">{model.keywords || "No keywords generated"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Scatter Plot Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Score Analysis</CardTitle>
          <CardDescription>
            Horizontal dot plot showing engagement scores by sub-context.
            <span className="text-red-500 ml-1">Red line (5)</span> = Critical Threshold,
            <span className="text-green-500 ml-1">Green line (8)</span> = Target
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No feedback data available for visualization
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 50)}>
              <ScatterChart
                margin={{ top: 20, right: 30, bottom: 20, left: 150 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="engagementDisplay"
                  name="Engagement Score"
                  domain={[0, 10]}
                  tickCount={11}
                  label={{
                    value: "Engagement Score",
                    position: "bottom",
                    offset: 0,
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="subContext"
                  name="Sub-context"
                  width={140}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {/* Critical Threshold Line (Red) at X=5 */}
                <ReferenceLine
                  x={5}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: "Critical (5)",
                    position: "top",
                    fill: "#ef4444",
                    fontSize: 12,
                  }}
                />

                {/* Target Line (Green) at X=8 */}
                <ReferenceLine
                  x={8}
                  stroke="#22c55e"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: "Target (8)",
                    position: "top",
                    fill: "#22c55e",
                    fontSize: 12,
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
                      fill={getScoreColor(entry.engagementDisplay)}
                      stroke={getScoreColor(entry.engagementDisplay)}
                      strokeWidth={2}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}

          {/* Legend for colors */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">Score ≥ 7: Keep Strategy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm">Score 5-7: Optimize</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No feedback records found for this model
                    </TableCell>
                  </TableRow>
                ) : (
                  feedbacks.map((feedback) => {
                    const score = feedback.engagement * 10
                    const status = getRecommendationStatus(score)
                    const subContext = `${feedback.model?.age || "N/A"}-${feedback.model?.location || "N/A"}-${feedback.model?.gender || "N/A"}`

                    return (
                      <TableRow key={feedback.id}>
                        <TableCell className="font-medium">{subContext}</TableCell>
                        <TableCell>{feedback.model?.age || "N/A"}</TableCell>
                        <TableCell>{feedback.model?.location || "N/A"}</TableCell>
                        <TableCell>{feedback.model?.gender || "N/A"}</TableCell>
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
                                : feedback.level === "good"
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
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

