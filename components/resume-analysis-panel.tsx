"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertTriangle, TrendingUp, Target } from "lucide-react"
import type { ResumeAnalysis } from "../types/analysis"
import { EmailGeneratorPanel } from "./email-generator-panel"
import { InterviewPracticePanel } from "./interview-practice-panel"

interface ResumeAnalysisPanelProps {
  analysis: ResumeAnalysis | null
  isLoading: boolean
  resumeData?: any
  jobRequirements?: string
}

export const ResumeAnalysisPanel = ({ analysis, isLoading, resumeData, jobRequirements }: ResumeAnalysisPanelProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Resume Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Analyzing your resume...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Resume Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Add job requirements above to get an AI-powered analysis of how well your resume matches the position.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Resume Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-2">
          <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
            {analysis.overallScore}/100
          </div>
          <Badge variant={getScoreVariant(analysis.overallScore)} className="text-sm">
            {analysis.matchPercentage} Match
          </Badge>
          <Progress value={analysis.overallScore} className="w-full" />
          <p className="text-sm text-muted-foreground">{analysis.summary}</p>
        </div>

        <div className="w-full">
          <select
            value={selectedTab}
            onChange={(e) => setSelectedTab(e.target.value)}
            className="w-full border border-input rounded-md p-2 text-sm bg-background"
          >
            <option value="overview">Overview</option>
            <option value="missing">Missing</option>
            <option value="keywords">Keywords</option>
            <option value="sections">Sections</option>
            <option value="interview">Interview</option>
            <option value="email">Email</option>
          </select>
        </div>

        {selectedTab === "overview" && (
            {/* Strengths */}
            <>
            <div>
              <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Strengths
              </h4>
              <ul className="space-y-1">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Recommendations
              </h4>
              <ul className="space-y-1">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <TrendingUp className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
            </>
        )}
        {selectedTab === "missing" && (
            <div>
              <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Missing Elements
              </h4>
              {analysis.missingElements.length > 0 ? (
                <ul className="space-y-1">
                  {analysis.missingElements.map((missing, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                      {missing}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No major missing elements identified!</p>
              )}
            </div>
        )}

        {selectedTab === "keywords" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Present Keywords</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.keywordAnalysis.presentKeywords.map((keyword, index) => (
                    <Badge key={index} variant="default" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-2">Missing Keywords</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.keywordAnalysis.missingKeywords.map((keyword, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
        )}

        {selectedTab === "sections" && (
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold mb-1">Experience</h4>
                <p className="text-sm text-muted-foreground">{analysis.sectionAnalysis.experience}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Skills</h4>
                <p className="text-sm text-muted-foreground">{analysis.sectionAnalysis.skills}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Education</h4>
                <p className="text-sm text-muted-foreground">{analysis.sectionAnalysis.education}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Other Sections</h4>
                <p className="text-sm text-muted-foreground">{analysis.sectionAnalysis.other}</p>
              </div>
            </div>
                  )}

        {selectedTab === "interview" && (
            <InterviewPracticePanel analysis={analysis} resumeData={resumeData} jobRequirements={jobRequirements} />
        )}
        {selectedTab === "email" && (
            <EmailGeneratorPanel analysis={analysis} resumeData={resumeData} jobRequirements={jobRequirements || ""} />
)} 
      </CardContent>
    </Card>
  )
}
