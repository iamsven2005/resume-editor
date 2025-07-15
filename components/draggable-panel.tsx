"use client"

import type React from "react"
import { Draggable } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react"
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
            "transition-all duration-200 border-border/50",
            snapshot.isDragging && "shadow-lg ring-2 ring-primary/20 rotate-1",
            isCollapsed && !isVerticalLayout && "w-[60px] min-w-[60px]",
            isCollapsed && isVerticalLayout && "h-[60px]",
            className,
          )}
        >
          <CardHeader
            className={cn(
              "flex flex-row items-center justify-between space-y-0 pb-2 px-3 py-2",
              isCollapsed && !isVerticalLayout && "flex-col justify-center px-1 py-3 h-full",
              isCollapsed && isVerticalLayout && "flex-row justify-between px-3 py-2 h-full",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2 min-w-0",
                isCollapsed && !isVerticalLayout && "flex-col gap-1 w-full",
                isCollapsed && isVerticalLayout && "flex-row gap-2",
              )}
            >
              {/* Drag Handle - Always visible and functional */}
              <div
                {...provided.dragHandleProps}
                className={cn(
                  "cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors flex-shrink-0",
                  isCollapsed && !isVerticalLayout && "mb-2",
                )}
                title="Drag to reorder"
              >
                <GripVertical className="h-4 w-4" />
              </div>

              {/* Icon */}
              {icon && (
                <div className={cn("flex-shrink-0 text-muted-foreground", isCollapsed && !isVerticalLayout && "mb-1")}>
                  {icon}
                </div>
              )}

              {/* Title */}
              <h3
                className={cn(
                  "font-semibold text-sm truncate",
                  isCollapsed &&
                    !isVerticalLayout &&
                    "writing-mode-vertical text-xs text-center transform rotate-180 whitespace-nowrap overflow-hidden text-ellipsis max-w-none w-full",
                  isCollapsed && isVerticalLayout && "truncate flex-1",
                )}
                title={title}
              >
                {title}
              </h3>
            </div>

            {/* Header Actions and Collapse Button */}
            <div
              className={cn(
                "flex items-center gap-1 flex-shrink-0",
                isCollapsed && !isVerticalLayout && "flex-col gap-1 mt-2",
                isCollapsed && isVerticalLayout && "flex-row gap-1",
              )}
            >
              {/* Header Actions - Only show when expanded or in vertical layout */}
              {headerActions && (!isCollapsed || isVerticalLayout) && (
                <div className={cn(isCollapsed && !isVerticalLayout && "mb-1")}>{headerActions}</div>
              )}

              {/* Collapse/Expand Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className={cn("h-6 w-6 p-0 hover:bg-accent", isCollapsed && !isVerticalLayout && "h-8 w-8")}
                title={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
              >
                {isCollapsed ? (
                  isVerticalLayout ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronUp className="h-3 w-3 transform rotate-90" />
                  )
                ) : (
                  <ChevronUp className="h-3 w-3" />
                )}
              </Button>
            </div>
          </CardHeader>

          {/* Panel Content - Only show when expanded */}
          {!isCollapsed && (
            <CardContent className="px-3 py-2 pt-0">
              <div className="space-y-4">{children}</div>
            </CardContent>
          )}
        </Card>
      )}
    </Draggable>
  )
}
