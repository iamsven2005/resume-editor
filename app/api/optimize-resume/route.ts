import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { resume, jobDescription } = await request.json()

    if (!resume || !jobDescription) {
      return NextResponse.json({ error: "Resume data and job description are required" }, { status: 400 })
    }

    // Validate resume structure
    if (!resume.sections || !Array.isArray(resume.sections)) {
      return NextResponse.json({ error: "Invalid resume format - sections array is required" }, { status: 400 })
    }

    const prompt = `You are an expert resume optimization specialist. Your task is to optimize a resume to better match a specific job description while maintaining authenticity and truthfulness.

IMPORTANT RULES:
1. NEVER invent false information, experiences, or qualifications
2. Only enhance, rephrase, and reorganize existing content
3. Maintain the exact JSON structure provided
4. Keep all existing section IDs and structure intact
5. Focus on keyword optimization and better alignment with job requirements

RESUME TO OPTIMIZE:
${JSON.stringify(resume, null, 2)}

JOB DESCRIPTION:
${jobDescription}

OPTIMIZATION TASKS:
1. Analyze the job description for key requirements, skills, and keywords
2. Enhance existing resume content to better align with job requirements
3. Rephrase descriptions to include relevant keywords naturally
4. Quantify achievements where possible (but don't invent numbers)
5. Reorder content within sections to prioritize job-relevant items
6. Improve action verbs and impact statements

RESPONSE FORMAT:
Return a JSON object with this exact structure:
{
  "optimized_resume": {
    // The enhanced resume with the same structure as input
  },
  "optimizations": {
    "changes_made": [
      // Array of specific changes made (e.g., "Enhanced software engineering experience description to include React and Node.js keywords")
    ],
    "keywords_added": [
      // Array of new keywords naturally integrated
    ],
    "sections_modified": [
      // Array of section names that were modified
    ],
    "improvement_summary": "Brief summary of overall improvements made",
    "match_score_improvement": 15 // Estimated percentage improvement in job match score
  }
}

Ensure the optimized resume maintains authenticity while being more competitive for the specific job.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.3,
    })

    // Clean and parse the response
    let cleanedResponse = text.trim()

    // Remove markdown code blocks if present
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    // Try to extract JSON if it's wrapped in other text
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0]
    }

    let result
    try {
      result = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Raw response:", text)
      return NextResponse.json({ error: "Failed to parse optimization results. Please try again." }, { status: 500 })
    }

    // Validate the response structure
    if (!result.optimized_resume || !result.optimizations) {
      return NextResponse.json({ error: "Invalid optimization response format" }, { status: 500 })
    }

    // Ensure the optimized resume maintains the required structure
    if (!result.optimized_resume.sections || !Array.isArray(result.optimized_resume.sections)) {
      return NextResponse.json({ error: "Optimized resume missing required sections array" }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in resume optimization:", error)
    return NextResponse.json({ error: "Internal server error during resume optimization" }, { status: 500 })
  }
}
