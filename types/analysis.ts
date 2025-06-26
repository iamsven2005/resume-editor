export interface KeywordAnalysis {
  presentKeywords: string[]
  missingKeywords: string[]
}

export interface SectionAnalysis {
  experience: string
  skills: string
  education: string
  other: string
}

export interface ResumeAnalysis {
  overallScore: number
  matchPercentage: string
  summary: string
  strengths: string[]
  missingElements: string[]
  recommendations: string[]
  keywordAnalysis: KeywordAnalysis
  sectionAnalysis: SectionAnalysis
}
