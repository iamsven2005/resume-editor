import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resumes = await sql`
      SELECT id, name, data, created_at, updated_at
      FROM resumes
      WHERE user_id = ${user.id}
      ORDER BY updated_at DESC
    `

    return NextResponse.json({ resumes })
  } catch (error) {
    console.error("Error fetching resumes:", error)
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    const { name, data } = await request.json()

    if (!name || !data) {
      return NextResponse.json({ error: "Name and data are required" }, { status: 400 })
    }

    // Create resume
    const resume = await sql`
      INSERT INTO resumes (user_id, name, data)
      VALUES (${user.id}, ${name}, ${JSON.stringify(data)})
      RETURNING id, name, data, created_at, updated_at
    `

    // Consume credit
    await sql`
      UPDATE user_credits
      SET remaining_credits = remaining_credits - 1,
          used_credits = used_credits + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${user.id}
    `

    return NextResponse.json({ resume: resume[0] })
  } catch (error) {
    console.error("Error creating resume:", error)
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 })
  }
}
