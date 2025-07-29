"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Brain,
  CheckCircle,
  TrendingUp,
  Star,
  Target,
  Lightbulb,
  ArrowRight,
  RotateCcw,
} from "lucide-react"
import type { InterviewQuestions, AnswerRating } from "../types/interview"
import type { ResumeAnalysis } from "../types/analysis"

interface InterviewPracticePanelProps {
  analysis: ResumeAnalysis | null
  resumeData?: any
  jobRequirements?: string
}

export const InterviewPracticePanel = ({ analysis, resumeData, jobRequirements }: InterviewPracticePanelProps) => {
  const [questions, setQuestions] = useState<InterviewQuestions | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [isRatingAnswer, setIsRatingAnswer] = useState(false)
  const [answerRating, setAnswerRating] = useState<AnswerRating | null>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())

  const generateQuestions = async () => {
    if (!analysis || !resumeData || !jobRequirements) return

    setIsGeneratingQuestions(true)
    try {
      const response = await fetch("/api/generate-interview-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeData,
          jobRequirements,
          analysis,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setQuestions(data.interviewQuestions)
        setCurrentQuestionIndex(0)
        setAnswerRating(null)
        setCurrentAnswer("")
        setAnsweredQuestions(new Set())
      }
    } catch (error) {
      console.error("Error generating questions:", error)
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  const rateAnswer = async () => {
    if (!questions || !currentAnswer.trim() || !resumeData) return

    const currentQuestion = questions.questions[currentQuestionIndex]
    setIsRatingAnswer(true)

    try {
      const response = await fetch("/api/rate-interview-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
          answer: currentAnswer,
          resumeData,
          keyPointsToAddress: currentQuestion.keyPointsToAddress,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setAnswerRating(data.rating)
        setAnsweredQuestions((prev) => new Set([...prev, currentQuestion.id]))
      }
    } catch (error) {
      console.error("Error rating answer:", error)
    } finally {
      setIsRatingAnswer(false)
    }
  }

  const nextQuestion = () => {
    if (!questions) return

    if (currentQuestionIndex < questions.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer("")
      setAnswerRating(null)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setCurrentAnswer("")
      setAnswerRating(null)
    }
  }

  const resetPractice = () => {
    setCurrentAnswer("")
    setAnswerRating(null)
    setCurrentQuestionIndex(0)
    setAnsweredQuestions(new Set())
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-blue-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreVariant = (score: number) => {
    if (score >= 90) return "default"
    if (score >= 75) return "secondary"
    if (score >= 60) return "outline"
    return "destructive"
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Technical":
        return "bg-blue-100 text-blue-800"
      case "Behavioral":
        return "bg-purple-100 text-purple-800"
      case "Situational":
        return "bg-orange-100 text-orange-800"
      case "Experience":
        return "bg-green-100 text-green-800"
      case "Gap-Addressing":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Interview Practice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              Complete the resume analysis first to generate personalized interview questions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!questions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Interview Practice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">AI-Powered Interview Practice</h3>
            <p className="text-muted-foreground mb-4">
              Get personalized interview questions based on your resume and the job requirements. Practice your answers
              and receive detailed AI feedback.
            </p>
            <Button onClick={generateQuestions} disabled={isGeneratingQuestions} className="w-full">
              {isGeneratingQuestions ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Questions...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Interview Questions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentQuestion = questions.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.questions.length) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Interview Practice
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {currentQuestionIndex + 1} of {questions.questions.length}
          </span>
          <span>{answeredQuestions.size} answered</span>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question Card */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getDifficultyColor(currentQuestion.difficulty)}>{currentQuestion.difficulty}</Badge>
            <Badge className={getCategoryColor(currentQuestion.category)}>{currentQuestion.category}</Badge>
            {answeredQuestions.has(currentQuestion.id) && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Answered
              </Badge>
            )}
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">{currentQuestion.question}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>What the interviewer is looking for:</strong> {currentQuestion.whatInterviewerLooksFor}
            </p>
            {currentQuestion.keyPointsToAddress.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Key points to address:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  {currentQuestion.keyPointsToAddress.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Answer Section */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Your Answer</label>
            <Textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here... Aim for 1-3 minutes of speaking time (150-400 words)"
              className="min-h-[120px]"
              disabled={isRatingAnswer}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {currentAnswer.split(" ").filter((word) => word.length > 0).length} words
              </span>
              <Button onClick={rateAnswer} disabled={!currentAnswer.trim() || isRatingAnswer} size="sm">
                {isRatingAnswer ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Rating...
                  </>
                ) : (
                  <>
                    <Star className="h-3 w-3 mr-2" />
                    Get AI Feedback
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Rating Results */}
          {answerRating && (
            <Tabs defaultValue="score" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="score">Score</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="improved">Improved</TabsTrigger>
                <TabsTrigger value="tips">Tips</TabsTrigger>
              </TabsList>

              <TabsContent value="score" className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(answerRating.overallScore)}`}>
                    {answerRating.overallScore}/100
                  </div>
                  <Badge variant={getScoreVariant(answerRating.overallScore)} className="mt-2">
                    {answerRating.overallScore >= 90
                      ? "Excellent"
                      : answerRating.overallScore >= 75
                        ? "Good"
                        : answerRating.overallScore >= 60
                          ? "Average"
                          : "Needs Work"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(answerRating.scoreBreakdown).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{key}</span>
                        <span className={getScoreColor(value)}>{value}/100</span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="feedback" className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {answerRating.strengths.map((strength, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-1">
                    {answerRating.areasForImprovement.map((area, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <TrendingUp className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>

                {answerRating.missedOpportunities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Missed Opportunities
                    </h4>
                    <ul className="space-y-1">
                      {answerRating.missedOpportunities.map((missed, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <Target className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                          {missed}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="improved" className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Improved Answer Suggestion
                  </h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{answerRating.improvedAnswer}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Interviewer's Perspective</h4>
                  <p className="text-sm text-muted-foreground">{answerRating.interviewerPerspective}</p>
                </div>
              </TabsContent>

              <TabsContent value="tips" className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Next Steps
                  </h4>
                  <ul className="space-y-2">
                    {answerRating.nextSteps.map((tip, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <ArrowRight className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={previousQuestion} disabled={currentQuestionIndex === 0}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextQuestion}
              disabled={currentQuestionIndex === questions.questions.length - 1}
            >
              Next
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetPractice}>
              <RotateCcw className="h-3 w-3 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={generateQuestions} disabled={isGeneratingQuestions}>
              <Brain className="h-3 w-3 mr-2" />
              New Questions
            </Button>
          </div>
        </div>

        {/* Overall Tips */}
        {questions.overallTips.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-900">Interview Tips for This Role</h4>
            <ul className="space-y-1">
              {questions.overallTips.map((tip, index) => (
                <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                  <Lightbulb className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
