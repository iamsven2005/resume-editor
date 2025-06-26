"use client"

import { Draggable, Droppable } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { GripVertical, Copy, Trash2, Plus, Clipboard, ChevronDown, ChevronUp } from "lucide-react"
import type { Section, EditingField, ClipboardData } from "../types/resume"
import { ContentItemEditor } from "./content-item-editor"

interface SectionEditorProps {
  section: Section
  sectionIndex: number
  editingField: EditingField | null
  clipboard: ClipboardData
  isCollapsed: boolean
  onToggleCollapse: () => void
  onSectionNameChange: (newName: string) => void
  onFieldChange: (contentIndex: number, field: string, value: string) => void
  onStartEditingLabel: (contentIndex: number, field: string) => void
  onSaveLabel: () => void
  onCancelLabel: () => void
  onLabelChange: (newKey: string) => void
  onDeleteField: (contentIndex: number, field: string) => void
  onAddField: (contentIndex: number) => void
  onAddContentItem: () => void
  onCopySection: () => void
  onDeleteSection: () => void
  onPasteSection: () => void
  onCopyItem: (contentIndex: number) => void
  onDeleteItem: (contentIndex: number) => void
  onPasteItem: (contentIndex: number) => void
}

export const SectionEditor = ({
  section,
  sectionIndex,
  editingField,
  clipboard,
  isCollapsed,
  onToggleCollapse,
  onSectionNameChange,
  onFieldChange,
  onStartEditingLabel,
  onSaveLabel,
  onCancelLabel,
  onLabelChange,
  onDeleteField,
  onAddField,
  onAddContentItem,
  onCopySection,
  onDeleteSection,
  onPasteSection,
  onCopyItem,
  onDeleteItem,
  onPasteItem,
}: SectionEditorProps) => {
  return (
    <Draggable key={section.id} draggableId={section.id} index={sectionIndex}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`border-2 relative group transition-all duration-200 ${
            snapshot.isDragging
              ? "shadow-lg border-primary bg-accent/50 scale-[1.02] rotate-1"
              : "hover:shadow-md hover:border-border"
          }`}
        >
          <div
            {...provided.dragHandleProps}
            className="absolute left-2 top-3 cursor-grab active:cursor-grabbing opacity-30 group-hover:opacity-70 hover:opacity-100 transition-opacity duration-200 z-10"
            title="Drag to reorder section"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </div>

          <CardHeader className="pb-3 pr-20 pl-10">
            <div className="absolute right-3 top-3 flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                title={isCollapsed ? "Expand section" : "Collapse section"}
                className="opacity-70 hover:opacity-100"
              >
                {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCopySection}
                title="Copy section"
                className="opacity-70 hover:opacity-100"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDeleteSection}
                title="Delete section"
                className="text-destructive hover:text-destructive opacity-70 hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label htmlFor={`section-${sectionIndex}`}>Section Name</Label>
              <Textarea
                id={`section-${sectionIndex}`}
                value={section["section name"]}
                onChange={(e) => onSectionNameChange(e.target.value)}
                className="mt-1"
                rows={1}
              />
            </div>
          </CardHeader>

          {!isCollapsed && (
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Content Items ({section.content.length})</Label>
                <div className="flex space-x-2">
                  {clipboard.type === "section" && clipboard.data && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onPasteSection}
                      className="flex items-center gap-1 text-xs"
                      title="Paste section after this one"
                    >
                      <Clipboard className="h-3 w-3" />
                      Paste Section
                    </Button>
                  )}
                  <Button
                    onClick={onAddContentItem}
                    size="sm"
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Plus className="h-3 w-3" />
                    Add Item
                  </Button>
                </div>
              </div>

              <Droppable droppableId={`content-${sectionIndex}`} type="content">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-4 transition-colors duration-200 ${
                      snapshot.isDraggingOver ? "bg-accent/30 rounded-md p-2" : ""
                    }`}
                  >
                    {section.content.map((contentItem, contentIndex) => (
                      <ContentItemEditor
                        key={`${section.id}-content-${contentIndex}`}
                        contentItem={contentItem}
                        sectionIndex={sectionIndex}
                        contentIndex={contentIndex}
                        sectionId={section.id}
                        editingField={editingField}
                        clipboard={clipboard}
                        onFieldChange={(field, value) => onFieldChange(contentIndex, field, value)}
                        onStartEditingLabel={(field) => onStartEditingLabel(contentIndex, field)}
                        onSaveLabel={onSaveLabel}
                        onCancelLabel={onCancelLabel}
                        onLabelChange={onLabelChange}
                        onDeleteField={(field) => onDeleteField(contentIndex, field)}
                        onAddField={() => onAddField(contentIndex)}
                        onCopyItem={() => onCopyItem(contentIndex)}
                        onDeleteItem={() => onDeleteItem(contentIndex)}
                        onPasteItem={() => onPasteItem(contentIndex)}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          )}

          {isCollapsed && (
            <CardContent className="pt-0 pb-3">
              <div className="text-sm text-muted-foreground">
                {section.content.length} item{section.content.length !== 1 ? "s" : ""} • Click to expand
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </Draggable>
  )
}
