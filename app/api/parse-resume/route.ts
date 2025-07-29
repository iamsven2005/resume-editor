import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json({ success: false, error: "Invalid request body. Expected JSON." }, { status: 400 })
    }

    const { text, file, type } = body
    let resumeText = text
    if (!resumeText && typeof file === "string") {
      const base64Content = file.split(",")[1] || file // remove "data:..." prefix if present
      const buffer = Buffer.from(base64Content, "base64")
      resumeText = buffer.toString("utf-8")
    }
    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Invalid text provided. Expected non-empty string." }, { status: 400 })
    }

    if (resumeText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Empty text provided. Please provide resume content." },
        { status: 400 },
      )
    }


    console.log(`Processing ${type || "unknown"} resume text, length:`, resumeText.length)
    console.log("Text preview:", resumeText.substring(0, 200) + "...")

    const prompt = `
You are an AI assistant that extracts structured information from resume text. 
Parse the following resume text and convert it into a structured JSON format.

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks, no additional text.

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
      "id": "exp-123"
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
      "id": "edu-456"
    },
    {
      "section name": "Skills",
      "content": [
        {
          "Category": "Skill Category",
          "Skills": "List of skills"
        }
      ],
      "id": "skills-789"
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
10. If you can't find a clear name, use "Resume" as the title
11. Always include at least Experience, Education, and Skills sections even if empty

Resume text to parse:
${resumeText}

Return ONLY the JSON object with no additional formatting or text.
`

    let result
    try {
      const aiResponse = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.1, // Low temperature for consistent parsing
      })
      result = aiResponse.text
      console.log("AI response received, length:", result.length)
    } catch (aiError) {
      console.error("AI generation error:", aiError)
      return NextResponse.json(
        { success: false, error: "AI service temporarily unavailable. Please try again later." },
        { status: 503 },
      )
    }

    // Clean the AI response to extract JSON
    let cleanedResult = result.trim()

    // Remove markdown code blocks if present
    if (cleanedResult.startsWith("```json")) {
      cleanedResult = cleanedResult.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedResult.startsWith("```")) {
      cleanedResult = cleanedResult.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    // Remove any leading/trailing whitespace again
    cleanedResult = cleanedResult.trim()

    // Log the cleaned result for debugging
    console.log("Cleaned AI response preview:", cleanedResult.substring(0, 200) + "...")

    // Parse the AI response
    let parsedData
    try {
      parsedData = JSON.parse(cleanedResult)
      console.log("Successfully parsed AI response")
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Original AI response:", result)
      console.error("Cleaned response:", cleanedResult)

      // Try to extract JSON from the response if it's embedded in text
      const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[0])
          console.log("Successfully extracted JSON from text")
        } catch (secondParseError) {
          console.error("Failed to parse extracted JSON:", secondParseError)
          return NextResponse.json(
            { success: false, error: "AI returned invalid JSON format. Please try again." },
            { status: 500 },
          )
        }
      } else {
        return NextResponse.json(
          { success: false, error: "AI returned invalid format. Please try again." },
          { status: 500 },
        )
      }
    }

    // Validate the structure
    if (!parsedData || typeof parsedData !== "object") {
      return NextResponse.json({ success: false, error: "AI returned invalid data structure." }, { status: 500 })
    }

    if (!parsedData.title || typeof parsedData.title !== "string") {
      parsedData.title = "Resume" // Fallback title
    }

    if (!Array.isArray(parsedData.sections)) {
      return NextResponse.json({ success: false, error: "AI failed to extract resume sections." }, { status: 500 })
    }

    // Ensure all sections have required fields and generate IDs
    parsedData.sections = parsedData.sections.map((section: any, index: number) => ({
      "section name": section["section name"] || `Section ${index + 1}`,
      content: Array.isArray(section.content) ? section.content : [],
      id: section.id || `section-${Math.random().toString(36).substring(2, 9)}`,
    }))

    console.log("Resume parsing completed successfully")
    console.log("Parsed data preview:", {
      title: parsedData.title,
      sectionsCount: parsedData.sections.length,
      sections: parsedData.sections.map((s: any) => s["section name"]),
    })

    return NextResponse.json({
      success: true,
      data: parsedData,
    })
  } catch (error) {
    console.error("Unexpected error in parse-resume API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 },
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ success: false, error: "Method not allowed. Use POST." }, { status: 405 })
}
