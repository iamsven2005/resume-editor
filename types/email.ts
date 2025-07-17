export interface GeneratedEmail {
  subject: string
  body: string
  type: "application" | "networking" | "follow_up"
}

export interface EmailGenerationRequest {
  resumeData: any
  jobRequirements: string
  analysis: any
  emailType: "application" | "networking" | "follow_up"
  customInstructions?: string
}
