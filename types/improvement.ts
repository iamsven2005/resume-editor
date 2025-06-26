export interface ImprovementQuestion {
  id: string
  question: string
  category: string
  purpose: string
}

export interface QuestionResponse {
  id: string
  question: string
  answer: string
}

export interface ImprovementSession {
  questions: ImprovementQuestion[]
  responses: QuestionResponse[]
  isComplete: boolean
}
