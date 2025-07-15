"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trash2,
  Star,
  StarOff,
  Search,
  X,
  Calendar,
  FileText,
  Briefcase,
  BarChart3,
  Plus,
  Edit,
  Save,
  Download,
  ExternalLink,
  Globe,
  Users,
  Eye,
  Edit2,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { PortfolioCreatorDialog } from "./portfolio-creator-dialog"
import { PortfolioAnalyticsDialog } from "./portfolio-analytics-dialog"
import { PortfolioEditorDialog } from "./portfolio-editor-dialog"
import { ResumeNameEditorDialog } from "./resume-name-editor-dialog"
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

interface SavedResume {
  id: string
  title: string
  resume_data: any
  is_favorite: boolean
  created_at: string
  updated_at: string
}

interface Portfolio {
  id: string
  title: string
  description?: string
  theme: string
  resume_data: any
  is_published: boolean
  portfolio_url: string
  total_views: number
  unique_visitors: number
  views_last_7_days: number
  views_last_30_days: number
  created_at: string
  updated_at: string
}

interface ResumeGalleryProps {
  onLoadResume: (resumeData: any) => void
  onCreateNew: () => void
  currentResumeData: any
  onSaveResume: (title: string) => Promise<void>
}

export function ResumeGallery({ onLoadResume, onCreateNew, currentResumeData, onSaveResume }: ResumeGalleryProps) {
  const { user } = useAuth()
  const [resumes, setResumes] = useState<SavedResume[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [portfoliosLoading, setPortfoliosLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveTitle, setSaveTitle] = useState("")
  const [activeTab, setActiveTab] = useState("resumes")
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (user) {
      fetchResumes()
      fetchPortfolios()
    }
  }, [user])

  // Auto-save functionality
  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    if (!autoSaveEnabled || !currentResumeData || !user || !currentResumeData.title) {
      return
    }

    // Set new timer
    const timer = setTimeout(async () => {
      try {
        console.log("Auto-saving resume:", currentResumeData.title)
        await handleAutoSave()
      } catch (error) {
        console.error("Auto-save failed:", error)
      }
    }, 30000) // 30 seconds

    setAutoSaveTimer(timer)

    // Cleanup function
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [currentResumeData, autoSaveEnabled, user])

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/resumes")
      if (response.ok) {
        const data = await response.json()
        setResumes(data.resumes || [])
      } else {
        console.error("Failed to fetch resumes:", response.status)
        toast({
          title: "Error",
          description: "Failed to load resumes",
          variant: "destructive",
        })
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
      const response = await fetch("/api/portfolios")
      if (response.ok) {
        const data = await response.json()
        setPortfolios(data.portfolios || [])
      } else {
        console.error("Failed to fetch portfolios:", response.status)
        toast({
          title: "Error",
          description: "Failed to load portfolios",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching portfolios:", error)
      toast({
        title: "Error",
        description: "Failed to load portfolios",
        variant: "destructive",
      })
    } finally {
      setPortfoliosLoading(false)
    }
  }

  const handleAutoSave = async () => {
    if (!currentResumeData?.title) {
      console.log("Auto-save skipped: no title")
      return
    }

    try {
      console.log("Auto-saving resume:", currentResumeData.title)
      await onSaveResume(currentResumeData.title)
      setLastSaved(new Date())
      toast({
        description: "Auto-saved successfully",
        duration: 2000,
      })
      // Refresh the resumes list
      fetchResumes()
    } catch (error) {
      console.error("Auto-save failed:", error)
      toast({
        description: "Auto-save failed",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const handleManualSave = async () => {
    if (!saveTitle.trim()) {
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
      console.error("Manual save error:", error)
      toast({
        title: "Error",
        description: "Failed to save resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleFavorite = async (resumeId: string, currentFavorite: boolean) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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
        const errorData = await response.json()
        console.error("Favorite toggle error:", errorData)
        toast({
          title: "Error",
          description: "Failed to update favorite status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Favorite toggle error:", error)
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      })
    }
  }

  const handleTitleUpdate = (resumeId: string, newTitle: string) => {
    setResumes((prev) => prev.map((resume) => (resume.id === resumeId ? { ...resume, title: newTitle } : resume)))
  }

  const deleteResume = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setResumes((prev) => prev.filter((resume) => resume.id !== resumeId))
        toast({
          title: "Success",
          description: "Resume deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete resume",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive",
      })
    }
  }

  const deletePortfolio = async (portfolioId: string) => {
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPortfolios((prev) => prev.filter((portfolio) => portfolio.id !== portfolioId))
        toast({
          title: "Success",
          description: "Portfolio deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete portfolio",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete portfolio",
        variant: "destructive",
      })
    }
  }

  const downloadResume = async (resumeId: string, title: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`)
      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data.resume.resume_data, null, 2)], {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPortfolioUrl = (portfolioUrl: string) => {
    return `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/portfolio/${portfolioUrl}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        description: "URL copied to clipboard",
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      })
    }
  }

  // Filter and sort resumes
  const filteredAndSortedResumes = useMemo(() => {
    const filtered = resumes.filter((resume) => resume.title.toLowerCase().includes(searchQuery.toLowerCase()))
    return filtered.sort((a, b) => {
      if (a.is_favorite && !b.is_favorite) return -1
      if (!a.is_favorite && b.is_favorite) return 1
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
  }, [resumes, searchQuery])

  // Filter and sort portfolios
  const filteredAndSortedPortfolios = useMemo(() => {
    const filtered = portfolios.filter((portfolio) => portfolio.title.toLowerCase().includes(searchQuery.toLowerCase()))
    return filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }, [portfolios, searchQuery])

  const favoriteCount = resumes.filter((resume) => resume.is_favorite).length

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view your saved resumes and portfolios.</p>
      </div>
    )
  }

  if (loading && portfoliosLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
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
            <Button onClick={onCreateNew} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create New Resume
            </Button>
            <Button
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              variant={autoSaveEnabled ? "default" : "outline"}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Auto-save {autoSaveEnabled ? "ON" : "OFF"}
            </Button>
            {lastSaved && (
              <Badge variant="secondary" className="text-xs">
                Last saved: {lastSaved.toLocaleTimeString()}
              </Badge>
            )}
          </div>

          {/* Manual Save Current Resume */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter resume title to save..."
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !saving) {
                  handleManualSave()
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleManualSave} disabled={saving || !saveTitle.trim()}>
              {saving ? "Saving..." : "Save Resume"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Resumes and Portfolios */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="resumes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resumes ({resumes.length})
              {favoriteCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {favoriteCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="portfolios" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Portfolios ({portfolios.length})
            </TabsTrigger>
          </TabsList>

          {activeTab === "portfolios" && (
            <PortfolioCreatorDialog
              resumes={resumes}
              onPortfolioCreated={() => {
                fetchPortfolios()
                setActiveTab("portfolios")
              }}
            >
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Portfolio
              </Button>
            </PortfolioCreatorDialog>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={`Search ${activeTab}...`}
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

          {/* Resume Grid */}
          {filteredAndSortedResumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              {searchQuery ? (
                <>
                  <p className="text-muted-foreground mb-2">No resumes found for "{searchQuery}"</p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">No saved resumes yet. Create your first resume!</p>
                  <Button onClick={onCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Resume
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedResumes.map((resume) => (
                <Card key={resume.id} className="hover:shadow-md transition-shadow group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <CardTitle className="text-base line-clamp-2 flex-1">{resume.title}</CardTitle>
                        <ResumeNameEditorDialog
                          resumeId={resume.id}
                          currentTitle={resume.title}
                          onTitleUpdated={(newTitle) => handleTitleUpdate(resume.id, newTitle)}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </ResumeNameEditorDialog>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(resume.id, resume.is_favorite)}
                        className="h-8 w-8 p-0 flex-shrink-0"
                      >
                        {resume.is_favorite ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Updated {formatDate(resume.updated_at)}</span>
                      </div>
                      {resume.is_favorite && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Favorite
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLoadResume(resume.resume_data)}
                        className="flex-1 min-w-0"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Load
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadResume(resume.id, resume.title)}
                        className="px-3"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="px-3 bg-transparent">
                            <Trash2 className="h-4 w-4" />
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
                              onClick={() => deleteResume(resume.id)}
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
          )}
        </TabsContent>

        <TabsContent value="portfolios" className="space-y-4">
          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredAndSortedPortfolios.length} portfolio{filteredAndSortedPortfolios.length !== 1 ? "s" : ""}
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
          </div>

          {/* Portfolio Grid */}
          {filteredAndSortedPortfolios.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              {searchQuery ? (
                <>
                  <p className="text-muted-foreground mb-2">No portfolios found for "{searchQuery}"</p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">
                    No portfolios yet. Create your first portfolio by merging resumes!
                  </p>
                  <PortfolioCreatorDialog
                    resumes={resumes}
                    onPortfolioCreated={() => {
                      fetchPortfolios()
                      setActiveTab("portfolios")
                    }}
                  >
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Portfolio
                    </Button>
                  </PortfolioCreatorDialog>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedPortfolios.map((portfolio) => (
                <Card key={portfolio.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base line-clamp-2 flex-1 mr-2">{portfolio.title}</CardTitle>
                      <Badge variant={portfolio.is_published ? "default" : "secondary"} className="text-xs">
                        {portfolio.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    {portfolio.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{portfolio.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Updated {formatDate(portfolio.updated_at)}</span>
                      </div>
                    </div>
                    {/* Analytics Summary */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{portfolio.total_views || 0} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{portfolio.unique_visitors || 0} visitors</span>
                      </div>
                    </div>
                    {/* Portfolio URL */}
                    {portfolio.is_published && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 p-2 bg-muted rounded text-xs">
                          <Globe className="h-3 w-3" />
                          <span className="flex-1 truncate">{getPortfolioUrl(portfolio.portfolio_url)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(getPortfolioUrl(portfolio.portfolio_url))}
                            className="h-5 w-5 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(getPortfolioUrl(portfolio.portfolio_url), "_blank")}
                            className="h-5 w-5 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLoadResume(portfolio.resume_data)}
                        className="flex-1 min-w-0"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Load
                      </Button>
                      <PortfolioEditorDialog portfolio={portfolio} onPortfolioUpdated={fetchPortfolios}>
                        <Button variant="outline" size="sm" className="px-3 bg-transparent">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </PortfolioEditorDialog>
                      <PortfolioAnalyticsDialog portfolioId={portfolio.id} portfolioTitle={portfolio.title}>
                        <Button variant="outline" size="sm" className="px-3 bg-transparent">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </PortfolioAnalyticsDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="px-3 bg-transparent">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Portfolio</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{portfolio.title}"? This action cannot be undone and will
                              also delete all associated analytics.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePortfolio(portfolio.id)}
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
