import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Edit,
  Edit2,
  Download,
  Trash2,
  Star,
  StarOff,
  Plus,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { ResumeNameEditorDialog } from "./ResumeNameEditorDialog"
import { PortfolioCreatorDialog } from "./PortfolioCreatorDialog"
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

interface ResumeCardProps {
  resume: Resume
  token: string
  resumes?: Resume[]
  onLoadResume?: (resumeData: any) => void
  onResumeUpdated: (updatedResume: Resume) => void
  onResumeDeleted: (resumeId: number) => void
  onPortfolioCreated: (portfolio: Portfolio) => void
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

export function ResumeCard({
  resume,
  token,
  resumes = [],
  onLoadResume,
  onResumeUpdated,
  onResumeDeleted,
  onPortfolioCreated,
}: ResumeCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Unknown date"
    }
  }

  const handleTitleUpdated = (newTitle: string) => {
    onResumeUpdated({ ...resume, title: newTitle })
  }

  const handlePortfolioCreated = () => {
    // Refresh portfolios by calling the parent callback
    onPortfolioCreated({} as Portfolio)
  }

  // Convert Resume[] to SavedResume[] for PortfolioCreatorDialog
  const savedResumes = resumes.map(resume => ({
    ...resume,
    id: String(resume.id),
    is_favorite: resume.is_favorite || false
  }))

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
        onResumeUpdated({ ...resume, is_favorite: !currentFavorite })
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
        onResumeDeleted(resumeId)
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

  const downloadResume = async (resumeId: number, title: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data.resume.resume_data, null, 2)], {
          type: "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${safeTrim(title)
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase()}.json`
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

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 mr-2">
            <CardTitle className="text-lg truncate flex-1">
              {safeString(resume.title) || "Untitled Resume"}
            </CardTitle>
            <ResumeNameEditorDialog
              resumeId={String(resume.id)}
              currentTitle={resume.title}
              onTitleUpdated={handleTitleUpdated}
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
                onClick={() => onLoadResume(resume.resume_data)}
                className="h-8 px-2"
              >
                <Edit className="h-3 w-3 mr-1" />
                Load
              </Button>
            )}
            <PortfolioCreatorDialog
              resumes={savedResumes}
              onPortfolioCreated={handlePortfolioCreated}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                Portfolio
              </Button>
            </PortfolioCreatorDialog>
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
                  Are you sure you want to delete "{safeString(resume.title)}"? This action cannot be
                  undone.
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
  )
}
