import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const [topic] = await sql`
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
      WHERE slug = ${params.slug}
    `

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: topic.id,
      slug: topic.slug,
      name: topic.name,
      description: topic.description || "",
      memberCount: topic.member_count || 0,
      created_at: topic.created_at,
    })
  } catch (error) {
    console.error("Error fetching topic:", error)
    return NextResponse.json({ error: "Failed to fetch topic" }, { status: 500 })
  }
}
