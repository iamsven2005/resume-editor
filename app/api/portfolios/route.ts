import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const portfolios = await sql`
      SELECT id, title, description, theme, is_published, portfolio_url, created_at, updated_at
      FROM portfolios
      WHERE user_id = ${user.id}
      ORDER BY updated_at DESC
    `

    return NextResponse.json({
      success: true,
      portfolios,
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

    const { title, description, theme, resume_data } = await request.json()

    if (!title || !resume_data) {
      return NextResponse.json({ success: false, error: "Title and resume data are required" }, { status: 400 })
    }

    // Generate a unique portfolio URL
    const portfolioSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
    const portfolioUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/portfolio/${user.id}/${portfolioSlug}`

    const result = await sql`
      INSERT INTO portfolios (user_id, title, description, theme, resume_data, portfolio_url)
      VALUES (${user.id}, ${title}, ${description || ""}, ${theme || "modern"}, ${JSON.stringify(resume_data)}, ${portfolioUrl})
      RETURNING id, title, description, theme, is_published, portfolio_url, created_at, updated_at
    `

    const portfolio = {
      ...result[0],
      resume_data,
    }

    return NextResponse.json({
      success: true,
      portfolio,
    })
  } catch (error) {
    console.error("Error creating portfolio:", error)
    return NextResponse.json({ success: false, error: "Failed to create portfolio" }, { status: 500 })
  }
}
