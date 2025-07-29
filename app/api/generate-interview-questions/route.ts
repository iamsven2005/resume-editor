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

    const { resumeData, jobRequirements, analysis } = body

    if (!resumeData || !jobRequirements || !analysis) {
      return NextResponse.json(
        { success: false, error: "Resume data, job requirements, and analysis are required." },
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
You are an expert HR interviewer and career coach. Based on the resume and job requirements, generate relevant interview questions that would likely be asked for this position.

RESUME:
${resumeText}

JOB REQUIREMENTS:
${jobRequirements}

RESUME ANALYSIS INSIGHTS:
- Match Score: ${analysis.overallScore}/100
- Strengths: ${analysis.strengths.join(", ")}
- Missing Elements: ${analysis.missingElements.join(", ")}
- Key Skills: ${analysis.keywordAnalysis.presentKeywords.join(", ")}

Generate 8-10 interview questions that cover:
1. Technical skills and experience relevant to the job
2. Behavioral questions based on the candidate's background
3. Questions that address any gaps or missing elements
4. Situational questions relevant to the role
5. Questions about specific achievements mentioned in the resume

For each question, provide:
- The question itself
- The category/type of question
- What the interviewer is looking for in the answer
- Key points the candidate should cover based on their resume

Return the response in this JSON format:

{
  "questions": [
    {
      "id": 1,
      "question": "The actual interview question",
      "category": "Technical|Behavioral|Situational|Experience|Gap-Addressing",
      "difficulty": "Easy|Medium|Hard",
      "whatInterviewerLooksFor": "What the interviewer wants to assess with this question",
      "keyPointsToAddress": [
        "Key point 1 the candidate should mention",
        "Key point 2 based on their resume",
        "Key point 3 relevant to the role"
      ],
      "resumeConnection": "How this question relates to the candidate's resume or gaps"
    }
  ],
  "overallTips": [
    "General tip 1 for the interview",
    "General tip 2 based on the analysis",
    "General tip 3 for this specific role"
  ]
}

Instructions:
1. Make questions specific to the role and the candidate's background
2. Include a mix of question types and difficulties
3. Address both strengths and potential weaknesses
4. Provide actionable guidance for each question
5. Consider the company culture and role requirements
6. Include questions that allow the candidate to showcase their best experiences

Return ONLY the JSON object with no additional formatting or text.
`

    let result
    try {
      const aiResponse = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.7,
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
    let questionsData
    try {
      questionsData = JSON.parse(cleanedResult)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Original AI response:", result)

      // Try to extract JSON from the response if it's embedded in text
      const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          questionsData = JSON.parse(jsonMatch[0])
        } catch (secondParseError) {
          return NextResponse.json(
            { success: false, error: "AI returned invalid questions format. Please try again." },
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

    // Validate the questions structure
    if (!questionsData || typeof questionsData !== "object" || !Array.isArray(questionsData.questions)) {
      return NextResponse.json({ success: false, error: "AI returned invalid questions structure." }, { status: 500 })
    }

    // Ensure required fields exist with defaults
    const validatedQuestions = {
      questions: questionsData.questions.map((q: any, index: number) => ({
        id: q.id || index + 1,
        question: q.question || "Question not available",
        category: q.category || "General",
        difficulty: q.difficulty || "Medium",
        whatInterviewerLooksFor: q.whatInterviewerLooksFor || "General assessment",
        keyPointsToAddress: Array.isArray(q.keyPointsToAddress) ? q.keyPointsToAddress : [],
        resumeConnection: q.resumeConnection || "General relevance to role",
      })),
      overallTips: Array.isArray(questionsData.overallTips) ? questionsData.overallTips : [],
    }

    return NextResponse.json({
      success: true,
      interviewQuestions: validatedQuestions,
    })
  } catch (error) {
    console.error("Unexpected error in generate-interview-questions API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: "Method not allowed. Use POST." }, { status: 405 })
}
