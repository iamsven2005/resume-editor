"use client"
import Link from "next/link"
import { useState, useMemo } from "react"
import { Suspense } from "react"

import { PostCard } from "../PostCard"
import { CommentCard } from "../CommentCard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Users, Calendar, Plus, MessageSquare, TrendingUp, ArrowLeft } from "lucide-react"

import { getTopicBySlug, getPostsByTopicId, getCommentsByPostId, mockPosts } from "@/data/mockData"

interface TopicDetailPageProps {
  slug: string
}

const TopicDetailPage = ({ slug }: TopicDetailPageProps) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")

  const topic = useMemo(() => (slug && typeof slug === "string" ? getTopicBySlug(slug) : null), [slug])
  const posts = topic ? getPostsByTopicId(topic.id) : []
  const selectedPost = selectedPostId ? mockPosts.find((p) => p.id === selectedPostId) : null
  const comments = selectedPostId ? getCommentsByPostId(selectedPostId) : []

  if (!topic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-foreground mb-2">Community not found</h2>
          <p className="text-muted-foreground mb-4">The community you're looking for doesn't exist.</p>
          <Link href="/topics">
            <Button>Browse Communities</Button>
          </Link>
          <Link href="/">
            <Button>Bulid Resume</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const handlePostClick = (postId: string) => {
    setSelectedPostId(selectedPostId === postId ? null : postId)
  }

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

          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">topics/{topic.name}</h1>
                <p className="text-muted-foreground max-w-2xl">{topic.description}</p>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{topic.memberCount.toLocaleString()} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(topic.created_at).toLocaleDateString()}</span>
                </div>
                <Badge variant="secondary">Community</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">Join</Button>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Posts</h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Hot
                  </Button>
                </div>
              </div>

              {posts.length === 0 ? (
                <Card className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">Be the first to start a discussion in this community!</p>
                  <Button>Create First Post</Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="space-y-4">
                      <div className="cursor-pointer" onClick={() => handlePostClick(post.id)}>
                        <PostCard post={post} topic={topic} isDetailView={selectedPostId === post.id} />
                      </div>

                      {selectedPostId === post.id && (
                        <Card className="border border-border bg-secondary/20">
                          <div className="p-4 space-y-6">
                            <div className="space-y-3">
                              <h4 className="font-medium text-foreground">Add a comment</h4>
                              <Textarea
                                placeholder="What are your thoughts?"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="min-h-[100px]"
                              />
                              <div className="flex justify-end">
                                <Button size="sm" disabled={!commentText.trim()}>
                                  Comment
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-6">
                              <h4 className="font-medium text-foreground">Comments ({comments.length})</h4>

                              {comments.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                  No comments yet. Be the first to comment!
                                </p>
                              ) : (
                                <div className="space-y-6">
                                  {comments.map((comment) => (
                                    <CommentCard key={comment.id} comment={comment} />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">About Community</h3>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{topic.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Members</span>
                    <span className="font-medium text-foreground">{topic.memberCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium text-foreground">
                      {new Date(topic.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Community Rules</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="font-medium text-foreground">1. Be respectful</p>
                  <p className="text-muted-foreground">Treat others with kindness and respect.</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="font-medium text-foreground">2. Stay on topic</p>
                  <p className="text-muted-foreground">Keep discussions relevant to the community.</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="font-medium text-foreground">3. No spam</p>
                  <p className="text-muted-foreground">Avoid repetitive or promotional content.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TopicPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading topic...</p>
          </div>
        </div>
      }
    >
      <TopicDetailPage slug={params.slug} />
    </Suspense>
  )
}
