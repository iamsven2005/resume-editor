"use client"

import type React from "react"

import { Draggable } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GripVertical, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface DraggablePanelProps {
  id: string
  index: number
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  isCollapsed: boolean
  onToggleCollapse: () => void
  headerActions?: React.ReactNode
  className?: string
  isVerticalLayout?: boolean
}

export const DraggablePanel = ({
  id,
  index,
  title,
  icon,
  children,
  isCollapsed,
  onToggleCollapse,
  headerActions,
  className,
  isVerticalLayout = false,
}: DraggablePanelProps) => {
  // Determine collapse behavior based on layout
  const isHorizontalCollapse = !isVerticalLayout && isCollapsed
  const isVerticalCollapse = isVerticalLayout && isCollapsed

  const CollapseIcon = isVerticalLayout
    ? isCollapsed
      ? ChevronDown
      : ChevronUp
    : isCollapsed
      ? ChevronRight
      : ChevronLeft

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "transition-all duration-300 ease-in-out",
            "hover:shadow-md",
            snapshot.isDragging && "rotate-2 scale-105 shadow-xl z-50",
            // Horizontal collapse (desktop wide screens)
            isHorizontalCollapse && "overflow-hidden",
            // Vertical collapse (mobile and smaller screens)
            isVerticalCollapse && "h-16 overflow-hidden",
            className,
          )}
        >
          <CardHeader
            className={cn(
              "flex flex-row items-center justify-between space-y-0 pb-2",
              "group transition-colors hover:bg-accent/50",
              // Horizontal collapse header (desktop)
              isHorizontalCollapse && "writing-mode-vertical text-center p-2 h-full justify-center flex-col",
              // Vertical collapse header (mobile/small screens)
              isVerticalCollapse && "py-2",
            )}
          >
            {/* Content for horizontal collapse (desktop) */}
            {isHorizontalCollapse ? (
              <div className="flex flex-col items-center h-full justify-center space-y-2">
                {/* Drag Handle */}
                <div
                  {...provided.dragHandleProps}
                  className="opacity-50 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:text-primary"
                  title="Drag to reorder panels"
                >
                  <GripVertical className="h-4 w-4" />
                </div>

                {/* Icon */}
                {icon && <div className="flex-shrink-0">{icon}</div>}

                {/* Vertical Title */}
                <h3 className="writing-mode-vertical whitespace-nowrap font-semibold text-sm transform rotate-180 flex-1 flex items-center justify-center">
                  {title}
                </h3>

                {/* Collapse Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCollapse}
                  className="h-6 w-6 p-0 opacity-60 hover:opacity-100 mt-auto"
                  title={`Expand ${title}`}
                >
                  <CollapseIcon className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              /* Content for expanded or vertical collapse */
              <>
                <div className={cn("flex items-center gap-2")}>
                  {/* Drag Handle */}
                  <div
                    {...provided.dragHandleProps}
                    className="opacity-30 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:text-primary"
                    title="Drag to reorder panels"
                  >
                    <GripVertical className="h-4 w-4" />
                  </div>

                  {/* Icon and Title */}
                  {icon && <div className="flex-shrink-0">{icon}</div>}
                  <h3 className={cn("font-semibold text-sm", isVerticalCollapse && "truncate")}>{title}</h3>
                </div>

                <div className="flex items-center gap-1">
                  {/* Header Actions */}
                  {!isCollapsed && headerActions && <div className="flex items-center gap-1">{headerActions}</div>}

                  {/* Collapse Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleCollapse}
                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                    title={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
                  >
                    <CollapseIcon className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </CardHeader>

          {!isCollapsed && <CardContent className="pt-0">{children}</CardContent>}
        </Card>
      )}
    </Draggable>
  )
}
