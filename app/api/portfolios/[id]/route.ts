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

    const result = await sql`
      SELECT 
        p.*,
        COALESCE(pas.total_views, 0) as total_views,
        COALESCE(pas.unique_visitors, 0) as unique_visitors,
        COALESCE(pas.views_last_7_days, 0) as views_last_7_days,
        COALESCE(pas.views_last_30_days, 0) as views_last_30_days,
        COALESCE(pas.avg_session_duration, 0) as avg_session_duration,
        COALESCE(pas.avg_pages_viewed, 0) as avg_pages_viewed
      FROM portfolios p
      LEFT JOIN portfolio_analytics_summary pas ON p.id = pas.portfolio_id
      WHERE p.id = ${params.id} AND p.user_id = ${user.id}
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Portfolio not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      portfolio: result[0],
    })
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch portfolio" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { title, description, theme, isPublished } = await request.json()

    const result = await sql`
      UPDATE portfolios
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        theme = COALESCE(${theme}, theme),
        is_published = COALESCE(${isPublished}, is_published),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id} AND user_id = ${user.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Portfolio not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      portfolio: result[0],
    })
  } catch (error) {
    console.error("Error updating portfolio:", error)
    return NextResponse.json({ success: false, error: "Failed to update portfolio" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const result = await sql`
      DELETE FROM portfolios
      WHERE id = ${params.id} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Portfolio not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Portfolio deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting portfolio:", error)
    return NextResponse.json({ success: false, error: "Failed to delete portfolio" }, { status: 500 })
  }
}
