export interface Portfolio {
  id: number
  user_id: number
  title: string
  description?: string
  theme: string
  resume_data: any
  is_published: boolean
  portfolio_url?: string
  total_views: number
  unique_visitors: number
  views_last_7_days: number
  views_last_30_days: number
  created_at: string
  updated_at: string
}

export interface PortfolioAnalytics {
  summary: {
    total_views: number
    unique_visitors: number
    avg_session_duration: number
    avg_pages_viewed: number
    views_last_7_days: number
    views_last_30_days: number
    views_last_90_days: number
  }
  topCountries: Array<{
    country: string
    views: number
    unique_visitors: number
  }>
  topCities: Array<{
    city: string
    country: string
    views: number
    unique_visitors: number
  }>
  deviceBreakdown: Array<{
    device_type: string
    views: number
    unique_visitors: number
  }>
  browserBreakdown: Array<{
    browser: string
    views: number
    unique_visitors: number
  }>
  dailyViews: Array<{
    date: string
    views: number
    unique_visitors: number
  }>
  recentViews: Array<{
    visitor_ip: string
    user_agent: string
    referrer?: string
    country?: string
    city?: string
    device_type?: string
    browser?: string
    os?: string
    session_duration: number
    pages_viewed: number
    created_at: string
  }>
}

export interface CreatePortfolioRequest {
  title: string
  description?: string
  theme?: string
  resumeIds: number[]
  isPublished?: boolean
}
