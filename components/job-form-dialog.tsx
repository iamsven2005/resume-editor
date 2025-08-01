"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { X, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Job, CreateJobData } from "@/types/job"

interface JobFormDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  job?: Job
  onSubmit?: (data: CreateJobData) => Promise<void>
  onSuccess?: () => void
  isLoading?: boolean
}

export function JobFormDialog({
  trigger,
  open,
  onOpenChange,
  job,
  onSubmit,
  onSuccess,
  isLoading = false,
}: JobFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newSkill, setNewSkill] = useState("")

  const [formData, setFormData] = useState<CreateJobData>({
    title: "",
    description: "",
    company: "",
    location: "",
    job_type: "full-time",
    salary_min: undefined,
    salary_max: undefined,
    currency: "USD",
    is_remote: false,
    required_skills: [],
  })

  // Handle controlled vs uncontrolled dialog state
  const dialogOpen = open !== undefined ? open : isOpen
  const setDialogOpen = onOpenChange || setIsOpen

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        description: job.description || "",
        company: job.company || "",
        location: job.location || "",
        job_type: job.job_type || "full-time",
        salary_min: job.salary_min || undefined,
        salary_max: job.salary_max || undefined,
        currency: job.currency || "USD",
        is_remote: job.is_remote || false,
        required_skills: Array.isArray(job.required_skills) ? job.required_skills : [],
      })
    } else {
      // Reset form for new job
      setFormData({
        title: "",
        description: "",
        company: "",
        location: "",
        job_type: "full-time",
        salary_min: undefined,
        salary_max: undefined,
        currency: "USD",
        is_remote: false,
        required_skills: [],
      })
    }
  }, [job, dialogOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.company || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      if (onSubmit) {
        await onSubmit(formData)
      }

      toast({
        title: "Success",
        description: job ? "Job updated successfully" : "Job created successfully",
      })

      setDialogOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error submitting job:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save job",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.required_skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        required_skills: [...prev.required_skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  const dialogContent = (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{job ? "Edit Job" : "Post New Job"}</DialogTitle>
        <DialogDescription>
          {job ? "Update your job posting details" : "Fill in the details for your job posting"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Senior Software Engineer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
              placeholder="e.g. Tech Corp"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Job Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the role, responsibilities, and requirements..."
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="e.g. San Francisco, CA"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_type">Job Type *</Label>
            <Select
              value={formData.job_type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, job_type: value as CreateJobData["job_type"] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salary_min">Min Salary</Label>
            <Input
              id="salary_min"
              type="number"
              value={formData.salary_min || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  salary_min: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              placeholder="50000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary_max">Max Salary</Label>
            <Input
              id="salary_max"
              type="number"
              value={formData.salary_max || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  salary_max: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              placeholder="80000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_remote"
            checked={formData.is_remote}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_remote: checked }))}
          />
          <Label htmlFor="is_remote">Remote work available</Label>
        </div>

        <div className="space-y-2">
          <Label>Required Skills</Label>
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a skill..."
            />
            <Button type="button" onClick={addSkill} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {formData.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.required_skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDialogOpen(false)}
            disabled={submitting || isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || isLoading}>
            {submitting || isLoading ? "Saving..." : job ? "Update Job" : "Post Job"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )

  if (trigger) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {dialogContent}
      </Dialog>
    )
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {dialogContent}
    </Dialog>
  )
}
