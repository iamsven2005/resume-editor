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

    const { resumeData, jobRequirements, analysis, emailType = "application", customInstructions = "" } = body

    if (!resumeData || !jobRequirements || !analysis) {
      return NextResponse.json(
        { success: false, error: "Resume data, job requirements, and analysis are required." },
        { status: 400 },
      )
    }

    // Extract key information from resume
    const resumeText = `
Name: ${resumeData.title}

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

    let emailPrompt = ""

    switch (emailType) {
      case "application":
        emailPrompt = `
You are an expert email writer specializing in job applications. Create a professional, personalized email for a job application based on the resume analysis and job requirements.

RESUME INFORMATION:
${resumeText}

JOB REQUIREMENTS:
${jobRequirements}

RESUME ANALYSIS:
- Match Score: ${analysis.overallScore}/100
- Strengths: ${analysis.strengths.join(", ")}
- Key Skills Present: ${analysis.keywordAnalysis.presentKeywords.join(", ")}

EMAIL TYPE: Job Application Email

Create a professional job application email that:
1. Has an engaging subject line
2. Addresses the hiring manager professionally
3. Highlights the candidate's strongest qualifications that match the job
4. Mentions specific achievements or experiences from the resume
5. Shows enthusiasm for the role and company
6. Includes a clear call to action
7. Is concise but impactful (200-300 words)

${customInstructions ? `ADDITIONAL INSTRUCTIONS: ${customInstructions}` : ""}

Return the email in this JSON format:
{
  "subject": "Compelling subject line for the job application",
  "body": "Professional email body with proper formatting and line breaks"
}
`
        break

      case "networking":
        emailPrompt = `
You are an expert email writer specializing in professional networking. Create a networking email based on the resume analysis and target industry/role.

RESUME INFORMATION:
${resumeText}

TARGET INDUSTRY/ROLE:
${jobRequirements}

RESUME ANALYSIS:
- Professional Background: ${analysis.sectionAnalysis.experience}
- Key Skills: ${analysis.keywordAnalysis.presentKeywords.join(", ")}
- Education: ${analysis.sectionAnalysis.education}

EMAIL TYPE: Professional Networking Email

Create a networking email that:
1. Has a professional subject line
2. Introduces the sender naturally
3. Mentions a specific connection point or shared interest
4. Highlights relevant background without being pushy
5. Suggests a specific, low-commitment next step (coffee chat, brief call)
6. Shows genuine interest in the recipient's work/company
7. Is warm but professional (150-250 words)

${customInstructions ? `ADDITIONAL INSTRUCTIONS: ${customInstructions}` : ""}

Return the email in this JSON format:
{
  "subject": "Professional subject line for networking",
  "body": "Networking email body with proper formatting and line breaks"
}
`
        break

      case "follow_up":
        emailPrompt = `
You are an expert email writer specializing in follow-up communications. Create a follow-up email based on the resume analysis and previous interaction context.

RESUME INFORMATION:
${resumeText}

CONTEXT/JOB REQUIREMENTS:
${jobRequirements}

RESUME ANALYSIS:
- Match Score: ${analysis.overallScore}/100
- Key Strengths: ${analysis.strengths.join(", ")}

EMAIL TYPE: Follow-up Email

Create a follow-up email that:
1. Has a clear, reference-based subject line
2. References the previous interaction professionally
3. Reiterates interest and qualifications briefly
4. Provides additional value or information if relevant
5. Includes a polite call to action
6. Maintains professional tone
7. Is concise and respectful (100-200 words)

${customInstructions ? `ADDITIONAL INSTRUCTIONS: ${customInstructions}` : ""}

Return the email in this JSON format:
{
  "subject": "Clear follow-up subject line",
  "body": "Follow-up email body with proper formatting and line breaks"
}
`
        break

      default:
        return NextResponse.json({ success: false, error: "Invalid email type." }, { status: 400 })
    }

    let result
    try {
      const aiResponse = await generateText({
        model: openai("gpt-4o"),
        prompt: emailPrompt,
        temperature: 0.7, // Slightly higher for more creative and personalized emails
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
    let emailData
    try {
      emailData = JSON.parse(cleanedResult)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Original AI response:", result)

      // Try to extract JSON from the response if it's embedded in text
      const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          emailData = JSON.parse(jsonMatch[0])
        } catch (secondParseError) {
          return NextResponse.json(
            { success: false, error: "AI returned invalid email format. Please try again." },
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

    // Validate the email structure
    if (!emailData || typeof emailData !== "object" || !emailData.subject || !emailData.body) {
      return NextResponse.json({ success: false, error: "AI returned invalid email structure." }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      email: {
        subject: emailData.subject,
        body: emailData.body,
        type: emailType,
      },
    })
  } catch (error) {
    console.error("Unexpected error in generate-email API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: "Method not allowed. Use POST." }, { status: 405 })
}
