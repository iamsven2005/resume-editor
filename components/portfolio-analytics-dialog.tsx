"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Eye, Users, Clock, Monitor, Smartphone, Tablet, Globe, Loader2 } from "lucide-react"
import type { Portfolio, PortfolioAnalytics } from "@/types/portfolio"

interface PortfolioAnalyticsDialogProps {
  portfolio: Portfolio
  trigger: React.ReactNode
}

export function PortfolioAnalyticsDialog({ portfolio, trigger }: PortfolioAnalyticsDialogProps) {
  const [open, setOpen] = useState(false)
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState("30")

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/portfolios/${portfolio.id}/analytics?days=${timeRange}`)
      const data = await response.json()

      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchAnalytics()
    }
  }, [open, timeRange])

  const totalViews = analytics?.daily.reduce((sum, day) => sum + day.views, 0) || 0
  const totalUniqueVisitors = analytics?.daily.reduce((sum, day) => sum + day.unique_visitors, 0) || 0
  const avgSessionDuration =
    analytics?.daily.reduce((sum, day) => sum + day.avg_session_duration, 0) / (analytics?.daily.length || 1) || 0

  const deviceStats = analytics?.daily.reduce(
    (acc, day) => ({
      mobile: acc.mobile + day.mobile_views,
      desktop: acc.desktop + day.desktop_views,
      tablet: acc.tablet + day.tablet_views,
    }),
    { mobile: 0, desktop: 0, tablet: 0 },
  ) || { mobile: 0, desktop: 0, tablet: 0 }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics for "{portfolio.title}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={portfolio.is_published ? "default" : "secondary"}>
                {portfolio.is_published ? "Published" : "Draft"}
              </Badge>
              {portfolio.is_published && <Badge variant="outline">{portfolio.portfolio_url}</Badge>}
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalUniqueVisitors.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(avgSessionDuration / 60)}m</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Published</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{portfolio.is_published ? "Yes" : "No"}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Device Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Desktop</div>
                        <div className="text-sm text-muted-foreground">{deviceStats.desktop} views</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Mobile</div>
                        <div className="text-sm text-muted-foreground">{deviceStats.mobile} views</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tablet className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Tablet</div>
                        <div className="text-sm text-muted-foreground">{deviceStats.tablet} views</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Countries */}
              {analytics?.topCountries && analytics.topCountries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Countries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.topCountries.slice(0, 5).map((country, index) => (
                        <div key={country.country} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <span>{country.country}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {country.views} views ({country.unique_visitors} unique)
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Top Browsers */}
              {analytics?.topBrowsers && analytics.topBrowsers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Browsers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.topBrowsers.slice(0, 5).map((browser, index) => (
                        <div key={browser.browser} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <span>{browser.browser}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{browser.views} views</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
