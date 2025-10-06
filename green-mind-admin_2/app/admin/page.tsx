"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Leaf, Plus, Loader2 } from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SelectedComponentsColumn } from "@/components/admin/selected-components-column"
import { TemplateColumn } from "@/components/admin/template-column"
import { QuestionColumn } from "@/components/admin/question-column"
import { GeneratedQuestionsColumn } from "@/components/admin/generated-questions-column"

const mockThreadHalls = [
  {
    id: 1,
    name: "Personality Assessment",
    description: "Big Five personality traits evaluation",
    traits: [
      {
        id: 1,
        name: "Openness",
        description: "Openness to experience",
        behaviors: [
          { id: 1, name: "Creative thinking", description: "Shows creativity in problem solving" },
          { id: 2, name: "Curiosity", description: "Demonstrates curiosity about new ideas" },
        ],
      },
      {
        id: 2,
        name: "Conscientiousness",
        description: "Self-discipline and organization",
        behaviors: [
          { id: 3, name: "Goal-oriented", description: "Sets and achieves goals consistently" },
          { id: 4, name: "Organized", description: "Maintains organized approach to tasks" },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Environmental Awareness",
    description: "Eco-friendly behavior assessment",
    traits: [
      {
        id: 3,
        name: "Sustainability",
        description: "Environmental consciousness",
        behaviors: [
          { id: 5, name: "Recycling habits", description: "Consistent recycling behavior" },
          { id: 6, name: "Energy conservation", description: "Mindful energy usage" },
        ],
      },
    ],
  },
]

type DragItem = {
  id: number
  name: string
  type: "threadhall" | "trait" | "behavior"
  parentId?: number
}

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

type QuestionsResponse = {
  total_templates: number
  items: Question[]
}

export default function AdminPage() {
  const [selectedThreadHall, setSelectedThreadHall] = useState<number | null>(null)
  const [selectedTrait, setSelectedTrait] = useState<number | null>(null)
  const [expandedThreadHalls, setExpandedThreadHalls] = useState<Set<number>>(new Set())
  const [expandedTraits, setExpandedTraits] = useState<Set<number>>(new Set())

  const [selectedThreadHallItem, setSelectedThreadHallItem] = useState<DragItem | null>(null)
  const [selectedTraitItem, setSelectedTraitItem] = useState<DragItem | null>(null)
  const [selectedBehaviorItem, setSelectedBehaviorItem] = useState<DragItem | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleThreadHall = (id: number) => {
    const newExpanded = new Set(expandedThreadHalls)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
      setSelectedThreadHall(null)
      setSelectedTrait(null)
    } else {
      newExpanded.add(id)
      setSelectedThreadHall(id)
    }
    setExpandedThreadHalls(newExpanded)
  }

  const toggleTrait = (id: number) => {
    const newExpanded = new Set(expandedTraits)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
      setSelectedTrait(null)
    } else {
      newExpanded.add(id)
      setSelectedTrait(id)
    }
    setExpandedTraits(newExpanded)
  }

  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    setIsDragging(true)
    e.dataTransfer.setData("application/json", JSON.stringify(item))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const item = JSON.parse(e.dataTransfer.getData("application/json")) as DragItem

    if (item.type === "threadhall") {
      setSelectedThreadHallItem(item)
      setSelectedTraitItem(null)
      setSelectedBehaviorItem(null)
    } else if (item.type === "trait") {
      const parentThreadHall = mockThreadHalls.find((th) => th.traits.some((t) => t.id === item.id))
      if (parentThreadHall) {
        setSelectedThreadHallItem({
          id: parentThreadHall.id,
          name: parentThreadHall.name,
          type: "threadhall",
        })
      }

      setSelectedTraitItem(item)
      setSelectedBehaviorItem(null)
    } else if (item.type === "behavior") {
      let parentTrait = null
      let parentThreadHall = null

      for (const threadHall of mockThreadHalls) {
        for (const trait of threadHall.traits) {
          if (trait.behaviors.some((b) => b.id === item.id)) {
            parentTrait = trait
            parentThreadHall = threadHall
            break
          }
        }
        if (parentTrait) break
      }

      if (parentThreadHall && parentTrait) {
        setSelectedThreadHallItem({
          id: parentThreadHall.id,
          name: parentThreadHall.name,
          type: "threadhall",
        })
        setSelectedTraitItem({
          id: parentTrait.id,
          name: parentTrait.name,
          type: "trait",
          parentId: parentThreadHall.id,
        })
      }

      setSelectedBehaviorItem(item)
    }
  }

  const removeThreadHall = () => {
    setSelectedThreadHallItem(null)
    setSelectedTraitItem(null)
    setSelectedBehaviorItem(null)
  }

  const removeTrait = () => {
    setSelectedTraitItem(null)
    setSelectedBehaviorItem(null)
  }

  const removeBehavior = () => {
    setSelectedBehaviorItem(null)
  }

  const canCreateQuestions = selectedTraitItem && selectedBehaviorItem

  const handleCreateQuestions = async () => {
    if (!canCreateQuestions || !selectedTraitItem || !selectedBehaviorItem) return

    setIsLoading(true)
    setError(null)

    try {
      const traitToOcean: { [key: string]: string } = {
        Openness: "O",
        Conscientiousness: "C",
        Extraversion: "E",
        Agreeableness: "A",
        Neuroticism: "N",
      }

      const oceanCode = traitToOcean[selectedTraitItem.name] || "O"

      const requestBody = {
        ocean: oceanCode,
        behavior_input: selectedBehaviorItem.name.toLowerCase(),
      }

      const response = await fetch("/api/questions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: QuestionsResponse = await response.json()
      setQuestions(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create questions")

      const mockQuestions: Question[] = [
        {
          ocean: "O",
          template_id: "O_F_001",
          question: "Khi đi du lịch, bạn ăn với tần suất như thế nào?",
          options: [
            { text: "rất ít khi", value: "rất ít khi" },
            { text: "thỉnh thoảng", value: "thỉnh thoảng" },
            { text: "thường xuyên", value: "thường xuyên" },
            { text: "gần như mọi lúc", value: "gần như mọi lúc" },
          ],
          behavior_input: "eating behavior",
          behavior_normalized: "ăn",
          normalize_score: 85.0,
          qtype: "frequency",
        },
        {
          ocean: "O",
          template_id: "O_YN_001",
          question: "Bạn có tò mò và hứng thú khi ăn không?",
          options: [
            { text: "Có", value: "Có" },
            { text: "Không", value: "Không" },
          ],
          behavior_input: "eating behavior",
          behavior_normalized: "ăn",
          normalize_score: 85.0,
          qtype: "yesno",
        },
      ]
      setQuestions(mockQuestions)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background dark">
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Leaf className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">GreenMind Admin</h1>
              <p className="text-sm text-muted-foreground">Question Set Builder</p>
            </div>
          </div>
          <Button
            disabled={!canCreateQuestions || isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleCreateQuestions}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            {isLoading ? "Creating..." : "Create Questions"}
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        <AdminSidebar
          threadHalls={mockThreadHalls}
          expandedThreadHalls={expandedThreadHalls}
          expandedTraits={expandedTraits}
          onToggleThreadHall={toggleThreadHall}
          onToggleTrait={toggleTrait}
          onDragStart={handleDragStart}
        />

        <div className="flex-1 p-6">
          <div className="h-full">
            <h2 className="text-2xl font-bold text-foreground mb-6">Question Set Builder</h2>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100%-4rem)]">
              <SelectedComponentsColumn
                selectedThreadHallItem={selectedThreadHallItem}
                selectedTraitItem={selectedTraitItem}
                selectedBehaviorItem={selectedBehaviorItem}
                isDragging={isDragging}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onRemoveThreadHall={removeThreadHall}
                onRemoveTrait={removeTrait}
                onRemoveBehavior={removeBehavior}
              />

              <TemplateColumn questions={questions} />

              <QuestionColumn questions={questions} />

              <GeneratedQuestionsColumn questions={questions} error={error} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
