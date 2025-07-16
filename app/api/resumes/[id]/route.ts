import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const result = await sql`
      SELECT * FROM resumes 
      WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      resume: result[0],
    })
  } catch (error) {
    console.error("Error fetching resume:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch resume" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { title, resumeData, isFavorite } = body

    console.log("Updating resume:", params.id, "for user:", user.id)
    console.log("Update data:", { title, isFavorite, hasResumeData: !!resumeData })

    // Check if resume exists and belongs to user
    const existingResume = await sql`
      SELECT * FROM resumes 
      WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (existingResume.length === 0) {
      console.log("Resume not found for user")
      return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 })
    }

    // Update resume with only the provided fields
    const result = await sql`
      UPDATE resumes
      SET 
        title = COALESCE(${title}, title),
        resume_data = COALESCE(${resumeData ? JSON.stringify(resumeData) : null}, resume_data),
        is_favorite = COALESCE(${isFavorite}, is_favorite),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id} AND user_id = ${user.id}
      RETURNING id, title, resume_data, is_favorite, created_at, updated_at
    `

    console.log("Resume updated successfully")

    return NextResponse.json({
      success: true,
      resume: result[0],
    })
  } catch (error) {
    console.error("Error updating resume:", error)
    return NextResponse.json({ success: false, error: "Failed to update resume" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const result = await sql`
      DELETE FROM resumes
      WHERE id = ${params.id} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting resume:", error)
    return NextResponse.json({ success: false, error: "Failed to delete resume" }, { status: 500 })
  }
}
