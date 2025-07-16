import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface JsonResumeSection {
  "section name": string
  content: Array<{
    [key: string]: string
  }>
  id: string
}

interface JsonResume {
  title: string
  sections: JsonResumeSection[]
}

interface JobDescription {
  title: string
  description: string
  requirements?: string[]
  skills?: string[]
}

interface ResumeRanking {
  resumeTitle: string
  score: number
  rank: number
  strengths: string[]
  weaknesses: string[]
  keySkillsFound: string[]
  experienceMatch: string
  summary: string
  contactInfo: {
    email?: string
    phone?: string
    name?: string
    linkedin?: string
  }
  detailedAnalysis: {
    experienceScore: number
    skillsScore: number
    educationScore: number
    overallFit: string
  }
}

interface RankingResponse {
  jobTitle: string
  totalResumes: number
  rankings: ResumeRanking[]
  analysisTimestamp: string
}

function extractContactInfoFromResume(resume: JsonResume): {
  email?: string
  phone?: string
  name?: string
  linkedin?: string
} {
  const contactInfo: { email?: string; phone?: string; name?: string; linkedin?: string } = {}

  // Extract name from title
  const titleMatch = resume.title.match(/^([^-]+)/)
  if (titleMatch) {
    contactInfo.name = titleMatch[1].trim()
  }

  // Look for contact information in sections
  resume.sections.forEach((section) => {
    if (
      section["section name"].toLowerCase().includes("contact") ||
      section["section name"].toLowerCase().includes("personal")
    ) {
      section.content.forEach((item) => {
        Object.entries(item).forEach(([key, value]) => {
          const lowerKey = key.toLowerCase()
          const lowerValue = value.toLowerCase()

          // Extract email
          const emailMatch = value.match(/[\w.-]+@[\w.-]+\.\w+/)
          if (emailMatch || lowerKey.includes("email")) {
            contactInfo.email = emailMatch ? emailMatch[0] : value
          }

          // Extract phone
          const phoneMatch = value.match(/[+]?[\d\s\-()]{10,}/)
          if (phoneMatch || lowerKey.includes("phone")) {
            contactInfo.phone = phoneMatch ? phoneMatch[0] : value
          }

          // Extract LinkedIn
          if (lowerValue.includes("linkedin") || lowerKey.includes("linkedin")) {
            contactInfo.linkedin = value
          }
        })
      })
    }
  })

  return contactInfo
}

function convertJsonResumeToText(resume: JsonResume): string {
  let text = `${resume.title}\n\n`

  resume.sections.forEach((section) => {
    text += `${section["section name"].toUpperCase()}:\n`

    section.content.forEach((item) => {
      Object.entries(item).forEach(([key, value]) => {
        text += `${key}: ${value}\n`
      })
      text += "\n"
    })
    text += "\n"
  })

  return text
}

function createFallbackRanking(resume: JsonResume, jobDescription: JobDescription, rank: number): ResumeRanking {
  // Extract skills from resume
  const skillsSection = resume.sections.find((s) => s["section name"].toLowerCase().includes("skill"))

  const resumeSkills: string[] = []
  if (skillsSection) {
    skillsSection.content.forEach((item) => {
      Object.values(item).forEach((value) => {
        if (typeof value === "string") {
          resumeSkills.push(...value.split(/[,;]/).map((s) => s.trim()))
        }
      })
    })
  }

  // Simple scoring based on keyword matching
  const jobSkills = jobDescription.skills || []
  const matchingSkills = resumeSkills.filter((skill) =>
    jobSkills.some(
      (jobSkill) =>
        skill.toLowerCase().includes(jobSkill.toLowerCase()) || jobSkill.toLowerCase().includes(skill.toLowerCase()),
    ),
  )

  const score = Math.min(95, Math.max(40, 60 + matchingSkills.length * 5))

  return {
    resumeTitle: resume.title,
    score,
    rank,
    strengths: ["Relevant technical background", "Good educational foundation", "Professional experience"],
    weaknesses: ["Could benefit from more specific experience", "May need additional training in some areas"],
    keySkillsFound: resumeSkills.slice(0, 8),
    experienceMatch: "Good match with relevant background",
    summary: `This candidate shows ${score >= 80 ? "excellent" : score >= 60 ? "good" : "fair"} potential for the role.`,
    contactInfo: extractContactInfoFromResume(resume),
    detailedAnalysis: {
      experienceScore: Math.floor(score * 0.9),
      skillsScore: score,
      educationScore: Math.floor(score * 1.1),
      overallFit: score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Fair",
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const { resumes, jobDescription } = await request.json()

    if (!resumes || !Array.isArray(resumes) || resumes.length === 0) {
      return NextResponse.json(
        {
          error: "Resumes array is required and must contain at least one resume",
        },
        { status: 400 },
      )
    }

    if (!jobDescription || !jobDescription.title || !jobDescription.description) {
      return NextResponse.json(
        {
          error: "Job description with title and description is required",
        },
        { status: 400 },
      )
    }

    const rankings: ResumeRanking[] = []

    // Process each resume individually for better error handling
    for (let i = 0; i < resumes.length; i++) {
      const resume = resumes[i] as JsonResume

      try {
        // Convert JSON resume to readable text
        const resumeText = convertJsonResumeToText(resume)

        const prompt = `
You are an expert HR recruiter. Analyze this JSON-structured resume against the job description and respond with ONLY a valid JSON object in this exact format:

{
  "resumeTitle": "${resume.title}",
  "score": 85,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "keySkillsFound": ["skill1", "skill2", "skill3"],
  "experienceMatch": "detailed experience assessment",
  "summary": "brief summary of candidate fit",
  "detailedAnalysis": {
    "experienceScore": 80,
    "skillsScore": 90,
    "educationScore": 85,
    "overallFit": "Excellent/Good/Fair/Poor"
  }
}

JOB DESCRIPTION:
Title: ${jobDescription.title}
Description: ${jobDescription.description}
${jobDescription.requirements ? `Requirements: ${jobDescription.requirements.join(", ")}` : ""}
${jobDescription.skills ? `Required Skills: ${jobDescription.skills.join(", ")}` : ""}

RESUME TO ANALYZE:
${resumeText}

Provide a comprehensive analysis with:
- Score from 0-100 based on job match
- 3-5 key strengths that align with the job
- 2-4 areas for improvement
- List of relevant skills found in resume
- Detailed experience match assessment
- Brief summary of overall fit
- Detailed scoring breakdown for experience, skills, and education

Respond with ONLY the JSON object, no other text.`

        const { text } = await generateText({
          model: openai("gpt-4o"),
          prompt,
          maxTokens: 1200,
        })

        let ranking: ResumeRanking
        try {
          // Clean and parse the response
          const cleanedText = text
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim()
          const parsed = JSON.parse(cleanedText)

          // Validate required fields
          if (!parsed.resumeTitle || typeof parsed.score !== "number") {
            throw new Error("Invalid structure")
          }

          ranking = {
            ...parsed,
            rank: 0, // Will be set after sorting
            contactInfo: extractContactInfoFromResume(resume),
          } as ResumeRanking
        } catch (parseError) {
          console.warn(`Failed to parse AI response for ${resume.title}, using fallback:`, parseError)
          ranking = createFallbackRanking(resume, jobDescription, 0)
        }

        rankings.push(ranking)
      } catch (error) {
        console.warn(`Error analyzing ${resume.title}, using fallback:`, error)
        rankings.push(createFallbackRanking(resume, jobDescription, 0))
      }
    }

    // Sort by score and assign ranks
    rankings.sort((a, b) => b.score - a.score)
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1
    })

    const response: RankingResponse = {
      jobTitle: jobDescription.title,
      totalResumes: resumes.length,
      rankings,
      analysisTimestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Resume ranking error:", error)
    return NextResponse.json(
      {
        error: "Failed to rank resumes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
