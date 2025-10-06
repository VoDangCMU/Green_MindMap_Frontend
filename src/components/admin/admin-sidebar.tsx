"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Settings, ChevronRight, ChevronDown, Target, Zap } from "lucide-react"

type DragItem = {
  id: number
  name: string
  type: "threadhall" | "trait" | "behavior"
  parentId?: number
}

type Behavior = {
  id: number
  name: string
  description: string
}

type Trait = {
  id: number
  name: string
  description: string
  behaviors: Behavior[]
}

type ThreadHall = {
  id: number
  name: string
  description: string
  traits: Trait[]
}

interface AdminSidebarProps {
  threadHalls: ThreadHall[]
  expandedThreadHalls: Set<number>
  expandedTraits: Set<number>
  onToggleThreadHall: (id: number) => void
  onToggleTrait: (id: number) => void
  onDragStart: (e: React.DragEvent, item: DragItem) => void
}

export function AdminSidebar({
  threadHalls,
  expandedThreadHalls,
  expandedTraits,
  onToggleThreadHall,
  onToggleTrait,
  onDragStart,
}: AdminSidebarProps) {
  return (
    <div className="w-80 border-r border-border bg-sidebar overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-sidebar-foreground mb-4">Components</h2>

        <div className="space-y-2">
          {threadHalls.map((threadHall) => (
            <div key={threadHall.id} className="space-y-1">
              <Card
                className="p-3 cursor-pointer hover:bg-sidebar-accent transition-colors"
                onClick={() => onToggleThreadHall(threadHall.id)}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-2 flex-1"
                    draggable
                    onDragStart={(e) =>
                      onDragStart(e, {
                        id: threadHall.id,
                        name: threadHall.name,
                        type: "threadhall",
                      })
                    }
                  >
                    <Settings className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-sidebar-foreground">{threadHall.name}</p>
                      <p className="text-xs text-muted-foreground">{threadHall.description}</p>
                    </div>
                  </div>
                  {expandedThreadHalls.has(threadHall.id) ? (
                    <ChevronDown className="h-4 w-4 text-sidebar-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
                  )}
                </div>
              </Card>

              {expandedThreadHalls.has(threadHall.id) && (
                <div className="ml-4 space-y-1">
                  {threadHall.traits.map((trait) => (
                    <div key={trait.id} className="space-y-1">
                      <Card
                        className="p-2 cursor-pointer hover:bg-sidebar-accent transition-colors"
                        onClick={() => onToggleTrait(trait.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="flex items-center gap-2 flex-1"
                            draggable
                            onDragStart={(e) =>
                              onDragStart(e, {
                                id: trait.id,
                                name: trait.name,
                                type: "trait",
                                parentId: threadHall.id,
                              })
                            }
                          >
                            <Target className="h-3 w-3 text-primary" />
                            <div>
                              <p className="text-sm font-medium text-sidebar-foreground">{trait.name}</p>
                              <p className="text-xs text-muted-foreground">{trait.description}</p>
                            </div>
                          </div>
                          {expandedTraits.has(trait.id) ? (
                            <ChevronDown className="h-3 w-3 text-sidebar-foreground" />
                          ) : (
                            <ChevronRight className="h-3 w-3 text-sidebar-foreground" />
                          )}
                        </div>
                      </Card>

                      {expandedTraits.has(trait.id) && (
                        <div className="ml-4 space-y-1">
                          {trait.behaviors.map((behavior) => (
                            <Card
                              key={behavior.id}
                              className="p-2 cursor-pointer hover:bg-sidebar-accent transition-colors"
                            >
                              <div
                                className="flex items-center gap-2"
                                draggable
                                onDragStart={(e) =>
                                  onDragStart(e, {
                                    id: behavior.id,
                                    name: behavior.name,
                                    type: "behavior",
                                    parentId: trait.id,
                                  })
                                }
                              >
                                <Zap className="h-3 w-3 text-accent-foreground" />
                                <div>
                                  <p className="text-sm font-medium text-sidebar-foreground">{behavior.name}</p>
                                  <p className="text-xs text-muted-foreground">{behavior.description}</p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
