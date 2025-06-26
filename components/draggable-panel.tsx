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
              "group cursor-pointer transition-colors hover:bg-accent/50",
              // Horizontal collapse header (desktop)
              isHorizontalCollapse && "writing-mode-vertical text-center p-2 h-full justify-center",
              // Vertical collapse header (mobile/small screens)
              isVerticalCollapse && "py-2",
            )}
          >
            <div className={cn("flex items-center gap-2", isHorizontalCollapse && "flex-col writing-mode-vertical")}>
              {/* Drag Handle */}
              <div
                {...provided.dragHandleProps}
                className={cn(
                  "opacity-30 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing",
                  "hover:text-primary",
                  isHorizontalCollapse && "mb-2",
                )}
                title="Drag to reorder panels"
              >
                <GripVertical className="h-4 w-4" />
              </div>

              {/* Icon and Title */}
              {icon && <div className={cn("flex-shrink-0", isHorizontalCollapse && "mb-2")}>{icon}</div>}
              <h3
                className={cn(
                  "font-semibold text-sm",
                  isHorizontalCollapse && "writing-mode-vertical whitespace-nowrap",
                  isVerticalCollapse && "truncate",
                )}
              >
                {title}
              </h3>
            </div>

            <div className={cn("flex items-center gap-1", isHorizontalCollapse && "flex-col mt-auto")}>
              {/* Header Actions */}
              {!isCollapsed && headerActions && (
                <div className={cn("flex items-center gap-1", isHorizontalCollapse && "flex-col")}>{headerActions}</div>
              )}

              {/* Collapse Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className={cn("h-6 w-6 p-0 opacity-60 hover:opacity-100", isHorizontalCollapse && "mt-2")}
                title={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
              >
                <CollapseIcon className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>

          {!isCollapsed && <CardContent className="pt-0">{children}</CardContent>}
        </Card>
      )}
    </Draggable>
  )
}
