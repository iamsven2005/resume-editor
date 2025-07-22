import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let query = `
      SELECT 
        t.*,
        COUNT(p.id) as post_count,
        COALESCE(SUM(p.comment_count), 0) as total_comments
      FROM topics t
      LEFT JOIN posts p ON t.id = p.topic_id
    `

    const params: any[] = []

    if (search) {
      query += ` WHERE t.name ILIKE $1 OR t.description ILIKE $1`
      params.push(`%${search}%`)
    }

    query += ` GROUP BY t.id ORDER BY post_count DESC, t.created_at DESC`

    const topics = await sql(query, params)

    return NextResponse.json({ topics })
  } catch (error) {
    console.error("Error fetching topics:", error)
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, slug } = await request.json()

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    const [topic] = await sql`
      INSERT INTO topics (name, description, slug)
      VALUES (${name}, ${description}, ${slug})
      RETURNING *
    `

    return NextResponse.json({ topic })
  } catch (error) {
    console.error("Error creating topic:", error)
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 })
  }
}
