"use client"

import { BehaviorFeedbackTable } from "@/components/behavior/BehaviorFeedbackTable"

export default function BehaviorFeedbackPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Behavior Feedback</h1>
        <p className="text-muted-foreground">View and analyze user behavior feedback with OCEAN insights</p>
      </div>
      <BehaviorFeedbackTable />
    </div>
  )
}

