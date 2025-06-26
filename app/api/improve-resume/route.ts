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

    const { resumeData, jobRequirements, analysis, action, responses } = body

    if (!resumeData || !jobRequirements || !analysis) {
      return NextResponse.json(
        { success: false, error: "Resume data, job requirements, and analysis are required." },
        { status: 400 },
      )
    }

    let prompt = ""

    if (action === "generate_questions") {
      // Generate improvement questions based on analysis
      prompt = `
You are an expert resume coach. Based on the resume analysis provided, generate targeted questions that will help gather information to improve the resume's match score for this specific job.

CURRENT ANALYSIS:
- Overall Score: ${analysis.overallScore}/100
- Missing Elements: ${analysis.missingElements.join(", ")}
- Missing Keywords: ${analysis.keywordAnalysis.missingKeywords.join(", ")}
- Recommendations: ${analysis.recommendations.join(", ")}

JOB REQUIREMENTS:
${jobRequirements}

CURRENT RESUME SECTIONS:
${resumeData.sections.map((section: any) => `${section["section name"]}: ${section.content.length} items`).join(", ")}

Generate 5-8 targeted questions that will help gather specific information to address the missing elements and improve the resume score. Focus on:
1. Missing technical skills or certifications
2. Relevant experience that might not be highlighted
3. Quantifiable achievements related to job requirements
4. Industry-specific keywords and terminology
5. Educational background or training
6. Projects or accomplishments that align with job needs

Return your response in this JSON format:
{
  "questions": [
    {
      "id": "q1",
      "question": "Do you have experience with [specific technology/skill mentioned in job requirements]? If yes, describe specific projects or achievements.",
      "category": "technical_skills",
      "purpose": "To address missing technical requirements"
    }
  ]
}

Make questions specific to the job requirements and missing elements. Each question should be actionable and help gather concrete information that can be added to the resume.
`
    } else if (action === "improve_resume" && responses) {
      // Generate improved resume based on responses
      prompt = `
You are an expert resume writer. Based on the user's responses to improvement questions, update the resume to better match the job requirements and improve the analysis score.

ORIGINAL RESUME:
${JSON.stringify(resumeData, null, 2)}

JOB REQUIREMENTS:
${jobRequirements}

CURRENT ANALYSIS ISSUES:
- Score: ${analysis.overallScore}/100
- Missing Elements: ${analysis.missingElements.join(", ")}
- Missing Keywords: ${analysis.keywordAnalysis.missingKeywords.join(", ")}

USER RESPONSES TO IMPROVEMENT QUESTIONS:
${responses.map((r: any) => `Q: ${r.question}\nA: ${r.answer}`).join("\n\n")}

Based on the user's responses, improve the resume by:
1. Adding relevant experience, skills, or achievements mentioned in responses
2. Incorporating missing keywords naturally into existing content
3. Quantifying achievements where possible
4. Restructuring content to better highlight relevant experience
5. Adding new sections if needed (e.g., Projects, Certifications)
6. Improving descriptions to better match job requirements

Return the improved resume in the same JSON format as the original, but with enhanced content. Maintain the original structure but improve the content quality and relevance.

IMPORTANT:
- Keep the same JSON structure as the original resume
- Only add information that was provided in the user's responses
- Don't fabricate or assume information not provided
- Improve existing content and add new relevant content based on responses
- Ensure all sections have proper IDs
- Make descriptions more impactful and keyword-rich

Return ONLY the improved resume JSON with no additional formatting or text.
`
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'generate_questions' or 'improve_resume'." },
        { status: 400 },
      )
    }

    let result
    try {
      const aiResponse = await generateText({
        model: openai("gpt-4o", {
          apiKey: "sk-proj-sDtKKyK65CABt9mRtL5wT3BlbkFJpg1ODkGHlhS0wqV1ma4T",
        }),
        prompt,
        temperature: 0.3,
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
    let responseData
    try {
      responseData = JSON.parse(cleanedResult)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Original AI response:", result)

      // Try to extract JSON from the response if it's embedded in text
      const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          responseData = JSON.parse(jsonMatch[0])
        } catch (secondParseError) {
          return NextResponse.json(
            { success: false, error: "AI returned invalid format. Please try again." },
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

    if (action === "generate_questions") {
      // Validate questions structure
      if (!responseData.questions || !Array.isArray(responseData.questions)) {
        return NextResponse.json({ success: false, error: "AI returned invalid questions format." }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        questions: responseData.questions,
      })
    } else if (action === "improve_resume") {
      // Validate resume structure
      if (!responseData.title || !responseData.sections) {
        return NextResponse.json({ success: false, error: "AI returned invalid resume format." }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        improvedResume: responseData,
      })
    }

    return NextResponse.json({ success: false, error: "Unknown error occurred." }, { status: 500 })
  } catch (error) {
    console.error("Unexpected error in improve-resume API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: "Method not allowed. Use POST." }, { status: 405 })
}
