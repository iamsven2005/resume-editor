"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DocumentUpload } from "./document-upload"
import { FileText, Code, Globe, Download, Upload, AlertCircle, RefreshCw, Target, Sparkles } from "lucide-react"
import type { TabType, ResumeData } from "@/types/resume"

interface DataInputPanelProps {
  jsonString: string
  markdownString: string
  htmlString: string
  activeTab: TabType
  parseError: string | null
  resumeTitle: string
  onJsonChange: (value: string) => void
  onMarkdownChange: (value: string) => void
  onHtmlChange: (value: string) => void
  onTabChange: (tab: TabType) => void
  onConvertToMarkdown: () => void
  onConvertToJson: () => void
  onConvertToHtml: () => void
  onConvertFromHtml: () => void
  onDownloadFile: (format: TabType) => void
  onResumeUploaded: (data: ResumeData) => void
  jobRequirements: string
  onJobRequirementsChange: (value: string) => void
  onAnalyzeResume: () => void
  isAnalyzing: boolean
}

export function DataInputPanel({
  jsonString,
  markdownString,
  htmlString,
  activeTab,
  parseError,
  resumeTitle,
  onJsonChange,
  onMarkdownChange,
  onHtmlChange,
  onTabChange,
  onConvertToMarkdown,
  onConvertToJson,
  onConvertToHtml,
  onConvertFromHtml,
  onDownloadFile,
  onResumeUploaded,
  jobRequirements,
  onJobRequirementsChange,
  onAnalyzeResume,
  isAnalyzing,
}: DataInputPanelProps) {
  const [isConverting, setIsConverting] = useState(false)

  const handleConversion = async (conversionFn: () => void) => {
    setIsConverting(true)
    try {
      conversionFn()
    } finally {
      setIsConverting(false)
    }
  }

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case "json":
        return <Code className="h-4 w-4" />
      case "markdown":
        return <FileText className="h-4 w-4" />
      case "html":
        return <Globe className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTabDescription = (tab: TabType) => {
    switch (tab) {
      case "json":
        return "Structured data format for editing"
      case "markdown":
        return "Human-readable text format"
      case "html":
        return "Web-ready markup format"
      default:
        return ""
    }
  }

  const handleResumeExtracted = (resumeData: ResumeData) => {
    console.log("Resume extracted in DataInputPanel:", resumeData)
    onResumeUploaded(resumeData)
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Document Upload</CardTitle>
              <CardDescription className="text-sm">Upload PDF or Word documents to extract resume data</CardDescription>
            </div>
            <DocumentUpload onResumeExtracted={handleResumeExtracted}>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DocumentUpload>
          </div>
        </CardHeader>
      </Card>

      {/* Data Tabs */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="json" className="flex items-center gap-2">
              {getTabIcon("json")}
              <span className="hidden sm:inline">JSON</span>
            </TabsTrigger>
            <TabsTrigger value="markdown" className="flex items-center gap-2">
              {getTabIcon("markdown")}
              <span className="hidden sm:inline">Markdown</span>
            </TabsTrigger>
            <TabsTrigger value="html" className="flex items-center gap-2">
              {getTabIcon("html")}
              <span className="hidden sm:inline">HTML</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onDownloadFile(activeTab)} disabled={!jsonString.trim()}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="json" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">JSON Data</h3>
              <p className="text-xs text-muted-foreground">{getTabDescription("json")}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConversion(onConvertToMarkdown)}
                disabled={isConverting || !jsonString.trim()}
              >
                {isConverting ? (
                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <FileText className="h-3 w-3 mr-1" />
                )}
                To MD
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConversion(onConvertToHtml)}
                disabled={isConverting || !jsonString.trim()}
              >
                {isConverting ? (
                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Globe className="h-3 w-3 mr-1" />
                )}
                To HTML
              </Button>
            </div>
          </div>

          {parseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}

          <Textarea
            value={jsonString}
            onChange={(e) => onJsonChange(e.target.value)}
            placeholder="Paste your JSON resume data here or upload a document..."
            className="min-h-[300px] font-mono text-sm"
          />
        </TabsContent>

        <TabsContent value="markdown" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Markdown Format</h3>
              <p className="text-xs text-muted-foreground">{getTabDescription("markdown")}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConversion(onConvertToJson)}
                disabled={isConverting || !markdownString.trim()}
              >
                {isConverting ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <Code className="h-3 w-3 mr-1" />}
                To JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConversion(onConvertToHtml)}
                disabled={isConverting || !markdownString.trim()}
              >
                {isConverting ? (
                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Globe className="h-3 w-3 mr-1" />
                )}
                To HTML
              </Button>
            </div>
          </div>

          <Textarea
            value={markdownString}
            onChange={(e) => onMarkdownChange(e.target.value)}
            placeholder="Markdown format of your resume..."
            className="min-h-[300px] font-mono text-sm"
          />
        </TabsContent>

        <TabsContent value="html" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">HTML Format</h3>
              <p className="text-xs text-muted-foreground">{getTabDescription("html")}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConversion(onConvertFromHtml)}
                disabled={isConverting || !htmlString.trim()}
              >
                {isConverting ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <Code className="h-3 w-3 mr-1" />}
                To JSON
              </Button>
            </div>
          </div>

          <Textarea
            value={htmlString}
            onChange={(e) => onHtmlChange(e.target.value)}
            placeholder="HTML format of your resume..."
            className="min-h-[300px] font-mono text-sm"
          />
        </TabsContent>
      </Tabs>

      {/* Job Requirements Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Job Requirements
              </CardTitle>
              <CardDescription className="text-sm">Paste job requirements to analyze resume match</CardDescription>
            </div>
            <Button
              onClick={onAnalyzeResume}
              disabled={isAnalyzing || !jobRequirements.trim() || !jsonString.trim()}
              size="sm"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={jobRequirements}
            onChange={(e) => onJobRequirementsChange(e.target.value)}
            placeholder="Paste the job description or requirements here to analyze how well your resume matches..."
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
