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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Calendar, FileText } from "lucide-react"

interface SavedResume {
  id: string
  title: string
  resume_data: any
  is_favorite: boolean
  created_at: string
  updated_at: string
}

interface PortfolioCreatorDialogProps {
  resumes: SavedResume[]
  onPortfolioCreated: () => void
  children: React.ReactNode
}

export function PortfolioCreatorDialog({ resumes, onPortfolioCreated, children }: PortfolioCreatorDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [theme, setTheme] = useState("modern")
  const [selectedResumeIds, setSelectedResumeIds] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const handleResumeToggle = (resumeId: string) => {
    setSelectedResumeIds((prev) =>
      prev.includes(resumeId) ? prev.filter((id) => id !== resumeId) : [...prev, resumeId],
    )
  }

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Portfolio title is required",
        variant: "destructive",
      })
      return
    }

    if (selectedResumeIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one resume to include in the portfolio",
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
          description: description.trim() || null,
          theme,
          resumeIds: selectedResumeIds,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Portfolio created successfully!",
        })
        setOpen(false)
        setTitle("")
        setDescription("")
        setTheme("modern")
        setSelectedResumeIds([])
        onPortfolioCreated()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create portfolio",
          variant: "destructive",
        })
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

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle("")
      setDescription("")
      setTheme("modern")
      setSelectedResumeIds([])
    }
    setOpen(newOpen)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Portfolio</DialogTitle>
          <DialogDescription>
            Merge multiple resumes into a comprehensive portfolio. Select the resumes you want to include and customize
            the appearance.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Portfolio Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-title" className="text-right">
                Title
              </Label>
              <Input
                id="portfolio-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="My Professional Portfolio"
                disabled={isCreating}
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="portfolio-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="portfolio-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="A brief description of your portfolio (optional)"
                rows={3}
                disabled={isCreating}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolio-theme" className="text-right">
                Theme
              </Label>
              <Select value={theme} onValueChange={setTheme} disabled={isCreating}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resume Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Select Resumes to Include</Label>
            {resumes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No saved resumes found. Create a resume first to build a portfolio.</p>
              </div>
            ) : (
              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {resumes.map((resume) => (
                  <Card key={resume.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`resume-${resume.id}`}
                          checked={selectedResumeIds.includes(resume.id)}
                          onCheckedChange={() => handleResumeToggle(resume.id)}
                          disabled={isCreating}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium truncate">{resume.title}</h4>
                            {resume.is_favorite && (
                              <Badge variant="secondary" className="text-xs ml-2">
                                Favorite
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>Updated {formatDate(resume.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedResumeIds.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedResumeIds.length} resume{selectedResumeIds.length !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !title.trim() || selectedResumeIds.length === 0}>
            {isCreating ? "Creating..." : "Create Portfolio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
