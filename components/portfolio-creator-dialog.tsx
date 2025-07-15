"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, FileText, Calendar } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Resume {
  id: string
  title: string
  resume_data: any
  is_favorite: boolean
  created_at: string
  updated_at: string
}

interface PortfolioCreatorDialogProps {
  resumes: Resume[]
  onPortfolioCreated: () => void
  children?: React.ReactNode
}

const themes = [
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "minimal", label: "Minimal" },
  { value: "creative", label: "Creative" },
]

export function PortfolioCreatorDialog({ resumes, onPortfolioCreated, children }: PortfolioCreatorDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [theme, setTheme] = useState("modern")
  const [selectedResumes, setSelectedResumes] = useState<string[]>([])
  const [isPublished, setIsPublished] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleResumeToggle = (resumeId: string) => {
    setSelectedResumes((prev) => (prev.includes(resumeId) ? prev.filter((id) => id !== resumeId) : [...prev, resumeId]))
  }

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a portfolio title",
        variant: "destructive",
      })
      return
    }

    if (selectedResumes.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one resume",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/portfolios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          theme,
          resumeIds: selectedResumes,
          isPublished,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Portfolio created successfully!",
        })
        onPortfolioCreated()
        setOpen(false)
        // Reset form
        setTitle("")
        setDescription("")
        setTheme("modern")
        setSelectedResumes([])
        setIsPublished(false)
      } else {
        throw new Error(data.error || "Failed to create portfolio")
      }
    } catch (error) {
      console.error("Error creating portfolio:", error)
      toast({
        title: "Error",
        description: "Failed to create portfolio. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Portfolio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Create Portfolio</DialogTitle>
          <DialogDescription>
            Merge multiple resumes into a comprehensive portfolio. Select the resumes you want to combine.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Portfolio Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter portfolio title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your portfolio"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((themeOption) => (
                      <SelectItem key={themeOption.value} value={themeOption.value}>
                        {themeOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="published" checked={isPublished} onCheckedChange={setIsPublished} />
                <Label htmlFor="published">Publish immediately</Label>
              </div>
            </div>

            {/* Resume Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Select Resumes to Merge *</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose the resumes you want to combine into this portfolio. Sections with the same name will be merged
                  automatically.
                </p>
              </div>

              {resumes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No resumes available. Create some resumes first!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {resumes.map((resume) => (
                    <Card
                      key={resume.id}
                      className={`cursor-pointer transition-colors ${
                        selectedResumes.includes(resume.id) ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleResumeToggle(resume.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedResumes.includes(resume.id)}
                              onChange={() => handleResumeToggle(resume.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base truncate">{resume.title}</CardTitle>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Updated {formatDate(resume.updated_at)}</span>
                                </div>
                                {resume.is_favorite && (
                                  <Badge variant="secondary" className="text-xs">
                                    Favorite
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-sm text-muted-foreground">
                          {resume.resume_data?.sections?.length || 0} section
                          {(resume.resume_data?.sections?.length || 0) !== 1 ? "s" : ""}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {selectedResumes.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Selected Resumes ({selectedResumes.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedResumes.map((resumeId) => {
                      const resume = resumes.find((r) => r.id === resumeId)
                      return (
                        <Badge key={resumeId} variant="secondary">
                          {resume?.title}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !title.trim() || selectedResumes.length === 0}>
            {isCreating ? "Creating..." : "Create Portfolio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
