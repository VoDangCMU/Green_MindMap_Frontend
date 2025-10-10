"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useScenarioStore } from "@/store/useScenarioStore"
import { CheckCircle2 } from "lucide-react"

interface SurveySimulatorProps {
  selectedScenarioId: string | null
}

export function SurveySimulator({ selectedScenarioId }: SurveySimulatorProps) {
  const { scenarios, users, questions } = useScenarioStore()

  const sentScenarios = scenarios.filter((s) => s.status === "sent")

  if (sentScenarios.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Assignment Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No simulations run yet. Click "Simulate" on a scenario to see results.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayScenario = selectedScenarioId
    ? sentScenarios.find((s) => s.id === selectedScenarioId) || sentScenarios[sentScenarios.length - 1]
    : sentScenarios[sentScenarios.length - 1]

  const eligibleUsers = users.filter((u) => {
    const inAgeRange =
      u.age >= displayScenario.demographic.ageRange[0] && u.age <= displayScenario.demographic.ageRange[1]
    const inLocation =
      displayScenario.demographic.location === "All Locations" || u.location === displayScenario.demographic.location
    return inAgeRange && inLocation
  })

  const assignedCount = displayScenario.usersAssigned.length
  const notAssignedCount = eligibleUsers.length - assignedCount
  const assignmentRate = eligibleUsers.length > 0 ? (assignedCount / eligibleUsers.length) * 100 : 0

  const selectedQuestions = questions.filter((q) => displayScenario.questions.includes(q.id))

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-xl">Assignment Overview</CardTitle>
          <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm">
            <p className="font-medium text-blue-900">
              Scenario:{" "}
              <span className="font-bold">
                {displayScenario.demographic.ageRange[0]}–{displayScenario.demographic.ageRange[1]}
              </span>{" "}
              | <span className="font-bold">{displayScenario.demographic.location}</span> (
              {(displayScenario.percentage * 100).toFixed(0)}%) | Eligible Users:{" "}
              <span className="font-bold">{eligibleUsers.length}</span> | Assigned:{" "}
              <span className="font-bold">{assignedCount}</span> ({assignmentRate.toFixed(0)}%)
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {eligibleUsers.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 py-12 text-center">
              <p className="text-sm text-muted-foreground">No eligible users found for this demographic criteria.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="stat-card stat-card-primary">
                <div className="text-center">
                  <div className="stat-number text-7xl font-bold">{assignedCount}</div>
                  <p className="mt-3 text-base font-medium text-gray-600">Users Assigned</p>
                </div>
              </div>

              <div className="stat-card stat-card-secondary">
                <div className="text-center">
                  <div className="stat-number text-7xl font-bold">{notAssignedCount}</div>
                  <p className="mt-3 text-base font-medium text-gray-600">Not Assigned</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedQuestions.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Survey Questions ({selectedQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedQuestions.map((question, index) => (
                <div key={question.id} className="flex items-start gap-3 rounded-lg border bg-white p-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-base leading-relaxed">{question.text}</p>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {eligibleUsers.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">User Assignment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Age</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eligibleUsers.map((user) => {
                    const isAssigned = displayScenario.usersAssigned.includes(user.id)
                    return (
                      <TableRow key={user.id} className="transition-colors hover:bg-gray-50/50">
                        <TableCell className="font-semibold">{user.name}</TableCell>
                        <TableCell className="font-medium text-muted-foreground">{user.age}</TableCell>
                        <TableCell className="font-medium">{user.location}</TableCell>
                        <TableCell>
                          <Badge variant={isAssigned ? "default" : "secondary"} className="font-medium shadow-sm">
                            {isAssigned ? "Assigned" : "Not Assigned"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
