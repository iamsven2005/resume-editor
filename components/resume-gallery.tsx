"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Globe, Plus, Search, Calendar, Edit, Trash2, Eye, Share, BarChart3, Download } from "lucide-react"
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

export function ResumeGallery() {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const filteredResumes = resumes.filter((resume) => resume.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredPortfolios = portfolios.filter((portfolio) =>
    portfolio.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view your resumes and portfolios.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
            <Download className="h-4 w-4" />
            Files
          </TabsTrigger>
        </TabsList>

        {/* Resumes Tab */}
        <TabsContent value="resumes" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading resumes...</p>
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              {searchQuery ? (
                <p className="text-muted-foreground">No resumes found for "{searchQuery}"</p>
              ) : (
                <p className="text-muted-foreground">No resumes yet. Create your first resume!</p>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[600px] w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
                {filteredResumes.map((resume) => (
                  <Card key={resume.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{resume.name}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>Updated {formatDate(resume.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedResume(resume)
                              setShowResumeEditor(true)
                            }}
                            className="h-8 px-2"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
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
                                Are you sure you want to delete "{resume.name}"? This action cannot be undone.
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
                          <CardTitle className="text-lg truncate">{portfolio.name}</CardTitle>
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
                                  Are you sure you want to delete "{portfolio.name}"? This action cannot be undone.
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
        <PortfolioAnalyticsDialog open={showAnalytics} onOpenChange={setShowAnalytics} portfolio={selectedPortfolio} />
      )}
    </div>
  )
}
