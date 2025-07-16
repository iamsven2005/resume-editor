import { type NextRequest, NextResponse } from "next/server"
import { createUser, generateToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const result = await createUser(email, password, name)

    if (!result.success || !result.user) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    const token = generateToken(result.user.id)
    const cookieStore = cookies()

    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({
      success: true,
      user: result.user,
      token,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, error: "Signup failed" }, { status: 500 })
  }
}
