import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ success: false, error: "Invalid text provided" }, { status: 400 })
    }

    const prompt = `
You are an AI assistant that extracts structured information from resume text. 
Parse the following resume text and convert it into a structured JSON format.

The output should follow this exact structure:
{
  "title": "Full Name - Job Title",
  "sections": [
    {
      "section name": "Experience",
      "content": [
        {
          "job title": "Position Title",
          "Organization": "Company Name",
          "Duration": "Start Date - End Date",
          "Description": "Job description and achievements"
        }
      ],
      "id": "unique-id"
    },
    {
      "section name": "Education", 
      "content": [
        {
          "Degree": "Degree Name",
          "Organization": "School Name",
          "Duration": "Start Year - End Year",
          "GPA": "GPA if mentioned"
        }
      ],
      "id": "unique-id"
    },
    {
      "section name": "Skills",
      "content": [
        {
          "Category": "Skill Category",
          "Skills": "List of skills"
        }
      ],
      "id": "unique-id"
    }
  ]
}

Instructions:
1. Extract the person's name and create a title in format "Name - Primary Job Title"
2. Group information into logical sections (Experience, Education, Skills, etc.)
3. For experience entries, extract job title, company, dates, and description
4. For education entries, extract degree, school, dates, and GPA if available
5. For skills, group them by category when possible
6. Generate unique IDs for each section (use format like "exp-123", "edu-456", etc.)
7. Preserve all important information from the original text
8. If dates are unclear, make reasonable assumptions or use "Present" for current positions
9. Clean up formatting and make descriptions concise but informative

Resume text to parse:
${text}

Return only the JSON object, no additional text or formatting.
`

    const { text: result } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.1, // Low temperature for consistent parsing
    })

    // Parse the AI response
    let parsedData
    try {
      parsedData = JSON.parse(result)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      return NextResponse.json({ success: false, error: "Failed to parse AI response" }, { status: 500 })
    }

    // Validate the structure
    if (!parsedData.title || !Array.isArray(parsedData.sections)) {
      return NextResponse.json({ success: false, error: "Invalid resume structure returned by AI" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    })
  } catch (error) {
    console.error("Error parsing resume:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
