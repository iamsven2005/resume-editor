import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadPromises = files.map(async (file) => {
      const filename = `${user.id}/${Date.now()}-${file.name}`

      const blob = await put(filename, file, {
        access: "public",
      })

      return {
        url: blob.url,
        pathname: blob.pathname,
        size: file.size,
        uploadedAt: new Date(),
        downloadUrl: blob.downloadUrl,
      }
    })

    const uploadedFiles = await Promise.all(uploadPromises)

    return NextResponse.json({ files: uploadedFiles })
  } catch (error) {
    console.error("Error uploading files:", error)
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 })
  }
}
