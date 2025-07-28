"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { ResumeList } from "./ResumeList"
import { PortfolioList } from "./PortfolioList"
import { RankingResults } from "./RankingResults"
import { ResumeRanker } from "./ResumeRanker"
import { FileUploadManager } from "./file-upload-manager"
import { useAuth } from "@/contexts/auth-context"
import type { ResumeData } from "@/types/resume"
import { FileText, Globe, TrendingUp, Download, Search, Plus, Video, GraduationCap, Star } from "lucide-react"

interface ResumeGalleryProps {
  onLoadResume: (data: ResumeData) => void
  onCreateNew: () => void
  currentResumeData: ResumeData | null
  onSaveResume: (title: string) => Promise<void>
}

export function ResumeGallery({ onLoadResume, onCreateNew, currentResumeData, onSaveResume }: ResumeGalleryProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("resumes")
  const [searchQuery, setSearchQuery] = useState("")
  const [resumes, setResumes] = useState([])
  const [portfolios, setPortfolios] = useState([])
  const [rankingResults, setRankingResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resumeCount, setResumeCount] = useState(0)
  const [portfolioCount, setPortfolioCount] = useState(0)
  const [favoriteCount, setFavoriteCount] = useState(0)

  // Load data when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadResumes()
      loadPortfolios()
    }
  }, [user])

  const loadResumes = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/resumes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setResumes(data.resumes || [])
        setResumeCount(data.resumes?.length || 0)
        setFavoriteCount(data.resumes?.filter((r: any) => r.is_favorite)?.length || 0)
      }
    } catch (error) {
      console.error("Error loading resumes:", error)
      toast({
        title: "Error",
        description: "Failed to load resumes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadPortfolios = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/portfolios", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPortfolios(data.portfolios || [])
        setPortfolioCount(data.portfolios?.length || 0)
      }
    } catch (error) {
      console.error("Error loading portfolios:", error)
    }
  }

  const handleVideoCall = () => {
    try {
      const videoCallUrl = "https://cal.com/sparkjob/15min"
      window.open(videoCallUrl, "_blank", "noopener,noreferrer")
    } catch (error) {
      console.error("Error opening video call:", error)
      toast({
        title: "Error",
        description: "Unable to open video call. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleBeginTutorial = () => {
    // Switch to resumes tab first
    setActiveTab("resumes")

    // Trigger the tutorial/onboarding
    if (window.startTutorial) {
      window.startTutorial()
    } else {
      toast({
        title: "Tutorial",
        description: "Tutorial feature will be available soon!",
      })
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Handle special actions
    if (value === "video-call") {
      handleVideoCall()
      return
    }

    if (value === "tutorial") {
      handleBeginTutorial()
      return
    }
  }

  const getTabIcon = (tabValue: string) => {
    switch (tabValue) {
      case "resumes":
        return <FileText className="h-4 w-4" />
      case "portfolios":
        return <Globe className="h-4 w-4" />
      case "ranking":
        return <TrendingUp className="h-4 w-4" />
      case "downloads":
        return <Download className="h-4 w-4" />
      case "video-call":
        return <Video className="h-4 w-4" />
      case "tutorial":
        return <GraduationCap className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTabLabel = (tabValue: string) => {
    switch (tabValue) {
      case "resumes":
        return (
          <div className="flex items-center gap-2">
            <span>Resumes</span>
            {resumeCount > 0 && <Badge variant="secondary">{resumeCount}</Badge>}
            {favoriteCount > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-current text-yellow-500" />
                <span className="text-xs">{favoriteCount}</span>
              </div>
            )}
          </div>
        )
      case "portfolios":
        return (
          <div className="flex items-center gap-2">
            <span>Portfolios</span>
            {portfolioCount > 0 && <Badge variant="secondary">{portfolioCount}</Badge>}
          </div>
        )
      case "ranking":
        return "Resume Ranking"
      case "downloads":
        return "Downloads"
      case "video-call":
        return "Video Call"
      case "tutorial":
        return "Begin Tutorial"
      default:
        return tabValue
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resume Gallery</CardTitle>
          <CardDescription>Please log in to access your resumes and portfolios.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Sign in to create, manage, and share your professional documents.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-[200px]">
              <div className="flex items-center gap-2">
                {getTabIcon(activeTab)}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resumes">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Resumes</span>
                  {resumeCount > 0 && <Badge variant="secondary">{resumeCount}</Badge>}
                  {favoriteCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      <span className="text-xs">{favoriteCount}</span>
                    </div>
                  )}
                </div>
              </SelectItem>
              <SelectItem value="portfolios">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Portfolios</span>
                  {portfolioCount > 0 && <Badge variant="secondary">{portfolioCount}</Badge>}
                </div>
              </SelectItem>
              <SelectItem value="ranking">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Resume Ranking</span>
                </div>
              </SelectItem>
              <SelectItem value="downloads">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>Downloads</span>
                </div>
              </SelectItem>
              <SelectItem value="video-call">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>Video Call</span>
                </div>
              </SelectItem>
              <SelectItem value="tutorial">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>Begin Tutorial</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Resume
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="resumes" className="space-y-4">
          <ResumeList
            resumes={resumes}
            searchQuery={searchQuery}
            onLoadResume={onLoadResume}
            onResumeUpdated={loadResumes}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="portfolios" className="space-y-4">
          <PortfolioList
            portfolios={portfolios}
            searchQuery={searchQuery}
            onPortfolioUpdated={loadPortfolios}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="ranking" className="space-y-4">
          <div className="grid gap-4">
            <ResumeRanker resumes={resumes} onRankingComplete={setRankingResults} />
            {rankingResults && <RankingResults results={rankingResults} />}
          </div>
        </TabsContent>

        <TabsContent value="downloads" className="space-y-4">
          <FileUploadManager
            onResumeUploaded={onLoadResume}
            currentResumeData={currentResumeData}
            onSaveResume={onSaveResume}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
