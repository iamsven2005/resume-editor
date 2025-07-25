import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_DATABASE_URL!)

export async function GET() {
  try {
    const topics = await sql`
      SELECT 
        id,
        name,
        slug,
        description,
        created_by,
        created_at,
        (SELECT COUNT(*) FROM posts WHERE topic_id = topics.id) as post_count
      FROM topics 
      ORDER BY created_at DESC
    `

    const formattedTopics = topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
      created_by: topic.created_by,
      created_at: topic.created_at,
      post_count: Number(topic.post_count) || 0,
    }))

    return NextResponse.json(formattedTopics)
  } catch (error) {
    console.error("Error fetching topics:", error)
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Get current user
    const currentUser = await getCurrentUser()
    const createdBy = currentUser ? currentUser.name || currentUser.email : "anonymous"

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const [topic] = await sql`
      INSERT INTO topics (name, slug, description, created_by)
      VALUES (${name}, ${slug}, ${description || null}, ${createdBy})
      RETURNING *
    `

    return NextResponse.json({
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
      created_by: topic.created_by,
      created_at: topic.created_at,
      post_count: 0,
    })
  } catch (error) {
    console.error("Error creating topic:", error)
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 })
  }
}
