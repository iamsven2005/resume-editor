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
    const { title, description, theme, resumeIds } = body

    console.log("Creating portfolio with data:", { title, description, theme, resumeIds })

    if (!title || !theme) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and theme are required",
        },
        { status: 400 },
      )
    }

    const finalResumeData = {
      title: title,
      sections: [],
    }

    // If resumeIds provided, merge the selected resumes
    if (resumeIds && resumeIds.length > 0) {
      const resumes = await sql`
        SELECT resume_data FROM resumes 
        WHERE id = ANY(${resumeIds}) AND user_id = ${user.id}
      `

      console.log("Found resumes to merge:", resumes.length)

      if (resumes.length > 0) {
        // Merge resume data
        const sectionMap = new Map()

        resumes.forEach((resume: any) => {
          const data = typeof resume.resume_data === "string" ? JSON.parse(resume.resume_data) : resume.resume_data

          if (data.sections && Array.isArray(data.sections)) {
            data.sections.forEach((section: any) => {
              const sectionName = section["section name"] || section.name || "Untitled"

              if (sectionMap.has(sectionName)) {
                // Merge content if section already exists
                const existingSection = sectionMap.get(sectionName)
                existingSection.content = [...existingSection.content, ...section.content]
              } else {
                // Add new section
                sectionMap.set(sectionName, {
                  "section name": sectionName,
                  content: [...section.content],
                  id: section.id || `section-${Math.random().toString(36).substr(2, 9)}`,
                })
              }
            })
          }
        })

        finalResumeData.sections = Array.from(sectionMap.values())
      }
    }

    // Generate a unique URL slug
    const urlSlug = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`

    console.log("Creating portfolio with final data:", finalResumeData)

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

    console.log("Portfolio created successfully:", result[0])

    return NextResponse.json({
      success: true,
      portfolio: result[0],
    })
  } catch (error) {
    console.error("Error creating portfolio:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to create portfolio: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
