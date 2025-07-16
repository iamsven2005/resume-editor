"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Lightbulb } from "lucide-react"

export function FeatureRequestDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { token } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "feature",
          title,
          description,
          url: window.location.href,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feature request")
      }

      toast({
        title: "Feature Request Submitted",
        description: "Thank you for your suggestion! We'll consider it for future updates.",
      })

      setTitle("")
      setDescription("")
      setOpen(false)
    } catch (error) {
      console.error("Error submitting feature request:", error)
      toast({
        title: "Error",
        description: "Failed to submit feature request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Lightbulb className="h-4 w-4 mr-2" />
          Request Feature
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Suggestion Details</DialogTitle>
          <p className="text-sm text-muted-foreground">Have an idea to improve our platform? We'd love to hear it!</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feature-title">Suggestion Title / Summary</Label>
            <Input
              id="feature-title"
              placeholder="e.g., Add dark mode feature"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feature-description">Detailed Description</Label>
            <Textarea
              id="feature-description"
              placeholder="Describe your suggestion. What problem does it solve? How would it work?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Suggestion"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
