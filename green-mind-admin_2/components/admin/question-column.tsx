"use client"

import { Card } from "@/components/ui/card"

type Question = {
  ocean: string
  template_id: string
  question: string
  options: Array<{ text: string; value: string }>
  behavior_input: string
  behavior_normalized: string
  normalize_score: number
  qtype: string
}

interface QuestionColumnProps {
  questions: Question[]
}

export function QuestionColumn({ questions }: QuestionColumnProps) {
  return (
    <Card className="p-4 min-h-[400px] overflow-y-auto">
      <h3 className="font-semibold text-card-foreground mb-4">Question</h3>

      {questions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Questions will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Card key={`question-${question.template_id}`} className="p-4 bg-card/50">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full font-medium">
                    {question.template_id}
                  </span>
                </div>

                <h4 className="font-medium text-card-foreground leading-relaxed">{question.question}</h4>

                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                  <p>Behavior: {question.behavior_normalized}</p>
                  <p>Score: {question.normalize_score}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  )
}
