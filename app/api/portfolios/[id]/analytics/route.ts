import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Fetching analytics for portfolio:", params.id)
    const user = await getCurrentUser()

    if (!user) {
      console.log("User not authenticated")
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Verify portfolio belongs to user
    const portfolio = await sql`
      SELECT id FROM portfolios 
      WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (portfolio.length === 0) {
      console.log("Portfolio not found or doesn't belong to user")
      return NextResponse.json({ success: false, error: "Portfolio not found" }, { status: 404 })
    }

    console.log("Portfolio verified, fetching analytics...")

    // Get analytics data - group by date for better visualization
    const analytics = await sql`
      SELECT 
        DATE(created_at) as view_date,
        COUNT(*) as view_count,
        COUNT(DISTINCT visitor_ip) as unique_visitors_on_date,
        STRING_AGG(DISTINCT device_type, ', ') as device_types,
        STRING_AGG(DISTINCT SUBSTRING(user_agent, 1, 50), ', ') as user_agents
      FROM portfolio_analytics 
      WHERE portfolio_id = ${params.id}
      GROUP BY DATE(created_at)
      ORDER BY view_date DESC
      LIMIT 30
    `

    console.log("Analytics data fetched:", analytics.length, "records")

    // Get portfolio stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT visitor_ip) as unique_visitors,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as views_last_7_days,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as views_last_30_days,
        AVG(session_duration) as avg_session_duration,
        AVG(pages_viewed) as avg_pages_viewed
      FROM portfolio_analytics 
      WHERE portfolio_id = ${params.id}
    `

    console.log("Stats fetched:", stats.length > 0 ? "success" : "no data")

    const statsData = stats[0] || {
      total_views: 0,
      unique_visitors: 0,
      views_last_7_days: 0,
      views_last_30_days: 0,
      avg_session_duration: 0,
      avg_pages_viewed: 0,
    }

    // Convert numeric strings to numbers
    const formattedStats = {
      total_views: Number.parseInt(statsData.total_views) || 0,
      unique_visitors: Number.parseInt(statsData.unique_visitors) || 0,
      views_last_7_days: Number.parseInt(statsData.views_last_7_days) || 0,
      views_last_30_days: Number.parseInt(statsData.views_last_30_days) || 0,
      avg_session_duration: Number.parseFloat(statsData.avg_session_duration) || 0,
      avg_pages_viewed: Number.parseFloat(statsData.avg_pages_viewed) || 0,
    }

    // Format analytics data
    const formattedAnalytics = analytics.map((item) => ({
      view_date: item.view_date,
      view_count: Number.parseInt(item.view_count) || 0,
      unique_visitors_on_date: Number.parseInt(item.unique_visitors_on_date) || 0,
      device_types: item.device_types || "Unknown",
      user_agent: item.user_agents || "Unknown",
    }))

    return NextResponse.json({
      success: true,
      analytics: formattedAnalytics,
      stats: formattedStats,
    })
  } catch (error) {
    console.error("Error fetching portfolio analytics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics",
        analytics: [],
        stats: {
          total_views: 0,
          unique_visitors: 0,
          views_last_7_days: 0,
          views_last_30_days: 0,
          avg_session_duration: 0,
          avg_pages_viewed: 0,
        },
      },
      { status: 500 },
    )
  }
}
