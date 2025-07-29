import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { resumeData, jobRequirements, analysis } = await request.json()

    const prompt = `Based on the following resume data and job requirements, generate 8-10 personalized interview questions that would be relevant for this candidate.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Job Requirements:
${jobRequirements}

Analysis Results:
${JSON.stringify(analysis, null, 2)}

Generate questions that:
1. Test relevant technical skills mentioned in the resume
2. Explore behavioral situations based on their experience
3. Address any gaps or weaknesses identified in the analysis
4. Validate their experience claims
5. Assess cultural fit for the role

For each question, provide:
- The question text
- Category (Technical, Behavioral, Situational, Experience, Gap-Addressing)
- Difficulty level (Easy, Medium, Hard)
- What the interviewer is looking for
- Key points the candidate should address based on their resume
- A unique ID

Also provide 3-5 overall interview tips specific to this role and candidate.

Return the response in this JSON format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "category": "Technical|Behavioral|Situational|Experience|Gap-Addressing",
      "difficulty": "Easy|Medium|Hard",
      "whatInterviewerLooksFor": "What the interviewer wants to assess",
      "keyPointsToAddress": ["Point 1", "Point 2", "Point 3"]
    }
  ],
  "overallTips": ["Tip 1", "Tip 2", "Tip 3"]
}`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
    })

    // Parse the JSON response
    const interviewQuestions = JSON.parse(text)

    return NextResponse.json({
      success: true,
      interviewQuestions,
    })
  } catch (error) {
    console.error("Error generating interview questions:", error)
    return NextResponse.json({ success: false, error: "Failed to generate interview questions" }, { status: 500 })
  }
}
