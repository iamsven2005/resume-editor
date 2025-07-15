"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Trash2,
  Star,
  StarOff,
  Search,
  X,
  Calendar,
  FileText,
  Plus,
  Combine,
  Check,
  Globe,
  Eye,
  Code,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ResumeData, Section } from "@/types/resume"

interface SavedResume {
  id: string
  title: string
  resume_data: ResumeData
  is_favorite: boolean
  created_at: string
  updated_at: string
}

interface Portfolio {
  id: string
  title: string
  description: string
  theme: string
  is_published: boolean
  portfolio_url: string
  resume_data: ResumeData
  created_at: string
  updated_at: string
}

interface ResumeGalleryProps {
  onLoadResume: (resumeData: ResumeData) => void
  onCreateNew: () => void
  currentResumeData: ResumeData | null
}

const portfolioThemes = [
  { id: "modern", name: "Modern", description: "Clean and professional design" },
  { id: "creative", name: "Creative", description: "Bold and artistic layout" },
  { id: "minimal", name: "Minimal", description: "Simple and elegant" },
  { id: "tech", name: "Tech", description: "Developer-focused design" },
]

export function ResumeGallery({ onLoadResume, onCreateNew, currentResumeData }: ResumeGalleryProps) {
  const { user } = useAuth()
  const [resumes, setResumes] = useState<SavedResume[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveTitle, setSaveTitle] = useState("")
  const [selectedResumes, setSelectedResumes] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false)
  const [portfolioDialogOpen, setPortfolioDialogOpen] = useState(false)
  const [newResumeTitle, setNewResumeTitle] = useState("")
  const [portfolioTitle, setPortfolioTitle] = useState("")
  const [portfolioDescription, setPortfolioDescription] = useState("")
  const [portfolioTheme, setPortfolioTheme] = useState("modern")
  const [creatingPortfolio, setCreatingPortfolio] = useState(false)
  const [activeTab, setActiveTab] = useState("resumes")
  const toast = useToast()

  useEffect(() => {
    if (user) {
      fetchResumes()
      fetchPortfolios()
    }
  }, [user])

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/resumes")
      if (response.ok) {
        const data = await response.json()
        setResumes(data.resumes || [])
      } else {
        toast.toast({
          title: "Error",
          description: "Failed to load resumes",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast.toast({
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
      }
    } catch (error) {
      console.error("Failed to fetch portfolios:", error)
    }
  }

  const saveCurrentResume = async () => {
    if (!saveTitle.trim()) {
      toast.toast({
        title: "Error",
        description: "Please enter a title for your resume",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: saveTitle.trim(),
          resume_data: currentResumeData,
        }),
      })

      if (response.ok) {
        toast.toast({
          title: "Success",
          description: "Resume saved successfully!",
        })
        setSaveTitle("")
        fetchResumes()
      } else {
        const error = await response.json()
        toast.toast({
          title: "Error",
          description: error.error || "Failed to save resume",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Failed to save resume",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleFavorite = async (resumeId: string, currentFavorite: boolean) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_favorite: !currentFavorite,
        }),
      })

      if (response.ok) {
        setResumes((prev) =>
          prev.map((resume) => (resume.id === resumeId ? { ...resume, is_favorite: !currentFavorite } : resume)),
        )
        toast.toast({
          title: "Success",
          description: `Resume ${!currentFavorite ? "added to" : "removed from"} favorites`,
        })
      } else {
        toast.toast({
          title: "Error",
          description: "Failed to update favorite status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      })
    }
  }

  const deleteResume = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setResumes((prev) => prev.filter((resume) => resume.id !== resumeId))
        setSelectedResumes((prev) => {
          const newSet = new Set(prev)
          newSet.delete(resumeId)
          return newSet
        })
        toast.toast({
          title: "Success",
          description: "Resume deleted successfully",
        })
      } else {
        toast.toast({
          title: "Error",
          description: "Failed to delete resume",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast.toast({
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
        toast.toast({
          title: "Success",
          description: "Portfolio deleted successfully",
        })
      } else {
        toast.toast({
          title: "Error",
          description: "Failed to delete portfolio",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Failed to delete portfolio",
        variant: "destructive",
      })
    }
  }

  const togglePortfolioPublish = async (portfolioId: string, currentPublished: boolean) => {
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_published: !currentPublished,
        }),
      })

      if (response.ok) {
        setPortfolios((prev) =>
          prev.map((portfolio) =>
            portfolio.id === portfolioId ? { ...portfolio, is_published: !currentPublished } : portfolio,
          ),
        )
        toast.toast({
          title: "Success",
          description: `Portfolio ${!currentPublished ? "published" : "unpublished"} successfully`,
        })
      } else {
        toast.toast({
          title: "Error",
          description: "Failed to update portfolio status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Failed to update portfolio status",
        variant: "destructive",
      })
    }
  }

  const toggleResumeSelection = (resumeId: string) => {
    setSelectedResumes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(resumeId)) {
        newSet.delete(resumeId)
      } else {
        newSet.add(resumeId)
      }
      return newSet
    })
  }

  const selectAllResumes = () => {
    setSelectedResumes(new Set(filteredAndSortedResumes.map((resume) => resume.id)))
  }

  const clearSelection = () => {
    setSelectedResumes(new Set())
  }

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    if (isSelectionMode) {
      clearSelection()
    }
  }

  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const mergeResumes = (resumesToMerge: SavedResume[]): ResumeData => {
    if (resumesToMerge.length === 0) {
      return {
        title: "New Resume",
        sections: [],
      }
    }

    if (resumesToMerge.length === 1) {
      return {
        ...resumesToMerge[0].resume_data,
        title: newResumeTitle || `Copy of ${resumesToMerge[0].title}`,
      }
    }

    // Merge multiple resumes
    const mergedSections: Section[] = []
    const sectionMap = new Map<string, Section>()

    // Process each resume
    resumesToMerge.forEach((resume) => {
      if (resume.resume_data?.sections) {
        resume.resume_data.sections.forEach((section) => {
          const sectionName = section["section name"]

          if (sectionMap.has(sectionName)) {
            // Merge content into existing section
            const existingSection = sectionMap.get(sectionName)!
            const mergedContent = [...existingSection.content]

            // Add new content items, avoiding exact duplicates
            section.content.forEach((newItem) => {
              const isDuplicate = mergedContent.some(
                (existingItem) => JSON.stringify(existingItem) === JSON.stringify(newItem),
              )
              if (!isDuplicate) {
                mergedContent.push(newItem)
              }
            })

            sectionMap.set(sectionName, {
              ...existingSection,
              content: mergedContent,
            })
          } else {
            // Create new section
            sectionMap.set(sectionName, {
              ...section,
              id: generateUniqueId(),
            })
          }
        })
      }
    })

    // Convert map to array and sort by common section order
    const sectionOrder = ["Experience", "Education", "Skills", "Projects", "Certifications", "Awards"]
    const sortedSections = Array.from(sectionMap.values()).sort((a, b) => {
      const aIndex = sectionOrder.indexOf(a["section name"])
      const bIndex = sectionOrder.indexOf(b["section name"])

      if (aIndex === -1 && bIndex === -1) return 0
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1

      return aIndex - bIndex
    })

    return {
      title: newResumeTitle || `Merged Resume - ${new Date().toLocaleDateString()}`,
      sections: sortedSections,
    }
  }

  const handleCreateFromSelected = () => {
    if (selectedResumes.size === 0) {
      toast.toast({
        title: "Error",
        description: "Please select at least one resume to merge",
        variant: "destructive",
      })
      return
    }

    setMergeDialogOpen(true)
  }

  const handleCreatePortfolio = () => {
    if (selectedResumes.size === 0) {
      toast.toast({
        title: "Error",
        description: "Please select at least one resume to create a portfolio",
        variant: "destructive",
      })
      return
    }

    setPortfolioDialogOpen(true)
  }

  const confirmMergeResumes = () => {
    const selectedResumeData = resumes.filter((resume) => selectedResumes.has(resume.id))
    const mergedResume = mergeResumes(selectedResumeData)

    onLoadResume(mergedResume)
    setMergeDialogOpen(false)
    setNewResumeTitle("")
    setIsSelectionMode(false)
    clearSelection()

    toast.toast({
      title: "Success",
      description: `Created new resume from ${selectedResumes.size} selected resume${selectedResumes.size > 1 ? "s" : ""}`,
    })
  }

  const confirmCreatePortfolio = async () => {
    if (!portfolioTitle.trim()) {
      toast.toast({
        title: "Error",
        description: "Please enter a title for your portfolio",
        variant: "destructive",
      })
      return
    }

    setCreatingPortfolio(true)
    try {
      const selectedResumeData = resumes.filter((resume) => selectedResumes.has(resume.id))
      const mergedResume = mergeResumes(selectedResumeData)

      const response = await fetch("/api/portfolios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: portfolioTitle.trim(),
          description: portfolioDescription.trim(),
          theme: portfolioTheme,
          resume_data: mergedResume,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPortfolios((prev) => [...prev, data.portfolio])
        setPortfolioDialogOpen(false)
        setPortfolioTitle("")
        setPortfolioDescription("")
        setPortfolioTheme("modern")
        setIsSelectionMode(false)
        clearSelection()

        toast.toast({
          title: "Success",
          description: "Portfolio created successfully!",
        })
      } else {
        const error = await response.json()
        toast.toast({
          title: "Error",
          description: error.error || "Failed to create portfolio",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Failed to create portfolio",
        variant: "destructive",
      })
    } finally {
      setCreatingPortfolio(false)
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

  // Filter and sort resumes
  const filteredAndSortedResumes = useMemo(() => {
    // Filter by search query
    const filtered = resumes.filter((resume) => resume.title.toLowerCase().includes(searchQuery.toLowerCase()))

    // Sort: favorites first, then by updated date (newest first)
    return filtered.sort((a, b) => {
      // First, sort by favorite status (favorites first)
      if (a.is_favorite && !b.is_favorite) return -1
      if (!a.is_favorite && b.is_favorite) return 1

      // Then sort by updated date (newest first)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
  }, [resumes, searchQuery])

  // Filter and sort portfolios
  const filteredAndSortedPortfolios = useMemo(() => {
    const filtered = portfolios.filter((portfolio) => portfolio.title.toLowerCase().includes(searchQuery.toLowerCase()))

    return filtered.sort((a, b) => {
      // Published first, then by updated date
      if (a.is_published && !b.is_published) return -1
      if (!a.is_published && b.is_published) return 1
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
  }, [portfolios, searchQuery])

  const favoriteCount = resumes.filter((resume) => resume.is_favorite).length
  const publishedCount = portfolios.filter((portfolio) => portfolio.is_published).length
  const hasSearchResults =
    activeTab === "resumes" ? filteredAndSortedResumes.length > 0 : filteredAndSortedPortfolios.length > 0
  const isSearching = searchQuery.trim().length > 0

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view your saved resumes and portfolios.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Save Current Resume */}
      {currentResumeData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Save Current Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter resume title..."
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !saving) {
                  saveCurrentResume()
                }
              }}
            />
            <Button onClick={saveCurrentResume} disabled={saving || !saveTitle.trim()} className="w-full">
              {saving ? "Saving..." : "Save Resume"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resumes">Resumes ({resumes.length})</TabsTrigger>
          <TabsTrigger value="portfolios">Portfolios ({portfolios.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="resumes" className="space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={onCreateNew} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>

            {resumes.length > 0 && (
              <>
                <Button onClick={toggleSelectionMode} variant={isSelectionMode ? "default" : "outline"}>
                  <Combine className="h-4 w-4 mr-2" />
                  {isSelectionMode ? "Cancel Selection" : "Select Multiple"}
                </Button>

                {isSelectionMode && (
                  <>
                    <Button onClick={selectAllResumes} variant="outline" size="sm">
                      Select All
                    </Button>
                    <Button onClick={clearSelection} variant="outline" size="sm">
                      Clear
                    </Button>
                    <div className="flex gap-2 ml-auto">
                      <Button onClick={handleCreateFromSelected} disabled={selectedResumes.size === 0}>
                        Merge {selectedResumes.size} Selected
                      </Button>
                      <Button onClick={handleCreatePortfolio} disabled={selectedResumes.size === 0} variant="secondary">
                        <Globe className="h-4 w-4 mr-2" />
                        Create Portfolio
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Search and Filter */}
          {resumes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search resumes by title..."
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

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {isSearching ? (
                    <span>
                      {filteredAndSortedResumes.length} result{filteredAndSortedResumes.length !== 1 ? "s" : ""}
                      for "{searchQuery}"
                    </span>
                  ) : (
                    <span>
                      {resumes.length} total resume{resumes.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {favoriteCount > 0 && !isSearching && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Favorites shown first
                    </Badge>
                  )}
                </div>

                {isSelectionMode && selectedResumes.size > 0 && (
                  <Badge variant="default" className="text-xs">
                    {selectedResumes.size} selected
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Resume Grid */}
          {!hasSearchResults ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              {isSearching ? (
                <>
                  <p className="text-muted-foreground mb-2">No resumes found for "{searchQuery}"</p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">No saved resumes yet. Save your first resume above!</p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedResumes.map((resume) => (
                <Card
                  key={resume.id}
                  className={`hover:shadow-md transition-shadow ${
                    isSelectionMode && selectedResumes.has(resume.id) ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        {isSelectionMode && (
                          <Checkbox
                            checked={selectedResumes.has(resume.id)}
                            onCheckedChange={() => toggleResumeSelection(resume.id)}
                            className="mt-1"
                          />
                        )}
                        <CardTitle className="text-base line-clamp-2 flex-1">{resume.title}</CardTitle>
                      </div>
                      {!isSelectionMode && (
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
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Updated {formatDate(resume.updated_at)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {!isSelectionMode && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onLoadResume(resume.resume_data)}
                          className="flex-1"
                        >
                          Load
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
                    )}
                    {isSelectionMode && selectedResumes.has(resume.id) && (
                      <div className="flex items-center justify-center py-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="portfolios" className="space-y-6">
          {/* Search for Portfolios */}
          {portfolios.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search portfolios by title..."
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

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {isSearching ? (
                    <span>
                      {filteredAndSortedPortfolios.length} result{filteredAndSortedPortfolios.length !== 1 ? "s" : ""}
                      for "{searchQuery}"
                    </span>
                  ) : (
                    <span>
                      {portfolios.length} total portfolio{portfolios.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {publishedCount > 0 && !isSearching && (
                    <Badge variant="secondary" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      {publishedCount} published
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Grid */}
          {filteredAndSortedPortfolios.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Globe className="h-12 w-12 text-muted-foreground mb-4" />
              {isSearching ? (
                <>
                  <p className="text-muted-foreground mb-2">No portfolios found for "{searchQuery}"</p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">No portfolios yet. Create one from your resumes!</p>
                  <Button onClick={() => setActiveTab("resumes")} variant="outline">
                    Go to Resumes
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedPortfolios.map((portfolio) => (
                <Card key={portfolio.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base line-clamp-2 flex-1">{portfolio.title}</CardTitle>
                      <div className="flex items-center gap-1">
                        {portfolio.is_published && (
                          <Badge variant="default" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Live
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{portfolio.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Updated {formatDate(portfolio.updated_at)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {portfolioThemes.find((t) => t.id === portfolio.theme)?.name || portfolio.theme}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      {portfolio.is_published && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(portfolio.portfolio_url, "_blank")}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLoadResume(portfolio.resume_data)}
                        className="flex-1"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant={portfolio.is_published ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePortfolioPublish(portfolio.id, portfolio.is_published)}
                        className="px-3"
                      >
                        {portfolio.is_published ? "Unpublish" : "Publish"}
                      </Button>
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
                              remove the published website.
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

      {/* Merge Dialog */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Resume from Selected</DialogTitle>
            <DialogDescription>
              Merge {selectedResumes.size} selected resume{selectedResumes.size > 1 ? "s" : ""} into a new resume.
              Sections with the same name will be combined, and duplicate entries will be removed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-resume-title">New Resume Title</Label>
              <Input
                id="new-resume-title"
                value={newResumeTitle}
                onChange={(e) => setNewResumeTitle(e.target.value)}
                placeholder={`Merged Resume - ${new Date().toLocaleDateString()}`}
              />
            </div>
            <div className="space-y-2">
              <Label>Selected Resumes:</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {resumes
                  .filter((resume) => selectedResumes.has(resume.id))
                  .map((resume) => (
                    <div key={resume.id} className="text-sm text-muted-foreground flex items-center gap-2">
                      <Check className="h-3 w-3" />
                      {resume.title}
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmMergeResumes}>Create Merged Resume</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Portfolio Dialog */}
      <Dialog open={portfolioDialogOpen} onOpenChange={setPortfolioDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Portfolio Website</DialogTitle>
            <DialogDescription>
              Create a beautiful portfolio website from {selectedResumes.size} selected resume
              {selectedResumes.size > 1 ? "s" : ""}. Your portfolio will be editable and can be published online.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="portfolio-title">Portfolio Title</Label>
              <Input
                id="portfolio-title"
                value={portfolioTitle}
                onChange={(e) => setPortfolioTitle(e.target.value)}
                placeholder="My Professional Portfolio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio-description">Description</Label>
              <Textarea
                id="portfolio-description"
                value={portfolioDescription}
                onChange={(e) => setPortfolioDescription(e.target.value)}
                placeholder="A brief description of your portfolio..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio-theme">Theme</Label>
              <Select value={portfolioTheme} onValueChange={setPortfolioTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {portfolioThemes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      <div>
                        <div className="font-medium">{theme.name}</div>
                        <div className="text-sm text-muted-foreground">{theme.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Selected Resumes:</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {resumes
                  .filter((resume) => selectedResumes.has(resume.id))
                  .map((resume) => (
                    <div key={resume.id} className="text-sm text-muted-foreground flex items-center gap-2">
                      <Check className="h-3 w-3" />
                      {resume.title}
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPortfolioDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCreatePortfolio} disabled={creatingPortfolio || !portfolioTitle.trim()}>
              {creatingPortfolio ? "Creating..." : "Create Portfolio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
