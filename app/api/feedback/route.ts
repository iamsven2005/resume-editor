import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"

const sql = neon(process.en.NEON_DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, description, browser_info, user_agent, url } = body

    if (!type || !title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["bug", "feature"].includes(type)) {
      return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO feedback (user_id, type, title, description, browser_info, user_agent, url)
      VALUES (${decoded.userId}, ${type}, ${title}, ${description}, ${browser_info || null}, ${user_agent || null}, ${url || null})
      RETURNING *
    `

    return NextResponse.json({ feedback: result[0] })
  } catch (error) {
    console.error("Error creating feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    let query = `SELECT * FROM feedback WHERE user_id = ${decoded.userId}`

    if (type && ["bug", "feature"].includes(type)) {
      query += ` AND type = '${type}'`
    }

    if (status && ["open", "in_progress", "resolved", "closed"].includes(status)) {
      query += ` AND status = '${status}'`
    }

    query += ` ORDER BY created_at DESC`

    const feedback = await sql(query)

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
