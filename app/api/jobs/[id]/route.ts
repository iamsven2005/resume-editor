import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"
import type { CreateJobData } from "@/types/job"

const sql = neon(process.env.NEON_NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = Number.parseInt(params.id)

    if (isNaN(jobId)) {
      return NextResponse.json({ success: false, error: "Invalid job ID" }, { status: 400 })
    }

    const result = await sql`
      SELECT 
        j.*,
        u.name as user_name,
        u.email as user_email
      FROM jobs j
      LEFT JOIN users u ON j.user_id = u.id
      WHERE j.id = ${jobId}
    `

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

    // Check if job exists and user owns it
    const existingJob = await sql`
      SELECT * FROM jobs WHERE id = ${jobId} AND user_id = ${user.id}
    `

    if (existingJob.length === 0) {
      return NextResponse.json({ success: false, error: "Job not found or access denied" }, { status: 404 })
    }

    const data: Partial<CreateJobData> & { is_active?: boolean } = await request.json()

    // Build update query dynamically
    const updateFields: string[] = []
    const updateValues: any[] = []

    if (data.title !== undefined) {
      updateFields.push("title = $" + (updateValues.length + 1))
      updateValues.push(data.title)
    }
    if (data.description !== undefined) {
      updateFields.push("description = $" + (updateValues.length + 1))
      updateValues.push(data.description)
    }
    if (data.company !== undefined) {
      updateFields.push("company = $" + (updateValues.length + 1))
      updateValues.push(data.company)
    }
    if (data.location !== undefined) {
      updateFields.push("location = $" + (updateValues.length + 1))
      updateValues.push(data.location)
    }
    if (data.job_type !== undefined) {
      const validJobTypes = ["full-time", "part-time", "contract", "freelance", "internship"]
      if (!validJobTypes.includes(data.job_type)) {
        return NextResponse.json({ success: false, error: "Invalid job type" }, { status: 400 })
      }
      updateFields.push("job_type = $" + (updateValues.length + 1))
      updateValues.push(data.job_type)
    }
    if (data.salary_min !== undefined) {
      updateFields.push("salary_min = $" + (updateValues.length + 1))
      updateValues.push(data.salary_min)
    }
    if (data.salary_max !== undefined) {
      updateFields.push("salary_max = $" + (updateValues.length + 1))
      updateValues.push(data.salary_max)
    }
    if (data.currency !== undefined) {
      updateFields.push("currency = $" + (updateValues.length + 1))
      updateValues.push(data.currency)
    }
    if (data.is_remote !== undefined) {
      updateFields.push("is_remote = $" + (updateValues.length + 1))
      updateValues.push(data.is_remote)
    }
    if (data.required_skills !== undefined) {
      updateFields.push("required_skills = $" + (updateValues.length + 1))
      updateValues.push(JSON.stringify(data.required_skills))
    }
    if (data.is_active !== undefined) {
      updateFields.push("is_active = $" + (updateValues.length + 1))
      updateValues.push(data.is_active)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 })
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP")

    // Use template literal for the update query
    const updateQuery = `
      UPDATE jobs 
      SET ${updateFields.join(", ")}
      WHERE id = ${jobId} AND user_id = ${user.id}
      RETURNING *
    `

    const result = await sql.unsafe(updateQuery, updateValues)

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Failed to update job" }, { status: 500 })
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

    const result = await sql`
      DELETE FROM jobs 
      WHERE id = ${jobId} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Job not found or access denied" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Job deleted successfully",
    })
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
