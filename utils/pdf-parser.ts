import type { ResumeData } from "../types/resume"

// Improved PDF text extraction with multiple methods
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // First, verify this is actually a PDF file
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error("This file doesn't appear to be a PDF document.")
    }

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Convert to string for processing - try different encodings
    let pdfString = ""

    try {
      // Try UTF-8 first
      pdfString = new TextDecoder("utf-8", { fatal: false }).decode(uint8Array)
    } catch {
      try {
        // Fallback to latin1
        pdfString = new TextDecoder("latin1").decode(uint8Array)
      } catch {
        // Final fallback - convert bytes to string
        pdfString = Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join("")
      }
    }

    // Verify this is a valid PDF by checking the header
    if (!pdfString.startsWith("%PDF-")) {
      throw new Error("This file doesn't appear to be a valid PDF document. The PDF header is missing.")
    }

    console.log("PDF file validated, starting text extraction...")

    // Extract text using multiple methods and pick the best result
    let extractedText = ""

    // Method 1: Extract from PDF text objects (most reliable)
    try {
      const textFromObjects = extractFromTextObjects(pdfString)
      if (textFromObjects && textFromObjects.length > extractedText.length) {
        extractedText = textFromObjects
        console.log("Text extracted from PDF objects:", textFromObjects.substring(0, 100) + "...")
      }
    } catch (error) {
      console.warn("Text object extraction failed:", error)
    }

    // Method 2: Extract from stream content
    try {
      const textFromStreams = extractFromStreams(pdfString)
      if (textFromStreams && textFromStreams.length > extractedText.length) {
        extractedText = textFromStreams
        console.log("Text extracted from streams:", textFromStreams.substring(0, 100) + "...")
      }
    } catch (error) {
      console.warn("Stream extraction failed:", error)
    }

    // Method 3: Simple parentheses extraction (fallback)
    try {
      const textFromParentheses = extractFromParentheses(pdfString)
      if (textFromParentheses && textFromParentheses.length > extractedText.length) {
        extractedText = textFromParentheses
        console.log("Text extracted from parentheses:", textFromParentheses.substring(0, 100) + "...")
      }
    } catch (error) {
      console.warn("Parentheses extraction failed:", error)
    }

    // Clean up the extracted text
    extractedText = cleanExtractedText(extractedText)

    // Validate the extracted text quality
    if (!extractedText || extractedText.trim().length < 50) {
      throw new Error(
        "Could not extract sufficient readable text from this PDF.\n\n" +
          "This might be because:\n" +
          "• The PDF contains scanned images instead of searchable text\n" +
          "• The PDF is password-protected or encrypted\n" +
          "• The PDF uses an unsupported text encoding\n" +
          "• The PDF is corrupted or malformed\n\n" +
          "Please try:\n" +
          "• Using a Word document (.docx) instead - recommended\n" +
          "• Converting the PDF to a text-based format\n" +
          "• Using OCR software if it's a scanned document\n" +
          "• Manually copying and pasting the text",
      )
    }

    // Check if the text contains meaningful resume content
    const words = extractedText.split(/\s+/).filter((word) => word.length > 2)
    const hasResumeKeywords = /\b(experience|education|skills|work|employment|resume|cv|name|email|phone)\b/i.test(
      extractedText,
    )

    if (words.length < 20 || !hasResumeKeywords) {
      throw new Error(
        "The extracted text doesn't appear to contain meaningful resume content.\n\n" +
          "Please ensure your PDF:\n" +
          "• Contains actual resume/CV information\n" +
          "• Is not just a cover letter or other document\n" +
          "• Has searchable text (not just images)\n\n" +
          "Word documents (.docx) typically work better for text extraction.",
      )
    }

    console.log(`Successfully extracted ${extractedText.length} characters from PDF`)
    return extractedText
  } catch (error) {
    console.error("PDF extraction error:", error)

    if (
      error instanceof Error &&
      (error.message.includes("Could not extract") ||
        error.message.includes("doesn't appear to contain") ||
        error.message.includes("doesn't appear to be"))
    ) {
      throw error
    }

    throw new Error(
      "Failed to process the PDF file.\n\n" +
        "Common causes:\n" +
        "• Scanned PDFs (image-based) cannot be processed\n" +
        "• Password-protected or encrypted PDFs\n" +
        "• Corrupted or non-standard PDF format\n" +
        "• Very complex PDF structure\n\n" +
        "Recommended solutions:\n" +
        "• Upload a Word document (.docx) instead - most reliable\n" +
        "• Use a text-based PDF (not scanned)\n" +
        "• Try converting the PDF to Word format first\n" +
        "• Copy and paste your resume text manually",
    )
  }
}

// Extract text from PDF text objects (BT...ET blocks)
function extractFromTextObjects(pdfString: string): string {
  const textParts: string[] = []

  // Find all text objects in the PDF
  const textObjectRegex = /BT\s*([\s\S]*?)\s*ET/g
  let match

  while ((match = textObjectRegex.exec(pdfString)) !== null) {
    const textObject = match[1]

    // Extract text using Tj operator: (text) Tj
    const tjRegex = /$$([^)]*)$$\s*Tj/g
    let tjMatch
    while ((tjMatch = tjRegex.exec(textObject)) !== null) {
      const text = tjMatch[1]
      if (text && text.trim()) {
        textParts.push(decodePDFString(text))
      }
    }

    // Extract text using TJ operator: [(text)] TJ
    const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g
    let tjArrayMatch
    while ((tjArrayMatch = tjArrayRegex.exec(textObject)) !== null) {
      const arrayContent = tjArrayMatch[1]
      // Find text strings in the array
      const textInArray = arrayContent.match(/$$([^)]*)$$/g)
      if (textInArray) {
        textInArray.forEach((textMatch) => {
          const text = textMatch.slice(1, -1) // Remove parentheses
          if (text && text.trim()) {
            textParts.push(decodePDFString(text))
          }
        })
      }
    }

    // Extract text using ' and " operators (move to next line and show text)
    const quoteRegex = /$$([^)]*)$$\s*['"]/g
    let quoteMatch
    while ((quoteMatch = quoteRegex.exec(textObject)) !== null) {
      const text = quoteMatch[1]
      if (text && text.trim()) {
        textParts.push(decodePDFString(text))
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
    const patterns = [
      /$$([^)]+)$$/g, // Text in parentheses
      /\[([^\]]+)\]/g, // Text in brackets
      /<([^>]+)>/g, // Text in angle brackets
    ]

    patterns.forEach((pattern) => {
      let patternMatch
      while ((patternMatch = pattern.exec(streamContent)) !== null) {
        const text = patternMatch[1]
        if (text && text.length > 1 && /[a-zA-Z]/.test(text)) {
          // Filter out non-text content
          if (!text.match(/^[0-9\s\-.]+$/) && !text.includes("\\") && text.length < 200 && text.length > 2) {
            textParts.push(decodePDFString(text))
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
    const text = match[1]
    if (text && text.length > 2 && /[a-zA-Z]/.test(text)) {
      // Filter out likely non-text content
      if (!text.match(/^[0-9\s\-.]+$/) && !text.includes("\\") && !text.includes("/") && text.length < 200) {
        textParts.push(decodePDFString(text))
      }
    }
  }

  return textParts.join(" ")
}

// Decode PDF string escape sequences
function decodePDFString(text: string): string {
  return text
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\([0-7]{3})/g, (match, octal) => {
      // Convert octal escape sequences
      return String.fromCharCode(Number.parseInt(octal, 8))
    })
}

// Clean and format extracted text
function cleanExtractedText(text: string): string {
  return (
    text
      // Clean up whitespace
      .replace(/\s+/g, " ")
      .replace(/\n\s+/g, "\n")
      .replace(/\s+\n/g, "\n")
      // Remove control characters except newlines and tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // Fix common PDF artifacts
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space between camelCase
      .replace(/([.!?])([A-Z])/g, "$1 $2") // Add space after sentence endings
      .trim()
  )
}

// Enhanced extraction method (fallback)
export const extractTextFromPDFAdvanced = async (file: File): Promise<string> => {
  try {
    console.log("Attempting advanced PDF extraction...")

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Try multiple decoding approaches
    const decodingMethods = [
      () => new TextDecoder("utf-8", { fatal: false }).decode(uint8Array),
      () => new TextDecoder("latin1").decode(uint8Array),
      () => new TextDecoder("ascii", { fatal: false }).decode(uint8Array),
      () => Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join(""),
    ]

    let bestText = ""

    for (let i = 0; i < decodingMethods.length; i++) {
      try {
        console.log(`Trying decoding method ${i + 1}...`)
        const decoded = decodingMethods[i]()

        if (!decoded.startsWith("%PDF-")) {
          console.warn(`Method ${i + 1}: Not a valid PDF`)
          continue
        }

        const extracted = extractAllTextPatterns(decoded)
        console.log(`Method ${i + 1}: Extracted ${extracted.length} characters`)

        if (extracted.length > bestText.length) {
          bestText = extracted
        }
      } catch (error) {
        console.warn(`Decoding method ${i + 1} failed:`, error)
        continue
      }
    }

    if (bestText.length < 50) {
      throw new Error("Advanced extraction could not find sufficient readable text")
    }

    return cleanExtractedText(bestText)
  } catch (error) {
    console.error("Advanced PDF extraction failed:", error)
    throw new Error(
      "All PDF text extraction methods failed.\n\n" +
        "This PDF likely contains:\n" +
        "• Scanned images instead of searchable text\n" +
        "• Complex formatting that cannot be parsed\n" +
        "• Encryption or protection\n" +
        "• Unsupported PDF version or structure\n\n" +
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

  for (let i = 0; i < methods.length; i++) {
    try {
      console.log(`Trying extraction method ${i + 1}...`)
      const result = methods[i]()
      console.log(`Method ${i + 1}: Got ${result.length} characters`)

      if (result.length > bestResult.length) {
        bestResult = result
      }
    } catch (error) {
      console.warn(`Text extraction method ${i + 1} failed:`, error)
    }
  }

  return bestResult
}

// Parse resume text using AI with improved error handling
export const parseResumeWithAI = async (text: string): Promise<ResumeData> => {
  try {
    console.log("Sending text to AI for parsing...")

    const response = await fetch("/api/parse-resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch {
        // If we can't parse the error response, use the status
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to parse resume")
    }

    console.log("AI parsing successful")
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
