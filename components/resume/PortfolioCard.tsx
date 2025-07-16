import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PortfolioAnalyticsDialog } from "./PortfolioAnalyticsDialog"
import { PortfolioEditorDialog } from "./portfolio-editor-dialog"

import {
  Calendar,
  Edit,
  Eye,
  Share,
  BarChart3,
  Trash2,
} from "lucide-react"
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

interface PortfolioCardProps {
  portfolio: Portfolio
  token: string
  onPortfolioDeleted: (portfolioId: string) => void
  onPortfolioUpdated: () => void
}

// Helper function to safely get string value
const safeString = (value: any): string => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  return String(value)
}

export function PortfolioCard({
  portfolio,
  token,
  onPortfolioDeleted,
  onPortfolioUpdated,
}: PortfolioCardProps) {

const [showAnalytics, setShowAnalytics] = useState(false)
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

  const handleDeletePortfolio = async (portfolioId: string) => {
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        onPortfolioDeleted(portfolioId)
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{safeString(portfolio.title)}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="h-3 w-3" />
              <span>Updated {formatDate(portfolio.updated_at)}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={portfolio.is_published ? "default" : "secondary"} className="text-xs">
                {portfolio.is_published ? "Public" : "Private"}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {safeString(portfolio.theme)}
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
              onClick={() => window.open(`/portfolio/${portfolio.portfolio_url}`, "_blank")}
              className="h-8 px-2"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
                                      <PortfolioEditorDialog
                            portfolio={portfolio}
                            onPortfolioUpdated={() => {
                              fetchPortfolios()
                            }}
                          >
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </PortfolioEditorDialog>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyPortfolioLink(portfolio.portfolio_url)}
              className="h-8 px-2"
            >
              <Share className="h-3 w-3 mr-1" />
              Share
            </Button>
          </div>
          <div className="flex items-center gap-1">
                          <PortfolioAnalyticsDialog portfolioId={portfolio.id} portfolioTitle={portfolio.title}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <BarChart3 className="h-3 w-3" />
                            </Button>
                          </PortfolioAnalyticsDialog>
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
                    Are you sure you want to delete "{safeString(portfolio.title)}"? This action cannot be
                    undone.
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
  )
}
