import type { ResumeData } from "../types/resume"

// Improved PDF text extraction with multiple methods
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Convert to string for processing
    let pdfString = ""

    // Try different encoding approaches
    try {
      // First try UTF-8
      pdfString = new TextDecoder("utf-8", { fatal: false }).decode(uint8Array)
    } catch {
      try {
        // Fallback to latin1
        pdfString = new TextDecoder("latin1").decode(uint8Array)
      } catch {
        // Final fallback to binary string
        pdfString = Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join("")
      }
    }

    // Check if this is actually a PDF
    if (!pdfString.startsWith("%PDF-")) {
      throw new Error("This doesn't appear to be a valid PDF file.")
    }

    // Extract text using multiple methods
    let extractedText = ""

    // Method 1: Extract from text objects (BT...ET blocks)
    const textFromObjects = extractFromTextObjects(pdfString)
    if (textFromObjects.length > extractedText.length) {
      extractedText = textFromObjects
    }

    // Method 2: Extract from stream content
    const textFromStreams = extractFromStreams(pdfString)
    if (textFromStreams.length > extractedText.length) {
      extractedText = textFromStreams
    }

    // Method 3: Simple parentheses extraction
    const textFromParentheses = extractFromParentheses(pdfString)
    if (textFromParentheses.length > extractedText.length) {
      extractedText = textFromParentheses
    }

    // Clean up the extracted text
    extractedText = cleanExtractedText(extractedText)

    // Validate extracted text
    if (!extractedText || extractedText.length < 50) {
      throw new Error(
        "Could not extract sufficient text from this PDF. This might be because:\n\n" +
          "• The PDF contains scanned images instead of text\n" +
          "• The PDF is password-protected or encrypted\n" +
          "• The PDF uses an unsupported text encoding\n\n" +
          "Please try:\n" +
          "• Using a Word document (.docx) instead\n" +
          "• Converting the PDF to a text-based format\n" +
          "• Copying and pasting the text manually",
      )
    }

    // Check if the text seems meaningful
    const wordCount = extractedText.split(/\s+/).filter((word) => word.length > 2).length
    if (wordCount < 10) {
      throw new Error(
        "The extracted text doesn't appear to contain meaningful content. " +
          "Please try uploading a Word document (.docx) or manually entering your resume text.",
      )
    }

    return extractedText
  } catch (error) {
    console.error("PDF extraction error:", error)

    if (error instanceof Error && error.message.includes("Could not extract")) {
      throw error
    }

    throw new Error(
      "Failed to process the PDF file. Common causes:\n\n" +
        "• Scanned PDFs (image-based) cannot be processed\n" +
        "• Password-protected or encrypted PDFs\n" +
        "• Corrupted or non-standard PDF format\n\n" +
        "Recommended solutions:\n" +
        "• Upload a Word document (.docx) instead\n" +
        "• Use a text-based PDF (not scanned)\n" +
        "• Copy and paste your resume text manually",
    )
  }
}

// Extract text from PDF text objects (BT...ET blocks)
function extractFromTextObjects(pdfString: string): string {
  const textParts: string[] = []

  // Find all text objects
  const textObjectRegex = /BT\s*([\s\S]*?)\s*ET/g
  let match

  while ((match = textObjectRegex.exec(pdfString)) !== null) {
    const textObject = match[1]

    // Extract text using various text operators
    // Tj operator: (text) Tj
    const tjRegex = /$$([^)]*)$$\s*Tj/g
    let tjMatch
    while ((tjMatch = tjRegex.exec(textObject)) !== null) {
      if (tjMatch[1] && tjMatch[1].trim()) {
        textParts.push(tjMatch[1].trim())
      }
    }

    // TJ operator: [(text)] TJ
    const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g
    let tjArrayMatch
    while ((tjArrayMatch = tjArrayRegex.exec(textObject)) !== null) {
      const arrayContent = tjArrayMatch[1]
      const textInArray = arrayContent.match(/$$([^)]*)$$/g)
      if (textInArray) {
        textInArray.forEach((text) => {
          const cleanText = text.slice(1, -1).trim()
          if (cleanText) {
            textParts.push(cleanText)
          }
        })
      }
    }

    // ' and " operators (move to next line and show text)
    const quoteRegex = /$$([^)]*)$$\s*['"]/g
    let quoteMatch
    while ((quoteMatch = quoteRegex.exec(textObject)) !== null) {
      if (quoteMatch[1] && quoteMatch[1].trim()) {
        textParts.push(quoteMatch[1].trim())
      }
    }
  }

  return textParts.join(" ")
}

// Extract text from PDF streams
function extractFromStreams(pdfString: string): string {
  const textParts: string[] = []

  // Find stream objects
  const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g
  let match

  while ((match = streamRegex.exec(pdfString)) !== null) {
    const streamContent = match[1]

    // Look for text patterns in streams
    const textPatterns = [
      /$$([^)]+)$$/g, // Text in parentheses
      /\[([^\]]+)\]/g, // Text in brackets
      /<([^>]+)>/g, // Text in angle brackets
    ]

    textPatterns.forEach((pattern) => {
      let patternMatch
      while ((patternMatch = pattern.exec(streamContent)) !== null) {
        const text = patternMatch[1]
        if (text && text.length > 1 && /[a-zA-Z]/.test(text)) {
          // Filter out non-text content
          if (!text.match(/^[0-9\s\-.]+$/) && !text.includes("\\") && text.length < 100) {
            textParts.push(text)
          }
        }
      }
    })
  }

  return textParts.join(" ")
}

// Simple extraction from parentheses (fallback method)
function extractFromParentheses(pdfString: string): string {
  const textParts: string[] = []
  const regex = /$$([^)]+)$$/g
  let match

  while ((match = regex.exec(pdfString)) !== null) {
    const text = match[1].trim()
    if (text.length > 2 && /[a-zA-Z]/.test(text)) {
      // Filter out likely non-text content
      if (!text.match(/^[0-9\s\-.]+$/) && !text.includes("\\") && !text.includes("/") && text.length < 200) {
        textParts.push(text)
      }
    }
  }

  return textParts.join(" ")
}

// Clean and format extracted text
function cleanExtractedText(text: string): string {
  return (
    text
      // Decode common PDF escape sequences
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\")
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      // Clean up whitespace
      .replace(/\s+/g, " ")
      .replace(/\n\s+/g, "\n")
      .replace(/\s+\n/g, "\n")
      // Remove control characters except newlines and tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .trim()
  )
}

// Enhanced extraction method (fallback)
export const extractTextFromPDFAdvanced = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Try to find readable text patterns in the binary data
    let bestText = ""

    // Convert using different approaches
    const approaches = [
      () => new TextDecoder("utf-8", { fatal: false }).decode(uint8Array),
      () => new TextDecoder("latin1").decode(uint8Array),
      () => new TextDecoder("ascii", { fatal: false }).decode(uint8Array),
      () => Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join(""),
    ]

    for (const approach of approaches) {
      try {
        const decoded = approach()
        const extracted = extractAllTextPatterns(decoded)

        if (extracted.length > bestText.length) {
          bestText = extracted
        }
      } catch (error) {
        console.warn("Decoding approach failed:", error)
        continue
      }
    }

    if (bestText.length < 50) {
      throw new Error("Advanced extraction could not find sufficient text")
    }

    return cleanExtractedText(bestText)
  } catch (error) {
    console.error("Advanced PDF extraction failed:", error)
    throw new Error(
      "All PDF text extraction methods failed. This PDF likely contains:\n\n" +
        "• Scanned images instead of searchable text\n" +
        "• Complex formatting that cannot be parsed\n" +
        "• Encryption or protection\n\n" +
        "Please try uploading a Word document (.docx) instead.",
    )
  }
}

// Extract text using all available patterns
function extractAllTextPatterns(pdfString: string): string {
  const methods = [
    () => extractFromTextObjects(pdfString),
    () => extractFromStreams(pdfString),
    () => extractFromParentheses(pdfString),
  ]

  let bestResult = ""

  for (const method of methods) {
    try {
      const result = method()
      if (result.length > bestResult.length) {
        bestResult = result
      }
    } catch (error) {
      console.warn("Text extraction method failed:", error)
    }
  }

  return bestResult
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to parse resume")
    }

    return ensureSectionIds(result.data)
  } catch (error) {
    console.error("Error parsing resume with AI:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error. Please check your internet connection and try again.")
    }

    if (error instanceof SyntaxError) {
      throw new Error("Server returned invalid response. Please try again.")
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
