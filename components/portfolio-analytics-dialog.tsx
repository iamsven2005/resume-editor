"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Eye, Users, Calendar, TrendingUp, Activity, Globe, Clock, Monitor, Smartphone, Tablet } from "lucide-react"

interface AnalyticsData {
  view_date: string
  view_count: number
  unique_visitors_on_date: number
  device_types: string
  user_agent: string
}

interface AnalyticsStats {
  total_views: number
  unique_visitors: number
  views_last_7_days: number
  views_last_30_days: number
  avg_session_duration: number
  avg_pages_viewed: number
}

interface PortfolioAnalyticsDialogProps {
  portfolioId: string
  portfolioTitle: string
  children: React.ReactNode
}

export function PortfolioAnalyticsDialog({ portfolioId, portfolioTitle, children }: PortfolioAnalyticsDialogProps) {
  const [open, setOpen] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [stats, setStats] = useState<AnalyticsStats>({
    total_views: 0,
    unique_visitors: 0,
    views_last_7_days: 0,
    views_last_30_days: 0,
    avg_session_duration: 0,
    avg_pages_viewed: 0,
  })
  const [loading, setLoading] = useState(false)

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/analytics`)

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAnalytics(data.analytics || [])
          setStats(data.stats || stats)
        } else {
          // Handle empty analytics gracefully
          setAnalytics([])
          setStats({
            total_views: 0,
            unique_visitors: 0,
            views_last_7_days: 0,
            views_last_30_days: 0,
            avg_session_duration: 0,
            avg_pages_viewed: 0,
          })
        }
      } else {
        // Handle 500 errors gracefully
        console.warn("Analytics fetch failed, showing empty state")
        setAnalytics([])
        setStats({
          total_views: 0,
          unique_visitors: 0,
          views_last_7_days: 0,
          views_last_30_days: 0,
          avg_session_duration: 0,
          avg_pages_viewed: 0,
        })
        toast({
          title: "Analytics Unavailable",
          description: "Analytics data is currently unavailable. Please try again later.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      // Set empty state on error
      setAnalytics([])
      setStats({
        total_views: 0,
        unique_visitors: 0,
        views_last_7_days: 0,
        views_last_30_days: 0,
        avg_session_duration: 0,
        avg_pages_viewed: 0,
      })
      toast({
        title: "Connection Error",
        description: "Unable to load analytics data. Please check your connection.",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getDeviceIcon = (deviceTypes: string) => {
    if (deviceTypes.toLowerCase().includes("mobile")) return <Smartphone className="h-4 w-4" />
    if (deviceTypes.toLowerCase().includes("tablet")) return <Tablet className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  const getDeviceType = (deviceTypes: string) => {
    if (deviceTypes.toLowerCase().includes("mobile")) return "Mobile"
    if (deviceTypes.toLowerCase().includes("tablet")) return "Tablet"
    return "Desktop"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Portfolio Analytics
          </DialogTitle>
          <DialogDescription>View detailed analytics for "{portfolioTitle}"</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading analytics...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.total_views}</p>
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
                      <p className="text-2xl font-bold">{stats.unique_visitors}</p>
                      <p className="text-xs text-muted-foreground">Unique Visitors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.views_last_7_days}</p>
                      <p className="text-xs text-muted-foreground">Last 7 Days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.views_last_30_days}</p>
                      <p className="text-xs text-muted-foreground">Last 30 Days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </h3>

              {analytics.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No analytics data available yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">Share your portfolio to start tracking views!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {analytics.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="font-medium">{formatDate(item.view_date)}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.view_count} view{item.view_count !== 1 ? "s" : ""} •{" "}
                                {item.unique_visitors_on_date} unique visitor
                                {item.unique_visitors_on_date !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            {getDeviceIcon(item.device_types)}
                            <Badge variant="secondary" className="text-xs">
                              {getDeviceType(item.device_types)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Insights */}
            {stats.total_views > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">Insights</h3>
                  <div className="space-y-3">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Performance</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Your portfolio has received {stats.total_views} total views from {stats.unique_visitors}{" "}
                          unique visitors.
                          {stats.views_last_7_days > 0 && (
                            <> You've had {stats.views_last_7_days} views in the last week.</>
                          )}
                        </p>
                      </CardContent>
                    </Card>

                    {stats.views_last_30_days > stats.views_last_7_days && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Growth</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Your portfolio is gaining traction with {stats.views_last_30_days - stats.views_last_7_days}{" "}
                            additional views in the past month.
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {stats.avg_session_duration > 0 && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-purple-500" />
                            <span className="font-medium">Engagement</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Visitors spend an average of {Math.round(stats.avg_session_duration)} seconds on your
                            portfolio and view {stats.avg_pages_viewed.toFixed(1)} pages per session.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
