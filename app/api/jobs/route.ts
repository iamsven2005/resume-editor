import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const excludeUserId = searchParams.get("excludeUserId")

    let query = `
      SELECT 
        j.*,
        u.first_name as employer_first_name,
        u.last_name as employer_last_name,
        u.email as employer_email,
        u.avatar_url as employer_avatar_url,
        u.bio as employer_bio,
        u.location as employer_location,
        u.user_type as employer_user_type,
        COALESCE(
          json_agg(
            CASE WHEN js.skill_id IS NOT NULL THEN
              json_build_object(
                'skill', json_build_object(
                  'id', s.id,
                  'name', s.name,
                  'category', s.category
                ),
                'isRequired', js.is_required,
                'minProficiency', js.min_proficiency
              )
            END
          ) FILTER (WHERE js.skill_id IS NOT NULL), '[]'
        ) as required_skills
      FROM jobs j
      JOIN users u ON j.employer_id = u.id
      LEFT JOIN job_skills js ON j.id = js.job_id
      LEFT JOIN skills s ON js.skill_id = s.id
      WHERE j.is_active = true
    `

    const params: any[] = []

    if (userId) {
      query += ` AND j.employer_id = $${params.length + 1}`
      params.push(userId)
    }

    if (excludeUserId) {
      query += ` AND j.employer_id != $${params.length + 1}`
      params.push(excludeUserId)
    }

    query += `
      GROUP BY j.id, u.id
      ORDER BY j.created_at DESC
    `

    const jobs = await sql(query, params)

    // Transform the data to match the frontend interface
    const transformedJobs = jobs.map((job: any) => ({
      id: job.id,
      employerId: job.employer_id,
      employer: {
        id: job.employer_id,
        firstName: job.employer_first_name || "Unknown",
        lastName: job.employer_last_name || "User",
        email: job.employer_email,
        avatarUrl: job.employer_avatar_url,
        bio: job.employer_bio || "",
        location: job.employer_location || "",
        userType: job.employer_user_type || "employer",
        skills: [],
        isActive: true,
      },
      title: job.title,
      description: job.description,
      jobType: job.job_type,
      location: job.location,
      isRemote: job.is_remote,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      currency: job.currency,
      requiredSkills: job.required_skills || [],
      isActive: job.is_active,
    }))

    return NextResponse.json(transformedJobs)
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const user = token ? await verifyToken(token) : null

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, jobType, location, isRemote, salaryMin, salaryMax, currency, requiredSkills } = body

    if (!title || !description || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create the job
    const [job] = await sql`
      INSERT INTO jobs (
        employer_id, title, description, job_type, location, 
        is_remote, salary_min, salary_max, currency
      )
      VALUES (
        ${user.id}, ${title}, ${description}, ${jobType}, ${location},
        ${isRemote}, ${salaryMin || null}, ${salaryMax || null}, ${currency}
      )
      RETURNING *
    `

    // Add required skills
    if (requiredSkills && requiredSkills.length > 0) {
      for (const skillReq of requiredSkills) {
        await sql`
          INSERT INTO job_skills (job_id, skill_id, is_required, min_proficiency)
          VALUES (${job.id}, ${skillReq.skill.id}, ${skillReq.isRequired}, ${skillReq.minProficiency})
        `
      }
    }

    return NextResponse.json({ success: true, jobId: job.id })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
