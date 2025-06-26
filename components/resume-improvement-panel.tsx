"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Lightbulb, MessageSquare, CheckCircle, ArrowRight, RefreshCw, Sparkles, HelpCircle } from "lucide-react"
import type { ResumeAnalysis } from "../types/analysis"
import type { QuestionResponse, ImprovementSession } from "../types/improvement"
import type { ResumeData } from "../types/resume"

interface ResumeImprovementPanelProps {
  analysis: ResumeAnalysis | null
  resumeData: ResumeData | null
  jobRequirements: string
  onResumeImproved: (improvedResume: ResumeData) => void
}

export const ResumeImprovementPanel = ({
  analysis,
  resumeData,
  jobRequirements,
  onResumeImproved,
}: ResumeImprovementPanelProps) => {
  const [improvementSession, setImprovementSession] = useState<ImprovementSession>({
    questions: [],
    responses: [],
    isComplete: false,
  })
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [isImprovingResume, setIsImprovingResume] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState("")

  // Check if improvement is available
  const canImprove = analysis && resumeData && jobRequirements.trim().length > 0

  // Generate improvement questions
  const generateQuestions = async () => {
    if (!canImprove) return

    setIsGeneratingQuestions(true)
    try {
      const response = await fetch("/api/improve-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeData,
          jobRequirements,
          analysis,
          action: "generate_questions",
        }),
      })

      const result = await response.json()

      if (result.success) {
        setImprovementSession({
          questions: result.questions,
          responses: [],
          isComplete: false,
        })
        setCurrentQuestionIndex(0)
        setCurrentAnswer("")
      } else {
        throw new Error(result.error || "Failed to generate questions")
      }
    } catch (error) {
      console.error("Error generating questions:", error)
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  // Handle answer submission
  const submitAnswer = () => {
    if (!currentAnswer.trim() || currentQuestionIndex >= improvementSession.questions.length) return

    const currentQuestion = improvementSession.questions[currentQuestionIndex]
    const newResponse: QuestionResponse = {
      id: currentQuestion.id,
      question: currentQuestion.question,
      answer: currentAnswer.trim(),
    }

    const updatedResponses = [...improvementSession.responses, newResponse]
    const isLastQuestion = currentQuestionIndex === improvementSession.questions.length - 1

    setImprovementSession({
      ...improvementSession,
      responses: updatedResponses,
      isComplete: isLastQuestion,
    })

    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer("")
    }
  }

  // Skip current question
  const skipQuestion = () => {
    if (currentQuestionIndex < improvementSession.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer("")
    } else {
      setImprovementSession({
        ...improvementSession,
        isComplete: true,
      })
    }
  }

  // Go back to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      // Find the previous answer if it exists
      const prevQuestion = improvementSession.questions[currentQuestionIndex - 1]
      const prevResponse = improvementSession.responses.find((r) => r.id === prevQuestion.id)
      setCurrentAnswer(prevResponse?.answer || "")

      // Remove responses from current index onwards
      const updatedResponses = improvementSession.responses.slice(0, currentQuestionIndex - 1)
      setImprovementSession({
        ...improvementSession,
        responses: updatedResponses,
        isComplete: false,
      })
    }
  }

  // Improve resume based on responses
  const improveResume = async () => {
    if (!canImprove || !improvementSession.isComplete) return

    setIsImprovingResume(true)
    try {
      const response = await fetch("/api/improve-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeData,
          jobRequirements,
          analysis,
          action: "improve_resume",
          responses: improvementSession.responses,
        }),
      })

      const result = await response.json()

      if (result.success) {
        onResumeImproved(result.improvedResume)
        // Reset the improvement session
        setImprovementSession({
          questions: [],
          responses: [],
          isComplete: false,
        })
        setCurrentQuestionIndex(0)
        setCurrentAnswer("")
      } else {
        throw new Error(result.error || "Failed to improve resume")
      }
    } catch (error) {
      console.error("Error improving resume:", error)
    } finally {
      setIsImprovingResume(false)
    }
  }

  // Reset improvement session
  const resetSession = () => {
    setImprovementSession({
      questions: [],
      responses: [],
      isComplete: false,
    })
    setCurrentQuestionIndex(0)
    setCurrentAnswer("")
  }

  if (!canImprove) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Resume Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              Complete a resume analysis first to get AI-powered improvement suggestions and questions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Resume Improvement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {improvementSession.questions.length === 0 ? (
          // Initial state - show improvement opportunity
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">{analysis?.overallScore}/100</div>
              <p className="text-sm text-muted-foreground">Current match score - let's improve it!</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Potential Improvements:</h4>
              <div className="text-sm space-y-1">
                <p>• {analysis?.missingElements.length || 0} missing elements to address</p>
                <p>• {analysis?.keywordAnalysis.missingKeywords.length || 0} important keywords to add</p>
                <p>• {analysis?.recommendations.length || 0} specific recommendations available</p>
              </div>
            </div>

            <Button onClick={generateQuestions} disabled={isGeneratingQuestions} className="w-full">
              {isGeneratingQuestions ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start AI Improvement Session
                </>
              )}
            </Button>
          </div>
        ) : (
          // Questions and improvement flow
          <Tabs defaultValue="questions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="responses">Responses</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-4">
              {!improvementSession.isComplete ? (
                // Current question
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      Question {currentQuestionIndex + 1} of {improvementSession.questions.length}
                    </Badge>
                    <Progress
                      value={(currentQuestionIndex / improvementSession.questions.length) * 100}
                      className="w-24"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-start gap-2">
                        <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium mb-1">
                            {improvementSession.questions[currentQuestionIndex]?.question}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {improvementSession.questions[currentQuestionIndex]?.purpose}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Provide specific details, examples, or achievements..."
                      rows={4}
                    />

                    <div className="flex gap-2">
                      <Button onClick={submitAnswer} disabled={!currentAnswer.trim()} className="flex-1">
                        {currentQuestionIndex === improvementSession.questions.length - 1 ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete
                          </>
                        ) : (
                          <>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Next Question
                          </>
                        )}
                      </Button>

                      <Button variant="outline" onClick={skipQuestion}>
                        Skip
                      </Button>

                      {currentQuestionIndex > 0 && (
                        <Button variant="outline" onClick={goToPreviousQuestion}>
                          Back
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Questions completed
                <div className="text-center space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <div>
                    <h3 className="font-semibold">Questions Completed!</h3>
                    <p className="text-sm text-muted-foreground">Ready to improve your resume with AI</p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={improveResume} disabled={isImprovingResume} className="flex-1">
                      {isImprovingResume ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Improving Resume...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Improve My Resume
                        </>
                      )}
                    </Button>

                    <Button variant="outline" onClick={resetSession}>
                      Start Over
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="responses" className="space-y-4">
              <div className="space-y-3">
                {improvementSession.responses.length > 0 ? (
                  improvementSession.responses.map((response, index) => (
                    <div key={response.id} className="space-y-2">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-medium text-sm mb-1">
                          Q{index + 1}: {response.question}
                        </p>
                        <p className="text-sm">{response.answer}</p>
                      </div>
                      {index < improvementSession.responses.length - 1 && <Separator />}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No responses yet. Answer questions to see them here.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
