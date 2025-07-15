import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Verify portfolio ownership
    const portfolioCheck = await sql`
      SELECT id FROM portfolios 
      WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (portfolioCheck.length === 0) {
      return NextResponse.json({ success: false, error: "Portfolio not found" }, { status: 404 })
    }

    // Get analytics summary
    const summary = await sql`
      SELECT 
        total_views,
        unique_visitors,
        avg_session_duration,
        avg_pages_viewed,
        views_last_7_days,
        views_last_30_days,
        views_last_90_days
      FROM portfolio_analytics_summary 
      WHERE portfolio_id = ${params.id}
    `

    // Get top countries
    const topCountries = await sql`
      SELECT 
        country,
        COUNT(*) as views,
        COUNT(DISTINCT visitor_ip) as unique_visitors
      FROM portfolio_analytics 
      WHERE portfolio_id = ${params.id} AND country IS NOT NULL
      GROUP BY country
      ORDER BY views DESC
      LIMIT 10
    `

    // Get top cities
    const topCities = await sql`
      SELECT 
        city,
        country,
        COUNT(*) as views,
        COUNT(DISTINCT visitor_ip) as unique_visitors
      FROM portfolio_analytics 
      WHERE portfolio_id = ${params.id} AND city IS NOT NULL
      GROUP BY city, country
      ORDER BY views DESC
      LIMIT 10
    `

    // Get device breakdown
    const deviceBreakdown = await sql`
      SELECT 
        device_type,
        COUNT(*) as views,
        COUNT(DISTINCT visitor_ip) as unique_visitors
      FROM portfolio_analytics 
      WHERE portfolio_id = ${params.id} AND device_type IS NOT NULL
      GROUP BY device_type
      ORDER BY views DESC
    `

    // Get browser breakdown
    const browserBreakdown = await sql`
      SELECT 
        browser,
        COUNT(*) as views,
        COUNT(DISTINCT visitor_ip) as unique_visitors
      FROM portfolio_analytics 
      WHERE portfolio_id = ${params.id} AND browser IS NOT NULL
      GROUP BY browser
      ORDER BY views DESC
      LIMIT 10
    `

    // Get daily views for the last 30 days
    const dailyViews = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as views,
        COUNT(DISTINCT visitor_ip) as unique_visitors
      FROM portfolio_analytics 
      WHERE portfolio_id = ${params.id} 
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `

    // Get recent views
    const recentViews = await sql`
      SELECT 
        visitor_ip,
        user_agent,
        referrer,
        country,
        city,
        device_type,
        browser,
        os,
        session_duration,
        pages_viewed,
        created_at
      FROM portfolio_analytics 
      WHERE portfolio_id = ${params.id}
      ORDER BY created_at DESC
      LIMIT 50
    `

    return NextResponse.json({
      success: true,
      analytics: {
        summary: summary[0] || {
          total_views: 0,
          unique_visitors: 0,
          avg_session_duration: 0,
          avg_pages_viewed: 0,
          views_last_7_days: 0,
          views_last_30_days: 0,
          views_last_90_days: 0,
        },
        topCountries,
        topCities,
        deviceBreakdown,
        browserBreakdown,
        dailyViews,
        recentViews,
      },
    })
  } catch (error) {
    console.error("Error fetching portfolio analytics:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
  }
}
