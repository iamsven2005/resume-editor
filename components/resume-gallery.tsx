"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  FileText, 
  Globe, 
  Plus, 
  Search, 
  Calendar, 
  Edit, 
  Trash2, 
  Eye, 
  Share, 
  BarChart3, 
  Download,
  TrendingUp,
  Star,
  User,
  Mail,
  Phone,
  Linkedin,
  Briefcase,
  CheckCircle2,
  Save,
  StarOff,
  X,
  Edit2,
  ImageIcon
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ResumeNameEditorDialog } from "./resume-name-editor-dialog"
import { PortfolioCreatorDialog } from "./portfolio-creator-dialog"
import { PortfolioEditorDialog } from "./portfolio-editor-dialog"
import { PortfolioAnalyticsDialog } from "./portfolio-analytics-dialog"
import { FileUploadManager } from "./file-upload-manager"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Resume {
  id: number
  name: string
  data: any
  created_at: string
  updated_at: string
  is_favorite?: boolean
}

interface Portfolio {
  id: number
  name: string
  slug: string
  theme: string
  resume_id: number
  is_public: boolean
  created_at: string
  updated_at: string
  resume?: Resume
}

interface ResumeAnalysis {
  resumeId: number
  fileName: string
  score: number
  strengths: string[]
  weaknesses: string[]
  keySkills: string[]
  experience: string
  summary: string
  contactInfo: {
    email?: string
    phone?: string
    name?: string
    linkedin?: string
  }
}

interface ResumeGalleryProps {
  onLoadResume?: (resumeData: any) => void
  onCreateNew?: () => void
  currentResumeData?: any
  onSaveResume?: (title: string) => Promise<void>
}

export function ResumeGallery({ 
  onLoadResume, 
  onCreateNew, 
  currentResumeData, 
  onSaveResume 
}: ResumeGalleryProps = {}) {
  const { user, token } = useAuth()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [showResumeEditor, setShowResumeEditor] = useState(false)
  const [showPortfolioCreator, setShowPortfolioCreator] = useState(false)
  const [showPortfolioEditor, setShowPortfolioEditor] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Quick Actions state
  const [saving, setSaving] = useState(false)
  const [saveTitle, setSaveTitle] = useState("")
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [manualSaving, setManualSaving] = useState(false)

  // Ranking functionality state
  const [selectedResumeIds, setSelectedResumeIds] = useState<Set<number>>(new Set())
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<ResumeAnalysis[]>([])
  const [showRanking, setShowRanking] = useState(false)

  useEffect(() => {
    if (user && token) {
      fetchResumes()
      fetchPortfolios()
    }
  }, [user, token])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !currentResumeData || !user || !onSaveResume) return

    const autoSaveTimer = setTimeout(async () => {
      if (currentResumeData && currentResumeData.title) {
        try {
          await handleAutoSave()
        } catch (error) {
          console.error("Auto-save failed:", error)
        }
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer)
  }, [currentResumeData, autoSaveEnabled, user, onSaveResume])

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/resumes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setResumes(data.resumes)
      }
    } catch (error) {
      console.error("Error fetching resumes:", error)
      toast({
        title: "Error",
        description: "Failed to load resumes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPortfolios = async () => {
    try {
      const response = await fetch("/api/portfolios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPortfolios(data.portfolios)
      }
    } catch (error) {
      console.error("Error fetching portfolios:", error)
    }
  }

  // Quick Actions handlers
  const handleAutoSave = async () => {
    if (!currentResumeData?.title || !onSaveResume) return

    try {
      await onSaveResume(currentResumeData.title)
      setLastSaved(new Date())
      toast({
        description: "Auto-saved successfully",
        duration: 2000,
      })
    } catch (error) {
      console.error("Auto-save failed:", error)
    }
  }

  const handleManualSave = async () => {
    if (!currentResumeData || !onSaveResume) {
      toast({
        title: "Error",
        description: "No resume data to save",
        variant: "destructive",
      })
      return
    }

    const title = currentResumeData.title || currentResumeData.personalInfo?.name || "Untitled Resume"

    setManualSaving(true)
    try {
      await onSaveResume(title)
      setLastSaved(new Date())
      fetchResumes()
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
    if (!saveTitle.trim() || !onSaveResume) {
      toast({
        title: "Error",
        description: "Please enter a title for your resume",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await onSaveResume(saveTitle.trim())
      setSaveTitle("")
      fetchResumes()
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

  const toggleFavorite = async (resumeId: number, currentFavorite: boolean) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isFavorite: !currentFavorite,
        }),
      })

      if (response.ok) {
        setResumes((prev) =>
          prev.map((resume) => (resume.id === resumeId ? { ...resume, is_favorite: !currentFavorite } : resume)),
        )
        toast({
          title: "Success",
          description: `Resume ${!currentFavorite ? "added to" : "removed from"} favorites`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update favorite status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteResume = async (resumeId: number) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setResumes(resumes.filter((r) => r.id !== resumeId))
        setSelectedResumeIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(resumeId)
          return newSet
        })
        toast({
          description: "Resume deleted successfully",
        })
      } else {
        throw new Error("Failed to delete resume")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive",
      })
    }
  }

  const handleDeletePortfolio = async (portfolioId: number) => {
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setPortfolios(portfolios.filter((p) => p.id !== portfolioId))
        toast({
          description: "Portfolio deleted successfully",
        })
      } else {
        throw new Error("Failed to delete portfolio")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete portfolio",
        variant: "destructive",
      })
    }
  }

  const copyPortfolioLink = async (slug: string) => {
    const url = `${window.location.origin}/portfolio/${slug}`
    try {
      await navigator.clipboard.writeText(url)
      toast({
        description: "Portfolio link copied to clipboard",
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  const downloadResume = async (resumeId: number, title: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data.resume.data, null, 2)], {
          type: "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast({
          title: "Success",
          description: "Resume downloaded successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download resume",
        variant: "destructive",
      })
    }
  }

  const handleResumeSelection = (resumeId: number, checked: boolean) => {
    setSelectedResumeIds(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(resumeId)
      } else {
        newSet.delete(resumeId)
      }
      return newSet
    })
  }

  const handleSelectAllResumes = (checked: boolean) => {
    if (checked) {
      setSelectedResumeIds(new Set(filteredResumes.map(r => r.id)))
    } else {
      setSelectedResumeIds(new Set())
    }
  }

  const analyzeSelectedResumes = async () => {
    if (!jobDescription.trim() || selectedResumeIds.size === 0) {
      toast({
        title: "Missing Information",
        description: "Please enter a job description and select at least one resume.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setShowRanking(true)

    try {
      const selectedResumes = resumes.filter(r => selectedResumeIds.has(r.id))
      
      const response = await fetch("/api/analyze-resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobDescription,
          resumes: selectedResumes.map(r => ({
            id: r.id,
            name: r.title,
            data: r.data
          }))
        }),
      })

      if (response.ok) {
        const analysisData = await response.json()
        setAnalysisResults(analysisData.results.sort((a: ResumeAnalysis, b: ResumeAnalysis) => b.score - a.score))
      } else {
        throw new Error("Analysis failed")
      }
    } catch (error) {
      console.error("Analysis failed:", error)
      toast({
        title: "Error",
        description: "Failed to analyze resumes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetRanking = () => {
    setSelectedResumeIds(new Set())
    setJobDescription("")
    setAnalysisResults([])
    setShowRanking(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match"
    if (score >= 60) return "Good Match"
    if (score >= 40) return "Fair Match"
    return "Poor Match"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const filteredResumes = resumes.filter((resume) =>
    resume.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPortfolios = portfolios.filter((portfolio) =>
    portfolio.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter and sort resumes with favorites first
  const filteredAndSortedResumes = filteredResumes.sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1
    if (!a.is_favorite && b.is_favorite) return 1
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  const favoriteCount = resumes.filter((resume) => resume.is_favorite).length

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view your resumes and portfolios.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
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
                onChange={(e) => setSaveTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !saving) {
                    saveCurrentResume()
                  }
                }}
                className="flex-1"
              />
              <Button onClick={saveCurrentResume} disabled={saving || !saveTitle.trim()}>
                {saving ? "Saving..." : "Save Resume"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search resumes, portfolios, and files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resumes ({filteredResumes.length})
            {favoriteCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                <Star className="h-3 w-3 mr-1 fill-current" />
                {favoriteCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="portfolios" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Portfolios ({filteredPortfolios.length})
          </TabsTrigger>
          <TabsTrigger value="ranker" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Ranker
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Files
          </TabsTrigger>
        </TabsList>

        {/* Resumes Tab */}
        <TabsContent value="resumes" className="space-y-4">
          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>
                {filteredAndSortedResumes.length} result{filteredAndSortedResumes.length !== 1 ? "s" : ""}
                {searchQuery && ` for "${searchQuery}"`}
              </span>
              {favoriteCount > 0 && !searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Favorites shown first
                </Badge>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading resumes...</p>
            </div>
          ) : filteredAndSortedResumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              {searchQuery ? (
                <>
                  <p className="text-muted-foreground mb-2">No resumes found for "{searchQuery}"</p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">No resumes yet. Create your first resume!</p>
                  {onCreateNew && (
                    <Button onClick={onCreateNew}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Resume
                    </Button>
                  )}
                </>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[600px] w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
                {filteredAndSortedResumes.map((resume) => (
                  <Card key={resume.id} className="hover:shadow-md transition-shadow group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <CardTitle className="text-lg truncate flex-1">{resume.title}</CardTitle>
                          <ResumeNameEditorDialog
                            open={showResumeEditor && selectedResume?.id === resume.id}
                            onOpenChange={(open) => {
                              setShowResumeEditor(open)
                              if (!open) setSelectedResume(null)
                            }}
                            resume={resume}
                            onSave={(updatedResume) => {
                              setResumes(resumes.map((r) => (r.id === updatedResume.id ? updatedResume : r)))
                              setSelectedResume(null)
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedResume(resume)
                                setShowResumeEditor(true)
                              }}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </ResumeNameEditorDialog>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(resume.id, resume.is_favorite || false)}
                            className="h-8 w-8 p-0 flex-shrink-0"
                          >
                            {resume.is_favorite ? (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <StarOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Updated {formatDate(resume.updated_at)}</span>
                        {resume.is_favorite && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Favorite
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {onLoadResume && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onLoadResume(resume.data)}
                              className="h-8 px-2"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Load
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedResume(resume)
                              setShowPortfolioCreator(true)
                            }}
                            className="h-8 px-2"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Portfolio
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadResume(resume.id, resume.title)}
                            className="h-8 px-2"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{resume.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteResume(resume.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Portfolios Tab */}
        <TabsContent value="portfolios" className="space-y-4">
          {filteredPortfolios.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Globe className="h-16 w-16 text-muted-foreground mb-4" />
              {searchQuery ? (
                <p className="text-muted-foreground">No portfolios found for "{searchQuery}"</p>
              ) : (
                <p className="text-muted-foreground">No portfolios yet. Create one from a resume!</p>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[600px] w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
                {filteredPortfolios.map((portfolio) => (
                  <Card key={portfolio.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{portfolio.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>Updated {formatDate(portfolio.updated_at)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={portfolio.is_public ? "default" : "secondary"} className="text-xs">
                              {portfolio.is_public ? "Public" : "Private"}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {portfolio.theme}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/portfolio/${portfolio.slug}`, "_blank")}
                            className="h-8 px-2"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPortfolio(portfolio)
                              setShowPortfolioEditor(true)
                            }}
                            className="h-8 px-2"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyPortfolioLink(portfolio.slug)}
                            className="h-8 px-2"
                          >
                            <Share className="h-3 w-3 mr-1" />
                            Share
                          </Button>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPortfolio(portfolio)
                              setShowAnalytics(true)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <BarChart3 className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Portfolio</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{portfolio.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePortfolio(portfolio.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Ranker Tab */}
        <TabsContent value="ranker" className="space-y-6">
          {!showRanking ? (
            <div className="grid gap-6">
              {/* Job Description Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Enter the job description, required skills, qualifications, and experience you want to match against..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[150px]"
                  />
                </CardContent>
              </Card>

              {/* Resume Selection */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Select Resumes to Rank
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="select-all"
                        checked={selectedResumeIds.size === filteredResumes.length && filteredResumes.length > 0}
                        onCheckedChange={handleSelectAllResumes}
                      />
                      <Label htmlFor="select-all" className="text-sm">
                        Select All ({filteredResumes.length})
                      </Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredResumes.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No resumes available for ranking</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px] w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
                        {filteredResumes.map((resume) => (
                          <Card 
                            key={resume.id} 
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedResumeIds.has(resume.id) 
                                ? 'ring-2 ring-blue-500 bg-blue-50' 
                                : ''
                            }`}
                            onClick={() => handleResumeSelection(resume.id, !selectedResumeIds.has(resume.id))}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={selectedResumeIds.has(resume.id)}
                                      onCheckedChange={(checked) => handleResumeSelection(resume.id, checked as boolean)}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <CardTitle className="text-base truncate">{resume.title}</CardTitle>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Updated {formatDate(resume.updated_at)}</span>
                                  </div>
                                </div>
                                {selectedResumeIds.has(resume.id) && (
                                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                )}
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={analyzeSelectedResumes}
                  disabled={!jobDescription.trim() || selectedResumeIds.size === 0 || isAnalyzing}
                  size="lg"
                  className="px-8"
                >
                  {isAnalyzing ? (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Rank Selected Resumes ({selectedResumeIds.size})
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // Results View
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Ranking Results</h2>
                  <p className="text-muted-foreground">
                    {analysisResults.length} resumes ranked by job match score
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetRanking}>
                    New Ranking
                  </Button>
                </div>
              </div>

              {isAnalyzing ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                    <p className="text-lg font-medium">Analyzing Resumes...</p>
                    <p className="text-muted-foreground">This may take a moment</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6">
                  {analysisResults.map((result, index) => (
                    <Card key={result.resumeId} className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full">
                              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                            </div>
                            <div>
                              <CardTitle className="text-lg">{result.fileName}</CardTitle>
                              <p className="text-sm text-muted-foreground">Resume #{index + 1}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                              {result.score}%
                            </div>
                            <Badge
                              variant={result.score >= 80 ? "default" : result.score >= 60 ? "secondary" : "destructive"}
                            >
                              {getScoreLabel(result.score)}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={result.score} className="mt-4" />
                      </CardHeader>

                      {/* Contact Information */}
                      {(result.contactInfo.email || result.contactInfo.phone || result.contactInfo.linkedin) && (
                        <div className="px-6 py-4 bg-gray-50 border-b">
                          <div className="flex flex-wrap items-center gap-3">
                            {result.contactInfo.name && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900">{result.contactInfo.name}</span>
                              </div>
                            )}

                            {result.contactInfo.email && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => window.open(`mailto:${result.contactInfo.email}`, "_blank")}
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Email
                              </Button>
                            )}

                            {result.contactInfo.phone && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => window.open(`tel:${result.contactInfo.phone}`, "_blank")}
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                Call
                              </Button>
                            )}

                            {result.contactInfo.linkedin && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => window.open(result.contactInfo.linkedin, "_blank")}
                              >
                                <Linkedin className="w-4 h-4 mr-2" />
                                LinkedIn
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      <CardContent className="p-6 space-y-6">
                        {/* Summary */}
                        <div>
                          <h4 className="font-semibold mb-2">Summary</h4>
                          <p className="text-gray-700">{result.summary}</p>
                        </div>

                        <Separator />

                        {/* Key Skills */}
                        <div>
                          <h4 className="font-semibold mb-3">Key Skills Found</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.keySkills.map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Experience */}
                        <div>
                          <h4 className="font-semibold mb-2">Experience Level</h4>
                          <p className="text-gray-700">{result.experience}</p>
                        </div>

                        <Separator />

                        {/* Strengths and Weaknesses */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3 text-green-700">Strengths</h4>
                            <ul className="space-y-2">
                              {result.strengths.map((strength, strengthIndex) => (
                                <li key={strengthIndex} className="flex items-start gap-2">
                                  <Star className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3 text-red-700">Areas for Improvement</h4>
                            <ul className="space-y-2">
                              {result.weaknesses.map((weakness, weaknessIndex) => (
                                <li key={weaknessIndex} className="flex items-start gap-2">
                                  <div className="w-4 h-4 bg-red-100 rounded-full mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files">
          <FileUploadManager searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {selectedResume && (
        <ResumeNameEditorDialog
          open={showResumeEditor}
          onOpenChange={setShowResumeEditor}
          resume={selectedResume}
          onSave={(updatedResume) => {
            setResumes(resumes.map((r) => (r.id === updatedResume.id ? updatedResume : r)))
            setSelectedResume(null)
          }}
        />
      )}

      {selectedResume && (
        <PortfolioCreatorDialog
          open={showPortfolioCreator}
          onOpenChange={setShowPortfolioCreator}
          resume={selectedResume}
          onSuccess={(newPortfolio) => {
            setPortfolios([...portfolios, newPortfolio])
            setSelectedResume(null)
          }}
        />
      )}

      {selectedPortfolio && (
        <PortfolioEditorDialog
          open={showPortfolioEditor}
          onOpenChange={setShowPortfolioEditor}
          portfolio={selectedPortfolio}
          onSave={(updatedPortfolio) => {
            setPortfolios(portfolios.map((p) => (p.id === updatedPortfolio.id ? updatedPortfolio : p)))
            setSelectedPortfolio(null)
          }}
        />
      )}

      {selectedPortfolio && (
        <PortfolioAnalyticsDialog 
          open={showAnalytics} 
          onOpenChange={setShowAnalytics} 
          portfolio={selectedPortfolio} 
        />
      )}
    </div>
  )
}
