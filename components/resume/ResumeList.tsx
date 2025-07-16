import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Star } from "lucide-react"
import { ResumeCard } from "./ResumeCard"

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

interface ResumeListProps {
  resumes: Resume[]
  loading: boolean
  searchQuery: string
  token: string
  onLoadResume?: (resumeData: any) => void
  onCreateNew?: () => void
  onResumeUpdated: (updatedResume: Resume) => void
  onResumeDeleted: (resumeId: number) => void
  onPortfolioCreated: (portfolio: Portfolio) => void
  setSearchQuery: (query: string) => void
}

// Helper function to safely get string value
const safeString = (value: any): string => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  return String(value)
}

export function ResumeList({
  resumes,
  loading,
  searchQuery,
  token,
  onLoadResume,
  onCreateNew,
  onResumeUpdated,
  onResumeDeleted,
  onPortfolioCreated,
  setSearchQuery,
}: ResumeListProps) {
  // Safe filtering with comprehensive null checks
  const filteredResumes = resumes.filter((resume) => {
    if (!resume || typeof resume !== "object") return false
    const title = safeString(resume.title)
    const query = safeString(searchQuery).toLowerCase()
    return title.toLowerCase().includes(query)
  })

  // Filter and sort resumes with favorites first
  const filteredAndSortedResumes = filteredResumes.sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1
    if (!a.is_favorite && b.is_favorite) return 1
    try {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    } catch {
      return 0
    }
  })

  const favoriteCount = resumes.filter((resume) => resume && resume.is_favorite).length

  // Results Summary
  const renderResultsSummary = () => (
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
  )

  if (loading) {
    return (
      <div className="space-y-4">
        {renderResultsSummary()}
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading resumes...</p>
        </div>
      </div>
    )
  }

  if (filteredAndSortedResumes.length === 0) {
    return (
      <div className="space-y-4">
        {renderResultsSummary()}
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
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {renderResultsSummary()}
      <ScrollArea className="h-[600px] w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
          {filteredAndSortedResumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              token={token}
              onLoadResume={onLoadResume}
              onResumeUpdated={onResumeUpdated}
              onResumeDeleted={onResumeDeleted}
              onPortfolioCreated={onPortfolioCreated}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
