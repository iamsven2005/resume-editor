import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

// Define the schema for resume optimization
const resumeOptimizationSchema = z.object({
  title: z.string(),
  sections: z.array(
    z.object({
      "section name": z.string(),
      content: z.array(z.record(z.any())),
      id: z.string(),
    }),
  ),
  optimizations: z.object({
    changes_made: z.array(z.string()),
    keywords_added: z.array(z.string()),
    sections_modified: z.array(z.string()),
    improvement_summary: z.string(),
    match_score_improvement: z.number(),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const { resume, jobDescription } = await request.json()

    if (!resume || !jobDescription) {
      return NextResponse.json({ error: "Resume and job description are required" }, { status: 400 })
    }

    // Validate resume structure
    if (!resume.title || !resume.sections || !Array.isArray(resume.sections)) {
      return NextResponse.json({ error: "Invalid resume format. Must have title and sections array." }, { status: 400 })
    }

    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: resumeOptimizationSchema,
      prompt: `You are an expert resume optimization specialist. Your task is to take the provided resume and job description, then return an optimized version of the resume that better matches the job requirements.

ORIGINAL RESUME:
${JSON.stringify(resume, null, 2)}

JOB DESCRIPTION:
${jobDescription}

OPTIMIZATION INSTRUCTIONS:
1. **Maintain Structure**: Keep the exact same JSON structure with "section name", "content", and "id" fields
2. **Enhance Content**: Rephrase bullet points and descriptions to better match job requirements
3. **Add Keywords**: Naturally incorporate relevant keywords from the job description
4. **Quantify Achievements**: Add or enhance metrics and numbers where possible
5. **Prioritize Relevance**: Reorder content items to put most relevant experience first
6. **Technical Skills**: Emphasize technologies and skills mentioned in the job description
7. **Action Verbs**: Use strong action verbs that align with the job requirements
8. **Industry Language**: Use terminology and phrases common in the target industry

SPECIFIC OPTIMIZATIONS TO MAKE:
- Analyze the job description for key requirements, skills, and qualifications
- Identify gaps between the current resume and job requirements
- Rephrase existing content to better highlight relevant experience
- Add missing keywords naturally into existing content
- Enhance achievement descriptions with metrics when possible
- Reorder sections and content items by relevance to the job
- Ensure the resume tells a compelling story for this specific role

IMPORTANT RULES:
- Do NOT invent false information or experiences
- Only enhance and rephrase existing content
- Keep all section IDs exactly the same
- Maintain the same number of sections and general structure
- Focus on making existing content more relevant and impactful
- Ensure all changes feel natural and authentic

Return the optimized resume with detailed information about what changes were made and why.`,
    })

    return NextResponse.json({
      optimized_resume: {
        title: result.object.title,
        sections: result.object.sections,
      },
      optimizations: result.object.optimizations,
      success: true,
    })
  } catch (error) {
    console.error("Resume optimization error:", error)
    return NextResponse.json(
      {
        error: "Failed to optimize resume",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
