"use client"

import { Draggable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { GripVertical, Copy, Trash2, Plus, Clipboard } from "lucide-react"
import type { ContentItem, EditingField, ClipboardData } from "../types/resume"
import { FieldEditor } from "./field-editor"

interface ContentItemEditorProps {
  contentItem: ContentItem
  sectionIndex: number
  contentIndex: number
  sectionId: string
  editingField: EditingField | null
  clipboard: ClipboardData
  onFieldChange: (field: string, value: string) => void
  onStartEditingLabel: (field: string) => void
  onSaveLabel: () => void
  onCancelLabel: () => void
  onLabelChange: (newKey: string) => void
  onDeleteField: (field: string) => void
  onAddField: () => void
  onCopyItem: () => void
  onDeleteItem: () => void
  onPasteItem: () => void
}

export const ContentItemEditor = ({
  contentItem,
  sectionIndex,
  contentIndex,
  sectionId,
  editingField,
  clipboard,
  onFieldChange,
  onStartEditingLabel,
  onSaveLabel,
  onCancelLabel,
  onLabelChange,
  onDeleteField,
  onAddField,
  onCopyItem,
  onDeleteItem,
  onPasteItem,
}: ContentItemEditorProps) => {
  return (
    <Draggable
      key={`${sectionId}-content-${contentIndex}`}
      draggableId={`${sectionId}-content-${contentIndex}`}
      index={contentIndex}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`grid grid-cols-1 gap-2 p-3 border rounded-md bg-muted/50 relative group transition-all duration-200 ${
            snapshot.isDragging
              ? "shadow-lg border-primary bg-accent/50 scale-[1.02] rotate-1 z-50"
              : "hover:shadow-md hover:border-border"
          }`}
        >
          <div
            {...provided.dragHandleProps}
            className="absolute left-2 top-2 cursor-grab active:cursor-grabbing opacity-30 group-hover:opacity-70 hover:opacity-100 transition-opacity duration-200 z-10"
            title="Drag to reorder content item"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </div>

          <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="icon"
              onClick={onCopyItem}
              title="Copy content item"
              className="h-6 w-6 hover:bg-accent"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDeleteItem}
              title="Delete content item"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6 w-6"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          <div className="pl-6 pr-16 pt-2">
            {Object.entries(contentItem).map(([field, value]) => (
              <FieldEditor
                key={field}
                field={field}
                value={value}
                sectionIndex={sectionIndex}
                contentIndex={contentIndex}
                editingField={editingField}
                onFieldChange={onFieldChange}
                onStartEditingLabel={onStartEditingLabel}
                onSaveLabel={onSaveLabel}
                onCancelLabel={onCancelLabel}
                onLabelChange={onLabelChange}
                onDeleteField={onDeleteField}
              />
            ))}

            <Button variant="outline" size="sm" onClick={onAddField} className="mt-2 w-full text-xs hover:bg-accent">
              <Plus className="h-3 w-3 mr-1" /> Add Field
            </Button>
          </div>

          {clipboard.type === "content" && clipboard.data && (
            <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="outline"
                size="sm"
                onClick={onPasteItem}
                className="flex items-center gap-1 text-xs hover:bg-accent"
                title="Paste content item after this one"
              >
                <Clipboard className="h-3 w-3" />
                Paste Item
              </Button>
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
