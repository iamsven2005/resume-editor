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

    // Verify portfolio belongs to user
    const portfolio = await sql`
      SELECT id FROM portfolios 
      WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (portfolio.length === 0) {
      return NextResponse.json({ success: false, error: "Portfolio not found" }, { status: 404 })
    }

    // Get analytics data
    const analytics = await sql`
      SELECT 
        view_date,
        view_count,
        user_agent
      FROM portfolio_analytics 
      WHERE portfolio_id = ${params.id}
      ORDER BY view_date DESC
      LIMIT 30
    `

    // Get portfolio stats
    const stats = await sql`
      SELECT 
        total_views,
        unique_visitors,
        views_last_7_days,
        views_last_30_days
      FROM portfolios 
      WHERE id = ${params.id}
    `

    return NextResponse.json({
      success: true,
      analytics: analytics,
      stats: stats[0] || {
        total_views: 0,
        unique_visitors: 0,
        views_last_7_days: 0,
        views_last_30_days: 0,
      },
    })
  } catch (error) {
    console.error("Error fetching portfolio analytics:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
  }
}
