"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { OnboardingTutorial } from "../onboarding-tutorial"
import { ResumeNameEditorDialog } from "./ResumeNameEditorDialog"
import { DocumentUpload } from "../document-upload"
import { useAuth } from "../../contexts/auth-context"
import type { ResumeData } from "../../types/resume"
import { FileText, Plus, Download, Trash2, Calendar, Search, BookOpen, MoreVertical, Eye, Copy } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SavedResume {
  id: string
  title: string
  resumeData: ResumeData
  createdAt: string
  updatedAt: string
}

interface ResumeGalleryProps {
  onLoadResume: (data: ResumeData) => void
  onCreateNew: () => void
  currentResumeData?: ResumeData | null
  onSaveResume: (title: string) => Promise<void>
}

export function ResumeGallery({ onLoadResume, onCreateNew, currentResumeData, onSaveResume }: ResumeGalleryProps) {
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showNameEditor, setShowNameEditor] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { user } = useAuth()

  // Load saved resumes
  const loadSavedResumes = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/resumes")
      const data = await response.json()

      if (data.success) {
        setSavedResumes(data.resumes)
      } else {
        console.error("Failed to load resumes:", data.error)
      }
    } catch (error) {
      console.error("Error loading resumes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSavedResumes()
  }, [user])

  // Filter resumes based on search term
  const filteredResumes = savedResumes.filter((resume) => resume.title.toLowerCase().includes(searchTerm.toLowerCase()))

  // Handle resume selection
  const handleResumeSelect = (resume: SavedResume) => {
    onLoadResume(resume.resumeData)
    toast({
      description: `Loaded resume: ${resume.title}`,
    })
  }

  // Handle resume deletion
  const handleDeleteResume = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setSavedResumes((prev) => prev.filter((resume) => resume.id !== resumeId))
        toast({
          description: "Resume deleted successfully",
        })
      } else {
        throw new Error(data.error || "Failed to delete resume")
      }
    } catch (error) {
      console.error("Error deleting resume:", error)
      toast({
        variant: "destructive",
        description: "Failed to delete resume. Please try again.",
      })
    }
  }

  // Handle save current resume
  const handleSaveCurrentResume = async (title: string) => {
    try {
      await onSaveResume(title)
      await loadSavedResumes() // Refresh the list
      setShowNameEditor(false)
    } catch (error) {
      // Error is already handled in the parent component
    }
  }

  // Handle duplicate resume
  const handleDuplicateResume = async (resume: SavedResume) => {
    try {
      const duplicatedTitle = `${resume.title} (Copy)`
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: duplicatedTitle,
          resumeData: resume.resumeData,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await loadSavedResumes()
        toast({
          description: `Resume duplicated as "${duplicatedTitle}"`,
        })
      } else {
        throw new Error(data.error || "Failed to duplicate resume")
      }
    } catch (error) {
      console.error("Error duplicating resume:", error)
      toast({
        variant: "destructive",
        description: "Failed to duplicate resume. Please try again.",
      })
    }
  }

  // Handle create from template (from onboarding)
  const handleCreateFromTemplate = (resumeData: ResumeData) => {
    onLoadResume(resumeData)
    setShowOnboarding(false)
    toast({
      description: "Resume created from template! You can now edit and customize it.",
    })
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-semibold mb-2">Resume Gallery</h3>
          <p className="text-muted-foreground">Please log in to save and manage your resumes.</p>
        </div>
        <Button onClick={onCreateNew} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create New Resume
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Resume Gallery</h3>
          <p className="text-sm text-muted-foreground">Manage your saved resumes</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search resumes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-2">
        <Button onClick={onCreateNew} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create New Resume
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full bg-transparent">
              <BookOpen className="h-4 w-4 mr-2" />
              Begin Tutorial
              <MoreVertical className="h-4 w-4 ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setShowOnboarding(true)}>
              <BookOpen className="h-4 w-4 mr-2" />
              Start Tutorial
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCreateNew}>
              <FileText className="h-4 w-4 mr-2" />
              Create Blank Resume
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {currentResumeData && (
          <Button variant="outline" onClick={() => setShowNameEditor(true)} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Save Current Resume
          </Button>
        )}
      </div>

      <Separator />

      {/* Document Upload */}
      <DocumentUpload onResumeUploaded={onLoadResume} />

      <Separator />

      {/* Saved Resumes */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Saved Resumes ({filteredResumes.length})
        </h4>

        <ScrollArea className="h-64">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {searchTerm ? "No resumes match your search" : "No saved resumes yet"}
              </p>
              {!searchTerm && (
                <Button variant="link" onClick={onCreateNew} className="mt-2">
                  Create your first resume
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredResumes.map((resume) => (
                <Card key={resume.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0" onClick={() => handleResumeSelect(resume)}>
                        <h5 className="font-medium truncate">{resume.title}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(resume.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {resume.resumeData.sections.length} sections
                          </Badge>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleResumeSelect(resume)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Load Resume
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateResume(resume)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteResume(resume.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Dialogs */}
      <ResumeNameEditorDialog
        open={showNameEditor}
        onOpenChange={setShowNameEditor}
        onSave={handleSaveCurrentResume}
        defaultTitle={currentResumeData?.title || "My Resume"}
      />

      <OnboardingTutorial
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onCreateNew={onCreateNew}
        onCreateFromTemplate={handleCreateFromTemplate}
      />
    </div>
  )
}
