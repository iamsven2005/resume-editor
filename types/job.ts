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
  user_id: number
  is_active: boolean
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
  currency?: string
  is_remote?: boolean
  required_skills?: string[]
  is_active?: boolean
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
}
