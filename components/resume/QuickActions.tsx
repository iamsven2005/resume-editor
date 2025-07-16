import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface QuickActionsProps {
  onCreateNew?: () => void
  onSaveResume?: (title: string) => Promise<void>
  currentResumeData?: any
  autoSaveEnabled: boolean
  setAutoSaveEnabled: (enabled: boolean) => void
  lastSaved: Date | null
}

// Helper function to safely get string value
const safeString = (value: any): string => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  return String(value)
}

// Helper function to safely trim string
const safeTrim = (value: any): string => {
  const str = safeString(value)
  return str.trim()
}

export function QuickActions({
  onCreateNew,
  onSaveResume,
  currentResumeData,
  autoSaveEnabled,
  setAutoSaveEnabled,
  lastSaved,
}: QuickActionsProps) {
  const [saving, setSaving] = useState(false)
  const [saveTitle, setSaveTitle] = useState("")
  const [manualSaving, setManualSaving] = useState(false)

  const handleManualSave = async () => {
    if (!currentResumeData || !onSaveResume) {
      toast({
        title: "Error",
        description: "No resume data to save",
        variant: "destructive",
      })
      return
    }

    const title = safeTrim(currentResumeData.title || currentResumeData.personalInfo?.name || "Untitled Resume")

    setManualSaving(true)
    try {
      await onSaveResume(title)
      toast({
        title: "Success",
        description: "Resume saved successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setManualSaving(false)
    }
  }

  const saveCurrentResume = async () => {
    const trimmedTitle = safeTrim(saveTitle)
    if (!trimmedTitle || !onSaveResume) {
      toast({
        title: "Error",
        description: "Please enter a title for your resume",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await onSaveResume(trimmedTitle)
      setSaveTitle("")
      toast({
        title: "Success",
        description: "Resume saved successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {onCreateNew && (
            <Button onClick={onCreateNew} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create New Resume
            </Button>
          )}
          {onSaveResume && (
            <>
              <Button
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                variant={autoSaveEnabled ? "default" : "outline"}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Auto-save {autoSaveEnabled ? "ON" : "OFF"}
              </Button>
              <Button
                onClick={handleManualSave}
                disabled={manualSaving || !currentResumeData}
                variant="outline"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {manualSaving ? "Saving..." : "Save Current"}
              </Button>
            </>
          )}
          {lastSaved && (
            <Badge variant="secondary" className="text-xs">
              Last saved: {lastSaved.toLocaleTimeString()}
            </Badge>
          )}
        </div>

        {/* Save Current Resume */}
        {onSaveResume && (
          <div className="flex gap-2">
            <Input
              placeholder="Enter resume title to save..."
              value={saveTitle}
              onChange={(e) => setSaveTitle(safeString(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !saving) {
                  saveCurrentResume()
                }
              }}
              className="flex-1"
            />
            <Button onClick={saveCurrentResume} disabled={saving || !safeTrim(saveTitle)}>
              {saving ? "Saving..." : "Save Resume"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
