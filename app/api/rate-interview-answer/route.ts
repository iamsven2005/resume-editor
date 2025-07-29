import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { question, answer, resumeData, keyPointsToAddress } = await request.json()

    const prompt = `Rate this interview answer on a scale of 0-100 and provide detailed feedback.

Interview Question:
${JSON.stringify(question, null, 2)}

Candidate's Answer:
${answer}

Candidate's Resume Data:
${JSON.stringify(resumeData, null, 2)}

Key Points They Should Address:
${keyPointsToAddress.join(", ")}

Please evaluate the answer based on:
1. Relevance to the question (0-100)
2. Completeness of response (0-100)
3. Clarity and structure (0-100)
4. Use of specific examples (0-100)
5. Confidence and professionalism (0-100)

Provide:
- Overall score (0-100)
- Score breakdown for each category
- 3-5 specific strengths
- 3-5 areas for improvement
- Missed opportunities (things from their resume they could have mentioned)
- An improved version of their answer
- How an interviewer would likely perceive this answer
- 3-5 next steps for improvement

Return the response in this JSON format:
{
  "overallScore": 85,
  "scoreBreakdown": {
    "relevance": 90,
    "completeness": 80,
    "clarity": 85,
    "examples": 85,
    "confidence": 80
  },
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "areasForImprovement": ["Area 1", "Area 2", "Area 3"],
  "missedOpportunities": ["Missed 1", "Missed 2"],
  "improvedAnswer": "Here's how they could have answered better...",
  "interviewerPerspective": "How an interviewer would view this response...",
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.3,
    })

    // Parse the JSON response
    const rating = JSON.parse(text)

    return NextResponse.json({
      success: true,
      rating,
    })
  } catch (error) {
    console.error("Error rating interview answer:", error)
    return NextResponse.json({ success: false, error: "Failed to rate interview answer" }, { status: 500 })
  }
}
