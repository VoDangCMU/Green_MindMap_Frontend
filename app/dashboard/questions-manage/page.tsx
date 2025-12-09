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
    id: "T_FREQ_01",
    name: "Tần suất thực hiện hành động 1",
    intent: "frequency",
    filled_prompt: `Người có tính cách O, giới tính Nam, độ tuổi 18, mức độ yêu thích hành động khám phá quán cafe Đà Nẵng mới là như thế nào?\nLoại câu trả lời: frequency\n1: Không bao giờ\n2: Thỉnh thoảng\n3: Thường xuyên\n4: Rất thường xuyên`,
    question_type: "frequency",
  },
  {
    id: "T_FREQ_02",
    name: "Tần suất thực hiện hành động 2",
    intent: "frequency",
    filled_prompt: `Người có tính cách O, thường thực hiện hành động khám phá quán cafe Đà Nẵng mới với tần suất nào?\nLoại câu trả lời: frequency\n1: Không bao giờ\n2: Thỉnh thoảng\n3: Thường xuyên\n4: Rất thường xuyên`,
    question_type: "frequency",
  },
  {
    id: "T_YN_01",
    name: "Thói quen hành động 1",
    intent: "yesno",
    filled_prompt: `Người có tính cách O, giới tính Nam, độ tuổi 18, có thực hiện khám phá quán cafe Đà Nẵng mới không?\nLoại câu trả lời: yesno\nCó\nKhông`,
    question_type: "yesno",
  },
]

export default function ManageQuestionsPage() {
  // DB questions are editable: start from mock DB. Expert list starts empty.
  const [dbQuestions, setDbQuestions] = useState<Question[]>(MOCK_DB_QUESTIONS)
  const [expertSelected, setExpertSelected] = useState<Record<string, boolean>>({})
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  // UI polish: search and filter for enterprise UX
  const [searchQuery, setSearchQuery] = useState("")
  const [intentFilter, setIntentFilter] = useState("")
  const { toast } = useToast()

  // drag-and-drop ordering state for Expert Questions
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = "move"
    try { e.dataTransfer.setData("text/plain", id) } catch (err) { /* some browsers require try/catch */ }
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault()
    const sourceId = draggedId || e.dataTransfer.getData("text/plain")
    if (!sourceId || sourceId === targetId) {
      setDraggedId(null)
      return
    }

    setExpertQuestions(prev => {
      const copy = [...prev]
      const fromIndex = copy.findIndex(x => x.id === sourceId)
      const toIndex = copy.findIndex(x => x.id === targetId)
      if (fromIndex === -1 || toIndex === -1) return prev
      const [moved] = copy.splice(fromIndex, 1)
      copy.splice(toIndex, 0, moved)
      return copy
    })

    setDraggedId(null)
  }

  // New state: questions-manage expert questions list so we can edit/delete/reorder
  const [expertQuestions, setExpertQuestions] = useState<Question[]>([])
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

  const toggleExpert = (id: string, value: boolean) => {
    setExpertSelected(prev => ({ ...prev, [id]: value }))
  }

  // Move a DB question into Expert questions for editing/rating
  const moveDbToExpert = (id: string) => {
    const q = dbQuestions.find(d => d.id === id)
    if (!q) return
    setExpertQuestions(prev => [q, ...prev])
    setDbQuestions(prev => prev.filter(d => d.id !== id))
    // remove any lingering selection state
    setExpertSelected(prev => ({ ...prev }))
    toast({ title: "Moved", description: `Question moved to Expert list` })
  }

  const createQuestionSet = () => {
    // After DB questions are moved to Expert list, only Expert-side selections apply
    const selectedExpertIds = Object.entries(expertSelected).filter(([_, v]) => v).map(([k]) => k)
    const questionIds = [...selectedExpertIds]

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

    // Reset form
    setName("")
    setDescription("")

    // Move all expert questions back to the Database Questions list and clear expert area
    // Preserve any edits made to expert questions by using the expertQuestions state
    setDbQuestions(prev => {
      // avoid duplicates by filtering out any DB items that have same id as expert ones
      const expertIds = new Set(expertQuestions.map(q => q.id))
      const filteredPrev = prev.filter(p => !expertIds.has(p.id))
      return [...expertQuestions, ...filteredPrev]
    })

    // Clear expert questions and selection state
    setExpertQuestions([])
    setExpertSelected({})
  }

  // delete saved question set
  const deleteQuestionSet = (id: string) => {
    if (!window.confirm("Delete this question set?")) return
    setQuestionSets(prev => prev.filter(s => s.id !== id))
    toast({ title: "Deleted", description: "Question set removed" })
  }

  // Expert question actions
  const [pendingMoveId, setPendingMoveId] = useState<string | null>(null)

  // perform the actual move from Expert back to DB
  const deleteExpertQuestion = (id: string) => {
    // find question in expert list
    const q = expertQuestions.find(q => q.id === id)
    if (q) {
      // add back to DB questions at the top
      setDbQuestions(prev => [q, ...prev])
    }

    // remove from expert list
    setExpertQuestions(prev => prev.filter(q => q.id !== id))

    // remove any expert selection state
    setExpertSelected(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })

    toast({ title: "Moved", description: "Question moved back to Database Questions" })
  }

  const promptMoveBack = (id: string) => {
    setPendingMoveId(id)
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
  const selectedExpertQuestions = expertQuestions.filter(q => expertSelected[q.id])
  const selectedQuestions = [...selectedExpertQuestions]

  // helper to get question name by id
  const getQuestionById = (id: string) => {
    return dbQuestions.concat(expertQuestions).find(q => q.id === id)
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
  const allIntents = Array.from(new Set(dbQuestions.concat(expertQuestions).map(q => q.intent))).filter(Boolean)

  // filtered lists based on search and intent filter
  const filteredDbQuestions = dbQuestions.filter(q => {
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
              <CardDescription>List of all questions from the database</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-[520px] overflow-y-auto">
                {filteredDbQuestions.map((q) => (
                  <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-white hover:shadow-md transition transform hover:-translate-y-0.5">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${intentColor(q.intent)}`}>{q.intent}</Badge>
                          <div className="font-medium">{q.name}</div>
                        </div>
                        <div>
                          <Button size="sm" variant="ghost" onClick={() => moveDbToExpert(q.id)}>Add</Button>
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
                  <div
                    key={q.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, q.id)}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, q.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg bg-white hover:shadow-md transition transform ${draggedId === q.id ? "opacity-60" : "hover:-translate-y-0.5"}`}>
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

                              <DropdownMenuItem onClick={() => startEdit(q)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => promptMoveBack(q.id)} variant="destructive">
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
              <div className="text-sm text-muted-foreground">Selected total: {(Object.values(expertSelected).filter(Boolean).length)} questions</div>
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
                          {/* Drag handle hint */}
                          <div className="text-xs text-muted-foreground">Drag to reorder</div>
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

        {/* Centered modal confirmation for delete/move-back */}
        {pendingMoveId && (() => {
          const q = expertQuestions.find(x => x.id === pendingMoveId) || dbQuestions.find(x => x.id === pendingMoveId)
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setPendingMoveId(null)} />

              <div className="relative w-full max-w-lg px-4">
                <Card className="shadow-2xl">
                  <CardHeader>
                    <CardTitle>Delete Question</CardTitle>
                    <CardDescription>Are you sure you want to delete this question?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {q ? (
                      <div className="space-y-4">
                        <div className="font-medium text-lg">{q.name}</div>
                        <div className="text-sm text-muted-foreground italic line-clamp-3">{q.filled_prompt}</div>
                        <div className="text-xs text-muted-foreground">ID: <span className="font-mono">{q.id}</span></div>

                        <div className="flex items-center justify-end gap-3 pt-4">
                          <Button variant="outline" onClick={() => setPendingMoveId(null)}>Cancel</Button>
                          <Button className="bg-red-600" onClick={() => { if (pendingMoveId) deleteExpertQuestion(pendingMoveId); setPendingMoveId(null) }}>Delete</Button>
                        </div>
                      </div>
                    ) : (
                      <div>Question not found.</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
