import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"
import type { UpdateJobData } from "@/types/job"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

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

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 })
    }

    const job = result.rows[0]
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
    console.error("Error fetching job:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch job",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
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

    const data: UpdateJobData = await request.json()

    // Check if user owns the job
    const ownershipQuery = "SELECT user_id FROM jobs WHERE id = $1"
    const ownershipResult = await sql.query(ownershipQuery, [jobId])

    if (ownershipResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 })
    }

    if (ownershipResult.rows[0].user_id !== user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    // Build update query dynamically
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    if (data.title !== undefined) {
      updateFields.push(`title = $${paramIndex}`)
      updateValues.push(data.title)
      paramIndex++
    }
    if (data.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`)
      updateValues.push(data.description)
      paramIndex++
    }
    if (data.company !== undefined) {
      updateFields.push(`company = $${paramIndex}`)
      updateValues.push(data.company)
      paramIndex++
    }
    if (data.location !== undefined) {
      updateFields.push(`location = $${paramIndex}`)
      updateValues.push(data.location)
      paramIndex++
    }
    if (data.job_type !== undefined) {
      updateFields.push(`job_type = $${paramIndex}`)
      updateValues.push(data.job_type)
      paramIndex++
    }
    if (data.salary_min !== undefined) {
      updateFields.push(`salary_min = $${paramIndex}`)
      updateValues.push(data.salary_min)
      paramIndex++
    }
    if (data.salary_max !== undefined) {
      updateFields.push(`salary_max = $${paramIndex}`)
      updateValues.push(data.salary_max)
      paramIndex++
    }
    if (data.currency !== undefined) {
      updateFields.push(`currency = $${paramIndex}`)
      updateValues.push(data.currency)
      paramIndex++
    }
    if (data.is_remote !== undefined) {
      updateFields.push(`is_remote = $${paramIndex}`)
      updateValues.push(data.is_remote)
      paramIndex++
    }
    if (data.required_skills !== undefined) {
      updateFields.push(`required_skills = $${paramIndex}`)
      updateValues.push(JSON.stringify(data.required_skills))
      paramIndex++
    }
    if (data.is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`)
      updateValues.push(data.is_active)
      paramIndex++
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)

    if (updateFields.length === 1) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 })
    }

    const updateQuery = `
      UPDATE jobs 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await sql.query(updateQuery, [...updateValues, jobId])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Failed to update job" }, { status: 500 })
    }

    const job = result.rows[0]
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
    console.error("Error updating job:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update job",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
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

    // Check if user owns the job
    const ownershipQuery = "SELECT user_id FROM jobs WHERE id = $1"
    const ownershipResult = await sql.query(ownershipQuery, [jobId])

    if (ownershipResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 })
    }

    if (ownershipResult.rows[0].user_id !== user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const deleteQuery = "DELETE FROM jobs WHERE id = $1"
    await sql.query(deleteQuery, [jobId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete job",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
