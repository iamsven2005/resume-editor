"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PostCard } from "../PostCard"
import { ArrowLeft, Plus, Users, MessageSquare, Calendar, TrendingUp, Clock, MessageCircle } from "lucide-react"
import type { Topic, Post } from "@/types/database"

interface TopicDetailPageProps {
  slug: string
}

export default function TopicDetailPage({ slug }: TopicDetailPageProps) {
  const [topic, setTopic] = useState<Topic | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"created_at" | "vote_score" | "comment_count">("created_at")

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const response = await fetch(`/api/topics/${slug}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError("Topic not found")
          } else {
            throw new Error("Failed to fetch topic")
          }
          return
        }

        const data = await response.json()
        setTopic(data.topic)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchTopic()
  }, [slug])

  useEffect(() => {
    const fetchPosts = async () => {
      if (!topic) return

      try {
        setPostsLoading(true)
        const response = await fetch(`/api/topics/${slug}/posts?sort=${sortBy}&order=desc`)
        if (!response.ok) {
          throw new Error("Failed to fetch posts")
        }

        const data = await response.json()
        setPosts(data.posts)
      } catch (err) {
        console.error("Error fetching posts:", err)
      } finally {
        setPostsLoading(false)
      }
    }

    fetchPosts()
  }, [slug, topic, sortBy])

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

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {error === "Topic not found" ? "Topic Not Found" : "Error Loading Topic"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {error === "Topic not found" ? "The topic you're looking for doesn't exist or has been removed." : error}
          </p>
          <Link href="/topics">
            <Button>Back to Topics</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/topics">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Topics
              </Button>
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">topics/{topic.name}</h1>
              <p className="text-muted-foreground max-w-2xl">{topic.description || "No description available"}</p>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{topic.post_count || 0} posts</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{topic.total_comments || 0} comments</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(topic.created_at)}</span>
                </div>
              </div>
            </div>

            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Post
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sort options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "created_at" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("created_at")}
                  className="gap-1"
                >
                  <Clock className="w-3 h-3" />
                  New
                </Button>
                <Button
                  variant={sortBy === "vote_score" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("vote_score")}
                  className="gap-1"
                >
                  <TrendingUp className="w-3 h-3" />
                  Top
                </Button>
                <Button
                  variant={sortBy === "comment_count" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("comment_count")}
                  className="gap-1"
                >
                  <MessageCircle className="w-3 h-3" />
                  Comments
                </Button>
              </div>
            </div>

            {/* Posts */}
            {postsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to start a discussion in this community!</p>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create First Post
                </Button>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">About Community</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Posts</span>
                  <span className="font-medium">{topic.post_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Comments</span>
                  <span className="font-medium">{topic.total_comments || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{formatDate(topic.created_at)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Community Rules</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>1. Be respectful and civil</p>
                <p>2. Stay on topic</p>
                <p>3. No spam or self-promotion</p>
                <p>4. Use descriptive titles</p>
                <p>5. Search before posting</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
