import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET() {
  try {
    const topics = await sql`
      SELECT 
        id,
        slug,
        name,
        description,
        created_at,
        (
          SELECT COUNT(*)::int 
          FROM posts 
          WHERE posts.topic_id = topics.id
        ) as member_count
      FROM topics 
      ORDER BY created_at DESC
    `

    const formattedTopics = topics.map((topic) => ({
      id: topic.id,
      slug: topic.slug,
      name: topic.name,
      description: topic.description || "",
      memberCount: topic.member_count || 0,
      created_at: topic.created_at,
    }))

    return NextResponse.json(formattedTopics)
  } catch (error) {
    console.error("Error fetching topics:", error)
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, slug, description } = await request.json()

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    const [topic] = await sql`
      INSERT INTO topics (name, slug, description)
      VALUES (${name}, ${slug}, ${description || ""})
      RETURNING *
    `

    return NextResponse.json({
      id: topic.id,
      slug: topic.slug,
      name: topic.name,
      description: topic.description || "",
      memberCount: 0,
      created_at: topic.created_at,
    })
  } catch (error) {
    console.error("Error creating topic:", error)
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 })
  }
}
