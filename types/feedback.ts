export interface Feedback {
  id: number
  user_id: number
  type: "bug" | "feature"
  title: string
  description: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "critical"
  browser_info?: string
  user_agent?: string
  url?: string
  created_at: string
  updated_at: string
}

export interface CreateFeedbackRequest {
  type: "bug" | "feature"
  title: string
  description: string
  browser_info?: string
  user_agent?: string
  url?: string
}
