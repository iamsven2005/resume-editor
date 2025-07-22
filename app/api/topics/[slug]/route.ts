import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    const [topic] = await sql`
      SELECT 
        t.*,
        COUNT(p.id) as post_count,
        COALESCE(SUM(p.comment_count), 0) as total_comments
      FROM topics t
      LEFT JOIN posts p ON t.id = p.topic_id
      WHERE t.slug = ${slug}
      GROUP BY t.id
    `

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    return NextResponse.json({ topic })
  } catch (error) {
    console.error("Error fetching topic:", error)
    return NextResponse.json({ error: "Failed to fetch topic" }, { status: 500 })
  }
}
