"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface Question {
  id: string
  name: string
  intent: string
  filled_prompt: string
  question_type: string
}

const MOCK_DB_QUESTIONS: Question[] = [
  {
    id: "a3f1d6b2-1c2b-4d3a-8f1a-111111111111",
    name: "Bạn thường dùng sản phẩm bao lâu 1 lần?",
    intent: "frequency",
    filled_prompt: "Trong tháng qua, bạn đã sử dụng sản phẩm X bao nhiêu lần?",
    question_type: "scale",
  },
  {
    id: "b4f2d7c3-2d3c-5e4b-9f2b-222222222222",
    name: "Bạn có hài lòng với dịch vụ?",
    intent: "yesno",
    filled_prompt: "Bạn có hài lòng với dịch vụ của chúng tôi không?",
    question_type: "binary",
  },
  {
    id: "c5f3e8d4-3e4d-6f5c-af3c-333333333333",
    name: "Đánh giá trải nghiệm tổng thể",
    intent: "rating",
    filled_prompt: "Xin vui lòng đánh giá trải nghiệm tổng thể của bạn với sản phẩm (1-5)",
    question_type: "rating",
  },
]

const MOCK_EXPERT_QUESTIONS: Question[] = [
  {
    id: "d6f4a9e5-4f5e-7g6d-bf4d-444444444444",
    name: "Bạn chọn tính năng nào nhiều nhất?",
    intent: "choice",
    filled_prompt: "Trong các tính năng A, B, C, bạn thường dùng tính năng nào nhất?",
    question_type: "single_choice",
  },
  {
    id: "e7f5b0f6-5g6f-8h7e-cg5e-555555555555",
    name: "Tần suất tiếp cận thông tin",
    intent: "frequency",
    filled_prompt: "Bạn tiếp cận thông tin về sản phẩm qua kênh nào thường xuyên nhất?",
    question_type: "multiple_choice",
  },
]

export default function ManageQuestionsPage() {
  const [dbSelected, setDbSelected] = useState<Record<string, boolean>>({})
  const [expertSelected, setExpertSelected] = useState<Record<string, boolean>>({})
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  // UI polish: search and filter for enterprise UX
  const [searchQuery, setSearchQuery] = useState("")
  const [intentFilter, setIntentFilter] = useState("")
  const { toast } = useToast()

  // Ratings state for rating-type questions (1-5)
  const [ratings, setRatings] = useState<Record<string, number | "">>({})

  const handleRatingChange = (id: string, value: string) => {
    setRatings(prev => ({ ...prev, [id]: value === "" ? "" : Number(value) }))
  }

  // New state: questions-manage expert questions list so we can edit/delete/reorder
  const [expertQuestions, setExpertQuestions] = useState<Question[]>(MOCK_EXPERT_QUESTIONS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<Question>>({})

  // New state: saved question sets created from selections
  const [questionSets, setQuestionSets] = useState<{
    id: string
    name: string
    description: string
    questionIds: string[]
  }[]>([])

  // Load saved question sets from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("questionSets")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setQuestionSets(parsed)
      }
    } catch (e) {
      console.warn("Failed to load saved question sets from localStorage", e)
    }
  }, [])

  // Persist questionSets to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("questionSets", JSON.stringify(questionSets))
    } catch (e) {
      console.warn("Failed to save question sets to localStorage", e)
    }
  }, [questionSets])

  const toggleDb = (id: string, value: boolean) => {
    setDbSelected(prev => ({ ...prev, [id]: value }))
  }

  const toggleExpert = (id: string, value: boolean) => {
    setExpertSelected(prev => ({ ...prev, [id]: value }))
  }

  const createQuestionSet = () => {
    const selectedDbIds = Object.entries(dbSelected).filter(([_, v]) => v).map(([k]) => k)
    const selectedExpertIds = Object.entries(expertSelected).filter(([_, v]) => v).map(([k]) => k)
    const questionIds = [...selectedDbIds, ...selectedExpertIds]

    if (name.trim() === "") {
      toast({ title: "Error", description: "Please enter a name for the question set", variant: "destructive" })
      return
    }

    if (questionIds.length === 0) {
      toast({ title: "Error", description: "Please select at least one question", variant: "destructive" })
      return
    }

    const newSet = {
      id: `${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      questionIds,
    }

    // Save the set locally (replace with API call if needed)
    setQuestionSets(prev => [newSet, ...prev])

    toast({ title: "Success", description: `Question set "${newSet.name}" created (${questionIds.length} questions)` })

    // Reset form and only unselect the questions that were used in the created set
    setName("")
    setDescription("")

    setDbSelected(prev => {
      const copy = { ...prev }
      selectedDbIds.forEach(id => {
        if (id in copy) delete copy[id]
      })
      return copy
    })

    setExpertSelected(prev => {
      const copy = { ...prev }
      selectedExpertIds.forEach(id => {
        if (id in copy) delete copy[id]
      })
      return copy
    })
  }

  // delete saved question set
  const deleteQuestionSet = (id: string) => {
    if (!window.confirm("Delete this question set?")) return
    setQuestionSets(prev => prev.filter(s => s.id !== id))
    toast({ title: "Deleted", description: "Question set removed" })
  }

  // Expert question actions
  const deleteExpertQuestion = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return
    setExpertQuestions(prev => prev.filter(q => q.id !== id))
    setExpertSelected(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
    toast({ title: "Deleted", description: "Expert question has been deleted" })
  }

  const startEdit = (q: Question) => {
    setEditingId(q.id)
    setEditingData({ ...q })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingData({})
  }

  const saveEdit = () => {
    if (!editingId) return
    setExpertQuestions(prev => prev.map(q => (q.id === editingId ? { ...(q as Question), ...(editingData as Question) } : q)))
    setEditingId(null)
    setEditingData({})
    toast({ title: "Saved", description: "Expert question has been updated" })
  }

  // Compute selected question objects for preview
  const selectedDbQuestions = MOCK_DB_QUESTIONS.filter(q => dbSelected[q.id])
  const selectedExpertQuestions = expertQuestions.filter(q => expertSelected[q.id])
  const selectedQuestions = [...selectedDbQuestions, ...selectedExpertQuestions]

  // helper to get question name by id
  const getQuestionById = (id: string) => {
    return MOCK_DB_QUESTIONS.concat(expertQuestions).find(q => q.id === id)
  }

  // helper: map intent to badge color classes
  const intentColor = (intent?: string) => {
    switch (intent) {
      case "frequency":
        return "bg-blue-100 text-blue-800"
      case "yesno":
        return "bg-green-100 text-green-800"
      case "rating":
        return "bg-yellow-100 text-yellow-800"
      case "choice":
        return "bg-indigo-100 text-indigo-800"
      case "binary":
        return "bg-rose-100 text-rose-800"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  // compute intents for filter select
  const allIntents = Array.from(new Set(MOCK_DB_QUESTIONS.concat(MOCK_EXPERT_QUESTIONS).map(q => q.intent))).filter(Boolean)

  // filtered lists based on search and intent filter
  const filteredDbQuestions = MOCK_DB_QUESTIONS.filter(q => {
    const matchQuery = searchQuery.trim() === "" || (q.name + " " + q.filled_prompt).toLowerCase().includes(searchQuery.toLowerCase())
    const matchIntent = intentFilter === "" || q.intent === intentFilter
    return matchQuery && matchIntent
  })

  const filteredExpertQuestions = expertQuestions.filter(q => {
    const matchQuery = searchQuery.trim() === "" || (q.name + " " + q.filled_prompt).toLowerCase().includes(searchQuery.toLowerCase())
    const matchIntent = intentFilter === "" || q.intent === intentFilter
    return matchQuery && matchIntent
  })

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Question Management</h1>
              <p className="text-sm text-muted-foreground">Select questions from Database and Expert to create a new question set</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Input placeholder="Search questions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[320px]" />
              <select value={intentFilter} onChange={(e) => setIntentFilter(e.target.value)} className="text-sm border rounded px-2 py-1">
                <option value="">All intents</option>
                {allIntents.map(i => (<option key={i} value={i}>{i}</option>))}
              </select>
            </div>
          </div>
          {/* mobile search */}
          <div className="md:hidden">
            <Input placeholder="Search questions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-lg rounded-xl overflow-hidden">
            <CardHeader>
              <CardTitle>Database Questions</CardTitle>
              <CardDescription>Mock list of all questions from the database</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-[520px] overflow-y-auto">
                {filteredDbQuestions.map((q) => (
                  <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-white hover:shadow-md transition transform hover:-translate-y-0.5">
                    <Checkbox id={`db-${q.id}`} checked={dbSelected[q.id]} onCheckedChange={(v) => toggleDb(q.id, v as boolean)} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${intentColor(q.intent)}`}>{q.intent}</Badge>
                          <div className="font-medium">{q.name}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground italic">{q.filled_prompt}</div>
                      <div className="text-xs text-muted-foreground mt-2">ID: {q.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl overflow-hidden">
            <CardHeader>
              <CardTitle>Expert Questions</CardTitle>
              <CardDescription>Questions generated by experts</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-[520px] overflow-y-auto">
                {filteredExpertQuestions.map((q) => (
                  <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-white hover:shadow-md transition transform hover:-translate-y-0.5">
                    <Checkbox id={`exp-${q.id}`} checked={expertSelected[q.id]} onCheckedChange={(v) => toggleExpert(q.id, v as boolean)} />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${intentColor(q.intent)}`}>{q.intent}</Badge>
                          <div className="font-medium">{q.name}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" title="Actions" className="w-8 h-8 rounded-full">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              <div className="px-2 py-2">
                                <label className="text-xs text-muted-foreground">Rating</label>
                                <select
                                  value={ratings[q.id] ?? ""}
                                  onChange={(e) => handleRatingChange(q.id, e.target.value)}
                                  className="mt-1 w-full text-sm border rounded px-2 py-1"
                                >
                                  <option value="">Select</option>
                                  <option value="1">1</option>
                                  <option value="2">2</option>
                                  <option value="3">3</option>
                                  <option value="4">4</option>
                                  <option value="5">5</option>
                                </select>
                              </div>

                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => startEdit(q)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteExpertQuestion(q.id)} variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {editingId === q.id ? (
                        <div className="space-y-2">
                          <Input value={editingData.name || ""} onChange={(e) => setEditingData(prev => ({ ...prev, name: e.target.value }))} />
                          <Textarea value={editingData.filled_prompt || ""} onChange={(e) => setEditingData(prev => ({ ...prev, filled_prompt: e.target.value }))} />
                          <div className="flex items-center gap-2">
                            <Input value={editingData.intent || ""} onChange={(e) => setEditingData(prev => ({ ...prev, intent: e.target.value }))} placeholder="intent" />
                            <Input value={editingData.question_type || ""} onChange={(e) => setEditingData(prev => ({ ...prev, question_type: e.target.value }))} placeholder="type" />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" onClick={saveEdit} className="bg-green-600">Save</Button>
                            <Button size="sm" onClick={cancelEdit} variant="outline">Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm text-muted-foreground italic">{q.filled_prompt}</div>
                          <div className="text-xs text-muted-foreground mt-2">ID: {q.id}</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Question Set</CardTitle>
            <CardDescription>Enter name, description and create a question set from selected questions</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Question set name" value={name} onChange={(e) => setName(e.target.value)} />
              <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Selected total: {(Object.values(dbSelected).filter(Boolean).length) + (Object.values(expertSelected).filter(Boolean).length)} questions</div>
              <Button onClick={createQuestionSet} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">Create Question Set</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-lg">
          <CardHeader>
            <CardTitle>Selected Questions</CardTitle>
            <CardDescription>Preview of selected questions for the new set</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {selectedQuestions.length === 0 ? (
              <div className="text-sm text-muted-foreground">No questions selected yet</div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-medium">Question Set: {name || "<name>"}</div>
                    <div className="text-xs text-muted-foreground">{description}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Total: <span className="font-semibold text-700">{selectedQuestions.length}</span></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedQuestions.map((q) => (
                    <div key={q.id} className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${intentColor(q.intent)}`}>{q.intent}</Badge>
                          <div className="font-medium">{q.name}</div>
                        </div>
                        <div className="text-right">
                          {ratings[q.id] ? (
                            <Badge className="bg-yellow-100 text-yellow-800">{ratings[q.id]} ★</Badge>
                          ) : (
                            <div className="text-xs text-muted-foreground">No rating</div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-muted-foreground line-clamp-3">{q.filled_prompt}</div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <div>ID: <span className="font-mono text-[11px]">{q.id.slice(0,8)}…</span></div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">Type: <span className="font-medium">{q.question_type}</span></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* New: Saved Question Sets list (bottom box) */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Saved Question Sets</CardTitle>
            <CardDescription>List of created question sets (preview)</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {questionSets.length === 0 ? (
              <div className="text-sm text-muted-foreground">No saved question sets yet</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questionSets.map((set) => (
                  <div key={set.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold">{set.name}</div>
                        <div className="text-xs text-muted-foreground">{set.description || <span className="italic text-muted-foreground">No description</span>}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xs text-muted-foreground">{set.questionIds.length} questions</div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(set.id)}>Copy ID</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteQuestionSet(set.id)}>Delete</Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {set.questionIds.map((qid) => {
                        const q = getQuestionById(qid)
                        return (
                          <div key={qid} className="px-3 py-1 rounded-full bg-gray-100 text-sm flex items-center gap-2">
                            <Badge className="bg-gray-200 text-xs">{q?.intent ?? "-"}</Badge>
                            <div className="truncate max-w-[160px]">{q?.name ?? qid}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
