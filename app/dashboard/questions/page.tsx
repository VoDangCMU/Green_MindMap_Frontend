"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAllModels, generateTemplate as apiGenerateTemplate, createTemplates, combineQuestion, createQuestions } from "@/lib/auth"
import { Checkbox } from "@/components/ui/checkbox"

interface Model {
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
      console.log('🔍 Loading models with Authorization header...')
      const response = await getAllModels()


      const modelsData = response.data || response || []
      setModels(modelsData)
      console.log('Models loaded successfully:', modelsData)
    } catch (error) {
      console.error(' Error loading models:', error)
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

      console.log('🔍 Generating template with Authorization header...')
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

      console.log('Saving templates with Authorization header...')
      const data = await createTemplates({ templates })

      toast({
        title: "Thành công",
        description: data.message || `Đã lưu ${data.count || templates.length} templates`,
      })

      // Clear templates after successful save
      setTemplates([])
      setSelectedModel(null)
      console.log('Templates saved successfully:', data)
    } catch (error) {
      console.error('Error saving templates:', error)
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
      console.log('🔍 Generating questions from templates with Authorization header...')
      
      // Create payload with same structure as generateTemplate response
      const payload = {
        input: selectedModel,
        templates: selectedTemplates
      }

      console.log('📤 Sending payload to combineQuestion:', payload)

      // Use combineQuestion API to generate questions from templates
      const response = await combineQuestion(payload)

      const questionsData = response.questions || response.data || response || []
      setGeneratedQuestions(questionsData)
      
      toast({
        title: "Thành công",
        description: `Đã tạo ${questionsData.length} câu hỏi từ ${selectedTemplates.length} templates`,
      })
      
      console.log('✅ Questions generated successfully:', questionsData)
    } catch (error) {
      console.error('❌ Error generating questions:', error)
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

    setSavingQuestions(true)
    try {
      console.log('Saving generated questions with Authorization header...')
      
      // Transform generatedQuestions to match the required payload format
      const questionsPayload = {
        questions: generatedQuestions.map(question => ({
          id: question.id,
          name: question.name,
          intent: question.intent,
          question_type: question.question_type,
          filled_prompt: question.filled_prompt,
          answer: question.answer
        }))
      }

      console.log('Sending questions payload:', questionsPayload)

      // Use createQuestions API to save all questions at once
      const response = await createQuestions(questionsPayload)

      toast({
        title: "Thành công",
        description: `Đã lưu ${generatedQuestions.length} câu hỏi`,
      })
      
      // Clear generated questions after successful save
      setGeneratedQuestions([])
      setSelectedTemplates([])
      
      console.log('✅ Questions saved successfully:', response)
    } catch (error) {
      console.error('Error saving questions:', error)
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Question Builder</h1>
        <p className="text-muted-foreground">Chọn model để tạo templates câu hỏi khảo sát</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Models List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách Models</CardTitle>
            <CardDescription>Chọn model để tạo template câu hỏi</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingModels ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : models.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Chưa có model nào</div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {models.map((model, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{model.ocean}</Badge>
                              <span className="font-medium">{model.behavior}</span>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>
                                Tuổi: {model.age} • Giới tính: {model.gender}
                              </div>
                              <div>Địa điểm: {model.location}</div>
                              <div className="text-xs italic">"{model.keywords}"</div>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => generateTemplate(model, index)}
                          disabled={loading}
                          className="w-full"
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

        {/* Generated Templates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Templates đã tạo</CardTitle>
                <CardDescription>
                  {templates.length > 0 ? `${templates.length} templates từ model đã chọn` : "Chưa có template nào"}
                </CardDescription>
              </div>
              {templates.length > 0 && (
                <Button onClick={saveTemplates} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Lưu Templates
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedModel && templates.length > 0 && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-1">Model đã chọn:</div>
                <div className="text-xs text-muted-foreground">
                  {selectedModel.ocean} • {selectedModel.behavior} • {selectedModel.age} tuổi • {selectedModel.gender} •{" "}
                  {selectedModel.location}
                </div>
              </div>
            )}

            {templates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Chọn một model và nhấn "Tạo Template"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Templates list with checkboxes */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {templates.map((template, index) => (
                    <Card key={index} className="border">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            {/* Checkbox for template selection */}
                            <Checkbox
                              id={`template-${index}`}
                              checked={selectedTemplates.some(t => t.id === template.id)}
                              onCheckedChange={(checked) => handleTemplateSelect(template, checked as boolean)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={getIntentBadgeColor(template.intent)}>{template.intent}</Badge>
                                <span className="font-medium text-sm">{template.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                            </div>
                          </div>

                          <div className="bg-muted p-2 rounded text-sm ml-7">{template.filled_prompt}</div>

                          <div className="text-xs space-y-1 ml-7">
                            <div className="font-medium">Loại câu trả lời:</div>
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
                  <div className="flex justify-center pt-4 border-t">
                    <Button
                      onClick={generateQuestions}
                      disabled={generatingQuestions || selectedTemplates.length === 0}
                      size="lg"
                      className="w-full max-w-md"
                    >
                      {generatingQuestions ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang sinh câu hỏi...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Sinh Câu Hỏi ({selectedTemplates.length} templates đã chọn)
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

      {/* New section for question generation */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Câu hỏi đã tạo</CardTitle>
                <CardDescription>
                  {generatedQuestions.length > 0
                    ? `${generatedQuestions.length} câu hỏi từ ${selectedTemplates.length} templates đã chọn`
                    : "Chưa có câu hỏi nào"}
                </CardDescription>
              </div>
              {generatedQuestions.length > 0 && (
                <Button onClick={saveGeneratedQuestions} disabled={savingQuestions}>
                  {savingQuestions ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu câu hỏi...
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
          <CardContent>
            {generatedQuestions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Chọn ít nhất một template và nhấn "Sinh Câu Hỏi"</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {generatedQuestions.map((question, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getIntentBadgeColor(question.intent)}>{question.intent}</Badge>
                              <span className="font-medium text-sm">{question.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">ID: {question.id}</p>
                          </div>
                        </div>

                        <div className="bg-muted p-2 rounded text-sm">{question.filled_prompt}</div>

                        <div className="text-xs space-y-1">
                          <div className="font-medium">Loại câu trả lời: {question.question_type}</div>
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
