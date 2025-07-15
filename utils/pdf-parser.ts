import type { ResumeData } from "../types/resume"

// Helper function to extract text from PDF using multiple methods
export const extractTextFromPDF = async (file: File): Promise<string> => {
  console.log("Starting PDF text extraction for:", file.name)

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)

        // Convert to string for processing
        const pdfString = Array.from(uint8Array)
          .map((byte) => String.fromCharCode(byte))
          .join("")

        console.log("PDF file size:", arrayBuffer.byteLength, "bytes")

        // Validate PDF header
        if (!pdfString.startsWith("%PDF-")) {
          throw new Error("Invalid PDF file: Missing PDF header")
        }

        let extractedText = ""

        // Method 1: Extract text from text objects (Tj, TJ operators)
        const textObjectRegex = /$$(.*?)$$\s*Tj/g
        const textArrayRegex = /\[(.*?)\]\s*TJ/g
        const quotedTextRegex = /'(.*?)'/g
        const doubleQuotedTextRegex = /"(.*?)"/g

        let match

        // Extract text from Tj operators
        while ((match = textObjectRegex.exec(pdfString)) !== null) {
          const text = match[1]
          if (text && text.trim().length > 0) {
            extractedText += decodePDFText(text) + " "
          }
        }

        // Extract text from TJ operators (text arrays)
        while ((match = textArrayRegex.exec(pdfString)) !== null) {
          const textArray = match[1]
          // Parse the array content
          const arrayContent = textArray.match(/$$(.*?)$$/g)
          if (arrayContent) {
            arrayContent.forEach((item) => {
              const text = item.replace(/[()]/g, "")
              if (text && text.trim().length > 0) {
                extractedText += decodePDFText(text) + " "
              }
            })
          }
        }

        // Extract text from quoted strings
        while ((match = quotedTextRegex.exec(pdfString)) !== null) {
          const text = match[1]
          if (text && text.trim().length > 0) {
            extractedText += decodePDFText(text) + " "
          }
        }

        while ((match = doubleQuotedTextRegex.exec(pdfString)) !== null) {
          const text = match[1]
          if (text && text.trim().length > 0) {
            extractedText += decodePDFText(text) + " "
          }
        }

        // Method 2: Extract from stream objects
        const streamRegex = /stream\s*(.*?)\s*endstream/gs
        while ((match = streamRegex.exec(pdfString)) !== null) {
          const streamContent = match[1]
          const streamText = extractTextFromStream(streamContent)
          if (streamText) {
            extractedText += streamText + " "
          }
        }

        // Clean up the extracted text
        extractedText = cleanExtractedText(extractedText)

        console.log("Extracted text length:", extractedText.length)
        console.log("Text preview:", extractedText.substring(0, 200))

        if (!extractedText || extractedText.trim().length < 10) {
          throw new Error("No readable text found in PDF. This might be a scanned document or image-based PDF.")
        }

        resolve(extractedText)
      } catch (error) {
        console.error("PDF extraction error:", error)
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read PDF file"))
    }

    reader.readAsArrayBuffer(file)
  })
}

// Advanced PDF extraction method as fallback
export const extractTextFromPDFAdvanced = async (file: File): Promise<string> => {
  console.log("Starting advanced PDF text extraction for:", file.name)

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)

        // Convert to string
        let pdfString = ""
        for (let i = 0; i < uint8Array.length; i++) {
          pdfString += String.fromCharCode(uint8Array[i])
        }

        // Validate PDF
        if (!pdfString.includes("%PDF-")) {
          throw new Error("Invalid PDF format")
        }

        let extractedText = ""

        // Advanced text extraction patterns
        const patterns = [
          // Text showing operators
          /BT\s*(.*?)\s*ET/gs,
          // Direct text content
          /$$((?:[^()\\]|\\.|\\[0-7]{1,3})*)$$/g,
          // Hex strings
          /<([0-9A-Fa-f\s]+)>/g,
          // Text in content streams
          /q\s*(.*?)\s*Q/gs,
        ]

        patterns.forEach((pattern) => {
          let match
          while ((match = pattern.exec(pdfString)) !== null) {
            const content = match[1]
            if (content) {
              const text = extractTextFromContent(content)
              if (text && text.trim().length > 0) {
                extractedText += text + " "
              }
            }
          }
        })

        // Try to extract from decompressed streams
        const streamMatches = pdfString.match(/stream\s*([\s\S]*?)\s*endstream/g)
        if (streamMatches) {
          streamMatches.forEach((stream) => {
            const content = stream.replace(/^stream\s*/, "").replace(/\s*endstream$/, "")
            const text = extractTextFromStream(content)
            if (text) {
              extractedText += text + " "
            }
          })
        }

        extractedText = cleanExtractedText(extractedText)

        if (!extractedText || extractedText.trim().length < 10) {
          throw new Error("Advanced extraction failed: No readable text found in PDF")
        }

        console.log("Advanced extraction successful, text length:", extractedText.length)
        resolve(extractedText)
      } catch (error) {
        console.error("Advanced PDF extraction error:", error)
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read PDF file for advanced extraction"))
    }

    reader.readAsArrayBuffer(file)
  })
}

// Helper function to decode PDF text
function decodePDFText(text: string): string {
  // Handle PDF escape sequences
  return (
    text
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\b/g, "\b")
      .replace(/\\f/g, "\f")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\")
      // Handle octal escape sequences
      .replace(/\\([0-7]{1,3})/g, (match, octal) => {
        return String.fromCharCode(Number.parseInt(octal, 8))
      })
  )
}

// Helper function to extract text from PDF streams
function extractTextFromStream(streamContent: string): string {
  let text = ""

  // Look for text operators in the stream
  const textPatterns = [/$$(.*?)$$\s*Tj/g, /\[(.*?)\]\s*TJ/g, /'(.*?)'\s*Tj/g, /"(.*?)"\s*Tj/g]

  textPatterns.forEach((pattern) => {
    let match
    while ((match = pattern.exec(streamContent)) !== null) {
      const extractedText = match[1]
      if (extractedText && extractedText.trim().length > 0) {
        text += decodePDFText(extractedText) + " "
      }
    }
  })

  return text
}

// Helper function to extract text from content
function extractTextFromContent(content: string): string {
  let text = ""

  // Extract text from various PDF text operators
  const patterns = [/$$(.*?)$$/g, /<([0-9A-Fa-f\s]+)>/g]

  patterns.forEach((pattern) => {
    let match
    while ((match = pattern.exec(content)) !== null) {
      let extractedText = match[1]

      // Handle hex strings
      if (pattern.source.includes("A-Fa-f")) {
        extractedText = hexToString(extractedText)
      }

      if (extractedText && extractedText.trim().length > 0) {
        text += decodePDFText(extractedText) + " "
      }
    }
  })

  return text
}

// Helper function to convert hex string to text
function hexToString(hex: string): string {
  let result = ""
  const cleanHex = hex.replace(/\s/g, "")

  for (let i = 0; i < cleanHex.length; i += 2) {
    const hexPair = cleanHex.substr(i, 2)
    if (hexPair.length === 2) {
      const charCode = Number.parseInt(hexPair, 16)
      if (charCode > 0 && charCode < 256) {
        result += String.fromCharCode(charCode)
      }
    }
  }

  return result
}

// Helper function to clean extracted text
function cleanExtractedText(text: string): string {
  return (
    text
      // Remove excessive whitespace
      .replace(/\s+/g, " ")
      // Remove non-printable characters except newlines and tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // Remove PDF-specific artifacts
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      // Clean up multiple spaces
      .replace(/\s+/g, " ")
      .trim()
  )
}

// Function to parse resume with AI
export const parseResumeWithAI = async (text: string): Promise<ResumeData> => {
  console.log("Parsing resume with AI, text length:", text.length)

  try {
    const response = await fetch("/api/parse-resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, type: "pdf" }),
    })

    if (!response.ok) {
      throw new Error(`AI parsing failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "AI parsing failed")
    }

    console.log("AI parsing successful")
    return result.data
  } catch (error) {
    console.error("AI parsing error:", error)
    throw new Error(`Failed to parse resume with AI: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
