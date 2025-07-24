import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"
import type { Job, CreateJobData } from "@/types/job"

const sql = neon(process.env.NEON_DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = Number.parseInt(params.id)

    if (isNaN(jobId)) {
      return NextResponse.json({ success: false, error: "Invalid job ID" }, { status: 400 })
    }

    const query = `
      SELECT 
        j.*,
        u.name as user_name,
        u.email as user_email
      FROM jobs j
      LEFT JOIN users u ON j.user_id = u.id
      WHERE j.id = $1
    `

    const result = await sql.query(query, [jobId])

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 })
    }

    const job = result[0]

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
    console.error("Error fetching job:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch job" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const jobId = Number.parseInt(params.id)
    if (isNaN(jobId)) {
      return NextResponse.json({ success: false, error: "Invalid job ID" }, { status: 400 })
    }

    // Check if job exists and user owns it
    const existingJob = await sql.query(`SELECT * FROM jobs WHERE id = $1`, [jobId])

    if (existingJob.length === 0) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 })
    }

    if (existingJob[0].user_id !== user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const data: Partial<CreateJobData> & { is_active?: boolean } = await request.json()

    // Build dynamic update query
    const updateFields = []
    const values = []
    let paramIndex = 1

    if (data.title !== undefined) {
      updateFields.push(`title = $${paramIndex}`)
      values.push(data.title)
      paramIndex++
    }

    if (data.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`)
      values.push(data.description)
      paramIndex++
    }

    if (data.company !== undefined) {
      updateFields.push(`company = $${paramIndex}`)
      values.push(data.company)
      paramIndex++
    }

    if (data.location !== undefined) {
      updateFields.push(`location = $${paramIndex}`)
      values.push(data.location)
      paramIndex++
    }

    if (data.job_type !== undefined) {
      const validJobTypes = ["full-time", "part-time", "contract", "freelance", "internship"]
      if (!validJobTypes.includes(data.job_type)) {
        return NextResponse.json({ success: false, error: "Invalid job type" }, { status: 400 })
      }
      updateFields.push(`job_type = $${paramIndex}`)
      values.push(data.job_type)
      paramIndex++
    }

    if (data.salary_min !== undefined) {
      updateFields.push(`salary_min = $${paramIndex}`)
      values.push(data.salary_min)
      paramIndex++
    }

    if (data.salary_max !== undefined) {
      updateFields.push(`salary_max = $${paramIndex}`)
      values.push(data.salary_max)
      paramIndex++
    }

    if (data.currency !== undefined) {
      updateFields.push(`currency = $${paramIndex}`)
      values.push(data.currency)
      paramIndex++
    }

    if (data.is_remote !== undefined) {
      updateFields.push(`is_remote = $${paramIndex}`)
      values.push(data.is_remote)
      paramIndex++
    }

    if (data.required_skills !== undefined) {
      updateFields.push(`required_skills = $${paramIndex}`)
      values.push(JSON.stringify(data.required_skills))
      paramIndex++
    }

    if (data.is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`)
      values.push(data.is_active)
      paramIndex++
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 })
    }

    // Add updated_at
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)

    // Add job ID for WHERE clause
    values.push(jobId)

    const updateQuery = `
      UPDATE jobs 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await sql.query(updateQuery, values)
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
    console.error("Error updating job:", error)
    return NextResponse.json({ success: false, error: "Failed to update job" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const jobId = Number.parseInt(params.id)
    if (isNaN(jobId)) {
      return NextResponse.json({ success: false, error: "Invalid job ID" }, { status: 400 })
    }

    // Check if job exists and user owns it
    const existingJob = await sql.query(`SELECT * FROM jobs WHERE id = $1`, [jobId])

    if (existingJob.length === 0) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 })
    }

    if (existingJob[0].user_id !== user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    await sql.query(`DELETE FROM jobs WHERE id = $1`, [jobId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json({ success: false, error: "Failed to delete job" }, { status: 500 })
  }
}
