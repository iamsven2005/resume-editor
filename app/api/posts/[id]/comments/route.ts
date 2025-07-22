import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const comments = await sql`
      SELECT 
        id,
        post_id,
        parent_comment_id,
        content,
        author_name,
        vote_score,
        created_at
      FROM comments 
      WHERE post_id = ${params.id}
      ORDER BY created_at ASC
    `

    // Organize comments with replies
    const commentMap = new Map()
    const topLevelComments = []

    // First pass: create all comment objects
    comments.forEach((comment) => {
      const formattedComment = {
        id: comment.id,
        post_id: comment.post_id,
        parent_comment_id: comment.parent_comment_id || undefined,
        content: comment.content,
        author_name: comment.author_name || "unknown",
        vote_score: comment.vote_score || 0,
        created_at: comment.created_at,
        replies: [],
      }
      commentMap.set(comment.id, formattedComment)
    })

    // Second pass: organize hierarchy
    comments.forEach((comment) => {
      const formattedComment = commentMap.get(comment.id)
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id)
        if (parent) {
          parent.replies.push(formattedComment)
        }
      } else {
        topLevelComments.push(formattedComment)
      }
    })

    return NextResponse.json(topLevelComments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { content, parent_comment_id } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // TODO: Get current user from auth context
    const authorName = "unknown" // Default for now

    const [comment] = await sql`
      INSERT INTO comments (post_id, parent_comment_id, content, author_name)
      VALUES (${params.id}, ${parent_comment_id || null}, ${content}, ${authorName})
      RETURNING *
    `

    // Update comment count on the post
    await sql`
      UPDATE posts 
      SET comment_count = comment_count + 1 
      WHERE id = ${params.id}
    `

    return NextResponse.json({
      id: comment.id,
      post_id: comment.post_id,
      parent_comment_id: comment.parent_comment_id || undefined,
      content: comment.content,
      author_name: comment.author_name || "unknown",
      vote_score: comment.vote_score || 0,
      created_at: comment.created_at,
      replies: [],
    })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
