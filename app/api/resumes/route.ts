import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET() {
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

    // Check if resume with same title already exists for this user
    const existingResume = await sql`
      SELECT id FROM resumes 
      WHERE user_id = ${user.id} AND title = ${title}
    `

    if (existingResume.length > 0) {
      // Update existing resume
      const result = await sql`
        UPDATE resumes 
        SET resume_data = ${JSON.stringify(resumeData)}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingResume[0].id}
        RETURNING *
      `

      return NextResponse.json({
        success: true,
        resume: result[0],
        message: "Resume updated successfully",
      })
    } else {
      // Create new resume
      const result = await sql`
        INSERT INTO resumes (user_id, title, resume_data, is_favorite, created_at, updated_at)
        VALUES (${user.id}, ${title}, ${JSON.stringify(resumeData)}, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `

      return NextResponse.json({
        success: true,
        resume: result[0],
        message: "Resume created successfully",
      })
    }
  } catch (error) {
    console.error("Error saving resume:", error)
    return NextResponse.json({ success: false, error: "Failed to save resume" }, { status: 500 })
  }
}
