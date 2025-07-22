"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronUp, ChevronDown, MessageSquare, User, Clock, Send } from "lucide-react"
import { useState } from "react"
import { vote } from "@/lib/api"
import { ShareButton } from "@/components/share-button"
import type { Comment } from "@/lib/api"

interface CommentCardProps {
  comment: Comment
  level?: number
  onReplyAdded?: (parentId: string, newReply: Comment) => void
}

export const CommentCard = ({ comment, level = 0, onReplyAdded }: CommentCardProps) => {
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)
  const [currentScore, setCurrentScore] = useState(comment.vote_score)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [submittingReply, setSubmittingReply] = useState(false)

  const handleVote = async (voteType: "up" | "down") => {
    try {
      const voteValue = voteType === "up" ? 1 : -1
      await vote(comment.id, "comment", voteValue)

      if (userVote === voteType) {
        setUserVote(null)
        setCurrentScore(comment.vote_score)
      } else {
        const scoreDiff = userVote ? (voteType === "up" ? 2 : -2) : voteType === "up" ? 1 : -1
        setUserVote(voteType)
        setCurrentScore(currentScore + scoreDiff)
      }
    } catch (error) {
      console.error("Error voting on comment:", error)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    setSubmittingReply(true)
    try {
      const response = await fetch(`/api/posts/${comment.post_id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent.trim(),
          parent_comment_id: comment.id,
        }),
      })

      if (!response.ok) throw new Error("Failed to create reply")

      const newReply = await response.json()

      // Add the reply to the current comment's replies
      if (onReplyAdded) {
        onReplyAdded(comment.id, newReply)
      }

      setReplyContent("")
      setShowReplyForm(false)
    } catch (error) {
      console.error("Error creating reply:", error)
      alert("Failed to create reply. Please try again.")
    } finally {
      setSubmittingReply(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const leftBorderColor = level > 0 ? "border-l-2 border-border" : ""
  const marginLeft = level > 0 ? `ml-${Math.min(level * 4, 16)}` : ""
  const commentUrl = `${window.location.origin}${window.location.pathname}#comment-${comment.id}`

  return (
    <div id={`comment-${comment.id}`} className={`${leftBorderColor} ${marginLeft} ${level > 0 ? "pl-4" : ""}`}>
      <div className="space-y-3">
        {/* Comment header */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="font-medium text-foreground">u/{comment.author_name}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(comment.created_at)}</span>
          </div>
        </div>

        {/* Comment content */}
        <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>

        {/* Comment actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`p-1 h-auto ${userVote === "up" ? "text-upvote" : "text-vote-text hover:text-upvote"}`}
              onClick={() => handleVote("up")}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <span
              className={`text-xs font-medium ${userVote === "up" ? "text-upvote" : userVote === "down" ? "text-downvote" : "text-vote-text"}`}
            >
              {currentScore}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={`p-1 h-auto ${userVote === "down" ? "text-downvote" : "text-vote-text hover:text-downvote"}`}
              onClick={() => handleVote("down")}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Reply
          </Button>

          <ShareButton url={commentUrl} title={`Comment by ${comment.author_name}`} type="comment" />
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <form onSubmit={handleSubmitReply} className="flex gap-2 p-3 bg-secondary/30 rounded border border-border">
            <Input
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={submittingReply || !replyContent.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4 mt-4">
            {comment.replies.map((reply) => (
              <CommentCard key={reply.id} comment={reply} level={level + 1} onReplyAdded={onReplyAdded} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
