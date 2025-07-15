import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const result = await sql`
      SELECT * FROM resumes 
      WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    return NextResponse.json({ resume: result[0] })
  } catch (error) {
    console.error("Error fetching resume:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { title, resumeData, isFavorite } = body

    // Check if resume exists and belongs to user
    const existingResume = await sql`
      SELECT * FROM resumes 
      WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (existingResume.length === 0) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    // Update resume
    const updateFields: any = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) {
      updateFields.title = title
    }

    if (resumeData !== undefined) {
      updateFields.resume_data = JSON.stringify(resumeData)
    }

    if (isFavorite !== undefined) {
      updateFields.is_favorite = isFavorite
    }

    const result = await sql`
      UPDATE resumes 
      SET 
        title = COALESCE(${updateFields.title}, title),
        resume_data = COALESCE(${updateFields.resume_data}, resume_data),
        is_favorite = COALESCE(${updateFields.is_favorite}, is_favorite),
        updated_at = ${updateFields.updated_at}
      WHERE id = ${params.id} AND user_id = ${user.id}
      RETURNING *
    `

    return NextResponse.json({
      message: "Resume updated successfully",
      resume: result[0],
    })
  } catch (error) {
    console.error("Error updating resume:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Check if resume exists and belongs to user
    const existingResume = await sql`
      SELECT * FROM resumes 
      WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (existingResume.length === 0) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    // Delete the resume
    await sql`
      DELETE FROM resumes 
      WHERE id = ${params.id} AND user_id = ${user.id}
    `

    return NextResponse.json({ message: "Resume deleted successfully" })
  } catch (error) {
    console.error("Error deleting resume:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
