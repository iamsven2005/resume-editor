import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  Star,
  User,
  Mail,
  Phone,
  Linkedin,
} from "lucide-react"

interface ResumeAnalysis {
  resumeId: number
  fileName: string
  score: number
  strengths: string[]
  weaknesses: string[]
  keySkills: string[]
  experience: string
  summary: string
  contactInfo: {
    email?: string
    phone?: string
    name?: string
    linkedin?: string
  }
}

interface RankingResultsProps {
  analysisResults: ResumeAnalysis[]
  isAnalyzing: boolean
  onReset: () => void
}

// Helper function to safely get string value
const safeString = (value: any): string => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  return String(value)
}

export function RankingResults({ analysisResults, isAnalyzing, onReset }: RankingResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match"
    if (score >= 60) return "Good Match"
    if (score >= 40) return "Fair Match"
    return "Poor Match"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ranking Results</h2>
          <p className="text-muted-foreground">{analysisResults.length} resumes ranked by job match score</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onReset}>
            New Ranking
          </Button>
        </div>
      </div>

      {isAnalyzing ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 animate-spin" />
            <p className="text-lg font-medium">Analyzing Resumes...</p>
            <p className="text-muted-foreground">This may take a moment</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {analysisResults.map((result, index) => (
            <Card key={result.resumeId} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full">
                      <div className="w-6 h-6 bg-blue-500  rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{safeString(result.fileName)}</CardTitle>
                      <p className="text-sm text-muted-foreground">Resume #{index + 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>{result.score}%</div>
                    <Badge
                      variant={
                        result.score >= 80 ? "default" : result.score >= 60 ? "secondary" : "destructive"
                      }
                    >
                      {getScoreLabel(result.score)}
                    </Badge>
                  </div>
                </div>
                <Progress value={result.score} className="mt-4" />
              </CardHeader>

              {/* Contact Information */}
              {(result.contactInfo.email || result.contactInfo.phone || result.contactInfo.linkedin) && (
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <div className="flex flex-wrap items-center gap-3">
                    {result.contactInfo.name && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{safeString(result.contactInfo.name)}</span>
                      </div>
                    )}

                    {result.contactInfo.email && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 bg-transparent"
                        onClick={() => window.open(`mailto:${result.contactInfo.email}`, "_blank")}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    )}

                    {result.contactInfo.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 bg-transparent"
                        onClick={() => window.open(`tel:${result.contactInfo.phone}`, "_blank")}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    )}

                    {result.contactInfo.linkedin && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 bg-transparent"
                        onClick={() => window.open(result.contactInfo.linkedin, "_blank")}
                      >
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <CardContent className="p-6 space-y-6">
                {/* Summary */}
                <div>
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <p className="text-gray-700">{safeString(result.summary)}</p>
                </div>

                <Separator />

                {/* Key Skills */}
                <div>
                  <h4 className="font-semibold mb-3">Key Skills Found</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keySkills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="outline">
                        {safeString(skill)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Experience */}
                <div>
                  <h4 className="font-semibold mb-2">Experience Level</h4>
                  <p className="text-gray-700">{safeString(result.experience)}</p>
                </div>

                <Separator />

                {/* Strengths and Weaknesses */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-green-700">Strengths</h4>
                    <ul className="space-y-2">
                      {result.strengths.map((strength, strengthIndex) => (
                        <li key={strengthIndex} className="flex items-start gap-2">
                          <Star className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{safeString(strength)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-red-700">Areas for Improvement</h4>
                    <ul className="space-y-2">
                      {result.weaknesses.map((weakness, weaknessIndex) => (
                        <li key={weaknessIndex} className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-red-100 rounded-full mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{safeString(weakness)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
