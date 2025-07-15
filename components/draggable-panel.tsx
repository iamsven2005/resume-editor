"use client"

import type React from "react"
import { Draggable } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown, GripVertical } from "lucide-react"
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
  isVerticalLayout?: boolean
  className?: string
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
  isVerticalLayout = false,
  className,
}: DraggablePanelProps) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "transition-all duration-200 overflow-hidden",
            snapshot.isDragging && "shadow-lg rotate-1 z-50",
            isCollapsed && !isVerticalLayout && "w-[60px]",
            className,
          )}
        >
          <CardHeader
            className={cn(
              "flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer select-none",
              isCollapsed && !isVerticalLayout && "flex-col justify-start h-full p-2",
            )}
            onClick={onToggleCollapse}
          >
            <div
              className={cn(
                "flex items-center gap-2 min-w-0",
                isCollapsed && !isVerticalLayout && "flex-col gap-1 w-full",
              )}
            >
              {/* Drag Handle */}
              <div
                {...provided.dragHandleProps}
                className={cn(
                  "flex items-center justify-center p-1 rounded hover:bg-accent transition-colors cursor-grab active:cursor-grabbing",
                  isCollapsed && !isVerticalLayout && "mb-2",
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Icon */}
              {icon && <div className={cn("flex-shrink-0", isCollapsed && !isVerticalLayout && "mb-1")}>{icon}</div>}

              {/* Title */}
              <h3
                className={cn(
                  "font-semibold text-sm truncate",
                  isCollapsed &&
                    !isVerticalLayout &&
                    "writing-mode-vertical text-xs text-center transform rotate-180 whitespace-nowrap overflow-visible w-auto",
                )}
                style={
                  isCollapsed && !isVerticalLayout
                    ? {
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                      }
                    : undefined
                }
              >
                {title}
              </h3>
            </div>

            {/* Controls */}
            <div
              className={cn("flex items-center gap-1", isCollapsed && !isVerticalLayout && "flex-col gap-2 mt-auto")}
            >
              {/* Header Actions */}
              {headerActions && !isCollapsed && <div onClick={(e) => e.stopPropagation()}>{headerActions}</div>}

              {/* Collapse/Expand Button */}
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-6 w-6 p-0 hover:bg-accent", isCollapsed && !isVerticalLayout && "rotate-90")}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleCollapse()
                }}
              >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </div>
          </CardHeader>

          {/* Panel Content */}
          {!isCollapsed && <CardContent className="p-4 pt-0">{children}</CardContent>}
        </Card>
      )}
    </Draggable>
  )
}
