import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const resumes = await sql`
      SELECT id, title, resume_data, is_favorite, created_at, updated_at
      FROM resumes 
      WHERE user_id = ${user.id}
      ORDER BY updated_at DESC
    `

    return NextResponse.json({
      success: true,
      resumes: resumes,
    })
  } catch (error) {
    console.error("Error fetching resumes:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch resumes" }, { status: 500 })
  }
}
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { title, resumeData } = body

    if (!title || !resumeData) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and resume data are required",
        },
        { status: 400 },
      )
    }
    // Check if user has credits
    const credits = await sql`
      SELECT remaining_credits FROM user_credits WHERE user_id = ${user.id}
    `

    if (credits.length === 0 || credits[0].remaining_credits <= 0) {
      return NextResponse.json(
        {
          error: "Insufficient credits. Please purchase more credits or wait for monthly reset.",
        },
        { status: 402 },
      )
    }

    const result = await sql`
      INSERT INTO resumes (user_id, title, resume_data, is_favorite, created_at, updated_at)
      VALUES (${user.id}, ${title}, ${JSON.stringify(resumeData)}, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, title, resume_data, is_favorite, created_at, updated_at
    `

    return NextResponse.json({
      success: true,
      resume: result[0],
    })
  } catch (error) {
    console.error("Error creating resume:", error)
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 })
  }
}
