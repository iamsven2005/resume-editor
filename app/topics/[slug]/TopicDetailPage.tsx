"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getTopicBySlug, getPostsByTopicSlug } from "@/lib/api"
import type { Topic, Post } from "@/lib/api"
import { PostCard } from "../PostCard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Users, Calendar, TrendingUp, ArrowLeft } from "lucide-react"

interface TopicDetailPageProps {
  slug: string
}

const TopicDetailPage = ({ slug }: TopicDetailPageProps) => {
  const [topic, setTopic] = useState<Topic | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicData, postsData] = await Promise.all([getTopicBySlug(slug), getPostsByTopicSlug(slug)])
        setTopic(topicData)
        setPosts(postsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading topic...</p>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Topic not found</h1>
          <p className="text-muted-foreground mb-4">The topic you're looking for doesn't exist.</p>
          <Link href="/topics">
            <Button>Back to Topics</Button>
          </Link>
        </div>
      </div>
    )
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.content && post.content.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/topics">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Topics
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">r/{topic.name}</h1>
                <Badge variant="secondary">{topic.memberCount.toLocaleString()} members</Badge>
              </div>
              <p className="text-muted-foreground">{topic.description}</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Post
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search posts..."
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
                    <p className="text-sm text-muted-foreground">Members</p>
                    <p className="text-xl font-bold text-foreground">{topic.memberCount.toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Posts</p>
                    <p className="text-xl font-bold text-foreground">{posts.length}</p>
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
                    <p className="text-xl font-bold text-foreground">24</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {searchQuery ? `Search results for "${searchQuery}"` : "Recent Posts"}
                <span className="text-sm font-normal text-muted-foreground ml-2">({filteredPosts.length} posts)</span>
              </h2>

              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} topic={topic} />
                ))}
              </div>

              {filteredPosts.length === 0 && (
                <Card className="p-8 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No posts found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search terms or create a new post."
                      : "Be the first to create a post in this community!"}
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">About Community</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{topic.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-foreground">{new Date(topic.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Members</span>
                  <span className="text-foreground">{topic.memberCount.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Community Rules</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>1. Be respectful and civil</p>
                <p>2. Stay on topic</p>
                <p>3. No spam or self-promotion</p>
                <p>4. Use appropriate post flair</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopicDetailPage
