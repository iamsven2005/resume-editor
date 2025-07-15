"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, GripVertical, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PanelConfig {
  id: string
  title: string
  icon?: React.ReactNode
  component: React.ReactNode
  headerActions?: React.ReactNode
  defaultCollapsed?: boolean
  className?: string
}

interface PanelLayoutManagerProps {
  panels: PanelConfig[]
  className?: string
}

export function PanelLayoutManager({ panels, className }: PanelLayoutManagerProps) {
  const [panelOrder, setPanelOrder] = useState<string[]>([])
  const [collapsedPanels, setCollapsedPanels] = useState<Set<string>>(new Set())

  // Initialize panel order and collapse all panels by default
  useEffect(() => {
    const initialOrder = panels.map((panel) => panel.id)
    setPanelOrder(initialOrder)

    // Collapse ALL panels by default
    const allPanelIds = new Set(panels.map((panel) => panel.id))
    setCollapsedPanels(allPanelIds)
  }, [panels])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(panelOrder)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setPanelOrder(items)
  }

  const togglePanel = (panelId: string) => {
    setCollapsedPanels((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(panelId)) {
        newSet.delete(panelId)
      } else {
        newSet.add(panelId)
      }
      return newSet
    })
  }

  const expandAll = () => {
    setCollapsedPanels(new Set())
  }

  const collapseAll = () => {
    const allPanelIds = new Set(panels.map((panel) => panel.id))
    setCollapsedPanels(allPanelIds)
  }

  const expandedCount = panels.length - collapsedPanels.size

  return (
    <div className={cn("space-y-6", className)}>
      {/* Global Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Panels</h2>
          <Badge variant="secondary" className="text-xs">
            {expandedCount} of {panels.length} expanded
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll} disabled={expandedCount === panels.length}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll} disabled={expandedCount === 0}>
            <Minimize2 className="h-4 w-4 mr-2" />
            Collapse All
          </Button>
        </div>
      </div>

      {/* Draggable Panels */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="panels">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {panelOrder.map((panelId, index) => {
                const panel = panels.find((p) => p.id === panelId)
                if (!panel) return null

                const isCollapsed = collapsedPanels.has(panelId)

                return (
                  <Draggable key={panelId} draggableId={panelId} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn("transition-shadow", snapshot.isDragging && "shadow-lg", panel.className)}
                      >
                        <CardHeader className="pb-3 cursor-pointer select-none" onClick={() => togglePanel(panelId)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex items-center gap-2">
                                {isCollapsed ? (
                                  <ChevronRight className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                                {panel.icon}
                                <CardTitle className="text-base">{panel.title}</CardTitle>
                              </div>
                            </div>
                            {panel.headerActions && (
                              <div onClick={(e) => e.stopPropagation()}>{panel.headerActions}</div>
                            )}
                          </div>
                        </CardHeader>
                        {!isCollapsed && <CardContent className="pt-0">{panel.component}</CardContent>}
                      </Card>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
