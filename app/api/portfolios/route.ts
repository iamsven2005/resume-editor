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
        p.id,
        p.title,
        p.description,
        p.theme,
        p.resume_data,
        p.is_published,
        p.portfolio_url,
        p.created_at,
        p.updated_at,
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

    const { title, description, theme, resumeIds, isPublished } = await request.json()

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
      SELECT resume_data
      FROM resumes
      WHERE id = ANY(${resumeIds}) AND user_id = ${user.id}
    `

    if (resumes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid resumes found",
        },
        { status: 400 },
      )
    }

    // Merge resume data
    const mergedData = {
      title: title,
      sections: [],
    }

    const sectionMap = new Map()

    // Process each resume
    resumes.forEach((resume) => {
      const resumeData = resume.resume_data
      if (resumeData.sections) {
        resumeData.sections.forEach((section) => {
          const sectionName = section["section name"]
          if (sectionMap.has(sectionName)) {
            // Merge content if section already exists
            sectionMap.get(sectionName).content.push(...section.content)
          } else {
            // Add new section
            sectionMap.set(sectionName, {
              "section name": sectionName,
              content: [...section.content],
              id: section.id,
            })
          }
        })
      }
    })

    mergedData.sections = Array.from(sectionMap.values())

    // Generate portfolio URL
    const portfolioUrl = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`

    const result = await sql`
      INSERT INTO portfolios (user_id, title, description, theme, resume_data, is_published, portfolio_url)
      VALUES (${user.id}, ${title}, ${description || null}, ${theme || "modern"}, ${JSON.stringify(mergedData)}, ${isPublished || false}, ${portfolioUrl})
      RETURNING id, title, description, theme, resume_data, is_published, portfolio_url, created_at, updated_at
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
