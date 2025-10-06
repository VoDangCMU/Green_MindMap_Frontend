import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { SelectedComponentsColumn } from '@/components/admin/selected-components-column'
import { Leaf, Plus, Loader2, Save, CheckCircle } from 'lucide-react'

// Types for admin interface
type DragItem = {
  id: number
  name: string
  type: "threadhall" | "trait" | "behavior"
  parentId?: number
}

type Behavior = {
  id: number
  name: string
  description: string
}

type Trait = {
  id: number
  name: string
  description: string
  behaviors: Behavior[]
}

type ThreadHall = {
  id: number
  name: string
  description: string
  traits: Trait[]
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

// Mock data for admin interface
const mockThreadHalls: ThreadHall[] = [
  {
    id: 1,
    name: "Đánh giá tính cách",
    description: "Đánh giá các đặc điểm tính cách Big Five",
    traits: [
      {
        id: 1,
        name: "Openness",
        description: "Sự cởi mở với trải nghiệm",
        behaviors: [
          { id: 1, name: "sáng tạo", description: "Thể hiện sự sáng tạo trong giải quyết vấn đề" },
          { id: 2, name: "tò mò", description: "Thể hiện sự tò mò về những ý tưởng mới" },
          { id: 3, name: "thích khám phá", description: "Thích khám phá những điều mới lạ" },
          { id: 4, name: "có trí tưởng tượng", description: "Có khả năng tưởng tượng phong phú" },
        ],
      },
      {
        id: 2,
        name: "Conscientiousness",
        description: "Tính tự giác và tổ chức",
        behaviors: [
          { id: 5, name: "có mục tiêu", description: "Đặt và đạt được mục tiêu một cách nhất quán" },
          { id: 6, name: "có tổ chức", description: "Duy trì cách tiếp cận có tổ chức đối với công việc" },
          { id: 7, name: "kỷ luật", description: "Có tính kỷ luật cao trong công việc" },
          { id: 8, name: "cẩn thận", description: "Làm việc cẩn thận và tỉ mỉ" },
        ],
      },
      {
        id: 3,
        name: "Extraversion",
        description: "Tính hướng ngoại",
        behaviors: [
          { id: 9, name: "giao tiếp", description: "Thích giao tiếp với mọi người" },
          { id: 10, name: "năng động", description: "Có tính cách năng động, hoạt bát" },
          { id: 11, name: "tự tin", description: "Thể hiện sự tự tin trong các tình huống" },
          { id: 12, name: "lãnh đạo", description: "Có khả năng lãnh đạo và dẫn dắt" },
        ],
      },
      {
        id: 4,
        name: "Agreeableness",
        description: "Tính dễ chịu và hợp tác",
        behaviors: [
          { id: 13, name: "hợp tác", description: "Thích làm việc hợp tác với người khác" },
          { id: 14, name: "tin tưởng", description: "Dễ dàng tin tưởng vào người khác" },
          { id: 15, name: "giúp đỡ", description: "Sẵn sàng giúp đỡ người khác" },
          { id: 16, name: "tha thứ", description: "Có khả năng tha thứ và bỏ qua lỗi lầm" },
        ],
      },
      {
        id: 5,
        name: "Neuroticism",
        description: "Tính bất ổn cảm xúc",
        behaviors: [
          { id: 17, name: "lo lắng", description: "Dễ cảm thấy lo lắng và căng thẳng" },
          { id: 18, name: "nhạy cảm", description: "Nhạy cảm với các tình huống và cảm xúc" },
          { id: 19, name: "thay đổi tâm trạng", description: "Tâm trạng thay đổi thất thường" },
          { id: 20, name: "áp lực", description: "Dễ cảm thấy áp lực trong công việc" },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Nhận thức môi trường",
    description: "Đánh giá hành vi thân thiện với môi trường",
    traits: [
      {
        id: 6,
        name: "Sustainability",
        description: "Ý thức bảo vệ môi trường",
        behaviors: [
          { id: 21, name: "tái chế", description: "Có thói quen tái chế nhất quán" },
          { id: 22, name: "tiết kiệm năng lượng", description: "Sử dụng năng lượng một cách có ý thức" },
          { id: 23, name: "bảo vệ thiên nhiên", description: "Quan tâm đến việc bảo vệ thiên nhiên" },
          { id: 24, name: "sống xanh", description: "Áp dụng lối sống xanh, thân thiện môi trường" },
        ],
      },
    ],
  },
]

export default function AdminPage() {
  const [expandedThreadHalls, setExpandedThreadHalls] = useState<Set<number>>(new Set())
  const [expandedTraits, setExpandedTraits] = useState<Set<number>>(new Set())

  const [selectedThreadHallItem, setSelectedThreadHallItem] = useState<DragItem | null>(null)
  const [selectedTraitItem, setSelectedTraitItem] = useState<DragItem | null>(null)
  const [selectedBehaviorItem, setSelectedBehaviorItem] = useState<DragItem | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleThreadHall = (id: number) => {
    const newExpanded = new Set(expandedThreadHalls)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedThreadHalls(newExpanded)
  }

  const toggleTrait = (id: number) => {
    const newExpanded = new Set(expandedTraits)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
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

      const response = await fetch("https://ai-greenmind.khoav4.com/gen-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setQuestions(data.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create questions")

      // Clear questions on error instead of showing mock data
      setQuestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const canSaveData = questions.length > 0 && selectedThreadHallItem && selectedTraitItem && selectedBehaviorItem

  const handleSaveData = async () => {
    if (!canSaveData) return

    setIsSaving(true)
    setSaveSuccess(false)
    setError(null)

    try {
      const payload = {
        total_templates: questions.length,
        items: questions
      }

      console.log("=== SAVE DATA DEBUG ===")
      console.log("URL:", "http://localhost:3000/templates/process-complex")
      console.log("Method:", "POST")
      console.log("Payload:", JSON.stringify(payload, null, 2))
      console.log("Questions count:", questions.length)
      console.log("Selected components:", {
        threadHall: selectedThreadHallItem?.name,
        trait: selectedTraitItem?.name,
        behavior: selectedBehaviorItem?.name
      })

      // Send the AI-API response data directly to backend
      const response = await fetch("http://localhost:3000/templates/process-complex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("Response status:", response.status)
      console.log("Response statusText:", response.statusText)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response body:", errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const result = await response.json()
      console.log("Save success response:", result)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000) // Reset success state after 3 seconds

      console.log("Data saved successfully:", result)
    } catch (err) {
      console.error("=== SAVE ERROR DETAILS ===")
      console.error("Error type:", typeof err)
      console.error("Error message:", err instanceof Error ? err.message : String(err))
      console.error("Error stack:", err instanceof Error ? err.stack : 'No stack trace')
      console.error("Full error object:", err)

      setError(err instanceof Error ? err.message : "Failed to save data")
    } finally {
      setIsSaving(false)
      console.log("=== SAVE OPERATION COMPLETED ===")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Leaf className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">GreenMind Admin</h1>
              <p className="text-sm text-muted-foreground">Question Set Builder</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              disabled={!canSaveData || isSaving}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={handleSaveData}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : saveSuccess ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Data"}
            </Button>

            <Button
              disabled={!canCreateQuestions || isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleCreateQuestions}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              {isLoading ? "Creating..." : "Create Questions"}
            </Button>
          </div>
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

              {/* Template Column */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Template</h3>
                <div className="space-y-2">
                  {questions.map((question, index) => (
                    <Card key={`template-${index}`} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            {question.ocean}
                          </span>
                          <span className="text-xs text-muted-foreground">{question.template_id}</span>
                        </div>
                        <p className="text-sm font-medium">{question.qtype}</p>
                        <p className="text-xs text-muted-foreground">Score: {question.normalize_score}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Question Column */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Questions</h3>
                <div className="space-y-2">
                  {questions.map((question, index) => (
                    <Card key={`question-${index}`} className="p-3">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{question.question}</p>
                        <div className="space-y-1">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                              {option.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Generated Questions Column */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Generated Questions</h3>
                {error && (
                  <Card className="p-3 border-destructive">
                    <p className="text-sm text-destructive">{error}</p>
                  </Card>
                )}
                <div className="space-y-2">
                  {questions.map((question, index) => (
                    <Card key={`generated-${index}`} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            {question.behavior_normalized}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{question.question}</p>
                        <p className="text-xs text-muted-foreground">
                          Input: {question.behavior_input}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
