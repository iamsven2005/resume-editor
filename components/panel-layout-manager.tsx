"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Maximize2, Minimize2, RotateCcw } from "lucide-react"
import { DraggablePanel } from "./draggable-panel"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export interface PanelConfig {
  id: string
  title: string
  icon?: React.ReactNode
  component: React.ReactNode
  headerActions?: React.ReactNode
  defaultCollapsed?: boolean
}

interface PanelLayoutManagerProps {
  panels: PanelConfig[]
  className?: string
}

export const PanelLayoutManager = ({ panels, className }: PanelLayoutManagerProps) => {
  const isMobile = useIsMobile()
  const [panelOrder, setPanelOrder] = useState<string[]>(panels.map((p) => p.id))
  const [collapsedPanels, setCollapsedPanels] = useState<Set<string>>(
    new Set(panels.filter((p) => p.defaultCollapsed).map((p) => p.id)),
  )

  // Determine if we should use vertical layout based on screen size
  const [isVerticalLayout, setIsVerticalLayout] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      // Use vertical layout on screens smaller than 1280px (xl breakpoint)
      setIsVerticalLayout(window.innerWidth < 1280)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Reset panel order when panels change
  useEffect(() => {
    setPanelOrder(panels.map((p) => p.id))
  }, [panels])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const newOrder = Array.from(panelOrder)
    const [reorderedPanel] = newOrder.splice(result.source.index, 1)
    newOrder.splice(result.destination.index, 0, reorderedPanel)

    setPanelOrder(newOrder)
  }

  const togglePanelCollapse = (panelId: string) => {
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

  const expandAllPanels = () => {
    setCollapsedPanels(new Set())
  }

  const collapseAllPanels = () => {
    setCollapsedPanels(new Set(panels.map((p) => p.id)))
  }

  const resetPanelOrder = () => {
    setPanelOrder(panels.map((p) => p.id))
  }

  const orderedPanels = panelOrder
    .map((id) => panels.find((p) => p.id === id))
    .filter((p): p is PanelConfig => p !== undefined)

  const collapsedCount = collapsedPanels.size
  const totalPanels = panels.length
  const expandedCount = totalPanels - collapsedCount

  // Calculate dynamic grid columns for desktop horizontal layout
  const getGridTemplateColumns = () => {
    if (isVerticalLayout || isMobile) return undefined

    // Base unit for collapsed panels (narrow width)
    const collapsedWidth = "60px"

    // Create template with collapsed panels taking minimal space
    // and expanded panels sharing the remaining space equally
    const columns = orderedPanels.map((panel) => {
      return collapsedPanels.has(panel.id) ? collapsedWidth : "1fr"
    })

    return columns.join(" ")
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Panel Controls */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {expandedCount} of {totalPanels} expanded
          </Badge>
          {collapsedCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {collapsedCount} collapsed
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAllPanels}
            disabled={collapsedCount === 0}
            className="h-7 px-2 text-xs"
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAllPanels}
            disabled={collapsedCount === totalPanels}
            className="h-7 px-2 text-xs"
          >
            <Minimize2 className="h-3 w-3 mr-1" />
            Collapse All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetPanelOrder}
            className="h-7 px-2 text-xs"
            title="Reset panel order"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Draggable Panels */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="panels" direction={isVerticalLayout || isMobile ? "vertical" : "horizontal"}>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={cn(
                "transition-colors duration-200 w-full",
                // Vertical layout for mobile and smaller screens
                isVerticalLayout || isMobile ? "flex flex-col gap-4" : "grid gap-4",
                snapshot.isDraggingOver && "bg-accent/10 rounded-lg p-2",
              )}
              style={
                !isVerticalLayout && !isMobile
                  ? {
                      gridTemplateColumns: getGridTemplateColumns(),
                    }
                  : undefined
              }
            >
              {orderedPanels.map((panel, index) => (
                <DraggablePanel
                  key={panel.id}
                  id={panel.id}
                  index={index}
                  title={panel.title}
                  icon={panel.icon}
                  isCollapsed={collapsedPanels.has(panel.id)}
                  onToggleCollapse={() => togglePanelCollapse(panel.id)}
                  headerActions={panel.headerActions}
                  isVerticalLayout={isVerticalLayout || isMobile}
                  className={cn(
                    // Ensure minimum height for collapsed panels on desktop horizontal layout
                    !isVerticalLayout && !isMobile && collapsedPanels.has(panel.id) && "min-h-[600px]",
                  )}
                >
                  {panel.component}
                </DraggablePanel>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
