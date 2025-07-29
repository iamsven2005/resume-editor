export interface Candidate {
  user_id: number
  name: string
  email: string
  resume_id: number
  resume_title: string
  skills: string[]
  experience_titles: string[]
  education: {
    degree: string
    institution: string
    year: string
  }[]
  resume_created_at: string
  resume_updated_at: string
  user_created_at: string
}

export interface CandidateSearchResponse {
  success: boolean
  candidates: Candidate[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  search_term: string
  error?: string
}

export interface CandidateFilters {
  search: string
  skills: string[]
  experience_level: string
  location: string
}
