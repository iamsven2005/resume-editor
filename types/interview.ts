export interface InterviewQuestion {
  id: number
  question: string
  category: "Technical" | "Behavioral" | "Situational" | "Experience" | "Gap-Addressing" | "General"
  difficulty: "Easy" | "Medium" | "Hard"
  whatInterviewerLooksFor: string
  keyPointsToAddress: string[]
  resumeConnection: string
}

export interface InterviewQuestions {
  questions: InterviewQuestion[]
  overallTips: string[]
}

export interface AnswerRating {
  overallScore: number
  scoreBreakdown: {
    relevance: number
    completeness: number
    clarity: number
    examples: number
    confidence: number
  }
  strengths: string[]
  areasForImprovement: string[]
  missedOpportunities: string[]
  improvedAnswer: string
  interviewerPerspective: string
  nextSteps: string[]
}

export interface InterviewAnswer {
  questionId: number
  answer: string
  rating?: AnswerRating
  timestamp: Date
}
