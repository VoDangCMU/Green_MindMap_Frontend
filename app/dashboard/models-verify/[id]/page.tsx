"use client"

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

// Mock data for demonstration
const MOCK_MODEL = {
  id: "mock-model-1",
  ocean: "A",
  behavior: "purchasing behavior (hành vi mua sắm)",
  age: "20-30",
  location: "Quang Nam, Da Nang, Hue",
  gender: "male, female",
  keywords: "Tổ chức buổi họp dân bàn về lợi ích nguồn nước sạch tại nhà văn hóa thôn",
  createdAt: "2024-12-18",
  updatedAt: "2024-12-18",
}

const MOCK_FEEDBACKS = [
  {
    id: "fb-1",
    subContext: "26-Da Nang-Male",
    age: "26",
    location: "Da Nang, Vietnam",
    gender: "Male",
    engagement: 8,
    level: "good",
    feedback: ["User shows strong engagement with the content", "Positive response to environmental initiatives"],
  },
  {
    id: "fb-2",
    subContext: "29-Quang Nam-Female",
    age: "29",
    location: "Quang Nam",
    gender: "Female",
    engagement: 8,
    level: "good",
    feedback: ["Active participation in community activities", "Good understanding of sustainability concepts"],
  },
  {
    id: "fb-3",
    subContext: "29-Quang Nam-Female",
    age: "29",
    location: "Quang Nam",
    gender: "Female",
    engagement: 9,
    level: "excellent",
    feedback: ["Excellent engagement score", "Strong advocate for green initiatives"],
  },
  {
    id: "fb-4",
    subContext: "20-Hue-Male",
    age: "20",
    location: "Hue",
    gender: "Male",
    engagement: 5,
    level: "warning",
    feedback: ["Moderate engagement", "Needs more targeted content"],
  },
  {
    id: "fb-5",
    subContext: "25-Quang Nam-Male",
    age: "25",
    location: "Quang Nam",
    gender: "Male",
    engagement: 2,
    level: "critical_mismatch",
    feedback: ["Very low engagement - Critical!", "Consider switching to Digital/Social Media Strategy"],
  },
]

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

export default function ModelVerifyDetailPage() {
  const params = useParams()
  const router = useRouter()

  // Use mock data
  const model = MOCK_MODEL
  const feedbacks = MOCK_FEEDBACKS

  // Transform feedbacks to chart data
  const chartData: ChartDataPoint[] = feedbacks.map((feedback, index) => ({
    id: feedback.id,
    subContext: feedback.subContext,
    age: feedback.age,
    location: feedback.location,
    gender: feedback.gender,
    engagement: index, // Y position (categorical index)
    engagementDisplay: 10 - feedback.engagement, // Reverse: 10 becomes 0, 0 becomes 10
    engagementOriginal: feedback.engagement, // Keep original for display
    level: feedback.level,
    recommendation: getRecommendation(feedback.engagement),
    feedback: feedback.feedback,
  }))

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
            Analyze engagement scores and recommendations (Mock Data)
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

      {/* Section 2: Scatter Plot Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Score Analysis</CardTitle>
          <CardDescription>
            Horizontal dot plot showing engagement scores by sub-context.
            <span className="text-red-500 ml-1">Red (10)</span> = Critical,
            <span className="text-blue-500 ml-1">Blue (0)</span> = Best
          </CardDescription>
        </CardHeader>
        <CardContent>
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

              {/* Red bar at position 10 (display 0) */}
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

              {/* Blue bar at position 0 (display 10) */}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((feedback) => {
                  const score = feedback.engagement
                  const status = getRecommendationStatus(score)

                  return (
                    <TableRow key={feedback.id}>
                      <TableCell className="font-medium">{feedback.subContext}</TableCell>
                      <TableCell>{feedback.age}</TableCell>
                      <TableCell>{feedback.location}</TableCell>
                      <TableCell>{feedback.gender}</TableCell>
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
                              : feedback.level === "excellent" || feedback.level === "good"
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
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
