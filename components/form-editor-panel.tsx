"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  GripVertical,
  Edit2,
  Check,
  X,
} from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import type { ResumeData, EditingField, ClipboardData } from "@/types/resume"

interface FormEditorPanelProps {
  parsedData: ResumeData | null
  editingField: EditingField | null
  clipboard: ClipboardData
  collapsedSections: Set<string>
  onToggleSectionCollapse: (sectionId: string) => void
  onTitleChange: (newTitle: string) => void
  onSectionNameChange: (sectionIndex: number, newName: string) => void
  onFieldChange: (sectionIndex: number, contentIndex: number, field: string, value: string) => void
  onStartEditingLabel: (sectionIndex: number, contentIndex: number, key: string) => void
  onSaveLabel: () => void
  onCancelLabel: () => void
  onLabelChange: (newKey: string) => void
  onDeleteField: (sectionIndex: number, contentIndex: number, field: string) => void
  onAddField: (sectionIndex: number, contentIndex: number) => void
  onAddSection: () => void
  onAddContentItem: (sectionIndex: number) => void
  onCopySection: (sectionIndex: number) => void
  onDeleteSection: (sectionIndex: number) => void
  onPasteSection: (afterIndex: number) => void
  onCopyItem: (sectionIndex: number, contentIndex: number) => void
  onDeleteItem: (sectionIndex: number, contentIndex: number) => void
  onPasteItem: (sectionIndex: number, afterIndex: number) => void
  onDragEnd: (result: any) => void
}

export function FormEditorPanel({
  parsedData,
  editingField,
  clipboard,
  collapsedSections,
  onToggleSectionCollapse,
  onTitleChange,
  onSectionNameChange,
  onFieldChange,
  onStartEditingLabel,
  onSaveLabel,
  onCancelLabel,
  onLabelChange,
  onDeleteField,
  onAddField,
  onAddSection,
  onAddContentItem,
  onCopySection,
  onDeleteSection,
  onPasteSection,
  onCopyItem,
  onDeleteItem,
  onPasteItem,
  onDragEnd,
}: FormEditorPanelProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState("")

  const startEditingTitle = () => {
    setTitleValue(parsedData?.title || "")
    setEditingTitle(true)
  }

  const saveTitle = () => {
    if (titleValue.trim()) {
      onTitleChange(titleValue.trim())
    }
    setEditingTitle(false)
  }

  const cancelTitleEdit = () => {
    setEditingTitle(false)
    setTitleValue("")
  }

  if (!parsedData) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No resume data to edit. Please upload a resume or create a new one.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Form Editor</CardTitle>
          <Button onClick={onAddSection} size="sm" className="h-7 px-2 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Add Section
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-3">
            {/* Resume Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Resume Title</label>
              {editingTitle ? (
                <div className="flex gap-1">
                  <Input
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveTitle()
                      if (e.key === "Escape") cancelTitleEdit()
                    }}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button onClick={saveTitle} size="sm" className="h-8 w-8 p-0">
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button onClick={cancelTitleEdit} size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    value={parsedData.title}
                    readOnly
                    className="h-8 text-sm bg-muted cursor-pointer"
                    onClick={startEditingTitle}
                  />
                  <Button
                    onClick={startEditingTitle}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-transparent"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Sections */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="sections" type="section">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {parsedData.sections.map((section, sectionIndex) => (
                      <Draggable key={section.id} draggableId={section.id} index={sectionIndex}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-card border rounded-lg ${snapshot.isDragging ? "shadow-lg" : ""}`}
                          >
                            <Collapsible
                              open={!collapsedSections.has(section.id)}
                              onOpenChange={() => onToggleSectionCollapse(section.id)}
                            >
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    {collapsedSections.has(section.id) ? (
                                      <ChevronRight className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                    <div className="flex-1">
                                      <h3 className="font-medium text-sm">{section["section name"]}</h3>
                                      <p className="text-xs text-muted-foreground">
                                        {section.content.length} item{section.content.length !== 1 ? "s" : ""}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Badge variant="secondary" className="text-xs px-2 py-0">
                                      {section.content.length}
                                    </Badge>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                          <MoreVertical className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem onClick={() => onAddContentItem(sectionIndex)}>
                                          <Plus className="h-3 w-3 mr-2" />
                                          Add Item
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onCopySection(sectionIndex)}>
                                          <Copy className="h-3 w-3 mr-2" />
                                          Copy Section
                                        </DropdownMenuItem>
                                        {clipboard.type === "section" && (
                                          <DropdownMenuItem onClick={() => onPasteSection(sectionIndex)}>
                                            <Copy className="h-3 w-3 mr-2" />
                                            Paste Section
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                          onClick={() => onDeleteSection(sectionIndex)}
                                          className="text-destructive"
                                        >
                                          <Trash2 className="h-3 w-3 mr-2" />
                                          Delete Section
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="px-3 pb-3 space-y-3">
                                  {/* Section Name Editor */}
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Section Title</label>
                                    <Input
                                      value={section["section name"]}
                                      onChange={(e) => onSectionNameChange(sectionIndex, e.target.value)}
                                      className="h-8 text-sm bg-background"
                                      placeholder="Section name"
                                    />
                                  </div>

                                  {/* Items Header */}
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-muted-foreground">Items</label>
                                    <Button
                                      onClick={() => onAddContentItem(sectionIndex)}
                                      size="sm"
                                      variant="outline"
                                      className="h-6 px-2 text-xs"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add Item
                                    </Button>
                                  </div>

                                  {/* Content Items */}
                                  <Droppable droppableId={`content-${sectionIndex}`} type="content">
                                    {(provided) => (
                                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                        {section.content.map((contentItem, contentIndex) => (
                                          <Draggable
                                            key={`${sectionIndex}-${contentIndex}`}
                                            draggableId={`${sectionIndex}-${contentIndex}`}
                                            index={contentIndex}
                                          >
                                            {(provided, snapshot) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`bg-muted/30 border rounded-md p-2 ${
                                                  snapshot.isDragging ? "shadow-md" : ""
                                                }`}
                                              >
                                                <Collapsible defaultOpen>
                                                  <CollapsibleTrigger asChild>
                                                    <div className="flex items-center justify-between mb-2 cursor-pointer">
                                                      <div className="flex items-center gap-2">
                                                        <div
                                                          {...provided.dragHandleProps}
                                                          className="cursor-grab active:cursor-grabbing"
                                                        >
                                                          <GripVertical className="h-3 w-3 text-muted-foreground" />
                                                        </div>
                                                        <span className="text-xs font-medium">
                                                          {Object.keys(contentItem)[0] || "Item"} - New Item
                                                        </span>
                                                        <ChevronDown className="h-3 w-3" />
                                                      </div>
                                                      <div className="flex items-center gap-1">
                                                        <DropdownMenu>
                                                          <DropdownMenuTrigger asChild>
                                                            <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                                                              <MoreVertical className="h-2 w-2" />
                                                            </Button>
                                                          </DropdownMenuTrigger>
                                                          <DropdownMenuContent align="end" className="w-36">
                                                            <DropdownMenuItem
                                                              onClick={() => onAddField(sectionIndex, contentIndex)}
                                                            >
                                                              <Plus className="h-3 w-3 mr-2" />
                                                              Add Field
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                              onClick={() => onCopyItem(sectionIndex, contentIndex)}
                                                            >
                                                              <Copy className="h-3 w-3 mr-2" />
                                                              Copy Item
                                                            </DropdownMenuItem>
                                                            {clipboard.type === "content" && (
                                                              <DropdownMenuItem
                                                                onClick={() => onPasteItem(sectionIndex, contentIndex)}
                                                              >
                                                                <Copy className="h-3 w-3 mr-2" />
                                                                Paste Item
                                                              </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                              onClick={() => onDeleteItem(sectionIndex, contentIndex)}
                                                              className="text-destructive"
                                                            >
                                                              <Trash2 className="h-3 w-3 mr-2" />
                                                              Delete Item
                                                            </DropdownMenuItem>
                                                          </DropdownMenuContent>
                                                        </DropdownMenu>
                                                        <Button
                                                          onClick={() => onDeleteItem(sectionIndex, contentIndex)}
                                                          size="sm"
                                                          variant="ghost"
                                                          className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                                                        >
                                                          <Trash2 className="h-2 w-2" />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  </CollapsibleTrigger>
                                                  <CollapsibleContent>
                                                    <div className="space-y-2">
                                                      {Object.entries(contentItem).map(([key, value]) => (
                                                        <div key={key} className="space-y-1">
                                                          {editingField &&
                                                          editingField.sectionIndex === sectionIndex &&
                                                          editingField.contentIndex === contentIndex &&
                                                          editingField.originalKey === key ? (
                                                            <div className="flex gap-1">
                                                              <Input
                                                                value={editingField.newKey}
                                                                onChange={(e) => onLabelChange(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                  if (e.key === "Enter") onSaveLabel()
                                                                  if (e.key === "Escape") onCancelLabel()
                                                                }}
                                                                className="h-6 text-xs"
                                                                autoFocus
                                                              />
                                                              <Button
                                                                onClick={onSaveLabel}
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                              >
                                                                <Check className="h-2 w-2" />
                                                              </Button>
                                                              <Button
                                                                onClick={onCancelLabel}
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-6 w-6 p-0 bg-transparent"
                                                              >
                                                                <X className="h-2 w-2" />
                                                              </Button>
                                                            </div>
                                                          ) : (
                                                            <div className="flex items-center gap-1">
                                                              <label
                                                                className="text-xs font-medium cursor-pointer flex-1"
                                                                onClick={() =>
                                                                  onStartEditingLabel(sectionIndex, contentIndex, key)
                                                                }
                                                              >
                                                                {key}
                                                              </label>
                                                              <Button
                                                                onClick={() =>
                                                                  onDeleteField(sectionIndex, contentIndex, key)
                                                                }
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                                                              >
                                                                <Trash2 className="h-2 w-2" />
                                                              </Button>
                                                            </div>
                                                          )}
                                                          {key.toLowerCase().includes("description") ||
                                                          (typeof value === "string" && value.length > 50) ? (
                                                            <Textarea
                                                              value={value as string}
                                                              onChange={(e) =>
                                                                onFieldChange(
                                                                  sectionIndex,
                                                                  contentIndex,
                                                                  key,
                                                                  e.target.value,
                                                                )
                                                              }
                                                              className="min-h-[60px] text-xs resize-none"
                                                              placeholder={`Enter ${key.toLowerCase()}`}
                                                            />
                                                          ) : (
                                                            <Input
                                                              value={value as string}
                                                              onChange={(e) =>
                                                                onFieldChange(
                                                                  sectionIndex,
                                                                  contentIndex,
                                                                  key,
                                                                  e.target.value,
                                                                )
                                                              }
                                                              className="h-7 text-xs"
                                                              placeholder={`Enter ${key.toLowerCase()}`}
                                                            />
                                                          )}
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </CollapsibleContent>
                                                </Collapsible>
                                              </div>
                                            )}
                                          </Draggable>
                                        ))}
                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
