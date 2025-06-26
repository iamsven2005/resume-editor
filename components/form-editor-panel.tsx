"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import { AlertCircle, Plus, ChevronUp, ChevronDown } from "lucide-react"
import type { ResumeData, EditingField, ClipboardData } from "../types/resume"
import { SectionEditor } from "./section-editor"

interface FormEditorPanelProps {
  parsedData: ResumeData | null
  editingField: EditingField | null
  clipboard: ClipboardData
  collapsedSections: Set<string>
  onToggleSectionCollapse: (sectionId: string) => void
  onTitleChange: (title: string) => void
  onSectionNameChange: (sectionIndex: number, name: string) => void
  onFieldChange: (sectionIndex: number, contentIndex: number, field: string, value: string) => void
  onStartEditingLabel: (sectionIndex: number, contentIndex: number, field: string) => void
  onSaveLabel: () => void
  onCancelLabel: () => void
  onLabelChange: (newKey: string) => void
  onDeleteField: (sectionIndex: number, contentIndex: number, field: string) => void
  onAddField: (sectionIndex: number, contentIndex: number) => void
  onAddSection: () => void
  onAddContentItem: (sectionIndex: number) => void
  onCopySection: (sectionIndex: number) => void
  onDeleteSection: (sectionIndex: number) => void
  onPasteSection: (sectionIndex: number) => void
  onCopyItem: (sectionIndex: number, contentIndex: number) => void
  onDeleteItem: (sectionIndex: number, contentIndex: number) => void
  onPasteItem: (sectionIndex: number, contentIndex: number) => void
  onDragEnd: (result: any) => void
}

export const FormEditorPanel = ({
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
}: FormEditorPanelProps) => {
  const allCollapsed = parsedData ? parsedData.sections.every((section) => collapsedSections.has(section.id)) : false
  const hasCollapsedSections = collapsedSections.size > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
        {parsedData ? (
          <>
            {/* Title */}
            <div>
              <Label htmlFor="title">Title</Label>
              <Textarea
                id="title"
                value={parsedData.title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="mt-1"
                rows={1}
              />
            </div>

            {/* Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Sections ({parsedData.sections.length})</Label>
                <div className="flex gap-2">
                  {parsedData.sections.length > 1 && (
                    <Button
                      onClick={() => {
                        if (allCollapsed || hasCollapsedSections) {
                          // Expand all
                          parsedData.sections.forEach((section) => {
                            if (collapsedSections.has(section.id)) {
                              onToggleSectionCollapse(section.id)
                            }
                          })
                        } else {
                          // Collapse all
                          parsedData.sections.forEach((section) => {
                            if (!collapsedSections.has(section.id)) {
                              onToggleSectionCollapse(section.id)
                            }
                          })
                        }
                      }}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 text-xs"
                    >
                      {allCollapsed ? (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Expand All
                        </>
                      ) : (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Collapse All
                        </>
                      )}
                    </Button>
                  )}
                  <Button onClick={onAddSection} size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Add Section
                  </Button>
                </div>
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="sections" type="section">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-6 transition-colors duration-200 ${
                        snapshot.isDraggingOver ? "bg-accent/20 rounded-lg p-2" : ""
                      }`}
                    >
                      {parsedData.sections.map((section, sectionIndex) => (
                        <SectionEditor
                          key={section.id}
                          section={section}
                          sectionIndex={sectionIndex}
                          editingField={editingField}
                          clipboard={clipboard}
                          isCollapsed={collapsedSections.has(section.id)}
                          onToggleCollapse={() => onToggleSectionCollapse(section.id)}
                          onSectionNameChange={(name) => onSectionNameChange(sectionIndex, name)}
                          onFieldChange={(contentIndex, field, value) =>
                            onFieldChange(sectionIndex, contentIndex, field, value)
                          }
                          onStartEditingLabel={(contentIndex, field) =>
                            onStartEditingLabel(sectionIndex, contentIndex, field)
                          }
                          onSaveLabel={onSaveLabel}
                          onCancelLabel={onCancelLabel}
                          onLabelChange={onLabelChange}
                          onDeleteField={(contentIndex, field) => onDeleteField(sectionIndex, contentIndex, field)}
                          onAddField={(contentIndex) => onAddField(sectionIndex, contentIndex)}
                          onAddContentItem={() => onAddContentItem(sectionIndex)}
                          onCopySection={() => onCopySection(sectionIndex)}
                          onDeleteSection={() => onDeleteSection(sectionIndex)}
                          onPasteSection={() => onPasteSection(sectionIndex)}
                          onCopyItem={(contentIndex) => onCopyItem(sectionIndex, contentIndex)}
                          onDeleteItem={(contentIndex) => onDeleteItem(sectionIndex, contentIndex)}
                          onPasteItem={(contentIndex) => onPasteItem(sectionIndex, contentIndex)}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Enter valid data to see the form view</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
