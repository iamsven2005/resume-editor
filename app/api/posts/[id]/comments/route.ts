import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get all comments for this post
    const comments = await sql`
      SELECT * FROM comments 
      WHERE post_id = ${id}
      ORDER BY created_at ASC
    `

    // Organize comments with replies
    const topLevelComments = comments.filter((comment) => !comment.parent_comment_id)
    const repliesMap = new Map()

    comments
      .filter((comment) => comment.parent_comment_id)
      .forEach((reply) => {
        const parentId = reply.parent_comment_id
        if (!repliesMap.has(parentId)) {
          repliesMap.set(parentId, [])
        }
        repliesMap.get(parentId).push(reply)
      })

    const organizedComments = topLevelComments.map((comment) => ({
      ...comment,
      replies: repliesMap.get(comment.id) || [],
    }))

    return NextResponse.json({ comments: organizedComments })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { content, author_name, parent_comment_id } = await request.json()

    if (!content || !author_name) {
      return NextResponse.json({ error: "Content and author name are required" }, { status: 400 })
    }

    const [comment] = await sql`
      INSERT INTO comments (post_id, content, author_name, parent_comment_id)
      VALUES (${id}, ${content}, ${author_name}, ${parent_comment_id})
      RETURNING *
    `

    // Update comment count on the post
    await sql`
      UPDATE posts 
      SET comment_count = comment_count + 1 
      WHERE id = ${id}
    `

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
