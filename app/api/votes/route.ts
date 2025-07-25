import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { target_id, target_type, vote_value } = await request.json()

    if (!target_id || !target_type || ![1, -1].includes(vote_value)) {
      return NextResponse.json({ error: "Invalid vote data" }, { status: 400 })
    }

    // Get current user
    const currentUser = await getCurrentUser()
    const userIdentifier = currentUser ? `user_${currentUser.id}` : "anonymous"

    // Check if user has already voted
    const [existingVote] = await sql`
      SELECT * FROM votes 
      WHERE user_identifier = ${userIdentifier} 
      AND target_id = ${target_id} 
      AND target_type = ${target_type}
    `

    let scoreDiff = 0

    if (existingVote) {
      if (existingVote.vote_value === vote_value) {
        // Remove vote (user clicked same vote again)
        await sql`
          DELETE FROM votes 
          WHERE user_identifier = ${userIdentifier} 
          AND target_id = ${target_id} 
          AND target_type = ${target_type}
        `
        scoreDiff = -vote_value
      } else {
        // Change vote
        await sql`
          UPDATE votes 
          SET vote_value = ${vote_value}
          WHERE user_identifier = ${userIdentifier} 
          AND target_id = ${target_id} 
          AND target_type = ${target_type}
        `
        scoreDiff = vote_value - existingVote.vote_value
      }
    } else {
      // New vote
      await sql`
        INSERT INTO votes (user_identifier, target_id, target_type, vote_value)
        VALUES (${userIdentifier}, ${target_id}, ${target_type}, ${vote_value})
      `
      scoreDiff = vote_value
    }

    // Update the vote score in the appropriate table
    if (target_type === "post") {
      await sql`
        UPDATE posts 
        SET vote_score = vote_score + ${scoreDiff}
        WHERE id = ${target_id}
      `
    } else if (target_type === "comment") {
      await sql`
        UPDATE comments 
        SET vote_score = vote_score + ${scoreDiff}
        WHERE id = ${target_id}
      `
    }

    return NextResponse.json({ success: true, scoreDiff })
  } catch (error) {
    console.error("Error processing vote:", error)
    return NextResponse.json({ error: "Failed to process vote" }, { status: 500 })
  }
}
