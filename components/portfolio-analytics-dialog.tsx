"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { BarChart3, Eye, Users, Clock, Globe, Monitor, Smartphone, Tablet, TrendingUp, Calendar } from "lucide-react"

interface PortfolioAnalyticsDialogProps {
  portfolioId: string
  portfolioTitle: string
  children: React.ReactNode
}

interface AnalyticsData {
  daily: Array<{
    date: string
    views: number
    unique_visitors: number
    avg_session_duration: number
    mobile_views: number
    desktop_views: number
    tablet_views: number
  }>
  topCountries: Array<{
    country: string
    views: number
    unique_visitors: number
  }>
  topBrowsers: Array<{
    browser: string
    views: number
  }>
  topReferrers: Array<{
    referrer: string
    views: number
  }>
}

export function PortfolioAnalyticsDialog({ portfolioId, portfolioTitle, children }: PortfolioAnalyticsDialogProps) {
  const [open, setOpen] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState("30")

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/analytics?days=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      } else {
        toast({
          title: "Error",
          description: "Failed to load analytics",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      })
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Portfolio Analytics
          </DialogTitle>
          <DialogDescription>Analytics for "{portfolioTitle}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Time Range:</label>
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
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading analytics...</p>
              </div>
            </div>
          ) : analytics ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="traffic">Traffic</TabsTrigger>
                <TabsTrigger value="devices">Devices</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      <div className="text-2xl font-bold">{formatDuration(avgSessionDuration)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Views/Visitor</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {totalUniqueVisitors > 0 ? (totalViews / totalUniqueVisitors).toFixed(1) : "0"}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Daily Views Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Daily Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.daily.slice(0, 10).map((day) => (
                        <div key={day.date} className="flex items-center justify-between">
                          <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">{day.views} views</Badge>
                            <Badge variant="secondary">{day.unique_visitors} unique</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="traffic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Top Countries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.topCountries.map((country, index) => (
                        <div key={country.country} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <span className="text-sm">{country.country}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{country.views} views</Badge>
                            <Badge variant="secondary">{country.unique_visitors} unique</Badge>
                          </div>
                        </div>
                      ))}
                      {analytics.topCountries.length === 0 && (
                        <p className="text-sm text-muted-foreground">No country data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="devices" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Desktop</CardTitle>
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{deviceStats.desktop}</div>
                      <p className="text-xs text-muted-foreground">
                        {totalViews > 0 ? ((deviceStats.desktop / totalViews) * 100).toFixed(1) : 0}% of total
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Mobile</CardTitle>
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{deviceStats.mobile}</div>
                      <p className="text-xs text-muted-foreground">
                        {totalViews > 0 ? ((deviceStats.mobile / totalViews) * 100).toFixed(1) : 0}% of total
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tablet</CardTitle>
                      <Tablet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{deviceStats.tablet}</div>
                      <p className="text-xs text-muted-foreground">
                        {totalViews > 0 ? ((deviceStats.tablet / totalViews) * 100).toFixed(1) : 0}% of total
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Browsers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.topBrowsers.map((browser, index) => (
                        <div key={browser.browser} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <span className="text-sm">{browser.browser}</span>
                          </div>
                          <Badge variant="outline">{browser.views} views</Badge>
                        </div>
                      ))}
                      {analytics.topBrowsers.length === 0 && (
                        <p className="text-sm text-muted-foreground">No browser data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sources" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Referrers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.topReferrers.map((referrer, index) => (
                        <div key={referrer.referrer} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <span className="text-sm truncate max-w-xs">{referrer.referrer}</span>
                          </div>
                          <Badge variant="outline">{referrer.views} views</Badge>
                        </div>
                      ))}
                      {analytics.topReferrers.length === 0 && (
                        <p className="text-sm text-muted-foreground">No referrer data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No analytics data available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
