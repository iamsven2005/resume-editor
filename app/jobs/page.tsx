"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Search, Filter, Briefcase, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { JobFormDialog } from "@/components/job-form-dialog"
import { JobCard } from "@/components/job-card"
import type { Job, JobFilters } from "@/types/job"

export default function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [filters, setFilters] = useState<JobFilters>({
    search: "",
    job_type: "all",
    is_remote: "all",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })

  const fetchJobs = async (newFilters?: JobFilters, page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const currentFilters = newFilters || filters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      if (currentFilters.search) {
        params.append("search", currentFilters.search)
      }
      if (currentFilters.job_type && currentFilters.job_type !== "all") {
        params.append("job_type", currentFilters.job_type)
      }
      if (currentFilters.is_remote && currentFilters.is_remote !== "all") {
        params.append("is_remote", currentFilters.is_remote.toString())
      }
      if (activeTab === "my-jobs" && user) {
        params.append("user_id", user.id.toString())
      }

      const response = await fetch(`/api/jobs?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setJobs(data.jobs || [])
        setPagination(data.pagination || pagination)
      } else {
        throw new Error(data.error || "Failed to fetch jobs")
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch jobs")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch jobs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [activeTab, user])

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchJobs(filters, 1)
  }

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchJobs(newFilters, 1)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      job_type: "all",
      is_remote: "all",
    }
    setFilters(clearedFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchJobs(clearedFilters, 1)
  }

  const hasActiveFilters =
    filters.search ||
    (filters.job_type && filters.job_type !== "all") ||
    (filters.is_remote && filters.is_remote !== "all")

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Job Board</h1>
          <p className="text-muted-foreground">Find your next opportunity or post a job</p>
        </div>
        {user && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Post Job
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            All Jobs
          </TabsTrigger>
          {user && (
            <TabsTrigger value="my-jobs" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Jobs
            </TabsTrigger>
          )}
        </TabsList>

        <div className="mt-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies, or descriptions..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              Search
            </Button>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={filters.job_type || "all"} onValueChange={(value) => handleFilterChange("job_type", value)}>
              <SelectTrigger className="w-40">
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

            <Select
              value={filters.is_remote?.toString() || "all"}
              onValueChange={(value) => handleFilterChange("is_remote", value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="true">Remote Only</SelectItem>
                <SelectItem value="false">On-site Only</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} size="sm">
                Clear Filters
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {filters.search && <Badge variant="secondary">Search: "{filters.search}"</Badge>}
              {filters.job_type && filters.job_type !== "all" && (
                <Badge variant="secondary">Type: {filters.job_type}</Badge>
              )}
              {filters.is_remote && filters.is_remote !== "all" && (
                <Badge variant="secondary">{filters.is_remote === "true" ? "Remote" : "On-site"}</Badge>
              )}
            </div>
          )}
        </div>

        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "Try adjusting your search criteria or clearing filters."
                  : "Be the first to post a job!"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {jobs.length} of {pagination.total} jobs
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} currentUserId={user?.id} onUpdate={() => fetchJobs()} />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {user && (
          <TabsContent value="my-jobs" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
                <p className="text-muted-foreground mb-4">Start by posting your first job opportunity.</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    You have posted {jobs.length} job{jobs.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} currentUserId={user?.id} onUpdate={() => fetchJobs()} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        )}
      </Tabs>

      <JobFormDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={() => fetchJobs()} />
    </div>
  )
}
