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

interface GeneratedQuestionsColumnProps {
  questions: Question[]
  error: string | null
}

export function GeneratedQuestionsColumn({ questions, error }: GeneratedQuestionsColumnProps) {
  return (
    <Card className="p-4 min-h-[400px] overflow-y-auto">
      <h3 className="font-semibold text-card-foreground mb-4">Generated Questions</h3>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Questions will appear here after generation</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="mb-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium text-primary">Generated {questions.length} questions</p>
          </div>

          {questions.map((question, index) => (
            <Card key={question.template_id} className="p-4 bg-card/50">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full font-medium">
                    {question.ocean}
                  </span>
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                    {question.qtype}
                  </span>
                </div>

                <h4 className="font-medium text-card-foreground">
                  {index + 1}. {question.question}
                </h4>

                <div className="space-y-1">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 border border-border rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary/60 rounded-full" />
                      </div>
                      <span className="text-muted-foreground">{option.text}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>
                    Behavior: {question.behavior_normalized} (Score: {question.normalize_score})
                  </p>
                  <p>Template ID: {question.template_id}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  )
}
