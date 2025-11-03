"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, Trash2 } from "lucide-react"
import { getAllQuestions, deleteQuestion } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface QuestionItem {
    id?: string
    text?: string
    question?: string
    type?: string
    [key: string]: any
}

export function QuestionsPanel() {
    const [isLoading, setIsLoading] = useState(false)
    const [questions, setQuestions] = useState<QuestionItem[]>([])
    const { toast } = useToast()
    const scrollRef = useRef<HTMLDivElement>(null)

    const handleGetQuestions = async () => {
        setIsLoading(true)
        try {
            const response = await getAllQuestions()
            const questionsData = (response as any)?.data ?? response ?? []
            setQuestions(questionsData as QuestionItem[])

            // Scroll to top after loading questions
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = 0
                }
            }, 100)

            toast({
                title: "Success",
                description: `Loaded ${Array.isArray(questionsData) ? questionsData.length : 0} questions from server`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load questions from server",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteQuestion = async (id?: string) => {
        if (!id) return
        try {
            await deleteQuestion(id)
            setQuestions((prev) => prev.filter((q) => q.id !== id))
            toast({ title: "Deleted", description: "Question removed successfully" })
        } catch (error) {
            toast({ title: "Error", description: "Could not delete question", variant: "destructive" })
        }
    }

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Survey Questions</CardTitle>
                    <Button onClick={handleGetQuestions} disabled={isLoading} className="shadow-sm">
                        {isLoading ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" /> Get Questions
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
                    <div ref={scrollRef} className="space-y-2 max-h-[300px] overflow-y-scroll ">
                        <p className="text-sm text-muted-foreground mb-4">
                            Loaded {questions.length} questions from server
                        </p>
                        {questions.map((question, index) => (
                            <div
                                key={question.id || index}
                                className="p-3 border rounded-lg bg-white hover:bg-gray-50 flex items-start justify-between gap-4"
                            >
                                <div>
                                    <div className="font-medium">
                                        {question.text || question.question || `Question ${index + 1}`}
                                    </div>
                                    {question.type && (
                                        <div className="text-xs text-muted-foreground mt-1">Type: {question.type}</div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDeleteQuestion(question.id)}
                                        className="shadow-sm"
                                        title="Delete question"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
