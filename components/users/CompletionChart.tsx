"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useScenarioStore } from "@/store/useScenarioStore"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export function CompletionChart() {
  const { scenarios, users } = useScenarioStore()

  // Calculate completion stats per scenario
  const scenarioStats = scenarios.map((scenario) => {
    const assignedUsers = users.filter((u) => u.assignedScenarios?.includes(scenario.id))
    const completedUsers = assignedUsers.filter((u) => u.status === "completed")
    const completionRate = assignedUsers.length > 0 ? (completedUsers.length / assignedUsers.length) * 100 : 0

    return {
      name: scenario.name.substring(0, 30) + "...",
      completion: Math.round(completionRate),
      total: assignedUsers.length,
      completed: completedUsers.length,
    }
  })

  // Overall status distribution
  const statusData = [
    {
      name: "Pending",
      value: users.filter((u) => u.status === "pending").length,
    },
    {
      name: "Completed",
      value: users.filter((u) => u.status === "completed").length,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Completion Rate by Scenario</CardTitle>
        </CardHeader>
        <CardContent>
          {scenarioStats.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No scenarios with assigned users yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scenarioStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completion" fill="#8884d8" name="Completion %" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overall User Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
