"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MapPin, Building2, DollarSign, Clock, Wifi, MoreVertical, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { JobFormDialog } from "./job-form-dialog"
import type { Job } from "@/types/job"

interface JobCardProps {
  job: Job
  currentUserId?: number
  onUpdate: () => void
}

export function JobCard({ job, currentUserId, onUpdate }: JobCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const isOwner = currentUserId === job.user_id

  const formatSalary = (min?: number, max?: number, currency = "USD") => {
    if (!min && !max) return null

    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`
    } else if (min) {
      return `From ${formatter.format(min)}`
    } else if (max) {
      return `Up to ${formatter.format(max)}`
    }
    return null
  }

  const formatJobType = (jobType: string) => {
    return jobType
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete job")
      }

      if (data.success) {
        toast({
          title: "Job deleted",
          description: "Job has been deleted successfully.",
        })
        onUpdate()
      } else {
        throw new Error(data.error || "Failed to delete job")
      }
    } catch (error) {
      console.error("Error deleting job:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete job",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const handleToggleActive = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !job.is_active,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update job")
      }

      if (data.success) {
        toast({
          title: job.is_active ? "Job deactivated" : "Job activated",
          description: `Job has been ${job.is_active ? "deactivated" : "activated"} successfully.`,
        })
        onUpdate()
      } else {
        throw new Error(data.error || "Failed to update job")
      }
    } catch (error) {
      console.error("Error updating job:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update job",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const salary = formatSalary(job.salary_min, job.salary_max, job.currency)

  return (
    <>
      <Card className={`h-full transition-all hover:shadow-md ${!job.is_active ? "opacity-60" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg leading-tight mb-1">{job.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{job.company}</span>
              </div>
            </div>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleToggleActive} disabled={loading}>
                    {job.is_active ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Activate
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
            {job.is_remote && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  <span>Remote</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">{formatJobType(job.job_type)}</Badge>
            </div>
            {salary && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{salary}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>

          {job.required_skills && job.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.required_skills.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.required_skills.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.required_skills.length - 4} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <span>Posted {formatDate(job.created_at)}</span>
            {!job.is_active && (
              <Badge variant="secondary" className="text-xs">
                Inactive
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>

      <JobFormDialog open={showEditDialog} onOpenChange={setShowEditDialog} job={job} onSuccess={onUpdate} />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{job.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
