import type { ResumeData } from "../types/resume"

// Simple PDF text extraction without PDF.js dependency
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Convert to string for text extraction
    let pdfText = ""

    // Try to decode as UTF-8 first
    try {
      pdfText = new TextDecoder("utf-8", { fatal: false }).decode(uint8Array)
    } catch {
      // Fallback to latin1 if UTF-8 fails
      pdfText = new TextDecoder("latin1").decode(uint8Array)
    }

    // Extract text using regex patterns for PDF text objects
    const textPatterns = [
      /$$([^)]+)$$/g, // Text in parentheses
      /\[([^\]]+)\]/g, // Text in brackets
      /<([^>]+)>/g, // Text in angle brackets
    ]

    let extractedText = ""

    // Try each pattern to extract text
    for (const pattern of textPatterns) {
      const matches = pdfText.match(pattern)
      if (matches) {
        const patternText = matches
          .map((match) => {
            // Remove the wrapping characters
            if (match.startsWith("(") && match.endsWith(")")) {
              return match.slice(1, -1)
            }
            if (match.startsWith("[") && match.endsWith("]")) {
              return match.slice(1, -1)
            }
            if (match.startsWith("<") && match.endsWith(">")) {
              return match.slice(1, -1)
            }
            return match
          })
          .filter((text) => {
            // Filter out non-text content
            return (
              text.length > 1 &&
              /[a-zA-Z]/.test(text) &&
              !text.match(/^[0-9\s\-.]+$/) &&
              !text.includes("\\") &&
              !text.includes("/") &&
              text.length < 200
            ) // Avoid very long strings that are likely not text
          })
          .join(" ")

        if (patternText.length > extractedText.length) {
          extractedText = patternText
        }
      }
    }

    // Additional extraction method: look for stream content
    const streamMatches = pdfText.match(/stream\s*(.*?)\s*endstream/gs)
    if (streamMatches) {
      const streamText = streamMatches
        .map((stream) => {
          // Extract readable text from stream
          const content = stream.replace(/^stream\s*/, "").replace(/\s*endstream$/, "")
          return content.replace(/[^\x20-\x7E\n\r\t]/g, " ") // Keep only printable ASCII
        })
        .filter((text) => text.length > 10 && /[a-zA-Z]/.test(text))
        .join(" ")

      if (streamText.length > extractedText.length) {
        extractedText = streamText
      }
    }

    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\")
      .replace(/\s+/g, " ")
      .trim()

    if (!extractedText || extractedText.length < 50) {
      throw new Error(
        "Could not extract readable text from this PDF. This might be a scanned document, image-based PDF, or encrypted PDF. Please try:\n\n" +
          "• Converting the PDF to a text-based format\n" +
          "• Using OCR software if it's a scanned document\n" +
          "• Uploading a Word document (.docx) instead\n" +
          "• Manually copying and pasting the text",
      )
    }

    return extractedText
  } catch (error) {
    console.error("Error extracting text from PDF:", error)

    if (error instanceof Error && error.message.includes("Could not extract readable text")) {
      throw error
    }

    throw new Error(
      "Failed to process the PDF file. This could be due to:\n\n" +
        "• The PDF being corrupted or password-protected\n" +
        "• The PDF containing only images or scanned content\n" +
        "• Browser compatibility issues\n\n" +
        "Please try uploading a Word document (.docx) instead, or manually copy and paste your resume text.",
    )
  }
}

// Enhanced text extraction using multiple methods
export const extractTextFromPDFAdvanced = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Convert to different encodings and try extraction
    const encodings = ["utf-8", "latin1", "ascii"]
    let bestText = ""

    for (const encoding of encodings) {
      try {
        const text = new TextDecoder(encoding, { fatal: false }).decode(uint8Array)

        // Look for PDF text content markers
        const textContent = extractPDFTextContent(text)

        if (textContent.length > bestText.length) {
          bestText = textContent
        }
      } catch (encodingError) {
        console.warn(`Failed to decode with ${encoding}:`, encodingError)
        continue
      }
    }

    if (bestText.length < 50) {
      throw new Error("Insufficient text extracted from PDF")
    }

    return bestText
  } catch (error) {
    console.error("Advanced PDF extraction failed:", error)
    throw error
  }
}

// Helper function to extract text content from PDF string
function extractPDFTextContent(pdfString: string): string {
  const textParts: string[] = []

  // Method 1: Extract text from BT...ET blocks (text objects)
  const textObjectRegex = /BT\s*(.*?)\s*ET/gs
  const textObjects = pdfString.match(textObjectRegex)

  if (textObjects) {
    textObjects.forEach((textObj) => {
      // Look for text show operators: Tj, TJ, ', "
      const textShowRegex = /$$([^)]*)$$\s*(?:Tj|'|")/g
      const arrayTextRegex = /\[([^\]]*)\]\s*TJ/g

      let match
      while ((match = textShowRegex.exec(textObj)) !== null) {
        if (match[1] && match[1].trim()) {
          textParts.push(match[1].trim())
        }
      }

      while ((match = arrayTextRegex.exec(textObj)) !== null) {
        if (match[1]) {
          // Extract text from array format
          const arrayContent = match[1].match(/$$([^)]*)$$/g)
          if (arrayContent) {
            arrayContent.forEach((item) => {
              const text = item.slice(1, -1).trim()
              if (text) textParts.push(text)
            })
          }
        }
      }
    })
  }

  // Method 2: Simple parentheses extraction as fallback
  if (textParts.length === 0) {
    const simpleTextRegex = /$$([^)]+)$$/g
    let match
    while ((match = simpleTextRegex.exec(pdfString)) !== null) {
      const text = match[1].trim()
      if (text.length > 2 && /[a-zA-Z]/.test(text)) {
        textParts.push(text)
      }
    }
  }

  // Clean and join text parts
  const cleanedText = textParts
    .map((text) => {
      return text
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .replace(/\\\\/g, "\\")
    })
    .filter((text) => text.trim().length > 0)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()

  return cleanedText
}

// Parse resume text using AI with improved error handling
export const parseResumeWithAI = async (text: string): Promise<ResumeData> => {
  try {
    const response = await fetch("/api/parse-resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text()
      console.error("API Error Response:", errorText)
      throw new Error(`HTTP error! status: ${response.status}. ${errorText}`)
    }

    // Check content type
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text()
      console.error("Non-JSON response:", responseText)
      throw new Error("Server returned non-JSON response. Please check your API configuration.")
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to parse resume")
    }

    return result.data
  } catch (error) {
    console.error("Error parsing resume with AI:", error)

    // Provide more specific error messages
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error. Please check your internet connection and try again.")
    }

    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      throw new Error("Server returned invalid response. Please try again or contact support.")
    }

    throw new Error(error instanceof Error ? error.message : "Failed to parse resume. Please try again.")
  }
}

// Generate unique ID for sections
const generateId = () => Math.random().toString(36).substring(2, 9)

// Ensure all sections have IDs
export const ensureSectionIds = (data: ResumeData): ResumeData => {
  return {
    ...data,
    sections: data.sections.map((section) => ({
      ...section,
      id: section.id || generateId(),
    })),
  }
}
