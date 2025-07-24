import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

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

    return NextResponse.json(resumes)
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

    // Check user credits before creating resume
    const credits = await sql`
      SELECT remaining_credits, reset_date
      FROM user_credits
      WHERE user_id = ${user.id}
    `

    if (credits.length === 0) {
      // Create default credits for new user
      await sql`
        INSERT INTO user_credits (user_id, remaining_credits, reset_date)
        VALUES (${user.id}, 20, ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()})
      `
    } else {
      const userCredits = credits[0]
      const resetDate = new Date(userCredits.reset_date)
      const now = new Date()

      // Check if credits should be reset
      if (now >= resetDate) {
        const nextResetDate = new Date(resetDate)
        nextResetDate.setMonth(nextResetDate.getMonth() + 1)

        await sql`
          UPDATE user_credits
          SET remaining_credits = 20, used_credits = 0, reset_date = ${nextResetDate.toISOString()}
          WHERE user_id = ${user.id}
        `
      } else if (userCredits.remaining_credits <= 0) {
        return NextResponse.json(
          {
            error: "Insufficient credits",
            message:
              "You have no remaining resume credits. Please wait for your monthly reset or purchase more credits.",
            credits_remaining: 0,
          },
          { status: 402 },
        )
      }
    }

    const { name, data } = await request.json()

    if (!name || !data) {
      return NextResponse.json({ error: "Name and data are required" }, { status: 400 })
    }

    // Create the resume
    const result = await sql`
      INSERT INTO resumes (user_id, name, data)
      VALUES (${user.id}, ${name}, ${JSON.stringify(data)})
      RETURNING id, name, data, created_at, updated_at
    `

    // Consume one credit
    await sql`
      UPDATE user_credits
      SET remaining_credits = remaining_credits - 1,
          used_credits = used_credits + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${user.id}
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating resume:", error)
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 })
  }
}
