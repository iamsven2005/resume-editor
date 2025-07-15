"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Sparkles, CheckCircle, AlertCircle, TrendingUp } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { ResumeData } from "../types/resume"

interface OptimizationResult {
  optimized_resume: ResumeData
  optimizations: {
    changes_made: string[]
    keywords_added: string[]
    sections_modified: string[]
    improvement_summary: string
    match_score_improvement: number
  }
}

interface ResumeOptimizerProps {
  resume: ResumeData | null
  jobDescription: string
  onOptimizedResume: (resume: ResumeData) => void
}

export function ResumeOptimizer({ resume, jobDescription, onOptimizedResume }: ResumeOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOptimize = async () => {
    if (!resume || !jobDescription.trim()) {
      toast({
        variant: "destructive",
        description: "Both resume data and job description are required for optimization.",
      })
      return
    }

    setIsOptimizing(true)
    setError(null)

    try {
      const response = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume,
          jobDescription: jobDescription.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Optimization failed")
      }

      setOptimizationResult(result)
      setIsDialogOpen(true)
      toast({
        description: "Resume optimization completed successfully!",
      })
    } catch (error) {
      console.error("Error optimizing resume:", error)
      setError(error instanceof Error ? error.message : "Failed to optimize resume")
      toast({
        variant: "destructive",
        description: "Failed to optimize resume. Please try again.",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleApplyOptimization = () => {
    if (optimizationResult) {
      onOptimizedResume(optimizationResult.optimized_resume)
      setIsDialogOpen(false)
      toast({
        description: "Optimized resume applied successfully!",
      })
    }
  }

  const canOptimize = resume && resume.sections && resume.sections.length > 0 && jobDescription.trim()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Resume Optimization
        </CardTitle>
        <CardDescription>
          Enhance your resume to better match the job requirements using AI-powered optimization.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Requirements for optimization:</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={resume && resume.sections && resume.sections.length > 0 ? "default" : "secondary"}>
              {resume && resume.sections && resume.sections.length > 0 ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              Resume Data
            </Badge>
            <Badge variant={jobDescription.trim() ? "default" : "secondary"}>
              {jobDescription.trim() ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              Job Description
            </Badge>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOptimize} disabled={!canOptimize || isOptimizing} className="w-full">
              {isOptimizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Optimize Resume for Job
                </>
              )}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resume Optimization Results
              </DialogTitle>
              <DialogDescription>Review the AI-powered improvements to your resume</DialogDescription>
            </DialogHeader>

            {optimizationResult && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-800">Optimization Summary</h3>
                  </div>
                  <p className="text-green-700 mb-3">{optimizationResult.optimizations.improvement_summary}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600">Estimated Match Score Improvement:</span>
                    <Badge variant="default" className="bg-green-600">
                      +{optimizationResult.optimizations.match_score_improvement}%
                    </Badge>
                  </div>
                </div>

                {/* Detailed Results */}
                <Tabs defaultValue="changes" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="changes">Changes Made</TabsTrigger>
                    <TabsTrigger value="keywords">Keywords Added</TabsTrigger>
                    <TabsTrigger value="sections">Sections Modified</TabsTrigger>
                  </TabsList>

                  <TabsContent value="changes" className="space-y-3">
                    <h4 className="font-medium">Changes Made to Your Resume:</h4>
                    <div className="space-y-2">
                      {optimizationResult.optimizations.changes_made.map((change, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-blue-800">{change}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="keywords" className="space-y-3">
                    <h4 className="font-medium">Keywords Added:</h4>
                    <div className="flex flex-wrap gap-2">
                      {optimizationResult.optimizations.keywords_added.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="sections" className="space-y-3">
                    <h4 className="font-medium">Sections Modified:</h4>
                    <div className="space-y-2">
                      {optimizationResult.optimizations.sections_modified.map((section, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                          <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm text-orange-800">{section}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleApplyOptimization} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply Optimization
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
