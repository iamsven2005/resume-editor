"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, Star, StarOff, Search, X, Calendar, FileText } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
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

interface ResumeGalleryProps {
  onLoadResume: (resumeData: any) => void
  currentResumeData: any
}

export function ResumeGallery({ onLoadResume, currentResumeData }: ResumeGalleryProps) {
  const { user } = useAuth()
  const [resumes, setResumes] = useState<SavedResume[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveTitle, setSaveTitle] = useState("")

  useEffect(() => {
    if (user) {
      fetchResumes()
    }
  }, [user])

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/resumes")
      if (response.ok) {
        const data = await response.json()
        setResumes(data.resumes)
      } else {
        toast({
          title: "Error",
          description: "Failed to load resumes",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load resumes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveCurrentResume = async () => {
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
        toast({
          title: "Success",
          description: "Resume saved successfully!",
        })
        setSaveTitle("")
        fetchResumes()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save resume",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
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

  const favoriteCount = resumes.filter((resume) => resume.is_favorite).length
  const hasSearchResults = filteredAndSortedResumes.length > 0
  const isSearching = searchQuery.trim().length > 0

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view your saved resumes.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading resumes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Save Current Resume */}
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

      {/* Search and Filter */}
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
        </div>
      </div>

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
            <Card key={resume.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-2 flex-1 mr-2">{resume.title}</CardTitle>
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
                </div>
              </CardHeader>
              <CardContent className="pt-0">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
