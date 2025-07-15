import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_NEON_DATABASE_URL!)

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { is_published } = await request.json()

    const result = await sql`
      UPDATE portfolios
      SET 
        is_published = ${is_published},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id} AND user_id = ${user.id}
      RETURNING id, title, description, theme, is_published, portfolio_url, created_at, updated_at
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Portfolio not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      portfolio: result[0],
    })
  } catch (error) {
    console.error("Error updating portfolio publish status:", error)
    return NextResponse.json({ success: false, error: "Failed to update portfolio" }, { status: 500 })
  }
}
