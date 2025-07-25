export interface Job {
  id: number
  title: string
  description: string
  company: string
  location: string
  job_type: "full-time" | "part-time" | "contract" | "freelance" | "internship"
  salary_min?: number
  salary_max?: number
  currency: string
  is_remote: boolean
  required_skills: string[]
  is_active: boolean
  user_id: number
  created_at: string
  updated_at: string
  user_name?: string
  user_email?: string
}

export interface CreateJobData {
  title: string
  description: string
  company: string
  location: string
  job_type: "full-time" | "part-time" | "contract" | "freelance" | "internship"
  salary_min?: number
  salary_max?: number
  currency: string
  is_remote: boolean
  required_skills: string[]
}

export interface UpdateJobData extends Partial<CreateJobData> {
  is_active?: boolean
}

export interface JobFilters {
  search: string
  job_type: string
  is_remote: string
}

export interface JobsResponse {
  success: boolean
  jobs: Job[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
}
