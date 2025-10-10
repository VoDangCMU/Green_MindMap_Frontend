"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useScenarioStore } from "@/store/useScenarioStore"
import { useToast } from "@/hooks/use-toast"
import { Send, Trash2, Eye, Download, ListChecks } from "lucide-react"
import { QuestionModal } from "./QuestionModal"

interface SurveyScenarioTableProps {
  onViewResult: (scenarioId: string) => void
}

export function SurveyScenarioTable({ onViewResult }: SurveyScenarioTableProps) {
  const { scenarios, simulateDistribution, deleteScenario, exportScenariosAsJSON } = useScenarioStore()
  const { toast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("")

  const handleSimulate = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId)

    if (!scenario?.questions || scenario.questions.length === 0) {
      toast({
        title: "No Questions Selected",
        description: "Please select at least one question before simulating.",
        variant: "destructive",
      })
      return
    }

    simulateDistribution(scenarioId)
    onViewResult(scenarioId)
    toast({
      title: "Survey Distributed",
      description: "Survey has been sent to assigned users. Check results below.",
    })
  }

  const handleDelete = (scenarioId: string) => {
    deleteScenario(scenarioId)
    toast({
      title: "Scenario Deleted",
      description: "The scenario has been removed.",
    })
  }

  const handleViewResult = (scenarioId: string) => {
    onViewResult(scenarioId)
    toast({
      title: "Viewing Results",
      description: "Check the simulation results below.",
    })
  }

  const handleSelectQuestions = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId)
    setModalOpen(true)
  }

  const currentScenario = scenarios.find((s) => s.id === selectedScenarioId)

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Demographic Scenarios</CardTitle>
            {scenarios.length > 0 && (
              <Button onClick={() => exportScenariosAsJSON()} variant="outline" size="sm" className="shadow-sm">
                <Download className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {scenarios.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No scenarios created yet. Use the form above to create one.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold">#</TableHead>
                    <TableHead className="font-semibold">Age Range</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">%</TableHead>
                    <TableHead className="font-semibold">Questions</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scenarios.map((scenario, index) => (
                    <TableRow key={scenario.id} className="transition-colors hover:bg-gray-50/50">
                      <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-semibold">
                        {scenario.demographic.ageRange[0]}–{scenario.demographic.ageRange[1]}
                      </TableCell>
                      <TableCell className="font-medium">{scenario.demographic.location}</TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        {(scenario.percentage * 100).toFixed(0)}%
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {scenario.questions.length} selected
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={scenario.status === "sent" ? "default" : "secondary"}
                          className="font-medium shadow-sm"
                        >
                          {scenario.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {scenario.status === "draft" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSelectQuestions(scenario.id)}
                                className="shadow-sm"
                              >
                                <ListChecks className="mr-2 h-4 w-4" />
                                Select Qs
                              </Button>
                              <Button size="sm" onClick={() => handleSimulate(scenario.id)} className="shadow-sm">
                                <Send className="mr-2 h-4 w-4" />
                                Simulate
                              </Button>
                            </>
                          )}
                          {scenario.status === "sent" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewResult(scenario.id)}
                              className="shadow-sm"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Result
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(scenario.id)}
                            className="shadow-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {currentScenario && (
        <QuestionModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          scenarioId={selectedScenarioId}
          selectedQuestions={currentScenario.questions}
        />
      )}
    </>
  )
}
