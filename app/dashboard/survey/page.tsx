"use client"

import { SurveyForm } from "@/components/survey/SurveyForm"
import { SurveyScenarioTable } from "@/components/survey/SurveyScenarioTable"
import { SurveySimulator } from "@/components/survey/SurveySimulator"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import { getAllQuestions } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export default function SurveyPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const { toast } = useToast()

  const handleGetQuestions = async () => {
    setIsLoadingQuestions(true)
    try {
      console.log('🔍 Getting questions with Authorization header...')
      const response = await getAllQuestions()

      // Extract questions from response (handle both array and object response)
      const questionsData = response.data || response || []
      setQuestions(questionsData)

      toast({
        title: "Thành công",
        description: `Đã tải ${questionsData.length} câu hỏi từ server`,
      })

      console.log('✅ Questions loaded successfully:', questionsData)
    } catch (error) {
      console.error('❌ Error loading questions:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách câu hỏi",
        variant: "destructive",
      })
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/30 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Survey Manager</h1>
          <p className="text-base text-muted-foreground">
            Create demographic scenarios and simulate survey distribution
          </p>
        </div>

        {/* Questions Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Survey Questions</CardTitle>
              <Button
                onClick={handleGetQuestions}
                disabled={isLoadingQuestions}
                className="shadow-sm"
              >
                {isLoadingQuestions ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Get Questions
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No questions loaded yet. Click "Get Questions" to load from server.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <p className="text-sm text-muted-foreground mb-4">
                  Loaded {questions.length} questions from server
                </p>
                {questions.map((question, index) => (
                  <div
                    key={question.id || index}
                    className="p-3 border rounded-lg bg-white hover:bg-gray-50"
                  >
                    <div className="text-sm font-medium">
                      {question.text || question.question || `Question ${index + 1}`}
                    </div>
                    {question.type && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Type: {question.type}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <SurveyForm />
        <SurveyScenarioTable onViewResult={setSelectedScenarioId} />
        <SurveySimulator selectedScenarioId={selectedScenarioId} />
      </div>
    </div>
  )
}
