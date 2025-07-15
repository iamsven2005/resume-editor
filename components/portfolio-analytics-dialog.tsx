"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Globe, Monitor, Calendar, Users, Eye, Clock, MousePointer } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
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

  useEffect(() => {
    if (open && !analytics) {
      fetchAnalytics()
    }
  }, [open])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/analytics`)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
            <BarChart3 className="h-3 w-3" />
            Analytics
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics - {portfolioTitle}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        ) : analytics ? (
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-2xl font-bold">{analytics.summary.total_views}</div>
                        <div className="text-xs text-muted-foreground">Total Views</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold">{analytics.summary.unique_visitors}</div>
                        <div className="text-xs text-muted-foreground">Unique Visitors</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <div>
                        <div className="text-2xl font-bold">{Math.round(analytics.summary.avg_session_duration)}s</div>
                        <div className="text-xs text-muted-foreground">Avg. Session</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-4 w-4 text-purple-500" />
                      <div>
                        <div className="text-2xl font-bold">{Math.round(analytics.summary.avg_pages_viewed)}</div>
                        <div className="text-xs text-muted-foreground">Pages/Session</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="geography">Geography</TabsTrigger>
                  <TabsTrigger value="technology">Technology</TabsTrigger>
                  <TabsTrigger value="recent">Recent Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {/* Time Period Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-xl font-bold text-green-600">{analytics.summary.views_last_7_days}</div>
                        <div className="text-sm text-muted-foreground">Last 7 Days</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-xl font-bold text-blue-600">{analytics.summary.views_last_30_days}</div>
                        <div className="text-sm text-muted-foreground">Last 30 Days</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-xl font-bold text-purple-600">{analytics.summary.views_last_90_days}</div>
                        <div className="text-sm text-muted-foreground">Last 90 Days</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Daily Views Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Daily Views (Last 30 Days)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.dailyViews}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={formatDate} />
                          <YAxis />
                          <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                          <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} name="Views" />
                          <Line
                            type="monotone"
                            dataKey="unique_visitors"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="Unique Visitors"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="geography" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Top Countries */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Top Countries
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analytics.topCountries.slice(0, 10).map((country, index) => (
                            <div key={country.country} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="w-6 h-6 p-0 text-xs">
                                  {index + 1}
                                </Badge>
                                <span className="text-sm">{country.country}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {country.views} views ({country.unique_visitors} unique)
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Top Cities */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Cities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analytics.topCities.slice(0, 10).map((city, index) => (
                            <div key={`${city.city}-${city.country}`} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="w-6 h-6 p-0 text-xs">
                                  {index + 1}
                                </Badge>
                                <span className="text-sm">
                                  {city.city}, {city.country}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">{city.views} views</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="technology" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Device Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          Device Types
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={analytics.deviceBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="device_type" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="views" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Browser Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Browsers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analytics.browserBreakdown.map((browser, index) => (
                            <div key={browser.browser} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="w-6 h-6 p-0 text-xs">
                                  {index + 1}
                                </Badge>
                                <span className="text-sm">{browser.browser}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">{browser.views} views</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="recent" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Visitors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {analytics.recentViews.map((view, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-sm">
                                  <Badge variant="outline" className="text-xs">
                                    {view.country || "Unknown"}
                                  </Badge>
                                  {view.city && <span className="text-muted-foreground">{view.city}</span>}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {view.device_type} • {view.browser} • {formatDuration(view.session_duration)}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(view.created_at).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No analytics data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
