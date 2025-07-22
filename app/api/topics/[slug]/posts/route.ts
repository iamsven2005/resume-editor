import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get("sort") || "created_at"
    const order = searchParams.get("order") || "desc"

    // First get the topic
    const [topic] = await sql`
      SELECT id FROM topics WHERE slug = ${slug}
    `

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    // Get posts for this topic
    let orderClause = "ORDER BY created_at DESC"
    if (sortBy === "vote_score") {
      orderClause = `ORDER BY vote_score ${order.toUpperCase()}, created_at DESC`
    } else if (sortBy === "comment_count") {
      orderClause = `ORDER BY comment_count ${order.toUpperCase()}, created_at DESC`
    }

    const posts = await sql`
      SELECT * FROM posts 
      WHERE topic_id = ${topic.id}
      ${sql.unsafe(orderClause)}
    `

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const { title, content, url, post_type, author_name } = await request.json()

    if (!title || !author_name) {
      return NextResponse.json({ error: "Title and author name are required" }, { status: 400 })
    }

    // Get topic ID
    const [topic] = await sql`
      SELECT id FROM topics WHERE slug = ${slug}
    `

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    const [post] = await sql`
      INSERT INTO posts (topic_id, title, content, url, post_type, author_name)
      VALUES (${topic.id}, ${title}, ${content}, ${url}, ${post_type || "text"}, ${author_name})
      RETURNING *
    `

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
