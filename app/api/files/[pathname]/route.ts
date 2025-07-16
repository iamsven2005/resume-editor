import { type NextRequest, NextResponse } from "next/server"
import { del } from "@vercel/blob"
import { getUserFromToken } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { pathname: string } }) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const pathname = decodeURIComponent(params.pathname)

    // Verify the file belongs to the user
    if (!pathname.startsWith(`user-${user.id}/`)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await del(pathname)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }
}
