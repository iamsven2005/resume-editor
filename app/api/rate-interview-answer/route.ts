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

    const { question, answer, resumeData, keyPointsToAddress } = body

    if (!question || !answer || !resumeData) {
      return NextResponse.json(
        { success: false, error: "Question, answer, and resume data are required." },
        { status: 400 },
      )
    }

    if (typeof answer !== "string" || answer.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Answer must be a non-empty string." }, { status: 400 })
    }

    // Convert resume data to text for context
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
You are an expert HR interviewer and career coach. Rate and provide feedback on this interview answer.

INTERVIEW QUESTION:
${question.question}

QUESTION CATEGORY: ${question.category}
QUESTION DIFFICULTY: ${question.difficulty}
WHAT INTERVIEWER LOOKS FOR: ${question.whatInterviewerLooksFor}

KEY POINTS TO ADDRESS:
${keyPointsToAddress ? keyPointsToAddress.join("\n- ") : "No specific points provided"}

CANDIDATE'S RESUME CONTEXT:
${resumeText}

CANDIDATE'S ANSWER:
${answer}

Please provide a comprehensive evaluation of this answer in the following JSON format:

{
  "overallScore": 85,
  "scoreBreakdown": {
    "relevance": 90,
    "completeness": 80,
    "clarity": 85,
    "examples": 75,
    "confidence": 90
  },
  "strengths": [
    "Specific strength 1 in the answer",
    "Specific strength 2 in the answer"
  ],
  "areasForImprovement": [
    "Specific area 1 that could be improved",
    "Specific area 2 that could be enhanced"
  ],
  "missedOpportunities": [
    "Key point from resume that wasn't mentioned",
    "Relevant experience that could have been highlighted"
  ],
  "improvedAnswer": "A suggested improved version of the answer that incorporates the feedback and better addresses the question",
  "interviewerPerspective": "How an interviewer would likely perceive this answer",
  "nextSteps": [
    "Actionable tip 1 for similar questions",
    "Actionable tip 2 for interview preparation"
  ]
}

Scoring Guidelines:
- Overall Score: 0-100 (Excellent: 90-100, Good: 75-89, Average: 60-74, Needs Work: 40-59, Poor: 0-39)
- Score Breakdown (each 0-100):
  - Relevance: How well the answer addresses the question
  - Completeness: Whether all key points were covered
  - Clarity: How clear and well-structured the answer is
  - Examples: Quality and relevance of examples provided
  - Confidence: How confident and professional the delivery sounds

Instructions:
1. Be constructive and specific in feedback
2. Reference the candidate's resume when relevant
3. Provide actionable improvement suggestions
4. Consider the question difficulty and category
5. Highlight both strengths and areas for growth
6. Suggest a realistic improved answer
7. Keep feedback professional and encouraging

Return ONLY the JSON object with no additional formatting or text.
`

    let result
    try {
      const aiResponse = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.3, // Lower temperature for more consistent scoring
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
    let ratingData
    try {
      ratingData = JSON.parse(cleanedResult)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Original AI response:", result)

      // Try to extract JSON from the response if it's embedded in text
      const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          ratingData = JSON.parse(jsonMatch[0])
        } catch (secondParseError) {
          return NextResponse.json(
            { success: false, error: "AI returned invalid rating format. Please try again." },
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

    // Validate the rating structure
    if (!ratingData || typeof ratingData !== "object") {
      return NextResponse.json({ success: false, error: "AI returned invalid rating structure." }, { status: 500 })
    }

    // Ensure required fields exist with defaults
    const validatedRating = {
      overallScore: ratingData.overallScore || 0,
      scoreBreakdown: {
        relevance: ratingData.scoreBreakdown?.relevance || 0,
        completeness: ratingData.scoreBreakdown?.completeness || 0,
        clarity: ratingData.scoreBreakdown?.clarity || 0,
        examples: ratingData.scoreBreakdown?.examples || 0,
        confidence: ratingData.scoreBreakdown?.confidence || 0,
      },
      strengths: Array.isArray(ratingData.strengths) ? ratingData.strengths : [],
      areasForImprovement: Array.isArray(ratingData.areasForImprovement) ? ratingData.areasForImprovement : [],
      missedOpportunities: Array.isArray(ratingData.missedOpportunities) ? ratingData.missedOpportunities : [],
      improvedAnswer: ratingData.improvedAnswer || "No improved answer provided",
      interviewerPerspective: ratingData.interviewerPerspective || "No perspective provided",
      nextSteps: Array.isArray(ratingData.nextSteps) ? ratingData.nextSteps : [],
    }

    return NextResponse.json({
      success: true,
      rating: validatedRating,
    })
  } catch (error) {
    console.error("Unexpected error in rate-interview-answer API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: "Method not allowed. Use POST." }, { status: 405 })
}
