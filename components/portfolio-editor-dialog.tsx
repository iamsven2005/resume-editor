"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Edit, Loader2, ExternalLink, Copy, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Portfolio } from "@/types/portfolio"

interface PortfolioEditorDialogProps {
  portfolio: Portfolio
  onPortfolioUpdated: () => void
  children?: React.ReactNode
}

const themes = [
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "minimal", label: "Minimal" },
  { value: "creative", label: "Creative" },
]

export function PortfolioEditorDialog({ portfolio, onPortfolioUpdated, children }: PortfolioEditorDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(portfolio.title)
  const [description, setDescription] = useState(portfolio.description || "")
  const [theme, setTheme] = useState(portfolio.theme)
  const [isPublished, setIsPublished] = useState(portfolio.is_published)
  const [isUpdating, setIsUpdating] = useState(false)
  const [copied, setCopied] = useState(false)

  const portfolioUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/portfolio/${portfolio.portfolio_url}`

  useEffect(() => {
    if (open) {
      setTitle(portfolio.title)
      setDescription(portfolio.description || "")
      setTheme(portfolio.theme)
      setIsPublished(portfolio.is_published)
    }
  }, [open, portfolio])

  const handleUpdate = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a portfolio title",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/portfolios/${portfolio.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          theme,
          isPublished,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Portfolio updated successfully!",
        })
        onPortfolioUpdated()
        setOpen(false)
      } else {
        throw new Error(data.error || "Failed to update portfolio")
      }
    } catch (error) {
      console.error("Error updating portfolio:", error)
      toast({
        title: "Error",
        description: "Failed to update portfolio. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl)
      setCopied(true)
      toast({
        description: "Portfolio URL copied to clipboard!",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
            <Edit className="h-3 w-3" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Portfolio</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Portfolio Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter portfolio title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter portfolio description"
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((themeOption) => (
                    <SelectItem key={themeOption.value} value={themeOption.value}>
                      {themeOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="edit-published">Published</Label>
                <p className="text-sm text-muted-foreground">Make this portfolio publicly accessible</p>
              </div>
              <Switch id="edit-published" checked={isPublished} onCheckedChange={setIsPublished} />
            </div>

            {/* Portfolio URL */}
            <div className="space-y-2">
              <Label>Portfolio URL</Label>
              <div className="flex items-center gap-2">
                <Input value={portfolioUrl} readOnly className="flex-1 bg-muted" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 bg-transparent"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                {isPublished && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(portfolioUrl, "_blank")}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Visit
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isPublished ? "default" : "secondary"}>{isPublished ? "Published" : "Draft"}</Badge>
                {!isPublished && (
                  <p className="text-xs text-muted-foreground">Enable "Published" to make this URL accessible</p>
                )}
              </div>
            </div>

            {/* Portfolio Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">{portfolio.total_views}</div>
                <div className="text-xs text-muted-foreground">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{portfolio.unique_visitors}</div>
                <div className="text-xs text-muted-foreground">Unique Visitors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{portfolio.views_last_7_days}</div>
                <div className="text-xs text-muted-foreground">Last 7 Days</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Portfolio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
