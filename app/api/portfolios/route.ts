import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const portfolios = await sql`
      SELECT id, title, description, theme, resume_data, is_published, portfolio_url, 
             total_views, unique_visitors, views_last_7_days, views_last_30_days, 
             created_at, updated_at
      FROM portfolios 
      WHERE user_id = ${user.id}
      ORDER BY updated_at DESC
    `

    return NextResponse.json({
      success: true,
      portfolios: portfolios,
    })
  } catch (error) {
    console.error("Error fetching portfolios:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch portfolios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, theme, resumeData } = body

    if (!title || !resumeData) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and resume data are required",
        },
        { status: 400 },
      )
    }

    // Generate a unique URL slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    const timestamp = Date.now().toString(36)
    const portfolioUrl = `${baseSlug}-${timestamp}`

    const result = await sql`
      INSERT INTO portfolios (
        user_id, title, description, theme, resume_data, is_published, 
        portfolio_url, total_views, unique_visitors, views_last_7_days, 
        views_last_30_days, created_at, updated_at
      )
      VALUES (
        ${user.id}, ${title}, ${description || null}, ${theme}, ${JSON.stringify(resumeData)}, 
        false, ${portfolioUrl}, 0, 0, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING id, title, description, theme, resume_data, is_published, portfolio_url, 
                total_views, unique_visitors, views_last_7_days, views_last_30_days, 
                created_at, updated_at
    `

    return NextResponse.json({
      success: true,
      portfolio: result[0],
    })
  } catch (error) {
    console.error("Error creating portfolio:", error)
    return NextResponse.json({ success: false, error: "Failed to create portfolio" }, { status: 500 })
  }
}
