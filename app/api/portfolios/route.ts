import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_NEON_DATABASE_URL!)

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const portfolios = await sql`
      SELECT 
        p.*,
        COALESCE(pas.total_views, 0) as total_views,
        COALESCE(pas.unique_visitors, 0) as unique_visitors,
        COALESCE(pas.views_last_7_days, 0) as views_last_7_days,
        COALESCE(pas.views_last_30_days, 0) as views_last_30_days
      FROM portfolios p
      LEFT JOIN portfolio_analytics_summary pas ON p.id = pas.portfolio_id
      WHERE p.user_id = ${user.id}
      ORDER BY p.updated_at DESC
    `

    return NextResponse.json({
      success: true,
      portfolios,
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

    const { title, description, theme = "modern", resumeIds } = await request.json()

    if (!title || !resumeIds || !Array.isArray(resumeIds) || resumeIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and at least one resume ID are required",
        },
        { status: 400 },
      )
    }

    // Fetch the selected resumes
    const resumes = await sql`
      SELECT id, title, resume_data
      FROM resumes
      WHERE id = ANY(${resumeIds}) AND user_id = ${user.id}
    `

    if (resumes.length !== resumeIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Some resumes not found or not accessible",
        },
        { status: 404 },
      )
    }

    // Merge resume data
    const mergedResumeData = {
      title: title,
      sections: [],
    }

    // Combine all sections from selected resumes
    const sectionMap = new Map()

    resumes.forEach((resume: any) => {
      const resumeData = typeof resume.resume_data === "string" ? JSON.parse(resume.resume_data) : resume.resume_data

      if (resumeData.sections) {
        resumeData.sections.forEach((section: any) => {
          const sectionName = section["section name"]
          if (sectionMap.has(sectionName)) {
            // Merge content if section already exists
            sectionMap.get(sectionName).content.push(...section.content)
          } else {
            // Add new section
            sectionMap.set(sectionName, {
              ...section,
              content: [...section.content],
            })
          }
        })
      }
    })

    mergedResumeData.sections = Array.from(sectionMap.values())

    // Generate unique portfolio URL
    const portfolioUrl = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`

    const result = await sql`
      INSERT INTO portfolios (user_id, title, description, theme, resume_data, portfolio_url)
      VALUES (${user.id}, ${title}, ${description || null}, ${theme}, ${JSON.stringify(mergedResumeData)}, ${portfolioUrl})
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
