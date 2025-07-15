import { type NextRequest, NextResponse } from "next/server"
import { del } from "@vercel/blob"
import { verifyToken } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { pathname: string } }) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const pathname = decodeURIComponent(params.pathname)

    // Ensure user can only delete their own files
    if (!pathname.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await del(pathname)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }
}
