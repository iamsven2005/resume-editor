"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Search, FileText, Trash2, Download, Eye, BarChart3, Globe, Users, Calendar, Folder } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { PortfolioCreatorDialog } from "./portfolio-creator-dialog"
import { PortfolioAnalyticsDialog } from "./portfolio-analytics-dialog"
import type { Portfolio } from "@/types/portfolio"

interface Resume {
  id: number
  title: string
  created_at: string
  updated_at: string
}

export function ResumeGallery() {
  const { user } = useAuth()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("resumes")

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/resumes")
      const data = await response.json()

      if (data.success) {
        setResumes(data.resumes)
      }
    } catch (error) {
      console.error("Error fetching resumes:", error)
    }
  }

  const fetchPortfolios = async () => {
    try {
      const response = await fetch("/api/portfolios")
      const data = await response.json()

      if (data.success) {
        setPortfolios(data.portfolios)
      }
    } catch (error) {
      console.error("Error fetching portfolios:", error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([fetchResumes(), fetchPortfolios()])
      setLoading(false)
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const handleDeleteResume = async (id: number) => {
    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setResumes(resumes.filter((resume) => resume.id !== id))
        toast.success("Resume deleted successfully")
      } else {
        toast.error(data.error || "Failed to delete resume")
      }
    } catch (error) {
      console.error("Error deleting resume:", error)
      toast.error("Failed to delete resume")
    }
  }

  const handleDeletePortfolio = async (id: number) => {
    try {
      const response = await fetch(`/api/portfolios/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setPortfolios(portfolios.filter((portfolio) => portfolio.id !== id))
        toast.success("Portfolio deleted successfully")
      } else {
        toast.error(data.error || "Failed to delete portfolio")
      }
    } catch (error) {
      console.error("Error deleting portfolio:", error)
      toast.error("Failed to delete portfolio")
    }
  }

  const handleDownloadResume = async (id: number, title: string) => {
    try {
      const response = await fetch(`/api/resumes/${id}`)
      const data = await response.json()

      if (data.success) {
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
        toast.success("Resume downloaded successfully")
      }
    } catch (error) {
      console.error("Error downloading resume:", error)
      toast.error("Failed to download resume")
    }
  }

  const filteredResumes = resumes.filter((resume) => resume.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const filteredPortfolios = portfolios.filter((portfolio) =>
    portfolio.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view your resumes and portfolios.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Work</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            {activeTab === "portfolios" && (
              <PortfolioCreatorDialog
                resumes={resumes}
                onPortfolioCreated={() => {
                  fetchPortfolios()
                  toast.success("Portfolio created successfully!")
                }}
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resumes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resumes ({resumes.length})
            </TabsTrigger>
            <TabsTrigger value="portfolios" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Portfolios ({portfolios.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumes" className="mt-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading resumes...</p>
              </div>
            ) : filteredResumes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No resumes found matching your search."
                    : "No resumes found. Create your first resume!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResumes.map((resume) => (
                  <Card key={resume.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{resume.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Created {new Date(resume.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Updated {new Date(resume.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadResume(resume.id, resume.title)}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1 text-destructive hover:text-destructive bg-transparent"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
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
            )}
          </TabsContent>

          <TabsContent value="portfolios" className="mt-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading portfolios...</p>
              </div>
            ) : filteredPortfolios.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "No portfolios found matching your search."
                    : "No portfolios found. Create your first portfolio!"}
                </p>
                {!searchTerm && resumes.length > 0 && (
                  <PortfolioCreatorDialog
                    resumes={resumes}
                    onPortfolioCreated={() => {
                      fetchPortfolios()
                      toast.success("Portfolio created successfully!")
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPortfolios.map((portfolio) => (
                  <Card key={portfolio.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{portfolio.title}</CardTitle>
                          {portfolio.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{portfolio.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={portfolio.is_published ? "default" : "secondary"}>
                              {portfolio.is_published ? "Published" : "Draft"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {portfolio.theme}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{portfolio.total_views || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{portfolio.unique_visitors || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{portfolio.views_last_7_days || 0}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <PortfolioAnalyticsDialog
                            portfolio={portfolio}
                            trigger={
                              <Button size="sm" variant="outline" className="flex items-center gap-1 bg-transparent">
                                <BarChart3 className="h-3 w-3" />
                                Analytics
                              </Button>
                            }
                          />
                          {portfolio.is_published && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/portfolio/${portfolio.portfolio_url}`, "_blank")}
                              className="flex items-center gap-1"
                            >
                              <Globe className="h-3 w-3" />
                              View
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1 text-destructive hover:text-destructive bg-transparent"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
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
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
