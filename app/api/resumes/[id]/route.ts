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

    // Build the update query dynamically based on provided fields
    const updateFields = []
    const updateValues = []

    if (title !== undefined) {
      updateFields.push("title = $" + (updateValues.length + 1))
      updateValues.push(title)
    }

    if (resumeData !== undefined) {
      updateFields.push("resume_data = $" + (updateValues.length + 1))
      updateValues.push(JSON.stringify(resumeData))
    }

    if (isFavorite !== undefined) {
      updateFields.push("is_favorite = $" + (updateValues.length + 1))
      updateValues.push(isFavorite)
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP")

    if (updateFields.length === 1) {
      // Only timestamp update
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 })
    }

    // Add WHERE conditions
    updateValues.push(params.id, user.id)
    const whereClause = `WHERE id = $${updateValues.length - 1} AND user_id = $${updateValues.length}`

    const query = `
      UPDATE resumes 
      SET ${updateFields.join(", ")}
      ${whereClause}
      RETURNING *
    `

    const result = await sql.unsafe(query, updateValues)

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 })
    }

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
