import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET() {
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
      const resetDate = new Date()
      resetDate.setMonth(resetDate.getMonth() + 1)

      await sql`
        INSERT INTO user_credits (user_id, remaining_credits, used_credits, purchased_credits, reset_date)
        VALUES (${user.id}, 20, 0, 0, ${resetDate.toISOString().split("T")[0]})
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

      // Fetch updated credits
      const updatedCredits = await sql`
        SELECT remaining_credits, used_credits, purchased_credits, reset_date
        FROM user_credits
        WHERE user_id = ${user.id}
      `

      const updated = updatedCredits[0]
      const daysUntilReset = Math.ceil((new Date(updated.reset_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      return NextResponse.json({
        remaining_credits: updated.remaining_credits,
        used_credits: updated.used_credits,
        purchased_credits: updated.purchased_credits,
        reset_date: updated.reset_date,
        days_until_reset: Math.max(0, daysUntilReset),
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
    console.error("Error fetching credits:", error)
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 })
  }
}
