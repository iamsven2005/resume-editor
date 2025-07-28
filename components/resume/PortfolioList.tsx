"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Globe, Search } from "lucide-react"
import { PortfolioCard } from "./PortfolioCard"
import { PortfolioCreatorDialog } from "./PortfolioCreatorDialog"
import { toast } from "@/hooks/use-toast"

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
  loading: boolean
  searchQuery: string
  token: string
  onPortfolioDeleted: (portfolioId: string) => void
  onPortfolioUpdated: () => void
}

export function PortfolioList({
  portfolios,
  loading,
  searchQuery,
  token,
  onPortfolioDeleted,
  onPortfolioUpdated,
}: PortfolioListProps) {
  const [saving, setSaving] = useState<string | null>(null)

  const handleSavePortfolio = async (portfolioId: string, updatedData: any) => {
    setSaving(portfolioId)
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        onPortfolioUpdated()
        toast({
          description: "Portfolio saved successfully",
        })
      } else {
        throw new Error("Failed to save portfolio")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save portfolio",
        variant: "destructive",
      })
    } finally {
      setSaving(null)
    }
  }

  const filteredPortfolios = portfolios.filter((portfolio) => {
    const title = portfolio.title?.toLowerCase() || ""
    const query = searchQuery.toLowerCase()
    return title.includes(query)
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2 mt-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Portfolios ({filteredPortfolios.length})</h2>
        </div>
        <PortfolioCreatorDialog onPortfolioCreated={onPortfolioUpdated}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Portfolio
          </Button>
        </PortfolioCreatorDialog>
      </div>

      {filteredPortfolios.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">No portfolios found</h3>
                  <p className="text-muted-foreground">No portfolios match your search for "{searchQuery}"</p>
                </div>
              </>
            ) : (
              <>
                <Globe className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">No portfolios yet</h3>
                  <p className="text-muted-foreground">Create your first portfolio to showcase your resume online</p>
                </div>
                <PortfolioCreatorDialog onPortfolioCreated={onPortfolioUpdated}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Portfolio
                  </Button>
                </PortfolioCreatorDialog>
              </>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPortfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              token={token}
              onPortfolioDeleted={onPortfolioDeleted}
              onPortfolioUpdated={onPortfolioUpdated}
              onSavePortfolio={handleSavePortfolio}
              saving={saving === portfolio.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
