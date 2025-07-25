import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_DATABASE_URL!)

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    // First get the topic ID
    const [topic] = await sql`
      SELECT id FROM topics WHERE slug = ${params.slug}
    `

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    const posts = await sql`
      SELECT 
        id,
        topic_id,
        title,
        content,
        url,
        post_type,
        author_name,
        vote_score,
        comment_count,
        created_at
      FROM posts 
      WHERE topic_id = ${topic.id}
      ORDER BY created_at DESC
    `

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      topic_id: post.topic_id,
      title: post.title,
      content: post.content || undefined,
      url: post.url || undefined,
      post_type: post.post_type || "text",
      author_name: post.author_name || "unknown",
      vote_score: post.vote_score || 0,
      comment_count: post.comment_count || 0,
      created_at: post.created_at,
    }))

    return NextResponse.json(formattedPosts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { title, content, url, post_type } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Get topic ID
    const [topic] = await sql`
      SELECT id FROM topics WHERE slug = ${params.slug}
    `

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    // Get current user
    const currentUser = await getCurrentUser()
    const authorName = currentUser ? currentUser.name || currentUser.email : "anonymous"

    const [post] = await sql`
      INSERT INTO posts (topic_id, title, content, url, post_type, author_name)
      VALUES (${topic.id}, ${title}, ${content || null}, ${url || null}, ${post_type || "text"}, ${authorName})
      RETURNING *
    `

    return NextResponse.json({
      id: post.id,
      topic_id: post.topic_id,
      title: post.title,
      content: post.content || undefined,
      url: post.url || undefined,
      post_type: post.post_type || "text",
      author_name: post.author_name || "unknown",
      vote_score: post.vote_score || 0,
      comment_count: post.comment_count || 0,
      created_at: post.created_at,
    })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
