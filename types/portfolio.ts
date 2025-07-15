export interface Portfolio {
  id: string
  user_id: string
  title: string
  description?: string
  theme: string
  resume_data: any
  is_published: boolean
  portfolio_url?: string
  created_at: string
  updated_at: string
}

export interface PortfolioAnalytics {
  id: string
  portfolio_id: string
  visitor_ip?: string
  user_agent?: string
  referrer?: string
  country?: string
  city?: string
  device_type?: string
  browser?: string
  os?: string
  session_duration: number
  pages_viewed: number
  created_at: string
}

export interface PortfolioAnalyticsSummary {
  portfolio_id: string
  total_views: number
  unique_visitors: number
  avg_session_duration: number
  avg_pages_viewed: number
  views_last_7_days: number
  views_last_30_days: number
  last_viewed: string
}

export interface CreatePortfolioRequest {
  title: string
  description?: string
  theme?: string
  resumeIds: string[]
}
