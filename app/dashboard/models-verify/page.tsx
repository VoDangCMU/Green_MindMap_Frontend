"use client"

import { ModelsTable } from "@/components/models/ModelsTable"

export default function ModelsVerifyPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Models Verification</h1>
        <p className="text-muted-foreground">View and verify AI models with their feedback</p>
      </div>
      <ModelsTable />
    </div>
  )
}

