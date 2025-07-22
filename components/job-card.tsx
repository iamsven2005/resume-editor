"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MapPin, DollarSign, Clock, Users, MoreVertical, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import type { Job } from "@/types/job"

interface JobCardProps {
  job: Job
  currentUserId?: number
  onEdit?: (job: Job) => void
  onDelete?: (jobId: number) => void
  onToggleStatus?: (jobId: number, isActive: boolean) => void
}

export function JobCard({ job, currentUserId, onEdit, onDelete, onToggleStatus }: JobCardProps) {
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

  const formatJobType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("-")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className={`h-full transition-all hover:shadow-md ${!job.is_active ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight mb-1 truncate">{job.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{job.company}</p>
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(job)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus?.(job.id, !job.is_active)}>
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
                  onClick={() => onDelete?.(job.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{job.location}</span>
          {job.is_remote && (
            <Badge variant="outline" className="text-xs">
              Remote
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{job.description}</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Type:</span>
            </div>
            <Badge variant="secondary">{formatJobType(job.job_type)}</Badge>
          </div>

          {formatSalary(job.salary_min, job.salary_max, job.currency) && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Salary:</span>
              </div>
              <span className="font-medium text-green-600">
                {formatSalary(job.salary_min, job.salary_max, job.currency)}
              </span>
            </div>
          )}

          {job.required_skills && job.required_skills.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Skills:</span>
              </div>
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
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <span>Posted {formatDate(job.created_at)}</span>
          {!job.is_active && (
            <Badge variant="destructive" className="text-xs">
              Inactive
            </Badge>
          )}
          {job.user_name && <span>by {job.user_name}</span>}
        </div>
      </CardFooter>
    </Card>
  )
}
