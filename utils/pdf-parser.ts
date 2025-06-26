import type { ResumeData } from "../types/resume"

// Extract text from PDF using PDF.js
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Dynamically import PDF.js
    const pdfjsLib = await import("pdfjs-dist")

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let fullText = ""

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(" ")
      fullText += pageText + "\n"
    }

    return fullText.trim()
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    throw new Error("Failed to extract text from PDF. Please ensure the PDF contains selectable text.")
  }
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
