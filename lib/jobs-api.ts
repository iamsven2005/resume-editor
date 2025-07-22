interface Skill {
  id: string
  name: string
  category: string
}

interface UserSkill {
  skill: Skill
  proficiency: "beginner" | "intermediate" | "advanced" | "expert"
  yearsExperience: number
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
  bio: string
  location: string
  userType: "seeker" | "employer" | "both"
  skills: UserSkill[]
  isActive: boolean
}

interface Job {
  id: string
  employerId: string
  employer: User
  title: string
  description: string
  jobType: "full-time" | "part-time" | "contract" | "freelance"
  location: string
  isRemote: boolean
  salaryMin?: number
  salaryMax?: number
  currency: string
  requiredSkills: Array<{
    skill: Skill
    isRequired: boolean
    minProficiency: "beginner" | "intermediate" | "advanced" | "expert"
  }>
  isActive: boolean
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const jobsApi = {
  // Skills
  async getSkills(): Promise<Skill[]> {
    const response = await fetch("/api/jobs/skills")
    if (!response.ok) throw new Error("Failed to fetch skills")
    return response.json()
  },

  // Jobs
  async getJobs(userId?: string, excludeUserId?: string): Promise<Job[]> {
    const params = new URLSearchParams()
    if (userId) params.append("userId", userId)
    if (excludeUserId) params.append("excludeUserId", excludeUserId)

    const response = await fetch(`/api/jobs?${params}`)
    if (!response.ok) throw new Error("Failed to fetch jobs")
    return response.json()
  },

  async createJob(jobData: any): Promise<{ success: boolean; jobId: string }> {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(jobData),
    })
    if (!response.ok) throw new Error("Failed to create job")
    return response.json()
  },

  async updateJob(jobId: string, jobData: any): Promise<{ success: boolean }> {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(jobData),
    })
    if (!response.ok) throw new Error("Failed to update job")
    return response.json()
  },

  async deleteJob(jobId: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to delete job")
    return response.json()
  },

  // Users
  async getUsers(excludeUserId?: string, userType?: string): Promise<User[]> {
    const params = new URLSearchParams()
    if (excludeUserId) params.append("excludeUserId", excludeUserId)
    if (userType) params.append("userType", userType)

    const response = await fetch(`/api/jobs/users?${params}`)
    if (!response.ok) throw new Error("Failed to fetch users")
    return response.json()
  },

  // Swipes
  async recordSwipe(
    targetId: string,
    targetType: "job" | "user",
    direction: "left" | "right" | "up",
  ): Promise<{ success: boolean; match: boolean }> {
    const response = await fetch("/api/jobs/swipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ targetId, targetType, direction }),
    })
    if (!response.ok) throw new Error("Failed to record swipe")
    return response.json()
  },

  // Applications
  async getApplications(type: "received" | "sent"): Promise<any[]> {
    const response = await fetch(`/api/jobs/applications?type=${type}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch applications")
    return response.json()
  },

  async updateApplicationStatus(applicationId: string, status: string): Promise<{ success: boolean }> {
    const response = await fetch("/api/jobs/applications", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ applicationId, status }),
    })
    if (!response.ok) throw new Error("Failed to update application")
    return response.json()
  },

  // Profile
  async updateProfile(profileData: any): Promise<{ success: boolean }> {
    const response = await fetch("/api/jobs/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(profileData),
    })
    if (!response.ok) throw new Error("Failed to update profile")
    return response.json()
  },
}
