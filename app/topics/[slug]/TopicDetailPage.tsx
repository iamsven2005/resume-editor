"use client"

import { useState, useEffect } from "react"
import { getTopicBySlug, getPostsByTopicSlug } from "@/lib/api"
import type { Topic, Post } from "@/lib/api"
import { PostCard } from "../PostCard"
import { CreatePostDialog } from "@/components/create-post-dialog"
import { ShareButton } from "@/components/share-button"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Users, Calendar, TrendingUp, MessageSquare } from "lucide-react"
import Link from "next/link"

interface TopicDetailPageProps {
  slug: string
}

const TopicDetailPage = ({ slug }: TopicDetailPageProps) => {
  const [topic, setTopic] = useState<Topic | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular" | "comments">("newest")
  const [filterBy, setFilterBy] = useState<"all" | "text" | "link">("all")
  const [searchComments, setSearchComments] = useState("")
  const [searchingComments, setSearchingComments] = useState(false)
  const [commentResults, setCommentResults] = useState<any[]>([])

  useEffect(() => {
    fetchTopicData()
  }, [slug])

  const fetchTopicData = async () => {
    try {
      const [topicData, postsData] = await Promise.all([getTopicBySlug(slug), getPostsByTopicSlug(slug)])
      setTopic(topicData)
      setPosts(postsData)
    } catch (error) {
      console.error("Error fetching topic data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostCreated = () => {
    fetchTopicData()
  }



  const filteredAndSortedPosts = posts
    .filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.content && post.content.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesFilter = filterBy === "all" || post.post_type === filterBy
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "popular":
          return b.vote_score - a.vote_score
        case "comments":
          return b.comment_count - a.comment_count
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community...</p>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Community Not Found</h1>
          <p className="text-muted-foreground mb-4">The community you're looking for doesn't exist.</p>
          <Link href="/topics">
            <Button>Browse Communities</Button>
          </Link>
        </div>
      </div>
    )
  }

  const communityUrl = `${window.location.origin}/topics/${topic.slug}`

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <Link href="/topics">
                <Button variant="outline" className="mb-4 bg-transparent">
                  ← Back to Communities
                </Button>
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">r/{topic.name}</h1>
                <ShareButton url={communityUrl} title={`r/${topic.name} community`} type="community" />
              </div>
              <p className="text-muted-foreground mb-4">{topic.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{topic.memberCount.toLocaleString()} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(topic.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <CreatePostDialog topicSlug={slug} onPostCreated={handlePostCreated} />
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search posts..."
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
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="comments">Most Comments</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Posts</SelectItem>
                    <SelectItem value="text">Text Posts</SelectItem>
                    <SelectItem value="link">Link Posts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">

            {/* Posts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Posts
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({filteredAndSortedPosts.length} posts)
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  {filterBy !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {filterBy} posts
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {filteredAndSortedPosts.map((post) => (
                  <PostCard key={post.id} post={post} topic={topic} />
                ))}
              </div>

              {filteredAndSortedPosts.length === 0 && (
                <Card className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No posts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try adjusting your search terms."
                      : "Be the first to create a post in this community!"}
                  </p>
                  <CreatePostDialog topicSlug={slug} onPostCreated={handlePostCreated} />
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Community Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Members</span>
                  <span className="font-medium text-foreground">{topic.memberCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Posts</span>
                  <span className="font-medium text-foreground">{posts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="font-medium text-foreground">{new Date(topic.created_at).getFullYear()}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Community Rules</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>1. Be respectful and civil</p>
                <p>2. Stay on topic</p>
                <p>3. No spam or self-promotion</p>
                <p>4. Use appropriate post flairs</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopicDetailPage
