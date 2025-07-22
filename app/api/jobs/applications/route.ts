import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const user = token ? await verifyToken(token) : null

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'received' or 'sent'

    let query = ""
    let params: any[] = []

    if (type === "received") {
      // Applications received by this user (as employer)
      query = `
        SELECT 
          ja.*,
          j.title as job_title,
          j.job_type,
          j.location,
          j.is_remote,
          j.salary_min,
          j.salary_max,
          j.currency,
          applicant.first_name as applicant_first_name,
          applicant.last_name as applicant_last_name,
          applicant.email as applicant_email,
          applicant.avatar_url as applicant_avatar_url,
          applicant.bio as applicant_bio,
          applicant.location as applicant_location
        FROM job_applications ja
        JOIN jobs j ON ja.job_id = j.id
        JOIN users applicant ON ja.applicant_id = applicant.id
        WHERE j.employer_id = $1
        ORDER BY ja.applied_at DESC
      `
      params = [user.id]
    } else {
      // Applications sent by this user (as job seeker)
      query = `
        SELECT 
          ja.*,
          j.title as job_title,
          j.job_type,
          j.location,
          j.is_remote,
          j.salary_min,
          j.salary_max,
          j.currency,
          employer.first_name as employer_first_name,
          employer.last_name as employer_last_name,
          employer.email as employer_email,
          employer.avatar_url as employer_avatar_url,
          employer.bio as employer_bio,
          employer.location as employer_location
        FROM job_applications ja
        JOIN jobs j ON ja.job_id = j.id
        JOIN users employer ON j.employer_id = employer.id
        WHERE ja.applicant_id = $1
        ORDER BY ja.applied_at DESC
      `
      params = [user.id]
    }

    const applications = await sql(query, params)

    // Transform the data to match the frontend interface
    const transformedApplications = applications.map((app: any) => ({
      id: app.id,
      job: {
        id: app.job_id,
        title: app.job_title,
        jobType: app.job_type,
        location: app.location,
        isRemote: app.is_remote,
        salaryMin: app.salary_min,
        salaryMax: app.salary_max,
        currency: app.currency,
        employer:
          type === "sent"
            ? {
                firstName: app.employer_first_name || "Unknown",
                lastName: app.employer_last_name || "User",
                email: app.employer_email,
                avatarUrl: app.employer_avatar_url,
              }
            : undefined,
      },
      applicant:
        type === "received"
          ? {
              id: app.applicant_id,
              firstName: app.applicant_first_name || "Unknown",
              lastName: app.applicant_last_name || "User",
              email: app.applicant_email,
              avatarUrl: app.applicant_avatar_url,
              bio: app.applicant_bio,
              location: app.applicant_location,
            }
          : undefined,
      status: app.status,
      message: app.message,
      appliedAt: new Date(app.applied_at),
    }))

    return NextResponse.json(transformedApplications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const user = token ? await verifyToken(token) : null

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { applicationId, status } = body

    if (!applicationId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the user owns the job for this application
    const [application] = await sql`
      SELECT ja.*, j.employer_id
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.id = ${applicationId}
    `

    if (!application || application.employer_id !== user.id) {
      return NextResponse.json({ error: "Application not found or unauthorized" }, { status: 404 })
    }

    // Update application status
    await sql`
      UPDATE job_applications 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${applicationId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}
