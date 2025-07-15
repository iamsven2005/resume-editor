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
    const portfolio = await sql`
      SELECT id FROM portfolios
      WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (portfolio.length === 0) {
      return NextResponse.json({ success: false, error: "Portfolio not found" }, { status: 404 })
    }

    // Get detailed analytics
    const analytics = await sql`
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
      LIMIT 1000
    `

    // Get summary statistics
    const summary = await sql`
      SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT visitor_ip) as unique_visitors,
        AVG(session_duration) as avg_session_duration,
        AVG(pages_viewed) as avg_pages_viewed,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as views_last_7_days,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as views_last_30_days,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as views_last_90_days
      FROM portfolio_analytics
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

    return NextResponse.json({
      success: true,
      analytics: {
        summary: summary[0] || {},
        topCountries,
        topCities,
        deviceBreakdown,
        browserBreakdown,
        dailyViews,
        recentViews: analytics.slice(0, 50), // Last 50 views
      },
    })
  } catch (error) {
    console.error("Error fetching portfolio analytics:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { visitorIp, userAgent, referrer, country, city, deviceType, browser, os } = await request.json()

    // Check if portfolio exists and is published
    const portfolio = await sql`
      SELECT id FROM portfolios
      WHERE id = ${params.id} AND is_published = true
    `

    if (portfolio.length === 0) {
      return NextResponse.json({ success: false, error: "Portfolio not found or not published" }, { status: 404 })
    }

    // Record the analytics event
    await sql`
      INSERT INTO portfolio_analytics (
        portfolio_id, visitor_ip, user_agent, referrer, country, city, 
        device_type, browser, os
      )
      VALUES (
        ${params.id}, ${visitorIp}, ${userAgent}, ${referrer}, ${country}, ${city},
        ${deviceType}, ${browser}, ${os}
      )
    `

    return NextResponse.json({
      success: true,
      message: "Analytics recorded successfully",
    })
  } catch (error) {
    console.error("Error recording analytics:", error)
    return NextResponse.json({ success: false, error: "Failed to record analytics" }, { status: 500 })
  }
}
