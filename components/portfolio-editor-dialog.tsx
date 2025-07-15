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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Globe, Copy, ExternalLink } from "lucide-react"

interface Portfolio {
  id: string
  title: string
  description?: string
  theme: string
  resume_data: any
  is_published: boolean
  portfolio_url: string
  total_views: number
  unique_visitors: number
  views_last_7_days: number
  views_last_30_days: number
  created_at: string
  updated_at: string
}

interface PortfolioEditorDialogProps {
  portfolio: Portfolio
  onPortfolioUpdated: () => void
  children: React.ReactNode
}

export function PortfolioEditorDialog({ portfolio, onPortfolioUpdated, children }: PortfolioEditorDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(portfolio.title)
  const [description, setDescription] = useState(portfolio.description || "")
  const [theme, setTheme] = useState(portfolio.theme)
  const [isPublished, setIsPublished] = useState(portfolio.is_published)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Portfolio title cannot be empty",
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
          description: "Portfolio updated successfully",
        })
        setOpen(false)
        onPortfolioUpdated()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update portfolio",
          variant: "destructive",
        })
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

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setTitle(portfolio.title)
      setDescription(portfolio.description || "")
      setTheme(portfolio.theme)
      setIsPublished(portfolio.is_published)
    }
    setOpen(newOpen)
  }

  const getPortfolioUrl = () => {
    return `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/portfolio/${portfolio.portfolio_url}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getPortfolioUrl())
      toast({
        description: "Portfolio URL copied to clipboard",
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      })
    }
  }

  const openPortfolio = () => {
    window.open(getPortfolioUrl(), "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Portfolio</DialogTitle>
          <DialogDescription>Update your portfolio settings, theme, and publishing status.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-title" className="text-right">
              Title
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              disabled={isUpdating}
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="edit-description" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              rows={3}
              disabled={isUpdating}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-theme" className="text-right">
              Theme
            </Label>
            <Select value={theme} onValueChange={setTheme} disabled={isUpdating}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-published" className="text-right">
              Published
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="edit-published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
                disabled={isUpdating}
              />
              <span className="text-sm text-muted-foreground">
                {isPublished ? "Portfolio is public" : "Portfolio is private"}
              </span>
            </div>
          </div>

          {/* Portfolio URL */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">URL</Label>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                <Globe className="h-4 w-4" />
                <span className="flex-1 truncate">/portfolio/{portfolio.portfolio_url}</span>
                <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-6 w-6 p-0">
                  <Copy className="h-3 w-3" />
                </Button>
                {isPublished && (
                  <Button variant="ghost" size="sm" onClick={openPortfolio} className="h-6 w-6 p-0">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {!isPublished && (
                <p className="text-xs text-muted-foreground">Enable publishing to make this URL accessible</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
