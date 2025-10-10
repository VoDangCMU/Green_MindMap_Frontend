"use client"

import { UserTable } from "@/components/users/UserTable"
import { CompletionChart } from "@/components/users/CompletionChart"

export default function UsersPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Users & Results</h1>
        <p className="text-muted-foreground">Manage users and track survey completion status</p>
      </div>
      <CompletionChart />
      <UserTable />
    </div>
  )
}
