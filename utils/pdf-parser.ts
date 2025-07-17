import type { ResumeData } from "../types/resume"

// Helper function to extract text from PDF using multiple methods
export const extractTextFromPDF = async (file: File): Promise<string> => {
  console.log("Starting PDF text extraction for:", file.name)

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        console.log("PDF file size:", arrayBuffer.byteLength, "bytes")

        // Try advanced extraction first
        try {
          const text = await extractWithAdvancedParser(arrayBuffer)
          if (text && text.trim().length > 10) {
            console.log("Advanced extraction successful, text length:", text.length)
            console.log("Text preview:", text.substring(0, 200))
            resolve(text)
            return
          }
        } catch (advancedError) {
          console.log("Advanced extraction failed, trying basic method:", advancedError)
        }

        // Fallback to basic extraction
        const uint8Array = new Uint8Array(arrayBuffer)
        const pdfString = Array.from(uint8Array)
          .map((byte) => String.fromCharCode(byte))
          .join("")

        // Validate PDF header
        if (!pdfString.startsWith("%PDF-")) {
          throw new Error("Invalid PDF file: Missing PDF header")
        }

        let extractedText = ""

        // Extract all readable text content
        const textPatterns = [
          // Standard text operators
          /\(((?:[^()\\]|\\.|\\[0-7]{1,3})*)\)\s*Tj/g,
          /\[((?:[^\[\]\\]|\\.|\\[0-7]{1,3})*)\]\s*TJ/g,
          // Direct parenthesized strings
          /\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g,
          // Hex strings
          /<([0-9A-Fa-f\s]+)>/g,
        ]

        textPatterns.forEach((pattern) => {
          let match
          while ((match = pattern.exec(pdfString)) !== null) {
            let text = match[1]
            
            // Handle hex strings
            if (pattern.source.includes("A-Fa-f")) {
              text = hexToString(text)
            } else {
              text = decodePDFText(text)
            }
            
            if (text && text.trim().length > 0) {
              extractedText += text + " "
            }
          }
        })

        // Extract from content streams
        const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g
        let streamMatch
        while ((streamMatch = streamRegex.exec(pdfString)) !== null) {
          const streamContent = streamMatch[1]
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
        // Try the advanced method as final fallback
        try {
          const fallbackText = await extractTextFromPDFAdvanced(file)
          resolve(fallbackText)
        } catch {
          reject(error)
        }
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read PDF file"))
    }

    reader.readAsArrayBuffer(file)
  })
}

// New advanced parser for better text extraction
async function extractWithAdvancedParser(arrayBuffer: ArrayBuffer): Promise<string> {
  const uint8Array = new Uint8Array(arrayBuffer)
  let pdfContent = ""
  
  // Convert to string with better encoding handling
  for (let i = 0; i < uint8Array.length; i++) {
    pdfContent += String.fromCharCode(uint8Array[i])
  }

  let extractedText = ""
  
  // Look for font mappings and character encodings
  const fontMappings = new Map<string, Map<string, string>>()
  
  // Extract font information
  const fontRegex = /\/Type\s*\/Font[^<]*?\/Encoding[^<]*?(?:<([^>]+)>)?/g
  let fontMatch
  while ((fontMatch = fontRegex.exec(pdfContent)) !== null) {
    // This would contain font encoding info
    console.log("Found font encoding information")
  }

  // Extract text with better Unicode handling
  const betterTextPatterns = [
    // Text in parentheses with proper escaping
    /\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*(?:Tj|TJ)/g,
    // Hex encoded text
    /<([0-9A-Fa-f\s]+)>\s*(?:Tj|TJ)/g,
    // Text arrays
    /\[([^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*)\]\s*TJ/g,
  ]

  betterTextPatterns.forEach((pattern) => {
    let match
    while ((match = pattern.exec(pdfContent)) !== null) {
      let text = match[1]
      
      if (pattern.source.includes("A-Fa-f")) {
        // Handle hex encoded text
        text = hexToString(text)
      } else if (pattern.source.includes("[")) {
        // Handle text arrays
        const textParts = text.match(/\(([^()]*)\)/g) || []
        text = textParts.map(part => part.slice(1, -1)).join("")
      }
      
      text = decodePDFText(text)
      
      if (text && text.trim().length > 0 && isReadableText(text)) {
        extractedText += text + " "
      }
    }
  })

  return cleanExtractedText(extractedText)
}

// Helper to check if text is readable
function isReadableText(text: string): boolean {
  // Check if text contains mostly printable ASCII characters
  const printableChars = text.replace(/[^\x20-\x7E]/g, "").length
  const totalChars = text.length
  return totalChars > 0 && (printableChars / totalChars) > 0.7
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
          /\((?:[^()\\]|\\.|\\[0-7]{1,3})*\)/g,
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
  const textPatterns = [/\((.*?)\)\s*Tj/g, /\[(.*?)\]\s*TJ/g, /'(.*?)'\s*Tj/g, /"(.*?)"\s*Tj/g]

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
  const patterns = [/\((.*?)\)/g, /<([0-9A-Fa-f\s]+)>/g]

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
      const errorText = await response.text()
      console.error("AI parsing API error:", response.status, errorText)
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
