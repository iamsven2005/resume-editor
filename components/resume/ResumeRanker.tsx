import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FileText,
  Briefcase,
  Calendar,
  TrendingUp,
  CheckCircle2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { RankingResults } from "./RankingResults"

interface Resume {
  id: number
  title: string
  resume_data: any
  created_at: string
  updated_at: string
  is_favorite?: boolean
}

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

interface ResumeRankerProps {
  resumes: Resume[]
  token: string
}

// Helper function to safely get string value
const safeString = (value: any): string => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  return String(value)
}

// Helper function to safely trim string
const safeTrim = (value: any): string => {
  const str = safeString(value)
  return str.trim()
}

export function ResumeRanker({ resumes, token }: ResumeRankerProps) {
  const [selectedResumeIds, setSelectedResumeIds] = useState<Set<number>>(new Set())
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<ResumeAnalysis[]>([])
  const [showRanking, setShowRanking] = useState(false)

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Unknown date"
    }
  }

  const handleResumeSelection = (resumeId: number, checked: boolean) => {
    setSelectedResumeIds((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(resumeId)
      } else {
        newSet.delete(resumeId)
      }
      return newSet
    })
  }

  const handleSelectAllResumes = (checked: boolean) => {
    if (checked) {
      setSelectedResumeIds(new Set(resumes.map((r) => r.id)))
    } else {
      setSelectedResumeIds(new Set())
    }
  }

  const analyzeSelectedResumes = async () => {
    if (!safeTrim(jobDescription) || selectedResumeIds.size === 0) {
      toast({
        title: "Missing Information",
        description: "Please enter a job description and select at least one resume.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setShowRanking(true)

    try {
      const selectedResumes = resumes.filter((r) => selectedResumeIds.has(r.id))

      const response = await fetch("/api/analyze-resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobDescription: safeTrim(jobDescription),
          resumes: selectedResumes.map((r) => ({
            id: r.id,
            name: safeTrim(r.title),
            data: r.resume_data,
          })),
        }),
      })

      if (response.ok) {
        const analysisData = await response.json()
        setAnalysisResults(analysisData.results.sort((a: ResumeAnalysis, b: ResumeAnalysis) => b.score - a.score))
      } else {
        throw new Error("Analysis failed")
      }
    } catch (error) {
      console.error("Analysis failed:", error)
      toast({
        title: "Error",
        description: "Failed to analyze resumes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetRanking = () => {
    setSelectedResumeIds(new Set())
    setJobDescription("")
    setAnalysisResults([])
    setShowRanking(false)
  }

  if (showRanking) {
    return (
      <RankingResults
        analysisResults={analysisResults}
        isAnalyzing={isAnalyzing}
        onReset={resetRanking}
      />
    )
  }

  return (
    <div className="grid gap-6">
      {/* Job Description Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Job Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter the job description, required skills, qualifications, and experience you want to match against..."
            value={jobDescription}
            onChange={(e) => setJobDescription(safeString(e.target.value))}
            className="min-h-[150px]"
          />
        </CardContent>
      </Card>

      {/* Resume Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Select Resumes to Rank
            </CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectedResumeIds.size === resumes.length && resumes.length > 0}
                onCheckedChange={handleSelectAllResumes}
              />
              <Label htmlFor="select-all" className="text-sm">
                Select All ({resumes.length})
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {resumes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No resumes available for ranking</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] w-full">
              <div className="flex flex-wrap gap-4 p-1">
                {resumes.map((resume) => (
                  <Card
                    key={resume.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedResumeIds.has(resume.id) ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => handleResumeSelection(resume.id, !selectedResumeIds.has(resume.id))}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedResumeIds.has(resume.id)}
                              onCheckedChange={(checked) =>
                                handleResumeSelection(resume.id, checked as boolean)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                            <CardTitle className="text-base truncate">{safeString(resume.title)}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>Updated {formatDate(resume.updated_at)}</span>
                          </div>
                        </div>
                        {selectedResumeIds.has(resume.id) && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={analyzeSelectedResumes}
          disabled={!safeTrim(jobDescription) || selectedResumeIds.size === 0 || isAnalyzing}
          size="lg"
          className="px-8"
        >
          {isAnalyzing ? (
            <>
              <TrendingUp className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Rank Selected Resumes ({selectedResumeIds.size})
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
