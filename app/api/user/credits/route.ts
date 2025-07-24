import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get or create user credits
    let credits = await sql`
      SELECT remaining_credits, used_credits, purchased_credits, reset_date
      FROM user_credits
      WHERE user_id = ${user.id}
    `

    if (credits.length === 0) {
      // Create default credits for new user
      await sql`
        INSERT INTO user_credits (user_id, remaining_credits, reset_date)
        VALUES (${user.id}, 20, ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()})
      `

      credits = await sql`
        SELECT remaining_credits, used_credits, purchased_credits, reset_date
        FROM user_credits
        WHERE user_id = ${user.id}
      `
    }

    const userCredits = credits[0]
    const resetDate = new Date(userCredits.reset_date)
    const now = new Date()

    // Check if credits should be reset
    if (now >= resetDate) {
      const nextResetDate = new Date(resetDate)
      nextResetDate.setMonth(nextResetDate.getMonth() + 1)

      await sql`
        UPDATE user_credits
        SET remaining_credits = 20, used_credits = 0, reset_date = ${nextResetDate.toISOString()}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${user.id}
      `

      return NextResponse.json({
        remaining_credits: 20,
        used_credits: 0,
        purchased_credits: userCredits.purchased_credits,
        reset_date: nextResetDate.toISOString(),
        days_until_reset: Math.ceil((nextResetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      })
    }

    const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      remaining_credits: userCredits.remaining_credits,
      used_credits: userCredits.used_credits,
      purchased_credits: userCredits.purchased_credits,
      reset_date: userCredits.reset_date,
      days_until_reset: Math.max(0, daysUntilReset),
    })
  } catch (error) {
    console.error("Error fetching user credits:", error)
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 })
  }
}
