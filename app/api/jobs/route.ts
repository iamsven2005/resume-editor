import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"
import type { Job, CreateJobData } from "@/types/job"

const sql = neon(process.env.NEON_DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "10"), 50)
    const search = searchParams.get("search") || ""
    const jobType = searchParams.get("job_type") || ""
    const isRemote = searchParams.get("is_remote")
    const userId = searchParams.get("user_id")
    const offset = (page - 1) * limit

    // Build WHERE conditions
    let whereConditions = ["j.is_active = true"]
    const queryParams: any[] = []

    if (userId) {
      whereConditions = [`j.user_id = $${queryParams.length + 1}`]
      queryParams.push(Number.parseInt(userId))
    }

    if (search) {
      whereConditions.push(
        `(j.title ILIKE $${queryParams.length + 1} OR j.description ILIKE $${queryParams.length + 1} OR j.company ILIKE $${queryParams.length + 1})`,
      )
      queryParams.push(`%${search}%`)
    }

    if (jobType && jobType !== "all") {
      whereConditions.push(`j.job_type = $${queryParams.length + 1}`)
      queryParams.push(jobType)
    }

    if (isRemote === "true") {
      whereConditions.push("j.is_remote = true")
    } else if (isRemote === "false") {
      whereConditions.push("j.is_remote = false")
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      ${whereClause}
    `

    const countResult = await sql.query(countQuery, queryParams)
    const total = Number.parseInt(countResult[0]?.total || "0")

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
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `

    const jobs = await sql.query(jobsQuery, [...queryParams, limit, offset])

    const processedJobs = jobs.map((job: any) => ({
      ...job,
      required_skills: Array.isArray(job.required_skills)
        ? job.required_skills
        : typeof job.required_skills === "string"
          ? JSON.parse(job.required_skills || "[]")
          : job.required_skills || [],
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
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const data: CreateJobData = await request.json()

    // Validate required fields
    if (!data.title || !data.description || !data.company || !data.location || !data.job_type) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate job_type
    const validJobTypes = ["full-time", "part-time", "contract", "freelance", "internship"]
    if (!validJobTypes.includes(data.job_type)) {
      return NextResponse.json({ success: false, error: "Invalid job type" }, { status: 400 })
    }

    const insertQuery = `
      INSERT INTO jobs (
        title, description, company, location, job_type,
        salary_min, salary_max, currency, is_remote, required_skills, user_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      RETURNING *
    `

    const result = await sql.query(insertQuery, [
      data.title,
      data.description,
      data.company,
      data.location,
      data.job_type,
      data.salary_min || null,
      data.salary_max || null,
      data.currency || "USD",
      data.is_remote || false,
      JSON.stringify(data.required_skills || []),
      user.id,
    ])

    const job = result[0] as Job

    return NextResponse.json({
      success: true,
      job: {
        ...job,
        required_skills: Array.isArray(job.required_skills)
          ? job.required_skills
          : typeof job.required_skills === "string"
            ? JSON.parse(job.required_skills || "[]")
            : job.required_skills || [],
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
