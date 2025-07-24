"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Building2, MapPin, Clock, DollarSign, MoreVertical, Edit, Trash2, Eye, EyeOff } from "lucide-react"
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

      if (data.success) {
        toast({
          title: "Success",
          description: "Job deleted successfully",
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

  const handleToggleStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !job.is_active }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Job ${!job.is_active ? "activated" : "deactivated"} successfully`,
        })
        onUpdate()
      } else {
        throw new Error(data.error || "Failed to update job status")
      }
    } catch (error) {
      console.error("Error updating job status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update job status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case "full-time":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "part-time":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "contract":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "freelance":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      case "internship":
        return "bg-pink-100 text-pink-800 hover:bg-pink-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <>
      <Card className={`h-full transition-all hover:shadow-md ${!job.is_active ? "opacity-60" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-lg leading-tight">{job.title}</h3>
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
                  <DropdownMenuItem onClick={handleToggleStatus} disabled={loading}>
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

        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
              {job.is_remote && (
                <Badge variant="outline" className="ml-1">
                  Remote
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getJobTypeColor(job.job_type)}>
              {job.job_type.charAt(0).toUpperCase() + job.job_type.slice(1)}
            </Badge>
            {!job.is_active && <Badge variant="secondary">Inactive</Badge>}
          </div>

          {formatSalary(job.salary_min, job.salary_max, job.currency) && (
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <DollarSign className="h-4 w-4" />
              <span>{formatSalary(job.salary_min, job.salary_max, job.currency)}</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>

          {job.required_skills && job.required_skills.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {job.required_skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.required_skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{job.required_skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Posted {formatDate(job.created_at)}</span>
            </div>
            {job.user_name && <span>by {job.user_name}</span>}
          </div>
        </CardFooter>
      </Card>

      <JobFormDialog open={showEditDialog} onOpenChange={setShowEditDialog} onSuccess={onUpdate} job={job} />

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
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
