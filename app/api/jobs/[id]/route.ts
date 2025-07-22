import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const user = token ? await verifyToken(token) : null

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, jobType, location, isRemote, salaryMin, salaryMax, currency, requiredSkills } = body

    // Verify job ownership
    const [existingJob] = await sql`
      SELECT employer_id FROM jobs WHERE id = ${params.id}
    `

    if (!existingJob || existingJob.employer_id !== user.id) {
      return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 })
    }

    // Update the job
    await sql`
      UPDATE jobs SET
        title = ${title},
        description = ${description},
        job_type = ${jobType},
        location = ${location},
        is_remote = ${isRemote},
        salary_min = ${salaryMin || null},
        salary_max = ${salaryMax || null},
        currency = ${currency},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
    `

    // Delete existing skills and add new ones
    await sql`DELETE FROM job_skills WHERE job_id = ${params.id}`

    if (requiredSkills && requiredSkills.length > 0) {
      for (const skillReq of requiredSkills) {
        await sql`
          INSERT INTO job_skills (job_id, skill_id, is_required, min_proficiency)
          VALUES (${params.id}, ${skillReq.skill.id}, ${skillReq.isRequired}, ${skillReq.minProficiency})
        `
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const user = token ? await verifyToken(token) : null

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify job ownership
    const [existingJob] = await sql`
      SELECT employer_id FROM jobs WHERE id = ${params.id}
    `

    if (!existingJob || existingJob.employer_id !== user.id) {
      return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 })
    }

    // Soft delete by setting is_active to false
    await sql`
      UPDATE jobs SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 })
  }
}
