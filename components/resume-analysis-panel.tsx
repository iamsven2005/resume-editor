"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, CheckCircle, AlertTriangle, TrendingUp, Target, FileText } from "lucide-react"
import type { ResumeAnalysis } from "../types/analysis"
import { InterviewPracticePanel } from "./interview-practice-panel"
import { EmailGeneratorPanel } from "./email-generator-panel"

interface ResumeAnalysisPanelProps {
  resumeData: any
  jobRequirements?: string
  onAnalysisComplete?: (analysis: ResumeAnalysis) => void
}

export const ResumeAnalysisPanel = ({ resumeData, jobRequirements, onAnalysisComplete }: ResumeAnalysisPanelProps) => {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const analyzeResume = async () => {
    if (!resumeData) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeData,
          jobRequirements: jobRequirements || "",
        }),
      })

      const data = await response.json()
      if (data.success) {
        setAnalysis(data.analysis)
        onAnalysisComplete?.(data.analysis)
      }
    } catch (error) {
      console.error("Error analyzing resume:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Resume Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Analyze Your Resume</h3>
            <p className="text-muted-foreground mb-4">
              Get detailed insights about your resume's strengths, weaknesses, and optimization opportunities.
            </p>
            <Button onClick={analyzeResume} disabled={isAnalyzing} className="w-full">
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze Resume
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="missing">Missing</TabsTrigger>
        <TabsTrigger value="keywords">Keywords</TabsTrigger>
        <TabsTrigger value="sections">Sections</TabsTrigger>
        <TabsTrigger value="interview">Interview</TabsTrigger>
        <TabsTrigger value="email">Email</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume Analysis Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}/100
              </div>
              <Badge variant={getScoreVariant(analysis.overallScore)} className="mt-2">
                {analysis.overallScore >= 80 ? "Excellent" : analysis.overallScore >= 60 ? "Good" : "Needs Work"}
              </Badge>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-4">
              <h3 className="font-semibold">Score Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(analysis.scoreBreakdown).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className={getScoreColor(value)}>{value}/100</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div>
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-muted-foreground">{analysis.summary}</p>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Strengths
              </h3>
              <ul className="space-y-1">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Areas for Improvement
              </h3>
              <ul className="space-y-1">
                {analysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="missing" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Missing Elements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.missingElements.length > 0 ? (
              <ul className="space-y-2">
                {analysis.missingElements.map((element, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{element}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Great! No critical elements are missing from your resume.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="keywords" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Keyword Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.keywordAnalysis.matchedKeywords.length > 0 && (
              <div>
                <h3 className="font-semibold text-green-700 mb-2">Matched Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywordAnalysis.matchedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="default" className="bg-green-100 text-green-800">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.keywordAnalysis.missingKeywords.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-700 mb-2">Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywordAnalysis.missingKeywords.map((keyword, index) => (
                    <Badge key={index} variant="destructive" className="bg-red-100 text-red-800">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.keywordAnalysis.suggestions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Suggestions</h3>
                <ul className="space-y-1">
                  {analysis.keywordAnalysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <TrendingUp className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sections" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Section Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.sectionAnalysis.map((section, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{section.section}</h3>
                  <Badge variant={getScoreVariant(section.score)}>{section.score}/100</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{section.feedback}</p>
                {section.suggestions.length > 0 && (
                  <ul className="space-y-1">
                    {section.suggestions.map((suggestion, suggestionIndex) => (
                      <li key={suggestionIndex} className="text-sm flex items-start gap-2">
                        <TrendingUp className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="interview" className="space-y-6">
        <InterviewPracticePanel analysis={analysis} resumeData={resumeData} jobRequirements={jobRequirements} />
      </TabsContent>

      <TabsContent value="email" className="space-y-6">
        <EmailGeneratorPanel analysis={analysis} resumeData={resumeData} jobRequirements={jobRequirements} />
      </TabsContent>
    </Tabs>
  )
}
