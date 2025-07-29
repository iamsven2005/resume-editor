"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import  DocumentUpload  from "./document-upload"
import type { TabType, ResumeData } from "../types/resume"
import { FileText, Download, Upload, RefreshCw, Code, Eye, AlertCircle, Target } from "lucide-react"

interface DataInputPanelProps {
  jsonString: string
  markdownString: string
  htmlString: string
  activeTab: TabType
  parseError: string
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

export const DataInputPanel = ({
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
}: DataInputPanelProps) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const handleResumeUploaded = (data: ResumeData) => {
    console.log("Resume uploaded in DataInputPanel:", data)
    onResumeUploaded(data)
    setUploadDialogOpen(false)
  }

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case "json":
        return <Code className="h-4 w-4" />
      case "markdown":
        return <FileText className="h-4 w-4" />
      case "html":
        return <Eye className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getConversionButtons = () => {
    switch (activeTab) {
      case "json":
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onConvertToMarkdown}>
              <FileText className="h-4 w-4 mr-2" />
              To Markdown
            </Button>
            <Button variant="outline" size="sm" onClick={onConvertToHtml}>
              <Eye className="h-4 w-4 mr-2" />
              To HTML
            </Button>
          </div>
        )
      case "markdown":
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onConvertToJson}>
              <Code className="h-4 w-4 mr-2" />
              To JSON
            </Button>
            <Button variant="outline" size="sm" onClick={onConvertToHtml}>
              <Eye className="h-4 w-4 mr-2" />
              To HTML
            </Button>
          </div>
        )
      case "html":
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onConvertFromHtml}>
              <Code className="h-4 w-4 mr-2" />
              To JSON
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  const getCurrentValue = () => {
    switch (activeTab) {
      case "json":
        return jsonString
      case "markdown":
        return markdownString
      case "html":
        return htmlString
      default:
        return ""
    }
  }

  const handleValueChange = (value: string) => {
    switch (activeTab) {
      case "json":
        onJsonChange(value)
        break
      case "markdown":
        onMarkdownChange(value)
        break
      case "html":
        onHtmlChange(value)
        break
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Document Upload</h3>
          <Badge variant="secondary" className="text-xs">
            AI Powered
          </Badge>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DocumentUpload onResumeExtracted={handleResumeUploaded} onClose={() => setUploadDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* Data Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Data Editor</h3>
          <div className="flex items-center gap-2">
            {getConversionButtons()}
            <Button variant="outline" size="sm" onClick={() => onDownloadFile(activeTab)}>
              <Download className="h-4 w-4 mr-2" />
              Download {activeTab.toUpperCase()}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as TabType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="json" className="flex items-center gap-2">
              {getTabIcon("json")}
              JSON
            </TabsTrigger>
            <TabsTrigger value="markdown" className="flex items-center gap-2">
              {getTabIcon("markdown")}
              Markdown
            </TabsTrigger>
            <TabsTrigger value="html" className="flex items-center gap-2">
              {getTabIcon("html")}
              HTML
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Edit your resume data in JSON format</p>
              <Badge variant={parseError ? "destructive" : "secondary"} className="text-xs">
                {parseError ? "Invalid JSON" : "Valid JSON"}
              </Badge>
            </div>
            <Textarea
              value={jsonString}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="Enter JSON data here..."
              className="min-h-[300px] font-mono text-sm"
            />
          </TabsContent>

          <TabsContent value="markdown" className="space-y-2">
            <p className="text-sm text-muted-foreground">Edit your resume in Markdown format</p>
            <Textarea
              value={markdownString}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="Enter Markdown data here..."
              className="min-h-[300px] font-mono text-sm"
            />
          </TabsContent>

          <TabsContent value="html" className="space-y-2">
            <p className="text-sm text-muted-foreground">Edit your resume in HTML format</p>
            <Textarea
              value={htmlString}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="Enter HTML data here..."
              className="min-h-[300px] font-mono text-sm"
            />
          </TabsContent>
        </Tabs>

        {parseError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}
      </div>

      <Separator />

      {/* Job Requirements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Job Requirements</h3>
            <Badge variant="outline" className="text-xs">
              For Analysis
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onAnalyzeResume}
            disabled={isAnalyzing || !jobRequirements.trim()}
          >
            {isAnalyzing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
            {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
          </Button>
        </div>

        <Textarea
          value={jobRequirements}
          onChange={(e) => onJobRequirementsChange(e.target.value)}
          placeholder="Paste the job description or requirements here to analyze how well your resume matches..."
          className="min-h-[120px] text-sm"
        />

        <p className="text-xs text-muted-foreground">
          💡 Tip: Paste a job description to get AI-powered analysis of how well your resume matches the requirements. Open the resume analysis and ai improvement panel to improve resume.
        </p>
      </div>
    </div>
  )
}
