import type { ResumeData } from "../types/resume"
import mammoth from "mammoth"

// Extract text from Word document using mammoth.js
export const extractTextFromWord = async (file: File): Promise<string> => {
  try {
    // Set worker source
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })

    if (result.messages && result.messages.length > 0) {
      console.warn("Word parsing warnings:", result.messages)
    }

    return result.value.trim()
  } catch (error) {
    console.error("Error extracting text from Word document:", error)
    throw new Error("Failed to extract text from Word document. Please ensure the file is a valid .docx file.")
  }
}

// Extract formatted text from Word document (preserves some formatting)
export const extractFormattedTextFromWord = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer()

    // Custom style map for better formatting preservation
    const options = {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Title'] => h1:fresh",
        "p[style-name='Subtitle'] => h2:fresh",
        "b => strong",
        "i => em",
      ],
    }

    const result = await mammoth.convertToHtml({ arrayBuffer }, options)

    if (result.messages && result.messages.length > 0) {
      console.warn("Word parsing warnings:", result.messages)
    }

    // Convert HTML to plain text but preserve structure
    const parser = new DOMParser()
    const doc = parser.parseFromString(result.value, "text/html")

    // Extract text with basic formatting
    let formattedText = ""
    const elements = doc.body.querySelectorAll("*")

    elements.forEach((element) => {
      const tagName = element.tagName.toLowerCase()
      const text = element.textContent?.trim()

      if (text) {
        switch (tagName) {
          case "h1":
            formattedText += `# ${text}\n\n`
            break
          case "h2":
            formattedText += `## ${text}\n\n`
            break
          case "h3":
            formattedText += `### ${text}\n\n`
            break
          case "p":
            formattedText += `${text}\n\n`
            break
          case "strong":
          case "b":
            formattedText += `**${text}** `
            break
          case "em":
          case "i":
            formattedText += `*${text}* `
            break
          default:
            if (!element.children.length) {
              formattedText += `${text} `
            }
        }
      }
    })

    const finalText = formattedText.trim()
    console.log("Word extraction successful, formatted text length:", finalText.length)
    return finalText
  } catch (error) {
    console.error("Error extracting formatted text from Word document:", error)
    // Fallback to raw text extraction
    return extractTextFromWord(file)
  }
}

// Parse resume text using AI with improved error handling
export const parseWordResumeWithAI = async (text: string): Promise<ResumeData> => {
  try {
    console.log("Parsing Word resume with AI, text length:", text.length)

    const response = await fetch("/api/parse-resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, type: "docx" }),
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

    console.log("Word resume parsing successful")
    return result.data
  } catch (error) {
    console.error("Error parsing Word resume with AI:", error)

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

// Parse Word document
export async function parseWord(file: File): Promise<string> {
  try {
    console.log("Starting Word document parsing for file:", file.name)

    const arrayBuffer = await file.arrayBuffer()

    // Use mammoth to extract text from Word document
    const result = await mammoth.extractRawText({ arrayBuffer })

    console.log("Word parsing completed, length:", result.value.length)

    if (result.messages && result.messages.length > 0) {
      console.log("Word parsing messages:", result.messages)
    }

    // Clean up the extracted text
    const cleanedText = result.value
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\n\s*\n\s*\n/g, "\n\n") // Remove excessive line breaks
      .replace(/\s+/g, " ") // Normalize spaces
      .trim()

    if (!cleanedText) {
      throw new Error("No text could be extracted from the Word document")
    }

    return cleanedText
  } catch (error) {
    console.error("Word parsing error:", error)
    throw new Error(`Failed to parse Word document: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
