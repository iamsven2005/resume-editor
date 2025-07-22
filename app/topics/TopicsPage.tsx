"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TopicCard } from "./TopicCard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, TrendingUp, Users, Calendar, Loader2 } from "lucide-react"
import type { Topic } from "@/types/database"

const TopicsPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTopics = async (search?: string) => {
    try {
      setLoading(true)
      const url = new URL("/api/topics", window.location.origin)
      if (search) {
        url.searchParams.set("search", search)
      }

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error("Failed to fetch topics")
      }

      const data = await response.json()
      setTopics(data.topics)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTopics()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTopics(searchQuery || undefined)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const totalMembers = topics.reduce((sum, topic) => sum + (topic.post_count || 0), 0)
  const totalComments = topics.reduce((sum, topic) => sum + (topic.total_comments || 0), 0)

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Topics</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchTopics()}>Try Again</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/">
                <Button variant="outline" className="mb-4 bg-transparent">
                  Build Resume
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-foreground mb-2">Explore Communities</h1>
              <p className="text-muted-foreground">Discover amazing communities and join the conversation</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Community
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Posts</p>
                    <p className="text-xl font-bold text-foreground">{totalMembers.toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Communities</p>
                    <p className="text-xl font-bold text-foreground">{topics.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Comments</p>
                    <p className="text-xl font-bold text-foreground">{totalComments.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Topics grid */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {searchQuery ? `Search results for "${searchQuery}"` : "All Communities"}
                <span className="text-sm font-normal text-muted-foreground ml-2">({topics.length} communities)</span>
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading communities...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topics.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              )}

              {!loading && topics.length === 0 && (
                <Card className="p-8 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No communities found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search terms or explore our popular communities."
                      : "No communities have been created yet. Be the first to create one!"}
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Popular Topics</h3>
              <div className="space-y-3">
                {topics.slice(0, 3).map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/topics/${topic.slug}`}
                    className="block p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">topics/{topic.name}</span>
                      <span className="text-xs text-muted-foreground">{topic.post_count || 0} posts</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Welcome to our Reddit-like platform! Discover communities, share your thoughts, and engage in meaningful
                discussions with people who share your interests.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopicsPage
