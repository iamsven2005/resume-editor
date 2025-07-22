import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const user = token ? await verifyToken(token) : null

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, bio, location, userType, avatarUrl, skills } = body

    // Update user profile
    await sql`
      UPDATE users SET
        first_name = ${firstName},
        last_name = ${lastName},
        bio = ${bio},
        location = ${location},
        user_type = ${userType},
        avatar_url = ${avatarUrl},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `

    // Delete existing skills and add new ones
    await sql`DELETE FROM user_skills WHERE user_id = ${user.id}`

    if (skills && skills.length > 0) {
      for (const userSkill of skills) {
        await sql`
          INSERT INTO user_skills (user_id, skill_id, proficiency, years_experience)
          VALUES (${user.id}, ${userSkill.skill.id}, ${userSkill.proficiency}, ${userSkill.yearsExperience})
        `
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
