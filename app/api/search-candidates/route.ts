import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 50)
    const offset = (page - 1) * limit

    const whereConditions = ["r.resume_data IS NOT NULL"]
    const queryParams: any[] = []

    if (search.trim()) {
      // Search in resume data (JSON field) for skills, experience, etc.
      whereConditions.push(`(
        r.resume_data::text ILIKE $${queryParams.length + 1} OR
        r.title ILIKE $${queryParams.length + 1} OR
        u.name ILIKE $${queryParams.length + 1} OR
        u.email ILIKE $${queryParams.length + 1}
      )`)
      queryParams.push(`%${search}%`)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      INNER JOIN resumes r ON u.id = r.user_id
      ${whereClause}
    `

    const countResult = await sql.query(countQuery, queryParams)
    const total = Number.parseInt(countResult[0]?.total || "0")

    // Get candidates with their latest resume
    const candidatesQuery = `
      SELECT DISTINCT ON (u.id)
        u.id as user_id,
        u.name,
        u.email,
        u.created_at as user_created_at,
        r.id as resume_id,
        r.title as resume_title,
        r.resume_data,
        r.created_at as resume_created_at,
        r.updated_at as resume_updated_at
      FROM users u
      INNER JOIN resumes r ON u.id = r.user_id
      ${whereClause}
      ORDER BY u.id, r.updated_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `

    const candidates = await sql.query(candidatesQuery, [...queryParams, limit, offset])

    // Process candidates to extract relevant information
    const processedCandidates = candidates.map((candidate: any) => {
      let resumeData = {}
      try {
        resumeData =
          typeof candidate.resume_data === "string" ? JSON.parse(candidate.resume_data) : candidate.resume_data || {}
      } catch (error) {
        console.error("Error parsing resume data:", error)
      }

      // Extract skills from resume data
      const skills = []
      if (resumeData.skills && Array.isArray(resumeData.skills)) {
        skills.push(...resumeData.skills)
      }
      if (resumeData.technicalSkills && Array.isArray(resumeData.technicalSkills)) {
        skills.push(...resumeData.technicalSkills)
      }

      // Extract experience titles
      const experienceTitles = []
      if (resumeData.experience && Array.isArray(resumeData.experience)) {
        experienceTitles.push(...resumeData.experience.map((exp: any) => exp.position || exp.title).filter(Boolean))
      }

      // Extract education
      const education = []
      if (resumeData.education && Array.isArray(resumeData.education)) {
        education.push(
          ...resumeData.education.map((edu: any) => ({
            degree: edu.degree || "",
            institution: edu.institution || edu.school || "",
            year: edu.graduationYear || edu.year || "",
          })),
        )
      }

      return {
        user_id: candidate.user_id,
        name: candidate.name,
        email: candidate.email,
        resume_id: candidate.resume_id,
        resume_title: candidate.resume_title,
        skills: [...new Set(skills)], // Remove duplicates
        experience_titles: [...new Set(experienceTitles)],
        education,
        resume_created_at: candidate.resume_created_at,
        resume_updated_at: candidate.resume_updated_at,
        user_created_at: candidate.user_created_at,
      }
    })

    return NextResponse.json({
      success: true,
      candidates: processedCandidates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      search_term: search,
    })
  } catch (error) {
    console.error("Error searching candidates:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search candidates",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
