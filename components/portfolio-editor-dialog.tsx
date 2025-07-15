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
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

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
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Portfolio title cannot be empty",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
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

      if (response.ok) {
        onPortfolioUpdated()
        setOpen(false)
        toast({
          title: "Success",
          description: "Portfolio updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update portfolio",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update portfolio",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form if dialog is closed without saving
      setTitle(portfolio.title)
      setDescription(portfolio.description || "")
      setTheme(portfolio.theme)
      setIsPublished(portfolio.is_published)
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Portfolio</DialogTitle>
          <DialogDescription>Update your portfolio settings, theme, and publishing status.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="portfolio-title" className="text-right">
              Title
            </Label>
            <Input
              id="portfolio-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Enter portfolio title..."
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="portfolio-description" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="portfolio-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Enter portfolio description (optional)..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="portfolio-theme" className="text-right">
              Theme
            </Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a theme" />
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
            <Label htmlFor="portfolio-published" className="text-right">
              Published
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch id="portfolio-published" checked={isPublished} onCheckedChange={setIsPublished} />
              <Label htmlFor="portfolio-published" className="text-sm text-muted-foreground">
                {isPublished ? "Portfolio is public" : "Portfolio is private"}
              </Label>
            </div>
          </div>

          {isPublished && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm text-muted-foreground">URL</Label>
              <div className="col-span-3 text-sm text-muted-foreground">/portfolio/{portfolio.portfolio_url}</div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
