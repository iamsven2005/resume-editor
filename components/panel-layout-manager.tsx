"use client"

import { useState, useEffect, useCallback } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Eye,
  Upload,
  Save,
  Plus,
  RotateCcw,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  TrendingUp,
  Mail,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

// Import all the panel components
import { FormEditorPanel } from "./form-editor-panel"
import { PDFPreviewPanel } from "./pdf-preview-panel"
import { ResumeGallery } from "./resume/resume-gallery"
import { ResumeAnalysisPanel } from "./resume-analysis-panel"
import { ResumeImprovementPanel } from "./resume-improvement-panel"
import { EmailGeneratorPanel } from "./email-generator-panel"
import { DocumentUpload } from "./document-upload"

// Types
import type { ResumeData } from "@/types/resume"

interface PanelLayoutManagerProps {
  onStartTutorial?: () => void
}

export function PanelLayoutManager({ onStartTutorial }: PanelLayoutManagerProps) {
  const { user, token } = useAuth()
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [activePanel, setActivePanel] = useState("editor")
  const [isGalleryVisible, setIsGalleryVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Initialize with default resume data
  useEffect(() => {
    if (!resumeData) {
      setResumeData({
        title: "My Resume",
        personalInfo: {
          name: "",
          email: "",
          phone: "",
          location: "",
          title: "",
        },
        summary: "",
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
      })
    }
  }, [resumeData])

  const handleResumeDataChange = useCallback((newData: ResumeData) => {
    setResumeData(newData)
    setHasUnsavedChanges(true)
  }, [])

  const handleLoadResume = useCallback((loadedData: any) => {
    setResumeData(loadedData)
    setHasUnsavedChanges(false)
    toast({
      title: "Resume Loaded",
      description: "Resume has been loaded successfully.",
    })
  }, [])

  const handleCreateNew = useCallback(() => {
    const newResumeData: ResumeData = {
      title: "New Resume",
      personalInfo: {
        name: "",
        email: user?.email || "",
        phone: "",
        location: "",
        title: "",
      },
      summary: "",
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
    }
    setResumeData(newResumeData)
    setHasUnsavedChanges(true)
    toast({
      title: "New Resume Created",
      description: "Started with a blank resume template.",
    })
  }, [user])

  const handleSaveResume = useCallback(
    async (title?: string) => {
      if (!resumeData || !user || !token) {
        toast({
          title: "Error",
          description: "Please log in to save your resume.",
          variant: "destructive",
        })
        return
      }

      try {
        const saveData = {
          ...resumeData,
          title: title || resumeData.title || "Untitled Resume",
        }

        const response = await fetch("/api/resumes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: saveData.title,
            resume_data: saveData,
          }),
        })

        if (response.ok) {
          setLastSaved(new Date())
          setHasUnsavedChanges(false)
          toast({
            title: "Resume Saved",
            description: "Your resume has been saved successfully.",
          })

          // Refresh credits
          if (window.refreshCredits) {
            window.refreshCredits()
          }
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to save resume")
        }
      } catch (error: any) {
        console.error("Error saving resume:", error)
        toast({
          title: "Save Failed",
          description: error.message || "Failed to save resume. Please try again.",
          variant: "destructive",
        })
      }
    },
    [resumeData, user, token],
  )

  const toggleGallery = () => {
    setIsGalleryVisible(!isGalleryVisible)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const resetLayout = () => {
    setIsGalleryVisible(true)
    setIsFullscreen(false)
    setActivePanel("editor")
  }

  const renderActivePanel = () => {
    if (!resumeData) return null

    switch (activePanel) {
      case "editor":
        return <FormEditorPanel resumeData={resumeData} onResumeDataChange={handleResumeDataChange} />
      case "preview":
        return (
          <PdfPreviewPanel
            resumeData={resumeData}
            onDownload={() => {
              toast({
                title: "Download Started",
                description: "Your resume PDF is being generated.",
              })
            }}
          />
        )
      case "analysis":
        return <ResumeAnalysisPanel resumeData={resumeData} />
      case "improvement":
        return <ResumeImprovementPanel resumeData={resumeData} onApplyImprovement={handleResumeDataChange} />
      case "email":
        return <EmailGeneratorPanel resumeData={resumeData} />
      case "upload":
        return <DocumentUpload onResumeDataExtracted={handleLoadResume} />
      default:
        return null
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to use the resume builder.</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Resume Builder</h1>
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="text-xs">
                Unsaved Changes
              </Badge>
            )}
            {lastSaved && (
              <span className="text-xs text-muted-foreground">Last saved: {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleSaveResume()} disabled={!hasUnsavedChanges}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={toggleGallery}>
              {isGalleryVisible ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={resetLayout}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Gallery Panel */}
          {isGalleryVisible && !isFullscreen && (
            <>
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <div className="h-full overflow-auto p-4">
                  <ResumeGallery
                    onLoadResume={handleLoadResume}
                    onCreateNew={handleCreateNew}
                    currentResumeData={resumeData}
                    onSaveResume={handleSaveResume}
                    onStartTutorial={onStartTutorial}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* Main Panel */}
          <ResizablePanel defaultSize={isGalleryVisible && !isFullscreen ? 75 : 100}>
            <div className="h-full flex flex-col">
              {/* Panel Tabs */}
              <div className="border-b">
                <Tabs value={activePanel} onValueChange={setActivePanel}>
                  <TabsList className="w-full justify-start rounded-none border-0 bg-transparent p-0">
                    <TabsTrigger value="editor" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="analysis" className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Analysis
                    </TabsTrigger>
                    <TabsTrigger value="improvement" className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Improve
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Gen
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-auto">{renderActivePanel()}</div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
