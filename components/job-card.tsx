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
import { JobFormDialog } from "./job-form-dialog"
import { MapPin, Building2, DollarSign, Calendar, MoreVertical, Edit, Trash2, Eye, EyeOff, Wifi } from "lucide-react"
import type { Job, CreateJobData } from "@/types/job"

interface JobCardProps {
  job: Job & { user_name?: string; user_email?: string }
  isOwner?: boolean
  onEdit?: (jobId: number, data: CreateJobData) => Promise<void>
  onDelete?: (jobId: number) => Promise<void>
  onToggleStatus?: (jobId: number, isActive: boolean) => Promise<void>
  isLoading?: boolean
}

export function JobCard({ job, isOwner = false, onEdit, onDelete, onToggleStatus, isLoading = false }: JobCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

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
    }
    if (min) {
      return `From ${formatter.format(min)}`
    }
    if (max) {
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

  const getJobTypeColor = (jobType: string) => {
    const colors = {
      "full-time": "bg-green-100 text-green-800 border-green-200",
      "part-time": "bg-blue-100 text-blue-800 border-blue-200",
      contract: "bg-purple-100 text-purple-800 border-purple-200",
      freelance: "bg-orange-100 text-orange-800 border-orange-200",
      internship: "bg-pink-100 text-pink-800 border-pink-200",
    }
    return colors[jobType as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const handleEdit = async (data: CreateJobData) => {
    if (onEdit) {
      await onEdit(job.id, data)
    }
  }

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(job.id)
      setShowDeleteDialog(false)
    }
  }

  const handleToggleStatus = async () => {
    if (onToggleStatus) {
      await onToggleStatus(job.id, !job.is_active)
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
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
                  <JobFormDialog
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    }
                    job={job}
                    onSubmit={handleEdit}
                    isLoading={isLoading}
                  />
                  <DropdownMenuItem onClick={handleToggleStatus} disabled={isLoading}>
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

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            {job.is_remote && (
              <div className="flex items-center gap-1">
                <Wifi className="h-4 w-4" />
                <span>Remote</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{job.description}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={getJobTypeColor(job.job_type)} variant="outline">
              {job.job_type.charAt(0).toUpperCase() + job.job_type.slice(1).replace("-", " ")}
            </Badge>
            {!job.is_active && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                Inactive
              </Badge>
            )}
          </div>

          {salary && (
            <div className="flex items-center gap-1 text-sm font-medium text-green-600 mb-3">
              <DollarSign className="h-4 w-4" />
              <span>{salary}</span>
            </div>
          )}

          {job.required_skills && job.required_skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Required Skills:</p>
              <div className="flex flex-wrap gap-1">
                {job.required_skills.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.required_skills.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{job.required_skills.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Posted {formatDate(job.created_at)}</span>
            </div>
            {job.user_name && <span className="text-xs">by {job.user_name}</span>}
          </div>
        </CardFooter>
      </Card>

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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
