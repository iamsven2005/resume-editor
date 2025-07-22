"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Search, Filter, Briefcase, User, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { JobCard } from "@/components/job-card"
import { JobFormDialog } from "@/components/job-form-dialog"
import { toast } from "@/hooks/use-toast"
import type { Job, CreateJobData, JobsResponse } from "@/types/job"

export default function JobsPage() {
  const { user, token } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [myJobs, setMyJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState("all")
  const [remoteFilter, setRemoteFilter] = useState("all")
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchJobs()
    if (user) {
      fetchMyJobs()
    }
  }, [user, searchQuery, jobTypeFilter, remoteFilter])

  const fetchJobs = async () => {
    try {
      setError(null)
      const params = new URLSearchParams({
        page: "1",
        limit: "20",
      })

      if (searchQuery) params.append("search", searchQuery)
      if (jobTypeFilter !== "all") params.append("job_type", jobTypeFilter)
      if (remoteFilter !== "all") params.append("is_remote", remoteFilter)

      const response = await fetch(`/api/jobs?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      let data: JobsResponse

      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("Failed to parse JSON:", text)
        throw new Error("Invalid response format from server")
      }

      if (data.success) {
        setJobs(data.jobs)
      } else {
        throw new Error(data.error || "Failed to fetch jobs")
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      setError(error instanceof Error ? error.message : "Failed to load jobs")
      toast({
        title: "Error",
        description: "Failed to load jobs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMyJobs = async () => {
    if (!user || !token) return

    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        user_id: user.id.toString(),
      })

      const response = await fetch(`/api/jobs?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      let data: JobsResponse

      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("Failed to parse JSON:", text)
        return
      }

      if (data.success) {
        setMyJobs(data.jobs)
      }
    } catch (error) {
      console.error("Error fetching my jobs:", error)
    }
  }

  const handleCreateJob = async (jobData: CreateJobData) => {
    if (!token) return

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      let data

      try {
        data = JSON.parse(text)
      } catch (parseError) {
        throw new Error("Invalid response format from server")
      }

      if (data.success) {
        toast({
          title: "Success",
          description: "Job posted successfully",
        })
        fetchJobs()
        fetchMyJobs()
        setShowJobForm(false)
      } else {
        throw new Error(data.error || "Failed to create job")
      }
    } catch (error) {
      console.error("Error creating job:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post job",
        variant: "destructive",
      })
    }
  }

  const handleEditJob = async (jobData: CreateJobData) => {
    if (!token || !editingJob) return

    try {
      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      let data

      try {
        data = JSON.parse(text)
      } catch (parseError) {
        throw new Error("Invalid response format from server")
      }

      if (data.success) {
        toast({
          title: "Success",
          description: "Job updated successfully",
        })
        fetchJobs()
        fetchMyJobs()
        setEditingJob(null)
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
    }
  }

  const handleDeleteJob = async (jobId: number) => {
    if (!token) return

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      let data

      try {
        data = JSON.parse(text)
      } catch (parseError) {
        throw new Error("Invalid response format from server")
      }

      if (data.success) {
        toast({
          title: "Success",
          description: "Job deleted successfully",
        })
        fetchJobs()
        fetchMyJobs()
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
    }
  }

  const handleToggleJobStatus = async (jobId: number, isActive: boolean) => {
    if (!token) return

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: isActive }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      let data

      try {
        data = JSON.parse(text)
      } catch (parseError) {
        throw new Error("Invalid response format from server")
      }

      if (data.success) {
        toast({
          title: "Success",
          description: `Job ${isActive ? "activated" : "deactivated"} successfully`,
        })
        fetchJobs()
        fetchMyJobs()
      } else {
        throw new Error(data.error || "Failed to update job status")
      }
    } catch (error) {
      console.error("Error toggling job status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update job status",
        variant: "destructive",
      })
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setJobTypeFilter("all")
    setRemoteFilter("all")
  }

  const activeFiltersCount = [searchQuery, jobTypeFilter !== "all", remoteFilter !== "all"].filter(Boolean).length

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Job Board</h1>
          <p className="text-muted-foreground mt-2">Find your next opportunity or post a job</p>
        </div>
        {user && (
          <Button onClick={() => setShowJobForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Post Job
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search jobs by title, company, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>
          <Select value={remoteFilter} onValueChange={setRemoteFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Remote" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Remote</SelectItem>
              <SelectItem value="false">On-site</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} applied
            </span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            All Jobs ({jobs.length})
          </TabsTrigger>
          {user && (
            <TabsTrigger value="my-jobs" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              My Jobs ({myJobs.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground">
                {searchQuery || jobTypeFilter !== "all" || remoteFilter !== "all"
                  ? "Try adjusting your search filters"
                  : "Be the first to post a job!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} currentUserId={user?.id} />
              ))}
            </div>
          )}
        </TabsContent>

        {user && (
          <TabsContent value="my-jobs" className="mt-6">
            {myJobs.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
                <p className="text-muted-foreground mb-4">Start by posting your first job opportunity</p>
                <Button onClick={() => setShowJobForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Job
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    currentUserId={user.id}
                    onEdit={setEditingJob}
                    onDelete={handleDeleteJob}
                    onToggleStatus={handleToggleJobStatus}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Job Form Dialog */}
      <JobFormDialog
        isOpen={showJobForm || !!editingJob}
        onClose={() => {
          setShowJobForm(false)
          setEditingJob(null)
        }}
        onSave={editingJob ? handleEditJob : handleCreateJob}
        job={editingJob}
        mode={editingJob ? "edit" : "create"}
      />
    </div>
  )
}
