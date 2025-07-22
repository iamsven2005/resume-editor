"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, FileText, LinkIcon } from "lucide-react"

interface CreatePostDialogProps {
  topicSlug: string
  onPostCreated?: () => void
}

export const CreatePostDialog = ({ topicSlug, onPostCreated }: CreatePostDialogProps) => {
  const [open, setOpen] = useState(false)
  const [postType, setPostType] = useState<"text" | "link">("text")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [url, setUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    try {
      const postData = {
        title: title.trim(),
        post_type: postType,
        ...(postType === "text" && content.trim() && { content: content.trim() }),
        ...(postType === "link" && url.trim() && { url: url.trim() }),
      }

      const response = await fetch(`/api/topics/${topicSlug}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create post")
      }

      // Reset form
      setTitle("")
      setContent("")
      setUrl("")
      setOpen(false)

      if (onPostCreated) {
        onPostCreated()
      }
    } catch (error) {
      console.error("Error creating post:", error)
      alert(error instanceof Error ? error.message : "Failed to create post. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const isValid = title.trim() && (postType === "text" || (postType === "link" && url.trim()))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>Share something interesting with the community.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your post about?"
                maxLength={300}
                required
              />
              <p className="text-xs text-muted-foreground">{title.length}/300 characters</p>
            </div>

            <Tabs value={postType} onValueChange={(value) => setPostType(value as "text" | "link")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Text Post
                </TabsTrigger>
                <TabsTrigger value="link" className="gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Link Post
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="content">Content (Optional)</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tell us more about your post..."
                    maxLength={10000}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">{content.length}/10,000 characters</p>
                </div>
              </TabsContent>

              <TabsContent value="link" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    required={postType === "link"}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !isValid}>
              {submitting ? "Creating..." : "Create Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
