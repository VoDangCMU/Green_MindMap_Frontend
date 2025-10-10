"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useScenarioStore } from "@/store/useScenarioStore"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Loader2 } from "lucide-react"
import { getAllQuestions } from "@/lib/auth"

interface QuestionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scenarioId: string
  selectedQuestions: string[]
}

export function QuestionModal({ open, onOpenChange, scenarioId, selectedQuestions }: QuestionModalProps) {
  const { selectQuestions } = useScenarioStore()
  const { toast } = useToast()
  const [selected, setSelected] = useState<string[]>(selectedQuestions)
  const [questions, setQuestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load questions from API when modal opens
  useEffect(() => {
    if (open) {
      loadQuestionsFromAPI()
    }
  }, [open])

  const loadQuestionsFromAPI = async () => {
    setIsLoading(true)
    try {
      console.log('🔍 Loading questions from API for modal...')
      const response = await getAllQuestions()

      // Extract questions from response (handle both array and object response)
      const questionsData = response.data || response || []
      setQuestions(questionsData)

      console.log('✅ Questions loaded for modal:', questionsData)
    } catch (error) {
      console.error('❌ Error loading questions for modal:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách câu hỏi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = (questionId: string) => {
    setSelected((prev) => (prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]))
  }

  const handleConfirm = () => {
    selectQuestions(scenarioId, selected)
    toast({
      title: "Questions Attached",
      description: `${selected.length} question(s) have been attached to this scenario.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Select Survey Questions</DialogTitle>
          <DialogDescription>Choose one or more questions to attach to this demographic scenario.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] space-y-3 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading questions...</span>
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No questions available. Please try again.
              </p>
            </div>
          ) : (
            questions.map((question, index) => (
              <div
                key={question.id || index}
                className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50/50"
              >
                <Checkbox
                  id={question.id || `question-${index}`}
                  checked={selected.includes(question.id || `question-${index}`)}
                  onCheckedChange={() => handleToggle(question.id || `question-${index}`)}
                  className="mt-1"
                />
                <Label htmlFor={question.id || `question-${index}`} className="flex-1 cursor-pointer text-base leading-relaxed">
                  {question.text || question.question || question.filled_prompt || `Question ${index + 1}`}
                </Label>
                {selected.includes(question.id || `question-${index}`) && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
              </div>
            ))
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selected.length === 0 || isLoading}>
            Confirm ({selected.length} selected)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
