import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ success: false, error: "Text content is required" }, { status: 400 })
    }

    console.log("Parsing resume text, length:", text.length)

    const prompt = `
You are a resume parsing expert. Parse the following resume text and convert it into a structured JSON format.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks, no additional text.

The JSON should have this exact structure:
{
  "title": "Resume Title or Person's Name",
  "sections": [
    {
      "section name": "Experience",
      "content": [
        {
          "job title": "Job Title",
          "Organization": "Company Name",
          "Duration": "Start Date - End Date",
          "Description": "Job description and achievements"
        }
      ],
      "id": "unique-id-1"
    },
    {
      "section name": "Education",
      "content": [
        {
          "Degree": "Degree Name",
          "Organization": "School Name",
          "Duration": "Start Date - End Date",
          "GPA": "GPA if mentioned"
        }
      ],
      "id": "unique-id-2"
    },
    {
      "section name": "Skills",
      "content": [
        {
          "Category": "Technical Skills",
          "Skills": "List of skills separated by commas"
        }
      ],
      "id": "unique-id-3"
    }
  ]
}

Rules:
1. Extract ALL information from the resume
2. Create appropriate sections (Experience, Education, Skills, Projects, Certifications, etc.)
3. Use consistent field names within each section type
4. Generate unique IDs for each section (use format: "section-1", "section-2", etc.)
5. If no clear title is found, use "Resume" as the title
6. Preserve all dates, descriptions, and details
7. Group similar information together
8. Return ONLY the JSON object, nothing else

Resume text to parse:
${text}
`

    const result = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.1,
    })

    console.log("AI response received, length:", result.text.length)

    // Clean the response to ensure it's valid JSON
    let cleanedResponse = result.text.trim()

    // Remove markdown code blocks if present
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    // Try to parse the JSON
    let resumeData
    try {
      resumeData = JSON.parse(cleanedResponse)
      console.log("JSON parsed successfully:", resumeData)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      console.error("Raw response:", cleanedResponse)

      // Fallback: create a basic structure with the original text
      resumeData = {
        title: "Parsed Resume",
        sections: [
          {
            "section name": "Raw Content",
            content: [
              {
                Content: text.substring(0, 1000) + (text.length > 1000 ? "..." : ""),
              },
            ],
            id: "section-1",
          },
        ],
      }
    }

    // Validate the structure
    if (!resumeData.title) {
      resumeData.title = "Resume"
    }

    if (!Array.isArray(resumeData.sections)) {
      resumeData.sections = []
    }

    // Ensure each section has required fields
    resumeData.sections = resumeData.sections.map((section: any, index: number) => ({
      "section name": section["section name"] || section.name || `Section ${index + 1}`,
      content: Array.isArray(section.content) ? section.content : [],
      id: section.id || `section-${index + 1}`,
    }))

    console.log("Final structured data:", resumeData)

    return NextResponse.json({
      success: true,
      resumeData,
    })
  } catch (error) {
    console.error("Resume parsing error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to parse resume",
      },
      { status: 500 },
    )
  }
}
