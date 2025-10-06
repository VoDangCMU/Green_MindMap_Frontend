"use client"

import { Card } from "@/components/ui/card"

type QuestionOption = {
  text: string
  value: string
}

type Question = {
  ocean: string
  template_id: string
  question: string
  options: QuestionOption[]
  behavior_input: string
  behavior_normalized: string
  normalize_score: number
  qtype: string
}

interface TemplateColumnProps {
  questions: Question[]
}

export function TemplateColumn({ questions }: TemplateColumnProps) {
  return (
    <Card className="p-4 min-h-[400px] overflow-y-auto">
      <h3 className="font-semibold text-card-foreground mb-4">Template</h3>

      {questions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Template details will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Card key={`template-${question.template_id}`} className="p-4 bg-card/50">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full font-medium">
                    ID: {question.template_id}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Ocean:</p>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-600 text-xs rounded-full">
                      {question.ocean}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Question Type:</p>
                    <span className="px-2 py-1 bg-green-500/20 text-green-600 text-xs rounded-full">
                      {question.qtype}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Options:</p>
                    <div className="space-y-1">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 bg-primary/40 rounded-full" />
                          <span className="text-card-foreground">{option.text}</span>
                          <span className="text-muted-foreground">({option.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  )
}
