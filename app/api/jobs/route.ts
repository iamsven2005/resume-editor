import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"
import type { CreateJobData } from "@/types/job"

// Initialize the database connection
let sql: any = null

try {
  sql = neon(process.env.NEON_DATABASE_URL!)
} catch (error) {
  console.error("Failed to initialize database connection:", error)
}

export async function GET(request: NextRequest) {
  try {
    if (!sql) {
      console.error("Database connection not initialized")
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const jobType = searchParams.get("job_type") || ""
    const isRemote = searchParams.get("is_remote")
    const userId = searchParams.get("user_id")
    const offset = (page - 1) * limit

    // Build the WHERE clause
    let whereClause = "WHERE 1=1"
    const queryParams: any[] = []
    let paramIndex = 1

    if (search) {
      whereClause += ` AND (j.title ILIKE $${paramIndex} OR j.description ILIKE $${paramIndex} OR j.company ILIKE $${paramIndex})`
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    if (jobType && jobType !== "all") {
      whereClause += ` AND j.job_type = $${paramIndex}`
      queryParams.push(jobType)
      paramIndex++
    }

    if (isRemote === "true") {
      whereClause += " AND j.is_remote = true"
    } else if (isRemote === "false") {
      whereClause += " AND j.is_remote = false"
    }

    if (userId) {
      whereClause += ` AND j.user_id = $${paramIndex}`
      queryParams.push(Number.parseInt(userId))
      paramIndex++
    } else {
      whereClause += " AND j.is_active = true"
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      ${whereClause}
    `

    console.log("Count query:", countQuery, "Params:", queryParams)
    const countResult = await sql(countQuery, queryParams)
    const total = Number.parseInt(countResult[0].total)

    // Get jobs with pagination
    const jobsQuery = `
      SELECT 
        j.id,
        j.title,
        j.description,
        j.company,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.currency,
        j.is_remote,
        j.required_skills,
        j.is_active,
        j.user_id,
        j.created_at,
        j.updated_at,
        u.name as user_name,
        u.email as user_email
      FROM jobs j
      LEFT JOIN users u ON j.user_id = u.id
      ${whereClause}
      ORDER BY j.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    console.log("Jobs query:", jobsQuery, "Params:", [...queryParams, limit, offset])
    const jobs = await sql(jobsQuery, [...queryParams, limit, offset])

    const processedJobs = jobs.map((job: any) => ({
      ...job,
      required_skills: Array.isArray(job.required_skills)
        ? job.required_skills
        : typeof job.required_skills === "string"
          ? JSON.parse(job.required_skills || "[]")
          : [],
    }))

    return NextResponse.json({
      success: true,
      jobs: processedJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch jobs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const data: CreateJobData = await request.json()

    // Validate required fields
    if (!data.title || !data.description || !data.company || !data.location || !data.job_type) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    console.log("Creating job with data:", data)

    const result = await sql`
      INSERT INTO jobs (
        title, description, company, location, job_type,
        salary_min, salary_max, currency, is_remote, required_skills, user_id, is_active
      ) VALUES (
        ${data.title}, 
        ${data.description}, 
        ${data.company}, 
        ${data.location}, 
        ${data.job_type},
        ${data.salary_min || null}, 
        ${data.salary_max || null}, 
        ${data.currency || "USD"}, 
        ${data.is_remote || false}, 
        ${JSON.stringify(data.required_skills || [])}, 
        ${user.id},
        ${data.is_active !== false}
      )
      RETURNING *
    `

    const job = result[0]

    return NextResponse.json({
      success: true,
      job: {
        ...job,
        required_skills: Array.isArray(job.required_skills)
          ? job.required_skills
          : typeof job.required_skills === "string"
            ? JSON.parse(job.required_skills || "[]")
            : [],
      },
    })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create job",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
