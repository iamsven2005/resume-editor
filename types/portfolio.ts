export interface Portfolio {
  id: number
  user_id: number
  title: string
  description?: string
  theme: string
  resume_data: any
  is_published: boolean
  portfolio_url: string
  created_at: string
  updated_at: string
  total_views?: number
  unique_visitors?: number
  views_last_7_days?: number
  views_last_30_days?: number
  avg_session_duration?: number
  avg_pages_viewed?: number
}

export interface PortfolioAnalytics {
  daily: Array<{
    date: string
    views: number
    unique_visitors: number
    avg_session_duration: number
    mobile_views: number
    desktop_views: number
    tablet_views: number
  }>
  topCountries: Array<{
    country: string
    views: number
    unique_visitors: number
  }>
  topBrowsers: Array<{
    browser: string
    views: number
  }>
  topReferrers: Array<{
    referrer: string
    views: number
  }>
}

export interface CreatePortfolioRequest {
  title: string
  description?: string
  theme?: string
  resumeIds: number[]
}
