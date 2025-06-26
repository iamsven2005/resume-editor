import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json({ success: false, error: "Invalid request body. Expected JSON." }, { status: 400 })
    }

    const { resumeData, jobRequirements } = body

    if (!resumeData || !jobRequirements) {
      return NextResponse.json(
        { success: false, error: "Both resume data and job requirements are required." },
        { status: 400 },
      )
    }

    if (typeof jobRequirements !== "string" || jobRequirements.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Job requirements must be a non-empty string." },
        { status: 400 },
      )
    }

    // Convert resume data to text for analysis
    const resumeText = `
Title: ${resumeData.title}

${resumeData.sections
  .map(
    (section: any) => `
${section["section name"]}:
${section.content
  .map((item: any) =>
    Object.entries(item)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n"),
  )
  .join("\n\n")}
`,
  )
  .join("\n")}
    `.trim()

    const prompt = `
You are an expert HR consultant and resume reviewer. Analyze the following resume against the provided job requirements and provide a comprehensive assessment.

RESUME:
${resumeText}

JOB REQUIREMENTS:
${jobRequirements}

Please provide your analysis in the following JSON format:

{
  "overallScore": 85,
  "matchPercentage": "85%",
  "summary": "Brief overall assessment of how well the resume matches the job requirements",
  "strengths": [
    "List of resume strengths that align with job requirements",
    "Each strength should be specific and actionable"
  ],
  "missingElements": [
    "List of key requirements from the job posting that are missing or not clearly demonstrated in the resume",
    "Be specific about what's missing"
  ],
  "recommendations": [
    "Specific actionable recommendations to improve the resume for this job",
    "Include suggestions for skills, experience, or formatting improvements"
  ],
  "keywordAnalysis": {
    "presentKeywords": ["list", "of", "important", "keywords", "found", "in", "resume"],
    "missingKeywords": ["list", "of", "important", "keywords", "missing", "from", "resume"]
  },
  "sectionAnalysis": {
    "experience": "Assessment of work experience relevance",
    "skills": "Assessment of skills section alignment",
    "education": "Assessment of education relevance",
    "other": "Assessment of other sections"
  }
}

Instructions:
1. Score the resume from 0-100 based on how well it matches the job requirements
2. Identify specific strengths that align with the job posting
3. Point out missing elements that are explicitly mentioned in the job requirements
4. Provide actionable recommendations for improvement
5. Analyze keyword presence and absence
6. Assess each major resume section for relevance
7. Be constructive and specific in your feedback
8. Consider both hard skills (technical) and soft skills (interpersonal)

Return ONLY the JSON object with no additional formatting or text.
`

    let result
    try {
      const aiResponse = await generateText({
        model: openai("gpt-4o", {
          apiKey: "sk-proj-sDtKKyK65CABt9mRtL5wT3BlbkFJpg1ODkGHlhS0wqV1ma4T",
        }),
        prompt,
        temperature: 0.3, // Slightly higher for more nuanced analysis
      })
      result = aiResponse.text
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

    cleanedResult = cleanedResult.trim()

    // Parse the AI response
    let analysisData
    try {
      analysisData = JSON.parse(cleanedResult)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Original AI response:", result)

      // Try to extract JSON from the response if it's embedded in text
      const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          analysisData = JSON.parse(jsonMatch[0])
        } catch (secondParseError) {
          return NextResponse.json(
            { success: false, error: "AI returned invalid analysis format. Please try again." },
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

    // Validate the analysis structure
    if (!analysisData || typeof analysisData !== "object") {
      return NextResponse.json({ success: false, error: "AI returned invalid analysis structure." }, { status: 500 })
    }

    // Ensure required fields exist with defaults
    const validatedAnalysis = {
      overallScore: analysisData.overallScore || 0,
      matchPercentage: analysisData.matchPercentage || "0%",
      summary: analysisData.summary || "Analysis could not be completed.",
      strengths: Array.isArray(analysisData.strengths) ? analysisData.strengths : [],
      missingElements: Array.isArray(analysisData.missingElements) ? analysisData.missingElements : [],
      recommendations: Array.isArray(analysisData.recommendations) ? analysisData.recommendations : [],
      keywordAnalysis: {
        presentKeywords: Array.isArray(analysisData.keywordAnalysis?.presentKeywords)
          ? analysisData.keywordAnalysis.presentKeywords
          : [],
        missingKeywords: Array.isArray(analysisData.keywordAnalysis?.missingKeywords)
          ? analysisData.keywordAnalysis.missingKeywords
          : [],
      },
      sectionAnalysis: {
        experience: analysisData.sectionAnalysis?.experience || "No analysis available",
        skills: analysisData.sectionAnalysis?.skills || "No analysis available",
        education: analysisData.sectionAnalysis?.education || "No analysis available",
        other: analysisData.sectionAnalysis?.other || "No analysis available",
      },
    }

    return NextResponse.json({
      success: true,
      analysis: validatedAnalysis,
    })
  } catch (error) {
    console.error("Unexpected error in analyze-resume API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: "Method not allowed. Use POST." }, { status: 405 })
}
