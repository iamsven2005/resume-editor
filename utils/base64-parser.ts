import type { ResumeData } from "../types/resume"

// Convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = reader.result as string
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64Data = result.split(",")[1]
      resolve(base64Data)
    }

    reader.onerror = () => {
      reject(new Error("Failed to convert file to base64"))
    }

    reader.readAsDataURL(file)
  })
}

// Parse document using base64 and OpenAI
export const parseDocumentWithBase64 = async (
  file: File,
  onProgress?: (progress: number) => void,
  onStep?: (step: string) => void,
): Promise<ResumeData> => {
  try {
    console.log("Starting base64 document parsing for:", file.name)

    onStep?.("Converting file to base64...")
    onProgress?.(20)

    // Convert file to base64
    const base64Data = await fileToBase64(file)
    console.log("File converted to base64, length:", base64Data.length)

    onStep?.("Sending to AI for analysis...")
    onProgress?.(40)

    // Send to OpenAI API
    const response = await fetch("/api/parse-document-base64", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base64Data,
        fileName: file.name,
        mimeType: file.type || getMimeTypeFromExtension(file.name),
      }),
    })

    onProgress?.(70)
    onStep?.("Processing AI response...")

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Base64 parsing API error:", response.status, errorText)
      throw new Error(`AI parsing failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "AI parsing failed")
    }

    onProgress?.(90)
    onStep?.("Finalizing...")

    console.log("Base64 parsing successful")
    return result.data
  } catch (error) {
    console.error("Base64 parsing error:", error)
    throw new Error(`Failed to parse document: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Helper function to get MIME type from file extension
const getMimeTypeFromExtension = (fileName: string): string => {
  const extension = fileName.toLowerCase().split(".").pop()

  switch (extension) {
    case "pdf":
      return "application/pdf"
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    case "doc":
      return "application/msword"
    default:
      return "application/octet-stream"
  }
}

// Validate file before processing
export const validateDocumentFile = (file: File): string | null => {
  console.log("Validating file:", file.name, "Size:", file.size, "Type:", file.type)

  const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  const isDocx =
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  const isDoc = file.type === "application/msword" || file.name.toLowerCase().endsWith(".doc")

  if (!isPDF && !isDocx && !isDoc) {
    return `Unsupported file type: ${file.type || "unknown"}. Please upload a PDF or Word document (.pdf, .docx, .doc) only.`
  }

  if (file.size > 25 * 1024 * 1024) {
    // 25MB limit for base64 processing
    return "File size must be less than 25MB."
  }

  if (file.size === 0) {
    return "The file appears to be empty. Please select a valid document."
  }

  return null
}

// Get file type for display purposes
export const getFileTypeInfo = (file: File) => {
  const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  const isDocx =
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  const isDoc = file.type === "application/msword" || file.name.toLowerCase().endsWith(".doc")

  if (isPDF) {
    return { type: "pdf", displayName: "PDF Document", color: "text-red-500" }
  } else if (isDocx) {
    return { type: "docx", displayName: "Word Document", color: "text-blue-500" }
  } else if (isDoc) {
    return { type: "doc", displayName: "Word Document (Legacy)", color: "text-blue-600" }
  }

  return { type: "unknown", displayName: "Unknown Document", color: "text-gray-500" }
}
