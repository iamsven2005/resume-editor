import { NextResponse } from "next/server"
import { getCurrentUser, generateToken } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const token = generateToken(user.id)

    return NextResponse.json({
      success: true,
      user,
      token,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 })
  }
}
