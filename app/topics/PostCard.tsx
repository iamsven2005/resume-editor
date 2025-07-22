"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ChevronUp, ChevronDown, MessageSquare, ExternalLink, Clock, User, Send } from "lucide-react"
import { useState, useCallback } from "react"
import { getCommentsByPostId, vote } from "@/lib/api"
import { CommentCard } from "./CommentCard"
import { ShareButton } from "@/components/share-button"
import type { Post, Topic, Comment } from "@/lib/api"

interface PostCardProps {
  post: Post
  topic?: Topic
  isDetailView?: boolean
}

export const PostCard = ({ post, topic, isDetailView = false }: PostCardProps) => {
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)
  const [currentScore, setCurrentScore] = useState(post.vote_score)
  const [showComments, setShowComments] = useState(isDetailView)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  const handleVote = async (voteType: "up" | "down") => {
    try {
      const voteValue = voteType === "up" ? 1 : -1
      const response = await vote(post.id, "post", voteValue)

      if (userVote === voteType) {
        // Remove vote
        setUserVote(null)
        setCurrentScore(post.vote_score)
      } else {
        // Add or change vote
        const scoreDiff = userVote ? (voteType === "up" ? 2 : -2) : voteType === "up" ? 1 : -1
        setUserVote(voteType)
        setCurrentScore(currentScore + scoreDiff)
      }
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  const loadComments = async () => {
    if (loadingComments) return

    setLoadingComments(true)
    try {
      const commentsData = await getCommentsByPostId(post.id)
      setComments(commentsData)
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleShowComments = () => {
    setShowComments(!showComments)
    if (!showComments && comments.length === 0) {
      loadComments()
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmittingComment(true)
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      })

      if (!response.ok) throw new Error("Failed to create comment")

      const newCommentData = await response.json()
      setComments((prev) => [...prev, newCommentData])
      setNewComment("")
    } catch (error) {
      console.error("Error creating comment:", error)
      alert("Failed to create comment. Please try again.")
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleReplyAdded = useCallback((parentId: string, newReply: Comment) => {
    setComments((prevComments) => {
      const addReplyToComment = (comments: Comment[]): Comment[] => {
        return comments.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            }
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReplyToComment(comment.replies),
            }
          }
          return comment
        })
      }
      return addReplyToComment(prevComments)
    })
  }, [])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const postUrl = `${window.location.origin}/topics/${topic?.slug || "unknown"}/posts/${post.id}`

  return (
    <Card className="border border-border overflow-hidden">
      <div className="flex">
        {/* Vote buttons */}
        <div className="flex flex-col items-center p-3 bg-secondary/30 border-r border-border">
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-auto ${userVote === "up" ? "text-upvote" : "text-vote-text hover:text-upvote"}`}
            onClick={() => handleVote("up")}
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
          <span
            className={`font-bold text-sm ${userVote === "up" ? "text-upvote" : userVote === "down" ? "text-downvote" : "text-vote-text"}`}
          >
            {currentScore}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-auto ${userVote === "down" ? "text-downvote" : "text-vote-text hover:text-downvote"}`}
            onClick={() => handleVote("down")}
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>

        {/* Post content */}
        <div className="flex-1 p-4">
          <div className="space-y-3">
            {/* Post header */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {topic && (
                <>
                  <span className="font-medium text-foreground">r/{topic.name}</span>
                  <span>•</span>
                </>
              )}
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="font-medium">u/{post.author_name}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(post.created_at)}</span>
              </div>
            </div>

            {/* Post title */}
            <h2 className={`font-semibold text-foreground leading-tight ${isDetailView ? "text-xl" : "text-lg"}`}>
              {post.title}
            </h2>

            {/* Post content */}
            {post.content && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isDetailView ? post.content : `${post.content.slice(0, 200)}${post.content.length > 200 ? "..." : ""}`}
              </p>
            )}

            {/* External link */}
            {post.url && (
              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded border border-border">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate"
                >
                  {post.url}
                </a>
              </div>
            )}

            {/* Post type badge */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {post.post_type}
              </Badge>
            </div>

            {/* Post actions */}
            <div className="flex items-center gap-4 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={handleShowComments}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                {post.comment_count} comments
              </Button>

              <ShareButton url={postUrl} title={post.title} type="post" />
            </div>

            {/* Comments section */}
            {showComments && (
              <div className="mt-6 space-y-4">
                {/* Add comment form */}
                <form onSubmit={handleSubmitComment} className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" disabled={submittingComment || !newComment.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>

                {/* Comments list */}
                {loadingComments ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <CommentCard key={comment.id} comment={comment} onReplyAdded={handleReplyAdded} />
                    ))}
                    {comments.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No comments yet. Be the first to comment!
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
