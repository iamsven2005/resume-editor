"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Sparkles, TrendingUp, CheckCircle, ArrowRight } from "lucide-react"
import type { ResumeData } from "@/types/resume"

interface OptimizationResult {
  changes_made: string[]
  keywords_added: string[]
  sections_modified: string[]
  improvement_summary: string
  match_score_improvement: number
}

interface ResumeOptimizerProps {
  resume: ResumeData
  jobDescription: string
  onOptimizedResume: (optimizedResume: ResumeData, optimizations: OptimizationResult) => void
}

export function ResumeOptimizer({ resume, jobDescription, onOptimizedResume }: ResumeOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizations, setOptimizations] = useState<OptimizationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOptimize = async () => {
    if (!resume || !jobDescription.trim()) {
      setError("Both resume and job description are required")
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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to optimize resume")
      }

      const data = await response.json()

      if (data.success) {
        setOptimizations(data.optimizations)
        onOptimizedResume(data.optimized_resume, data.optimizations)
      } else {
        throw new Error(data.error || "Optimization failed")
      }
    } catch (error) {
      console.error("Optimization error:", error)
      setError(error instanceof Error ? error.message : "Failed to optimize resume")
    } finally {
      setIsOptimizing(false)
    }
  }

  const canOptimize = resume && resume.sections && resume.sections.length > 0 && jobDescription.trim().length > 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Resume Optimizer
        </CardTitle>
        <CardDescription>AI-powered resume optimization to better match job requirements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4">
          <Button onClick={handleOptimize} disabled={!canOptimize || isOptimizing} className="w-full" size="lg">
            {isOptimizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Optimizing Resume...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Optimize Resume for This Job
              </>
            )}
          </Button>

          {!canOptimize && (
            <p className="text-sm text-muted-foreground text-center">
              {!resume || resume.sections?.length === 0
                ? "Upload or create a resume first"
                : "Add job description to enable optimization"}
            </p>
          )}
        </div>

        {optimizations && (
          <div className="mt-6">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="changes">Changes</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="sections">Sections</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      Estimated Match Score Improvement: +{optimizations.match_score_improvement}%
                    </p>
                    <p className="text-sm text-green-600 mt-1">{optimizations.improvement_summary}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="changes" className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Changes Made ({optimizations.changes_made.length})
                </h4>
                <div className="space-y-2">
                  {optimizations.changes_made.map((change, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">{change}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="keywords" className="space-y-3">
                <h4 className="font-medium">Keywords Added ({optimizations.keywords_added.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {optimizations.keywords_added.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="sections" className="space-y-3">
                <h4 className="font-medium">Sections Modified ({optimizations.sections_modified.length})</h4>
                <div className="space-y-2">
                  {optimizations.sections_modified.map((section, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{section}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
