"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { JobCard } from "@/components/job-card"
import { JobFormDialog } from "@/components/job-form-dialog"
import { useAuth } from "@/contexts/auth-context"
import { Search, Plus, Briefcase, Filter } from "lucide-react"
import type { Job, CreateJobData } from "@/types/job"
import { Button } from "@/components/ui/button"

interface JobsResponse {
  success: boolean
  jobs: Job[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [myJobs, setMyJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState("all")
  const [remoteFilter, setRemoteFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState("all")

  const fetchJobs = async (isMyJobs = false) => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
      })

      if (searchTerm) params.append("search", searchTerm)
      if (jobTypeFilter !== "all") params.append("job_type", jobTypeFilter)
      if (remoteFilter !== "all") params.append("is_remote", remoteFilter)
      if (isMyJobs && user) params.append("user_id", user.id.toString())

      const response = await fetch(`/api/jobs?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: JobsResponse = await response.json()

      if (data.success) {
        if (isMyJobs) {
          setMyJobs(data.jobs)
        } else {
          setJobs(data.jobs)
        }
        setTotalPages(data.pagination.totalPages)
      } else {
        throw new Error(data.error || "Failed to fetch jobs")
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    }
  }

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true)
      try {
        await fetchJobs(activeTab === "my")
      } finally {
        setLoading(false)
      }
    }
    loadJobs()
  }, [searchTerm, jobTypeFilter, remoteFilter, currentPage, activeTab, user])

  const handleCreateJob = async (data: CreateJobData) => {
    setActionLoading(true)
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create job")
      }

      // Refresh the appropriate job list
      await fetchJobs(activeTab === "my")
    } catch (error) {
      console.error("Error creating job:", error)
      throw error
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditJob = async (jobId: number, data: CreateJobData) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update job")
      }

      // Refresh both job lists
      await Promise.all([fetchJobs(false), fetchJobs(true)])
    } catch (error) {
      console.error("Error updating job:", error)
      throw error
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: number) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete job")
      }

      // Refresh both job lists
      await Promise.all([fetchJobs(false), fetchJobs(true)])
    } catch (error) {
      console.error("Error deleting job:", error)
      throw error
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleStatus = async (jobId: number, isActive: boolean) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update job status")
      }

      // Refresh both job lists
      await Promise.all([fetchJobs(false), fetchJobs(true)])
    } catch (error) {
      console.error("Error updating job status:", error)
      throw error
    } finally {
      setActionLoading(false)
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setJobTypeFilter("all")
    setRemoteFilter("all")
    setCurrentPage(1)
  }

  const currentJobs = activeTab === "my" ? myJobs : jobs

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
                    <Button variant="outline" size="sm">
              <Link href="/">
              Home
              </Link>
              </Button>
          <h1 className="text-3xl font-bold mb-2">Job Board</h1>
          <p className="text-muted-foreground">Discover opportunities and find your next career move</p>
        </div>
        {user && (
          <JobFormDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post Job
              </Button>
            }
            onSubmit={handleCreateJob}
            isLoading={actionLoading}
          />
        )}
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search jobs by title, company, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                <SelectTrigger className="w-[140px]">
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
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Remote" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Remote</SelectItem>
                  <SelectItem value="false">On-site</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={resetFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            All Jobs
            {jobs.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {jobs.length}
              </Badge>
            )}
          </TabsTrigger>
          {user && (
            <TabsTrigger value="my" className="flex items-center gap-2">
              My Jobs
              {myJobs.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {myJobs.length}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-64 animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : currentJobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentJobs.map((job) => (
                  <JobCard key={job.id} job={job} isOwner={false} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || jobTypeFilter !== "all" || remoteFilter !== "all"
                    ? "Try adjusting your search criteria"
                    : "Be the first to post a job!"}
                </p>
                {user && (
                  <JobFormDialog
                    trigger={<Button>Post the First Job</Button>}
                    onSubmit={handleCreateJob}
                    isLoading={actionLoading}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {user && (
          <TabsContent value="my" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="h-64 animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : myJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isOwner={true}
                    onEdit={handleEditJob}
                    onDelete={handleDeleteJob}
                    onToggleStatus={handleToggleStatus}
                    isLoading={actionLoading}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
                  <p className="text-muted-foreground mb-4">Start by creating your first job posting</p>
                  <JobFormDialog
                    trigger={<Button>Create Your First Job</Button>}
                    onSubmit={handleCreateJob}
                    isLoading={actionLoading}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
