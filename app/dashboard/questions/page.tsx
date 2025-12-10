"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save } from "lucide-react"
import { Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAllModels, generateTemplate as apiGenerateTemplate, createTemplates, combineQuestion, createQuestions } from "@/lib/auth"
import { Checkbox } from "@/components/ui/checkbox"

interface Model {
  id: string
  ocean: string
  behavior: string
  age: string
  location: string
  gender: string
  keywords: string
}

interface Template {
  id: string
  name: string
  description: string
  intent: string
  prompt: string
  question_type: string
  filled_prompt: string
  answer: {
    type: string
    scale?: number[]
    labels?: string[]
    options?: string[]
  }
  placeholders?: {
    required: string[]
    optional: string[]
    used_placeholders: string[]
  }
}

interface GeneratedTemplateResponse {
  input: Model
  templates: Template[]
}

export default function QuestionBuilderPage() {
  const router = useRouter()
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingModels, setLoadingModels] = useState(true)
  const [generatingModelId, setGeneratingModelId] = useState<number | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [saving, setSaving] = useState(false)

  // New states for question generation
  const [selectedTemplates, setSelectedTemplates] = useState<Template[]>([])
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [savingQuestions, setSavingQuestions] = useState(false)

  const { toast } = useToast()

  // Load models on mount
  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      setLoadingModels(true)
      const response = await getAllModels()


      const modelsData = response.data || response || []
      setModels(modelsData)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách model",
        variant: "destructive",
      })
    } finally {
      setLoadingModels(false)
    }
  }

  const generateTemplate = async (model: Model, index: number) => {
    try {
      setGeneratingModelId(index)
      setLoading(true)
      setSelectedModel(model)

      const data: GeneratedTemplateResponse = await apiGenerateTemplate(model) // ✅ Sử dụng apiGenerateTemplate với Authorization header
      setTemplates(data.templates)

      toast({
        title: "Thành công",
        description: `Đã tạo ${data.templates.length} templates`,
      })
    } catch (error) {
      console.error('❌ Error generating template:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo template",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setGeneratingModelId(null)
    }
  }

  const saveTemplates = async () => {
    if (templates.length === 0) return

    try {
      setSaving(true)

      const data = await createTemplates({ templates })

      toast({
        title: "Thành công",
        description: data.message || `Đã lưu ${data.count || templates.length} templates`,
      })

      // Clear templates after successful save
      setTemplates([])
      setSelectedModel(null)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu templates",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // New function to handle template selection
  const handleTemplateSelect = (template: Template, isSelected: boolean) => {
    if (isSelected) {
      setSelectedTemplates(prev => [...prev, template])
    } else {
      setSelectedTemplates(prev => prev.filter(t => t.id !== template.id))
    }
  }

  // New function to generate questions from selected templates
  const generateQuestions = async () => {
    if (selectedTemplates.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một template để tạo câu hỏi",
        variant: "destructive",
      })
      return
    }

    if (!selectedModel) {
      toast({
        title: "Lỗi",
        description: "Không có model được chọn",
        variant: "destructive",
      })
      return
    }

    setGeneratingQuestions(true)
    try {

      // Create payload with same structure as generateTemplate response
      const payload = {
        input: selectedModel,
        templates: selectedTemplates
      }

      // Use combineQuestion API to generate questions from templates
      const response = await combineQuestion(payload)

      const questionsData = response.questions || response.data || response || []
      setGeneratedQuestions(questionsData)

      toast({
        title: "Thành công",
        description: `Đã tạo ${questionsData.length} câu hỏi từ ${selectedTemplates.length} templates`,
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo câu hỏi từ templates",
        variant: "destructive",
      })
    } finally {
      setGeneratingQuestions(false)
    }
  }

  // New function to save generated questions
  const saveGeneratedQuestions = async () => {
    if (generatedQuestions.length === 0) return

    if (!selectedModel?.id) {
      toast({
        title: "Lỗi",
        description: "Không có model được chọn hoặc model không có ID",
        variant: "destructive",
      })
      return
    }

    setSavingQuestions(true)
    try {

      // Transform generatedQuestions to match the required payload format
      const questionsPayload = {
        questions: generatedQuestions.map(question => ({
          question: question.filled_prompt,
          templateId: question.id,
          modelId: selectedModel.id
        }))
      }

      // Use createQuestions API to save all questions at once
      const response = await createQuestions(questionsPayload)

      toast({
        title: "Thành công",
        description: `Đã lưu ${generatedQuestions.length} câu hỏi`,
      })

      // Clear generated questions after successful save
      setGeneratedQuestions([])
      setSelectedTemplates([])

      // Redirect to question management page
      router.push('/dashboard/questions-manage')
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu câu hỏi",
        variant: "destructive",
      })
    } finally {
      setSavingQuestions(false)
    }
  }

  const getIntentBadgeColor = (intent: string) => {
    switch (intent) {
      case "frequency":
        return "bg-blue-500"
      case "yesno":
        return "bg-green-500"
      case "likert5":
        return "bg-purple-500"
      case "rating":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Question Builder</h1>
          <p className="text-base text-muted-foreground">
            Create question templates from models and generate survey questions
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Models List - Left Column */}
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-2xl">Danh sách Models</CardTitle>
              <CardDescription className="text-base">Chọn model để tạo template câu hỏi</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loadingModels ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : models.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">Chưa có model nào</div>
              ) : (
                <div className="space-y-3 max-h-[650px] overflow-y-auto pr-2">
                  {models.map((model, index) => (
                    <Card key={index} className="border hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-semibold">{model.ocean}</Badge>
                                <span className="font-semibold text-sm">{model.behavior}</span>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>
                                  <span className="font-medium">Tuổi:</span> {model.age} • <span className="font-medium">Giới tính:</span> {model.gender}
                                </div>
                                <div>
                                  <span className="font-medium">Địa điểm:</span> {model.location}
                                </div>
                                <div className="text-xs italic text-gray-500">"{model.keywords}"</div>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => generateTemplate(model, index)}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            size="sm"
                          >
                            {generatingModelId === index ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tạo...
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Tạo Template
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Templates - Right Column */}
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl">Templates đã tạo</CardTitle>
                  <CardDescription className="text-base">
                    {templates.length > 0 ? `${templates.length} templates từ model đã chọn` : "Chưa có template nào"}
                  </CardDescription>
                </div>
                {templates.length > 0 && (
                  <Button
                    onClick={saveTemplates}
                    disabled={saving}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    size="sm"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Lưu
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {selectedModel && templates.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-semibold mb-1 text-blue-900">Model đã chọn:</div>
                  <div className="text-xs text-blue-800">
                    {selectedModel.ocean} • {selectedModel.behavior} • {selectedModel.age} tuổi • {selectedModel.gender} •{" "}
                    {selectedModel.location}
                  </div>
                </div>
              )}

              {templates.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-base">Chọn một model và nhấn "Tạo Template"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Templates list */}
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
                    {templates.map((template, index) => (
                      <Card key={index} className="border hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                id={`template-${index}`}
                                checked={selectedTemplates.some(t => t.id === template.id)}
                                onCheckedChange={(checked) => handleTemplateSelect(template, checked as boolean)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <Badge className={getIntentBadgeColor(template.intent)}>{template.intent}</Badge>
                                  <span className="font-medium text-sm">{template.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                              </div>
                            </div>

                            <div className="bg-gray-100 p-2 rounded text-sm ml-7 italic">{template.filled_prompt}</div>

                            <div className="text-xs space-y-1 ml-7">
                              <div className="font-semibold text-gray-700">Loại câu trả lời:</div>
                              {template.answer.type === "scale" && (
                                <div className="flex flex-wrap gap-1">
                                  {template.answer.labels?.map((label, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {template.answer.scale?.[i]}: {label}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {template.answer.type === "binary" && (
                                <div className="flex gap-1">
                                  {template.answer.options?.map((option, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {option}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Generate Questions Button */}
                  {selectedTemplates.length > 0 && (
                    <div className="flex justify-center pt-4 border-t mt-4">
                      <Button
                        onClick={generateQuestions}
                        disabled={generatingQuestions || selectedTemplates.length === 0}
                        size="lg"
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                      >
                        {generatingQuestions ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang sinh câu hỏi...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Sinh Câu Hỏi ({selectedTemplates.length})
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generated Questions Section */}
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl">Câu hỏi đã tạo</CardTitle>
                <CardDescription className="text-base">
                  {generatedQuestions.length > 0
                    ? `${generatedQuestions.length} câu hỏi từ ${selectedTemplates.length} templates đã chọn`
                    : "Chưa có câu hỏi nào"}
                </CardDescription>
              </div>
              {generatedQuestions.length > 0 && (
                <Button
                  onClick={saveGeneratedQuestions}
                  disabled={savingQuestions}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  size="sm"
                >
                  {savingQuestions ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Lưu Câu Hỏi
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {generatedQuestions.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-base">Chọn ít nhất một template và nhấn "Sinh Câu Hỏi"</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {generatedQuestions.map((question, index) => (
                  <Card key={index} className="border hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge className={getIntentBadgeColor(question.intent)}>{question.intent}</Badge>
                              <span className="font-medium text-sm">{question.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">ID: {question.id}</p>
                          </div>
                        </div>

                        <div className="bg-gray-100 p-2 rounded text-sm italic">{question.filled_prompt}</div>

                        <div className="text-xs space-y-1">
                          <div className="font-semibold text-gray-700">Loại câu trả lời: {question.question_type}</div>
                          {question.answer.type === "scale" && question.answer.labels && (
                            <div className="flex flex-wrap gap-1">
                              {question.answer.labels.map((label: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {question.answer.scale?.[i]}: {label}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {question.answer.type === "binary" && question.answer.options && (
                            <div className="flex gap-1">
                              {question.answer.options.map((option: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
