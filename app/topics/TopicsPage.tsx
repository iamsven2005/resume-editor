"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getTopics } from "@/lib/api"
import type { Topic } from "@/lib/api"
import { TopicCard } from "./TopicCard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, TrendingUp, Users, Calendar } from "lucide-react"

const TopicsPage = () => {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getTopics()
        setTopics(data)
      } catch (error) {
        console.error("Error fetching topics:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTopics()
  }, [])

  const filteredTopics = topics.filter(
    (topic) =>
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalMembers = topics.reduce((sum, topic) => sum + topic.memberCount, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading topics...</p>
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
              <Link href="/">
                <Button>Bulid Resume</Button>
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
                    <p className="text-sm text-muted-foreground">Total Members</p>
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
                    <p className="text-sm text-muted-foreground">Active Today</p>
                    <p className="text-xl font-bold text-foreground">12.4k</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Topics grid */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {searchQuery ? `Search results for "${searchQuery}"` : "All Communities"}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({filteredTopics.length} communities)
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTopics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>

              {filteredTopics.length === 0 && (
                <Card className="p-8 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No communities found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or explore our popular communities.
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
                      <span className="text-xs text-muted-foreground">{(topic.memberCount / 1000).toFixed(0)}k</span>
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
