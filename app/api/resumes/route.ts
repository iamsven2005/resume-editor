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

    // Check user credits before creating resume
    const credits = await sql`
      SELECT remaining_credits, reset_date
      FROM user_credits 
      WHERE user_id = ${user.id}
    `

    if (credits.length === 0) {
      // Create default credits for new user
      const resetDate = new Date()
      resetDate.setMonth(resetDate.getMonth() + 1)

      await sql`
        INSERT INTO user_credits (user_id, remaining_credits, used_credits, purchased_credits, reset_date)
        VALUES (${user.id}, 20, 0, 0, ${resetDate.toISOString().split("T")[0]})
      `
    } else {
      const userCredits = credits[0]
      const resetDate = new Date(userCredits.reset_date)
      const now = new Date()

      // Check if credits should be reset (monthly)
      if (now >= resetDate) {
        const nextResetDate = new Date(resetDate)
        nextResetDate.setMonth(nextResetDate.getMonth() + 1)

        await sql`
          UPDATE user_credits 
          SET remaining_credits = 20, 
              used_credits = 0,
              reset_date = ${nextResetDate.toISOString().split("T")[0]},
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${user.id}
        `
      } else if (userCredits.remaining_credits <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: "No resume credits remaining. Please wait for next month or purchase more credits.",
            needsCredits: true,
          },
          { status: 402 },
        )
      }
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

    // Create the resume
    const result = await sql`
      INSERT INTO resumes (user_id, title, resume_data, is_favorite, created_at, updated_at)
      VALUES (${user.id}, ${title}, ${JSON.stringify(resumeData)}, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, title, resume_data, is_favorite, created_at, updated_at
    `

    // Consume one credit
    await sql`
      UPDATE user_credits 
      SET remaining_credits = remaining_credits - 1,
          used_credits = used_credits + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${user.id}
    `

    return NextResponse.json({
      success: true,
      resume: result[0],
    })
  } catch (error) {
    console.error("Error creating resume:", error)
    return NextResponse.json({ success: false, error: "Failed to create resume" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: "Resume IDs are required" }, { status: 400 })
    }

    // Delete multiple resumes
    const result = await sql`
      DELETE FROM resumes
      WHERE id = ANY(${ids}) AND user_id = ${user.id}
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      deletedCount: result.length,
      message: `${result.length} resume(s) deleted successfully`,
    })
  } catch (error) {
    console.error("Error deleting resumes:", error)
    return NextResponse.json({ success: false, error: "Failed to delete resumes" }, { status: 500 })
  }
}
