"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { cn } from "@/lib/utils"

type DragItem = {
  id: number
  name: string
  type: "threadhall" | "trait" | "behavior"
  parentId?: number
}

interface SelectedComponentsColumnProps {
  selectedThreadHallItem: DragItem | null
  selectedTraitItem: DragItem | null
  selectedBehaviorItem: DragItem | null
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onRemoveThreadHall: () => void
  onRemoveTrait: () => void
  onRemoveBehavior: () => void
}

export function SelectedComponentsColumn({
  selectedThreadHallItem,
  selectedTraitItem,
  selectedBehaviorItem,
  isDragging,
  onDragOver,
  onDrop,
  onRemoveThreadHall,
  onRemoveTrait,
  onRemoveBehavior,
}: SelectedComponentsColumnProps) {
  return (
    <Card
      className={cn(
        "p-4 min-h-[400px] transition-all duration-200",
        isDragging && "ring-2 ring-primary/50 bg-primary/5",
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <h3 className="font-semibold text-card-foreground mb-4">Selected Components</h3>
      <div className="space-y-2">
        {!selectedThreadHallItem && !selectedTraitItem && !selectedBehaviorItem ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Drag components here to build your question set</p>
            <p className="text-xs mt-2">Select 1 Thread Hall → 1 Trait → 1 Behavior</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedThreadHallItem && (
              <Card className="p-3 bg-blue-500/10 border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium text-card-foreground">{selectedThreadHallItem.name}</p>
                      <p className="text-xs text-muted-foreground">Thread Hall</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemoveThreadHall}
                    className="h-6 w-6 p-0 hover:bg-destructive/20"
                  >
                    ×
                  </Button>
                </div>
              </Card>
            )}

            {selectedTraitItem && (
              <Card className="p-3 bg-green-500/10 border-green-500/20 ml-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    <div>
                      <p className="font-medium text-card-foreground">{selectedTraitItem.name}</p>
                      <p className="text-xs text-muted-foreground">Trait</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemoveTrait}
                    className="h-6 w-6 p-0 hover:bg-destructive/20"
                  >
                    ×
                  </Button>
                </div>
              </Card>
            )}

            {selectedBehaviorItem && (
              <Card className="p-3 bg-primary/10 border-primary/20 ml-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                    <div>
                      <p className="font-medium text-card-foreground">{selectedBehaviorItem.name}</p>
                      <p className="text-xs text-muted-foreground">Behavior</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemoveBehavior}
                    className="h-6 w-6 p-0 hover:bg-destructive/20"
                  >
                    ×
                  </Button>
                </div>
              </Card>
            )}

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    selectedThreadHallItem ? "bg-blue-500" : "bg-muted-foreground/30",
                  )}
                />
                <span className={selectedThreadHallItem ? "text-foreground" : "text-muted-foreground"}>
                  Thread Hall
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <div
                  className={cn("w-2 h-2 rounded-full", selectedTraitItem ? "bg-green-500" : "bg-muted-foreground/30")}
                />
                <span className={selectedTraitItem ? "text-foreground" : "text-muted-foreground"}>Trait</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <div
                  className={cn("w-2 h-2 rounded-full", selectedBehaviorItem ? "bg-primary" : "bg-muted-foreground/30")}
                />
                <span className={selectedBehaviorItem ? "text-foreground" : "text-muted-foreground"}>Behavior</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
