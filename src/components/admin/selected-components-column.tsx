"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Target, Zap, X } from "lucide-react"
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Selected Components</h3>
      <Card
        className={cn(
          "p-4 min-h-[400px] transition-all duration-200",
          isDragging && "ring-2 ring-primary/50 bg-primary/5"
        )}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="space-y-2">
          {!selectedThreadHallItem && !selectedTraitItem && !selectedBehaviorItem ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Drag components here to build your question set</p>
              <p className="text-xs mt-2">Select 1 Thread Hall → 1 Trait → 1 Behavior</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedThreadHallItem && (
                <Card className="p-3 bg-primary/10 border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-primary" />
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
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              )}

              {selectedTraitItem && (
                <Card className="p-3 bg-secondary/50 border-secondary ml-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
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
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              )}

              {selectedBehaviorItem && (
                <Card className="p-3 bg-accent/50 border-accent ml-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-accent-foreground" />
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
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
