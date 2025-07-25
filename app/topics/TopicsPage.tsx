"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getTopics } from "@/lib/api"
import type { Topic } from "@/lib/api"
import { TopicCard } from "./TopicCard"
import { CreateCommunityDialog } from "@/components/create-community-dialog"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Users, TrendingUp, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

const TopicsPage = () => {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "members" | "alphabetical">("newest")

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    try {
      const topicsData = await getTopics()
      setTopics(topicsData)
    } catch (error) {
      console.error("Error fetching topics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCommunityCreated = () => {
    fetchTopics()
  }

  const filteredAndSortedTopics = topics
    .filter((topic) => {
      const matchesSearch =
        topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "members":
          return b.memberCount - a.memberCount
        case "alphabetical":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading communities...</p>
        </div>
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
            <Button variant="outline" size="sm">
              <Link href="/">
              Home
              </Link>
              </Button>
              <h1 className="text-3xl font-bold text-foreground mb-2">Communities</h1>
              <p className="text-muted-foreground">
                Discover and join communities around topics you're passionate about
              </p>
            </div>
            <CreateCommunityDialog onCommunityCreated={handleCommunityCreated} />
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="members">Most Members</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                    <p className="text-sm text-muted-foreground">Total Communities</p>
                    <p className="text-xl font-bold text-foreground">{topics.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Members</p>
                    <p className="text-xl font-bold text-foreground">
                      {topics.reduce((sum, topic) => sum + topic.memberCount, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Today</p>
                    <p className="text-xl font-bold text-foreground">156</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Communities */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {searchQuery ? `Search results for "${searchQuery}"` : "All Communities"}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({filteredAndSortedTopics.length} communities)
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAndSortedTopics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>

              {filteredAndSortedTopics.length === 0 && (
                <Card className="p-8 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No communities found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try adjusting your search terms or create a new community."
                      : "Be the first to create a community!"}
                  </p>
                  <CreateCommunityDialog onCommunityCreated={handleCommunityCreated} />
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Popular Communities</h3>
              <div className="space-y-3">
                {topics
                  .sort((a, b) => b.memberCount - a.memberCount)
                  .slice(0, 5)
                  .map((topic) => (
                    <Link key={topic.id} href={`/topics/${topic.slug}`}>
                      <div className="flex items-center justify-between p-2 rounded hover:bg-secondary/50 transition-colors">
                        <div>
                          <p className="font-medium text-sm">r/{topic.name}</p>
                          <p className="text-xs text-muted-foreground">{topic.memberCount.toLocaleString()} members</p>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Community Guidelines</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>1. Be respectful to all members</p>
                <p>2. Stay on topic in discussions</p>
                <p>3. No spam or excessive self-promotion</p>
                <p>4. Follow community-specific rules</p>
                <p>5. Report inappropriate content</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopicsPage
