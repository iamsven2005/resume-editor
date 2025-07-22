import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const excludeUserId = searchParams.get("excludeUserId")
    const userType = searchParams.get("userType") || "seeker"

    let query = `
      SELECT 
        u.*,
        COALESCE(
          json_agg(
            CASE WHEN us.skill_id IS NOT NULL THEN
              json_build_object(
                'skill', json_build_object(
                  'id', s.id,
                  'name', s.name,
                  'category', s.category
                ),
                'proficiency', us.proficiency,
                'yearsExperience', us.years_experience
              )
            END
          ) FILTER (WHERE us.skill_id IS NOT NULL), '[]'
        ) as skills
      FROM users u
      LEFT JOIN user_skills us ON u.id = us.user_id
      LEFT JOIN skills s ON us.skill_id = s.id
      WHERE (u.user_type = $1 OR u.user_type = 'both')
    `

    const params: any[] = [userType]

    if (excludeUserId) {
      query += ` AND u.id != $${params.length + 1}`
      params.push(excludeUserId)
    }

    query += `
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `

    const users = await sql(query, params)

    // Transform the data to match the frontend interface
    const transformedUsers = users.map((user: any) => ({
      id: user.id,
      firstName: user.first_name || "Unknown",
      lastName: user.last_name || "User",
      email: user.email,
      avatarUrl: user.avatar_url,
      bio: user.bio || "",
      location: user.location || "",
      userType: user.user_type || "seeker",
      skills: user.skills || [],
      isActive: true,
    }))

    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
