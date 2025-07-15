import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching portfolios...")
    const user = await getCurrentUser()

    if (!user) {
      console.log("User not authenticated")
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    console.log("User authenticated:", user.id)

    // Get portfolios with analytics summary
    const portfolios = await sql`
      SELECT 
        p.*,
        COALESCE(COUNT(DISTINCT pa.visitor_ip), 0) as unique_visitors,
        COALESCE(SUM(pa.pages_viewed), 0) as total_views,
        COALESCE(COUNT(CASE WHEN pa.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END), 0) as views_last_7_days,
        COALESCE(COUNT(CASE WHEN pa.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END), 0) as views_last_30_days
      FROM portfolios p
      LEFT JOIN portfolio_analytics pa ON p.id = pa.portfolio_id
      WHERE p.user_id = ${user.id}
      GROUP BY p.id
      ORDER BY p.updated_at DESC
    `

    console.log("Portfolios fetched:", portfolios.length)

    // Parse resume_data for each portfolio
    const parsedPortfolios = portfolios.map((portfolio) => {
      let resumeData = portfolio.resume_data
      if (typeof resumeData === "string") {
        try {
          resumeData = JSON.parse(resumeData)
        } catch (error) {
          console.error("Error parsing resume_data for portfolio", portfolio.id, error)
          resumeData = {}
        }
      }
      return {
        ...portfolio,
        resume_data: resumeData,
      }
    })

    return NextResponse.json({
      success: true,
      portfolios: parsedPortfolios,
    })
  } catch (error) {
    console.error("Error fetching portfolios:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch portfolios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Creating new portfolio...")
    const user = await getCurrentUser()

    if (!user) {
      console.log("User not authenticated")
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    console.log("User authenticated:", user.id)

    const body = await request.json()
    console.log("Request body received:", { ...body, resumeIds: body.resumeIds?.length })

    const { title, description, theme, resumeIds, isPublished } = body

    if (!title || !Array.isArray(resumeIds) || resumeIds.length === 0) {
      console.log("Invalid request data:", {
        title: !!title,
        resumeIds: Array.isArray(resumeIds) ? resumeIds.length : "not array",
      })
      return NextResponse.json({ success: false, error: "Title and at least one resume are required" }, { status: 400 })
    }

    console.log("Fetching resumes for merging...")
    // Fetch the selected resumes
    const resumes = await sql`
      SELECT resume_data FROM resumes 
      WHERE id = ANY(${resumeIds}) AND user_id = ${user.id}
    `

    if (resumes.length === 0) {
      console.log("No resumes found for user")
      return NextResponse.json({ success: false, error: "No resumes found" }, { status: 404 })
    }

    console.log("Resumes found:", resumes.length)

    // Merge resume data
    const finalResumeData = {
      title: title,
      personalInfo: {},
      sections: [],
    }

    try {
      for (const resume of resumes) {
        let resumeData = resume.resume_data
        if (typeof resumeData === "string") {
          try {
            resumeData = JSON.parse(resumeData)
          } catch (parseError) {
            console.error("Error parsing resume data:", parseError)
            continue
          }
        }

        if (resumeData && typeof resumeData === "object") {
          // Merge personal info (last one wins for conflicts)
          if (resumeData.personalInfo) {
            finalResumeData.personalInfo = { ...finalResumeData.personalInfo, ...resumeData.personalInfo }
          }

          // Merge sections
          if (Array.isArray(resumeData.sections)) {
            finalResumeData.sections = [...finalResumeData.sections, ...resumeData.sections]
          }
        }
      }
    } catch (mergeError) {
      console.error("Error merging resume data:", mergeError)
      return NextResponse.json({ success: false, error: "Failed to merge resume data" }, { status: 500 })
    }

    console.log("Resume data merged successfully")

    // Generate unique portfolio URL
    const portfolioUrl = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`

    console.log("Creating portfolio in database...")
    // Create portfolio
    const result = await sql`
      INSERT INTO portfolios (
        user_id, title, description, theme, resume_data, 
        is_published, portfolio_url, created_at, updated_at
      )
      VALUES (
        ${user.id}, ${title}, ${description || null}, ${theme || "modern"}, 
        ${JSON.stringify(finalResumeData)}, ${isPublished || false}, ${portfolioUrl},
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `

    if (result.length === 0) {
      console.log("Failed to create portfolio")
      return NextResponse.json({ success: false, error: "Failed to create portfolio" }, { status: 500 })
    }

    const portfolio = result[0]
    console.log("Portfolio created successfully:", portfolio.id)

    // Parse resume_data back for response
    let parsedResumeData = portfolio.resume_data
    if (typeof parsedResumeData === "string") {
      try {
        parsedResumeData = JSON.parse(parsedResumeData)
      } catch (error) {
        console.error("Error parsing created portfolio resume_data:", error)
      }
    }

    return NextResponse.json({
      success: true,
      portfolio: {
        ...portfolio,
        resume_data: parsedResumeData,
        unique_visitors: 0,
        total_views: 0,
        views_last_7_days: 0,
        views_last_30_days: 0,
      },
    })
  } catch (error) {
    console.error("Error creating portfolio:", error)
    return NextResponse.json({ success: false, error: "Failed to create portfolio" }, { status: 500 })
  }
}
