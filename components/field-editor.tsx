"use client"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Save, X, Trash2 } from "lucide-react"
import type { EditingField } from "../types/resume"

interface FieldEditorProps {
  field: string
  value: string
  sectionIndex: number
  contentIndex: number
  editingField: EditingField | null
  onFieldChange: (field: string, value: string) => void
  onStartEditingLabel: (field: string) => void
  onSaveLabel: () => void
  onCancelLabel: () => void
  onLabelChange: (newKey: string) => void
  onDeleteField: (field: string) => void
}

export const FieldEditor = ({
  field,
  value,
  sectionIndex,
  contentIndex,
  editingField,
  onFieldChange,
  onStartEditingLabel,
  onSaveLabel,
  onCancelLabel,
  onLabelChange,
  onDeleteField,
}: FieldEditorProps) => {
  const isEditing =
    editingField &&
    editingField.sectionIndex === sectionIndex &&
    editingField.contentIndex === contentIndex &&
    editingField.originalKey === field

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        {isEditing ? (
          <div className="flex items-center gap-2 w-full">
            <Input
              value={editingField.newKey}
              onChange={(e) => onLabelChange(e.target.value)}
              className="text-sm h-8"
              autoFocus
            />
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={onSaveLabel} className="h-6 w-6">
                <Save className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onCancelLabel} className="h-6 w-6">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Label htmlFor={`${sectionIndex}-${contentIndex}-${field}`} className="text-sm">
              {field}
            </Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onStartEditingLabel(field)}
              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit field name"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteField(field)}
              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              title="Delete field"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      <Textarea
        id={`${sectionIndex}-${contentIndex}-${field}`}
        value={value as string}
        onChange={(e) => onFieldChange(field, e.target.value)}
        className="mt-1"
        rows={field.toLowerCase().includes("description") ? 3 : 1}
      />
    </div>
  )
}
