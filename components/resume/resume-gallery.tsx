"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Globe,
  TrendingUp,
  Download,
  Star,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { QuickActions } from "./QuickActions"
import { SearchBar } from "./SearchBar"
import { ResumeList } from "./ResumeList"
import { PortfolioList } from "./PortfolioList"
import { ResumeRanker } from "./ResumeRanker"
import { FileUploadManager } from "./file-upload-manager"

interface Resume {
  id: number
  title: string
  resume_data: any
  created_at: string
  updated_at: string
  is_favorite?: boolean
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
  onLoadResume?: (resumeData: any) => void
  onCreateNew?: () => void
  currentResumeData?: any
  onSaveResume?: (title: string) => Promise<void>
}

// Helper function to safely get string value
const safeString = (value: any): string => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  return String(value)
}

// Helper function to safely trim string
const safeTrim = (value: any): string => {
  const str = safeString(value)
  return str.trim()
}

export function ResumeGallery({ onLoadResume, onCreateNew, currentResumeData, onSaveResume }: ResumeGalleryProps = {}) {
  const { user, token } = useAuth()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Quick Actions state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

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
      if (currentResumeData && safeTrim(currentResumeData.title)) {
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
        console.log("Fetched resumes:", data.resumes)
        setResumes(Array.isArray(data.resumes) ? data.resumes : [])
      } else {
        console.error("Failed to fetch resumes:", response.status)
        setResumes([])
      }
    } catch (error) {
      console.error("Error fetching resumes:", error)
      setResumes([])
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
        console.log("Fetched portfolios:", data.portfolios)
        setPortfolios(Array.isArray(data.portfolios) ? data.portfolios : [])
      } else {
        console.error("Failed to fetch portfolios:", response.status)
        setPortfolios([])
      }
    } catch (error) {
      console.error("Error fetching portfolios:", error)
      setPortfolios([])
    }
  }

  const handleAutoSave = async () => {
    if (!currentResumeData?.title || !onSaveResume) return

    try {
      await onSaveResume(safeTrim(currentResumeData.title))
      setLastSaved(new Date())
      toast({
        description: "Auto-saved successfully",
        duration: 2000,
      })
    } catch (error) {
      console.error("Auto-save failed:", error)
    }
  }

  const handleResumeUpdated = (updatedResume: Resume) => {
    setResumes(resumes.map((r) => (r.id === updatedResume.id ? updatedResume : r)))
  }

  const handleResumeDeleted = (resumeId: number) => {
    setResumes(resumes.filter((r) => r.id !== resumeId))
  }

  const handlePortfolioCreated = (newPortfolio: Portfolio) => {
    setPortfolios([...portfolios, newPortfolio])
  }

  const handlePortfolioDeleted = (portfolioId: string) => {
    setPortfolios(portfolios.filter((p) => p.id !== portfolioId))
  }

  // Safe filtering with comprehensive null checks
  const filteredResumes = resumes.filter((resume) => {
    if (!resume || typeof resume !== "object") return false
    const title = safeString(resume.title)
    const query = safeString(searchQuery).toLowerCase()
    return title.toLowerCase().includes(query)
  })

  const filteredPortfolios = portfolios.filter((portfolio) => {
    if (!portfolio || typeof portfolio !== "object") return false
    const title = safeString(portfolio.title)
    const query = safeString(searchQuery).toLowerCase()
    return title.toLowerCase().includes(query)
  })

  const favoriteCount = resumes.filter((resume) => resume && resume.is_favorite).length

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
      <QuickActions
        onCreateNew={onCreateNew}
        onSaveResume={onSaveResume}
        currentResumeData={currentResumeData}
        autoSaveEnabled={autoSaveEnabled}
        setAutoSaveEnabled={setAutoSaveEnabled}
        lastSaved={lastSaved}
      />

      {/* Search Bar */}
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Tabs */}
      <Tabs defaultValue="resumes" className="w-full">
        <TabsList className="flex w-full flex-wrap">
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
          <ResumeList
            resumes={resumes}
            loading={loading}
            searchQuery={searchQuery}
            token={token}
            onLoadResume={onLoadResume}
            onCreateNew={onCreateNew}
            onResumeUpdated={handleResumeUpdated}
            onResumeDeleted={handleResumeDeleted}
            onPortfolioCreated={handlePortfolioCreated}
            setSearchQuery={setSearchQuery}
          />
        </TabsContent>

        {/* Portfolios Tab */}
        <TabsContent value="portfolios" className="space-y-4">
          <PortfolioList
            portfolios={portfolios}
            searchQuery={searchQuery}
            token={token}
            onPortfolioDeleted={handlePortfolioDeleted}
            onPortfolioUpdated={fetchPortfolios}
          />
        </TabsContent>

        {/* Ranker Tab */}
        <TabsContent value="ranker" className="space-y-6">
          <ResumeRanker resumes={resumes} token={token} />
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files">
          <FileUploadManager searchQuery={searchQuery}/>
        </TabsContent>
      </Tabs>
    </div>
  )
}
