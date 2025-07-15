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
      SELECT id FROM portfolios WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (portfolio.length === 0) {
      return NextResponse.json({ success: false, error: "Portfolio not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    // Get detailed analytics
    const analytics = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as views,
        COUNT(DISTINCT visitor_ip) as unique_visitors,
        AVG(session_duration) as avg_session_duration,
        COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) as mobile_views,
        COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) as desktop_views,
        COUNT(CASE WHEN device_type = 'tablet' THEN 1 END) as tablet_views
      FROM portfolio_analytics
      WHERE portfolio_id = ${params.id} 
        AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `

    // Get top countries
    const topCountries = await sql`
      SELECT 
        country,
        COUNT(*) as views,
        COUNT(DISTINCT visitor_ip) as unique_visitors
      FROM portfolio_analytics
      WHERE portfolio_id = ${params.id} 
        AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
        AND country IS NOT NULL
      GROUP BY country
      ORDER BY views DESC
      LIMIT 10
    `

    // Get top browsers
    const topBrowsers = await sql`
      SELECT 
        browser,
        COUNT(*) as views
      FROM portfolio_analytics
      WHERE portfolio_id = ${params.id} 
        AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
        AND browser IS NOT NULL
      GROUP BY browser
      ORDER BY views DESC
      LIMIT 10
    `

    // Get referrers
    const topReferrers = await sql`
      SELECT 
        referrer,
        COUNT(*) as views
      FROM portfolio_analytics
      WHERE portfolio_id = ${params.id} 
        AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
        AND referrer IS NOT NULL
        AND referrer != ''
      GROUP BY referrer
      ORDER BY views DESC
      LIMIT 10
    `

    return NextResponse.json({
      success: true,
      analytics: {
        daily: analytics,
        topCountries,
        topBrowsers,
        topReferrers,
      },
    })
  } catch (error) {
    console.error("Error fetching portfolio analytics:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // This endpoint is for tracking visits (can be called without authentication)
    const { visitorIp, userAgent, referrer, country, city, deviceType, browser, os, sessionDuration, pagesViewed } =
      await request.json()

    // Verify portfolio exists and is published
    const portfolio = await sql`
      SELECT id FROM portfolios WHERE id = ${params.id} AND is_published = true
    `

    if (portfolio.length === 0) {
      return NextResponse.json({ success: false, error: "Portfolio not found or not published" }, { status: 404 })
    }

    await sql`
      INSERT INTO portfolio_analytics (
        portfolio_id, visitor_ip, user_agent, referrer, country, city, 
        device_type, browser, os, session_duration, pages_viewed
      )
      VALUES (
        ${params.id}, ${visitorIp}, ${userAgent}, ${referrer}, ${country}, ${city},
        ${deviceType}, ${browser}, ${os}, ${sessionDuration || 0}, ${pagesViewed || 1}
      )
    `

    return NextResponse.json({
      success: true,
      message: "Analytics recorded",
    })
  } catch (error) {
    console.error("Error recording analytics:", error)
    return NextResponse.json({ success: false, error: "Failed to record analytics" }, { status: 500 })
  }
}
