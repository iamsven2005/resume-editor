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
import { toast } from "@/hooks/use-toast"

interface ResumeNameEditorDialogProps {
  resumeId: string
  currentTitle: string
  onTitleUpdated: (newTitle: string) => void
  children: React.ReactNode
}

export function ResumeNameEditorDialog({
  resumeId,
  currentTitle,
  onTitleUpdated,
  children,
}: ResumeNameEditorDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(currentTitle)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Resume title cannot be empty",
        variant: "destructive",
      })
      return
    }

    if (title.trim() === currentTitle) {
      setOpen(false)
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        onTitleUpdated(title.trim())
        setOpen(false)
        toast({
          title: "Success",
          description: "Resume name updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update resume name",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating resume name:", error)
      toast({
        title: "Error",
        description: "Failed to update resume name. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle(currentTitle) // Reset title if dialog is closed without saving
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Resume Name</DialogTitle>
          <DialogDescription>
            Change the name of your resume. This will help you organize your resumes better.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Name
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isUpdating) {
                  handleSave()
                }
              }}
              className="col-span-3"
              placeholder="Enter resume name..."
              disabled={isUpdating}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating || !title.trim()}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
