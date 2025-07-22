import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const user = token ? await verifyToken(token) : null

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { targetId, targetType, direction } = body

    if (!targetId || !targetType || !direction) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (targetType === "job") {
      // Record job swipe
      await sql`
        INSERT INTO job_swipes (user_id, job_id, swipe_direction)
        VALUES (${user.id}, ${targetId}, ${direction})
        ON CONFLICT (user_id, job_id) 
        DO UPDATE SET swipe_direction = ${direction}, created_at = CURRENT_TIMESTAMP
      `

      // If right swipe or super like, create application
      if (direction === "right" || direction === "up") {
        await sql`
          INSERT INTO job_applications (job_id, applicant_id, status)
          VALUES (${targetId}, ${user.id}, 'pending')
          ON CONFLICT (job_id, applicant_id) DO NOTHING
        `
      }
    } else if (targetType === "user") {
      // Record user swipe
      await sql`
        INSERT INTO user_swipes (swiper_id, swiped_user_id, swipe_direction)
        VALUES (${user.id}, ${targetId}, ${direction})
        ON CONFLICT (swiper_id, swiped_user_id) 
        DO UPDATE SET swipe_direction = ${direction}, created_at = CURRENT_TIMESTAMP
      `

      // Check for mutual match if right swipe or super like
      if (direction === "right" || direction === "up") {
        const [mutualSwipe] = await sql`
          SELECT * FROM user_swipes 
          WHERE swiper_id = ${targetId} 
          AND swiped_user_id = ${user.id} 
          AND swipe_direction IN ('right', 'up')
        `

        if (mutualSwipe) {
          return NextResponse.json({
            success: true,
            match: true,
            message: "It's a mutual match!",
          })
        }
      }
    }

    return NextResponse.json({ success: true, match: false })
  } catch (error) {
    console.error("Error recording swipe:", error)
    return NextResponse.json({ error: "Failed to record swipe" }, { status: 500 })
  }
}
