import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"
import type { CreateJobData } from "@/types/job"

const sql = neon(process.env.NEON_DATABASE_URL!)

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
        required_skills:
          typeof job.required_skills === "string" ? JSON.parse(job.required_skills || "[]") : job.required_skills || [],
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
    const existingJob = await sql`
      SELECT * FROM jobs WHERE id = ${jobId} AND user_id = ${user.id}
    `

    if (existingJob.length === 0) {
      return NextResponse.json({ success: false, error: "Job not found or unauthorized" }, { status: 404 })
    }

    const data: CreateJobData = await request.json()

    const result = await sql`
      UPDATE jobs SET
        title = ${data.title || existingJob[0].title},
        description = ${data.description || existingJob[0].description},
        company = ${data.company || existingJob[0].company},
        location = ${data.location || existingJob[0].location},
        job_type = ${data.job_type || existingJob[0].job_type},
        salary_min = ${data.salary_min !== undefined ? data.salary_min : existingJob[0].salary_min},
        salary_max = ${data.salary_max !== undefined ? data.salary_max : existingJob[0].salary_max},
        currency = ${data.currency || existingJob[0].currency},
        is_remote = ${data.is_remote !== undefined ? data.is_remote : existingJob[0].is_remote},
        required_skills = ${JSON.stringify(data.required_skills || existingJob[0].required_skills || [])},
        is_active = ${data.is_active !== undefined ? data.is_active : existingJob[0].is_active},
        updated_at = NOW()
      WHERE id = ${jobId}
      RETURNING *
    `

    const job = result[0]
    return NextResponse.json({
      success: true,
      job: {
        ...job,
        required_skills:
          typeof job.required_skills === "string" ? JSON.parse(job.required_skills) : job.required_skills || [],
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

    const result = await sql`
      DELETE FROM jobs 
      WHERE id = ${jobId} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Job not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Job deleted successfully" })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json({ success: false, error: "Failed to delete job" }, { status: 500 })
  }
}
