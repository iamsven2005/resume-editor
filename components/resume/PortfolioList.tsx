import { ScrollArea } from "@/components/ui/scroll-area"
import { Globe } from "lucide-react"
import { PortfolioCard } from "./PortfolioCard"

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

interface PortfolioListProps {
  portfolios: Portfolio[]
  searchQuery: string
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

export function PortfolioList({
  portfolios,
  searchQuery,
  token,
  onPortfolioDeleted,
  onPortfolioUpdated,
}: PortfolioListProps) {
  const filteredPortfolios = portfolios.filter((portfolio) => {
    if (!portfolio || typeof portfolio !== "object") return false
    const title = safeString(portfolio.title)
    const query = safeString(searchQuery).toLowerCase()
    return title.toLowerCase().includes(query)
  })

  if (filteredPortfolios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Globe className="h-16 w-16 text-muted-foreground mb-4" />
        {searchQuery ? (
          <p className="text-muted-foreground">No portfolios found for "{searchQuery}"</p>
        ) : (
          <p className="text-muted-foreground">No portfolios yet. Create one from a resume!</p>
        )}
      </div>
    )
  }

  return (
    <ScrollArea className="h-[600px] w-full">
      <div className="flex flex-wrap gap-4 p-1">
        {filteredPortfolios.map((portfolio) => (
          <PortfolioCard
            key={portfolio.id}
            portfolio={portfolio}
            token={token}
            onPortfolioDeleted={onPortfolioDeleted}
            onPortfolioUpdated={onPortfolioUpdated}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
