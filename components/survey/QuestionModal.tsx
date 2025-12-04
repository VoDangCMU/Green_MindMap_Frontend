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
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Loader2 } from "lucide-react"
import { getAllQuestions } from "@/lib/auth"
import { attachQuestions } from "@/lib/survey"

interface QuestionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scenarioId: string
  selectedQuestions: Array<{ id: string; question: string }>
  onSuccess?: () => void
}

export function QuestionModal({ open, onOpenChange, scenarioId, selectedQuestions, onSuccess }: QuestionModalProps) {
  const { toast } = useToast()
  const [selected, setSelected] = useState<string[]>(selectedQuestions.map(q => q.id))
  const [questions, setQuestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedSets, setSavedSets] = useState<{ id: string; name: string; description: string; questionIds: string[] }[]>([])
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      loadQuestionsFromAPI()
      // load saved question sets from Question Manager (localStorage)
      try {
        const raw = localStorage.getItem("questionSets")
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) setSavedSets(parsed)
        }
      } catch (e) {
        console.warn("Failed to load saved question sets", e)
      }
    }
  }, [open])

  const toggleSetSelection = (setId: string) => {
    setSelectedSetIds((prev) => (prev.includes(setId) ? prev.filter((id) => id !== setId) : [...prev, setId]))
  }

  const clearSelection = () => setSelected([])

  const loadQuestionsFromAPI = async () => {
    setIsLoading(true)
    try {
      const response = await getAllQuestions()

      // Extract questions from response (handle both array and object response)
      const questionsData = response.data || response || []
      setQuestions(questionsData)
    } catch (error) {
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

  const handleConfirm = async () => {
    // Attach merged question IDs from selected sets
    if (selectedSetIds.length === 0) {
      toast({ title: "No Sets Selected", description: "Please select at least one question set.", variant: "destructive" })
      return
    }

    const mergedIds = Array.from(new Set(selectedSetIds.flatMap(id => {
      const s = savedSets.find(x => x.id === id)
      return s ? s.questionIds : []
    })))

    setIsSubmitting(true)
    try {
      await attachQuestions(scenarioId, mergedIds)
      toast({
        title: "Question Sets Attached",
        description: `${mergedIds.length} question(s) have been attached from ${selectedSetIds.length} set(s).`,
      })
      // reset selections
      setSelectedSetIds([])
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to attach questions",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Select Question Sets</DialogTitle>
          <DialogDescription>Choose one or more question sets to attach to this demographic scenario.</DialogDescription>
        </DialogHeader>

        {/* Saved question sets area */}
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium">Saved Question Sets</div>
            <div className="text-xs text-muted-foreground">Select sets to attach their questions</div>
          </div>
          {savedSets.length === 0 ? (
            <div className="text-sm text-muted-foreground mt-2">No saved question sets available. Create sets in Question Manager first.</div>
          ) : (
            <div className="mt-2 grid gap-2">
              {savedSets.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-2 bg-gray-50 border rounded-md px-3 py-2">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={selectedSetIds.includes(s.id)} onCheckedChange={() => toggleSetSelection(s.id)} />
                    <div>
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.description || ""}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{s.questionIds.length} Q</div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedSetIds([])}>Clear</Button>
              </div>
            </div>
          )}
        </div>

        {/* Note: individual question list removed; users should use saved sets created in Question Manager */}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedSetIds.length === 0 || isSubmitting}>
            {isSubmitting ? "Attaching..." : `Confirm (${selectedSetIds.length} set(s))`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}