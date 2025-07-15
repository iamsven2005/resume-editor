"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Briefcase } from "lucide-react"

interface SavedResume {
  id: string
  title: string
  resume_data: any
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
  const [selectedResumes, setSelectedResumes] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

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

    setCreating(true)
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
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Portfolio created successfully!",
        })
        setOpen(false)
        setTitle("")
        setDescription("")
        setTheme("modern")
        setSelectedResumes([])
        onPortfolioCreated()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create portfolio",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create portfolio",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Create Portfolio
          </DialogTitle>
          <DialogDescription>
            Merge multiple resumes into a comprehensive portfolio. Select the resumes you want to combine.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Portfolio Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Portfolio Title</Label>
              <Input
                id="title"
                placeholder="My Professional Portfolio"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="A comprehensive showcase of my professional experience and skills..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
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
          <div>
            <Label className="text-base font-semibold">Select Resumes to Merge</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Choose the resumes you want to combine into this portfolio. Sections with the same name will be merged.
            </p>

            {resumes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No resumes available. Create some resumes first to build a portfolio.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                {resumes.map((resume) => (
                  <div key={resume.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={resume.id}
                      checked={selectedResumes.includes(resume.id)}
                      onCheckedChange={() => handleResumeToggle(resume.id)}
                    />
                    <Label htmlFor={resume.id} className="flex-1 cursor-pointer text-sm">
                      <div className="font-medium">{resume.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Updated {new Date(resume.updated_at).toLocaleDateString()}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedResumes.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Selected {selectedResumes.length} resume{selectedResumes.length !== 1 ? "s" : ""} for merging
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating || !title.trim() || selectedResumes.length === 0}>
            {creating ? "Creating..." : "Create Portfolio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
