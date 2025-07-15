"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText,
  User,
  Calendar,
  Edit,
  Trash2,
  Plus,
  Search,
  Eye,
  Share,
  BarChart3,
  Globe,
  Upload,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ResumeNameEditorDialog } from "./resume-name-editor-dialog"
import { PortfolioCreatorDialog } from "./portfolio-creator-dialog"
import { PortfolioEditorDialog } from "./portfolio-editor-dialog"
import { PortfolioAnalyticsDialog } from "./portfolio-analytics-dialog"
import { FileUploadManager } from "./file-upload-manager"
import type { Resume } from "@/types/resume"
import type { Portfolio } from "@/types/portfolio"

interface ResumeGalleryProps {
  onResumeSelect: (resume: Resume) => void
  selectedResumeId?: string
}

export function ResumeGallery({ onResumeSelect, selectedResumeId }: ResumeGalleryProps) {
  const { user, token } = useAuth()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingResume, setEditingResume] = useState<Resume | null>(null)
  const [creatingPortfolio, setCreatingPortfolio] = useState(false)
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null)
  const [viewingAnalytics, setViewingAnalytics] = useState<Portfolio | null>(null)

  useEffect(() => {
    if (user && token) {
      fetchResumes()
      fetchPortfolios()
    }
  }, [user, token])

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

  const handleDeleteResume = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setResumes(resumes.filter((r) => r.id !== resumeId))
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

  const handleDeletePortfolio = async (portfolioId: string) => {
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

  const copyPortfolioUrl = async (slug: string) => {
    const url = `${window.location.origin}/portfolio/${slug}`
    try {
      await navigator.clipboard.writeText(url)
      toast({
        description: "Portfolio URL copied to clipboard",
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

  const filteredResumes = resumes.filter((resume) => resume.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredPortfolios = portfolios.filter((portfolio) =>
    portfolio.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view your resumes.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search resumes, portfolios, and files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resumes ({filteredResumes.length})
          </TabsTrigger>
          <TabsTrigger value="portfolios" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Portfolios ({filteredPortfolios.length})
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Files
          </TabsTrigger>
        </TabsList>

        {/* Resumes Tab */}
        <TabsContent value="resumes" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Loading resumes...</p>
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              {searchQuery ? (
                <p className="text-muted-foreground">No resumes found for "{searchQuery}"</p>
              ) : (
                <p className="text-muted-foreground">No resumes yet. Create your first resume!</p>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[600px] w-full">
              <div className="grid gap-4 p-1">
                {filteredResumes.map((resume) => (
                  <Card
                    key={resume.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedResumeId === resume.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => onResumeSelect(resume)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg truncate">{resume.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingResume(resume)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteResume(resume.id)
                            }}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{resume.personalInfo?.name || "No name"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(resume.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {resume.template || "Default"}
                        </Badge>
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
          <div className="flex justify-end">
            <Button onClick={() => setCreatingPortfolio(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Portfolio
            </Button>
          </div>

          {filteredPortfolios.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Globe className="h-12 w-12 text-muted-foreground mb-4" />
              {searchQuery ? (
                <p className="text-muted-foreground">No portfolios found for "{searchQuery}"</p>
              ) : (
                <p className="text-muted-foreground">No portfolios yet. Create your first portfolio!</p>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[600px] w-full">
              <div className="grid gap-4 p-1">
                {filteredPortfolios.map((portfolio) => (
                  <Card key={portfolio.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg truncate">{portfolio.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/portfolio/${portfolio.slug}`, "_blank")}
                            className="h-8 w-8 p-0"
                            title="View Portfolio"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyPortfolioUrl(portfolio.slug)}
                            className="h-8 w-8 p-0"
                            title="Copy URL"
                          >
                            <Share className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingAnalytics(portfolio)}
                            className="h-8 w-8 p-0"
                            title="View Analytics"
                          >
                            <BarChart3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingPortfolio(portfolio)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePortfolio(portfolio.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>/{portfolio.slug}</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(portfolio.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge variant={portfolio.isPublic ? "default" : "secondary"} className="text-xs">
                          {portfolio.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files">
          <FileUploadManager searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {editingResume && (
        <ResumeNameEditorDialog
          resume={editingResume}
          open={!!editingResume}
          onOpenChange={(open) => !open && setEditingResume(null)}
          onSave={(updatedResume) => {
            setResumes(resumes.map((r) => (r.id === updatedResume.id ? updatedResume : r)))
            setEditingResume(null)
          }}
        />
      )}

      {creatingPortfolio && (
        <PortfolioCreatorDialog
          resumes={resumes}
          open={creatingPortfolio}
          onOpenChange={setCreatingPortfolio}
          onSuccess={(newPortfolio) => {
            setPortfolios([...portfolios, newPortfolio])
            setCreatingPortfolio(false)
          }}
        />
      )}

      {editingPortfolio && (
        <PortfolioEditorDialog
          portfolio={editingPortfolio}
          resumes={resumes}
          open={!!editingPortfolio}
          onOpenChange={(open) => !open && setEditingPortfolio(null)}
          onSuccess={(updatedPortfolio) => {
            setPortfolios(portfolios.map((p) => (p.id === updatedPortfolio.id ? updatedPortfolio : p)))
            setEditingPortfolio(null)
          }}
        />
      )}

      {viewingAnalytics && (
        <PortfolioAnalyticsDialog
          portfolio={viewingAnalytics}
          open={!!viewingAnalytics}
          onOpenChange={(open) => !open && setViewingAnalytics(null)}
        />
      )}
    </div>
  )
}
