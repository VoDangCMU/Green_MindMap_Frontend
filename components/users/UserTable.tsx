"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useScenarioStore } from "@/store/useScenarioStore"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Eye } from "lucide-react"

export function UserTable() {
  const { users, scenarios, updateUserStatus } = useScenarioStore()
  const { toast } = useToast()
  const [locationFilter, setLocationFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredUsers = users.filter((user) => {
    if (locationFilter !== "all" && user.location !== locationFilter) return false
    if (statusFilter !== "all" && user.status !== statusFilter) return false
    return true
  })

  const handleMarkCompleted = (userId: string) => {
    updateUserStatus(userId, "completed")
    toast({
      title: "Status Updated",
      description: "User marked as completed.",
    })
  }

  const getScenarioName = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId)
    return scenario?.name || scenarioId
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users & Survey Status</CardTitle>
        <div className="flex gap-4">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
              <SelectItem value="Hà Nội">Hà Nội</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Assigned Scenarios</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.age}</TableCell>
                <TableCell>{user.location}</TableCell>
                <TableCell>
                  {user.assignedScenarios && user.assignedScenarios.length > 0 ? (
                    <div className="space-y-1">
                      {user.assignedScenarios.map((scenarioId) => (
                        <div key={scenarioId} className="text-xs">
                          {getScenarioName(scenarioId)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === "completed" ? "default" : "secondary"}>
                    {user.status || "pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {user.status !== "completed" && (
                      <Button size="sm" variant="outline" onClick={() => handleMarkCompleted(user.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Completed
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
