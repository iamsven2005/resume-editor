"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Resume {
  id: number
  title: string
  created_at: string
}

interface PortfolioCreatorDialogProps {
  resumes: Resume[]
  onPortfolioCreated: () => void
}

export function PortfolioCreatorDialog({ resumes, onPortfolioCreated }: PortfolioCreatorDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [theme, setTheme] = useState("modern")
  const [selectedResumes, setSelectedResumes] = useState<number[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const handleResumeToggle = (resumeId: number) => {
    setSelectedResumes((prev) => (prev.includes(resumeId) ? prev.filter((id) => id !== resumeId) : [...prev, resumeId]))
  }

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a portfolio title")
      return
    }

    if (selectedResumes.length === 0) {
      toast.error("Please select at least one resume")
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
          resumeIds: selectedResumes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Portfolio created successfully!")
        setOpen(false)
        setTitle("")
        setDescription("")
        setTheme("modern")
        setSelectedResumes([])
        onPortfolioCreated()
      } else {
        toast.error(data.error || "Failed to create portfolio")
      }
    } catch (error) {
      console.error("Error creating portfolio:", error)
      toast.error("Failed to create portfolio")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Portfolio</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="portfolio-title">Portfolio Title</Label>
              <Input
                id="portfolio-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter portfolio title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="portfolio-description">Description (Optional)</Label>
              <Textarea
                id="portfolio-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter portfolio description"
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="portfolio-theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select theme" />
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

          <div>
            <Label className="text-base font-semibold">Select Resumes to Merge</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Choose the resumes you want to combine into this portfolio
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
              {resumes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No resumes available. Create some resumes first.
                </p>
              ) : (
                resumes.map((resume) => (
                  <div key={resume.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`resume-${resume.id}`}
                      checked={selectedResumes.includes(resume.id)}
                      onCheckedChange={() => handleResumeToggle(resume.id)}
                    />
                    <Label htmlFor={`resume-${resume.id}`} className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">{resume.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Created {new Date(resume.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))
              )}
            </div>
            {selectedResumes.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {selectedResumes.length} resume{selectedResumes.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Portfolio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
