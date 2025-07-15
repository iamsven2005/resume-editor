"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Eye,
  Users,
  Clock,
  Globe,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Calendar,
  TrendingUp,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { PortfolioAnalytics } from "@/types/portfolio"

interface PortfolioAnalyticsDialogProps {
  portfolioId: string
  portfolioTitle: string
  children?: React.ReactNode
}

export function PortfolioAnalyticsDialog({ portfolioId, portfolioTitle, children }: PortfolioAnalyticsDialogProps) {
  const [open, setOpen] = useState(false)
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/analytics`)
      const data = await response.json()

      if (data.success) {
        setAnalytics(data.analytics)
      } else {
        throw new Error(data.error || "Failed to fetch analytics")
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
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
  }, [open, portfolioId])

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics - {portfolioTitle}
          </DialogTitle>
          <DialogDescription>Detailed analytics and insights for your portfolio performance.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground">Loading analytics...</p>
              </div>
            </div>
          ) : !analytics ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No analytics data available</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">{analytics.summary.total_views || 0}</p>
                        <p className="text-xs text-muted-foreground">Total Views</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">{analytics.summary.unique_visitors || 0}</p>
                        <p className="text-xs text-muted-foreground">Unique Visitors</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="text-2xl font-bold">
                          {formatDuration(analytics.summary.avg_session_duration || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Avg. Session</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-2xl font-bold">{analytics.summary.views_last_7_days || 0}</p>
                        <p className="text-xs text-muted-foreground">Last 7 Days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="geography">Geography</TabsTrigger>
                  <TabsTrigger value="devices">Devices</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Time Period Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Last 7 days</span>
                          <Badge variant="outline">{analytics.summary.views_last_7_days || 0} views</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Last 30 days</span>
                          <Badge variant="outline">{analytics.summary.views_last_30_days || 0} views</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Last 90 days</span>
                          <Badge variant="outline">{analytics.summary.views_last_90_days || 0} views</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Engagement Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg. Pages Viewed</span>
                          <Badge variant="outline">{(analytics.summary.avg_pages_viewed || 0).toFixed(1)}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg. Session Duration</span>
                          <Badge variant="outline">{formatDuration(analytics.summary.avg_session_duration || 0)}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Return Visitor Rate</span>
                          <Badge variant="outline">
                            {analytics.summary.total_views && analytics.summary.unique_visitors
                              ? (
                                  ((analytics.summary.total_views - analytics.summary.unique_visitors) /
                                    analytics.summary.total_views) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="geography" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Top Countries
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analytics.topCountries.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No geographic data available</p>
                          ) : (
                            analytics.topCountries.slice(0, 5).map((country, index) => (
                              <div key={country.country} className="flex justify-between items-center">
                                <span className="text-sm">{country.country}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {country.views} views
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {country.unique_visitors} visitors
                                  </Badge>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Top Cities
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analytics.topCities.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No city data available</p>
                          ) : (
                            analytics.topCities.slice(0, 5).map((city, index) => (
                              <div key={`${city.city}-${city.country}`} className="flex justify-between items-center">
                                <span className="text-sm">
                                  {city.city}, {city.country}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {city.views} views
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {city.unique_visitors} visitors
                                  </Badge>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="devices" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Device Types</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analytics.deviceBreakdown.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No device data available</p>
                          ) : (
                            analytics.deviceBreakdown.map((device) => (
                              <div key={device.device_type} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  {getDeviceIcon(device.device_type)}
                                  <span className="text-sm capitalize">{device.device_type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {device.views} views
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {device.unique_visitors} visitors
                                  </Badge>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Top Browsers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analytics.browserBreakdown.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No browser data available</p>
                          ) : (
                            analytics.browserBreakdown.slice(0, 5).map((browser) => (
                              <div key={browser.browser} className="flex justify-between items-center">
                                <span className="text-sm">{browser.browser}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {browser.views} views
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {browser.unique_visitors} visitors
                                  </Badge>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Daily Views (Last 30 Days)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {analytics.dailyViews.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No daily activity data available</p>
                        ) : (
                          analytics.dailyViews.map((day) => (
                            <div key={day.date} className="flex justify-between items-center">
                              <span className="text-sm">{formatDate(day.date)}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {day.views} views
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {day.unique_visitors} visitors
                                </Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {analytics.recentViews.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No recent activity</p>
                        ) : (
                          analytics.recentViews.slice(0, 10).map((view, index) => (
                            <div key={index} className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                {getDeviceIcon(view.device_type)}
                                <span>
                                  {view.city && view.country ? `${view.city}, ${view.country}` : "Unknown location"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {view.browser}
                                </Badge>
                                <span className="text-muted-foreground">
                                  {new Date(view.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
