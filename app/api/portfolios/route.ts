import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const portfolios = await sql`
      SELECT 
        id, 
        title, 
        description, 
        theme, 
        resume_data, 
        is_published, 
        portfolio_url,
        total_views,
        unique_visitors,
        views_last_7_days,
        views_last_30_days,
        created_at, 
        updated_at
      FROM portfolios 
      WHERE user_id = ${user.id}
      ORDER BY updated_at DESC
    `

    return NextResponse.json({
      success: true,
      portfolios: portfolios,
    })
  } catch (error) {
    console.error("Error fetching portfolios:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch portfolios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, theme, resumeIds, mergedResumeData } = body

    if (!title || !theme) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and theme are required",
        },
        { status: 400 },
      )
    }

    // Generate a unique URL slug
    const urlSlug = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now().toString(36)}`

    let finalResumeData = mergedResumeData

    // If no merged data provided, merge the selected resumes
    if (!finalResumeData && resumeIds && resumeIds.length > 0) {
      const resumes = await sql`
        SELECT resume_data FROM resumes 
        WHERE id = ANY(${resumeIds}) AND user_id = ${user.id}
      `

      // Simple merge logic - combine all sections
      finalResumeData = {
        personalInfo: {},
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
      }

      resumes.forEach((resume: any) => {
        const data = typeof resume.resume_data === "string" ? JSON.parse(resume.resume_data) : resume.resume_data

        // Merge personal info (last one wins for conflicts)
        if (data.personalInfo) {
          finalResumeData.personalInfo = { ...finalResumeData.personalInfo, ...data.personalInfo }
        }

        // Concatenate arrays
        if (data.experience) finalResumeData.experience.push(...data.experience)
        if (data.education) finalResumeData.education.push(...data.education)
        if (data.skills) finalResumeData.skills.push(...data.skills)
        if (data.projects) finalResumeData.projects.push(...data.projects)
        if (data.certifications) finalResumeData.certifications.push(...data.certifications)
      })

      // Remove duplicates from skills
      finalResumeData.skills = [...new Set(finalResumeData.skills)]
    }

    const result = await sql`
      INSERT INTO portfolios (
        user_id, 
        title, 
        description, 
        theme, 
        resume_data, 
        portfolio_url,
        is_published,
        total_views,
        unique_visitors,
        views_last_7_days,
        views_last_30_days,
        created_at, 
        updated_at
      )
      VALUES (
        ${user.id}, 
        ${title}, 
        ${description || null}, 
        ${theme}, 
        ${JSON.stringify(finalResumeData)}, 
        ${urlSlug},
        false,
        0,
        0,
        0,
        0,
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      portfolio: result[0],
    })
  } catch (error) {
    console.error("Error creating portfolio:", error)
    return NextResponse.json({ success: false, error: "Failed to create portfolio" }, { status: 500 })
  }
}
