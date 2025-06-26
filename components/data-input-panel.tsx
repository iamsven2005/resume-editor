"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AlertCircle, Code, FileCode, Globe, Download, Upload } from "lucide-react"
import { DocumentUpload } from "./document-upload"
import type { TabType, ResumeData } from "../types/resume"

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
}: DataInputPanelProps) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const getConversionButtons = () => {
    switch (activeTab) {
      case "json":
        return (
          <>
            <Button variant="outline" size="sm" onClick={onConvertToMarkdown} className="flex items-center gap-1">
              <FileCode className="h-4 w-4" />
              To Markdown
            </Button>
            <Button variant="outline" size="sm" onClick={onConvertToHtml} className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              To HTML
            </Button>
          </>
        )
      case "markdown":
        return (
          <>
            <Button variant="outline" size="sm" onClick={onConvertToJson} className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              To JSON
            </Button>
            <Button variant="outline" size="sm" onClick={onConvertToHtml} className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              To HTML
            </Button>
          </>
        )
      case "html":
        return (
          <>
            <Button variant="outline" size="sm" onClick={onConvertFromHtml} className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              To JSON
            </Button>
            <Button variant="outline" size="sm" onClick={onConvertToMarkdown} className="flex items-center gap-1">
              <FileCode className="h-4 w-4" />
              To Markdown
            </Button>
          </>
        )
      default:
        return null
    }
  }

  const getDownloadButtonText = () => {
    switch (activeTab) {
      case "json":
        return "Download JSON"
      case "markdown":
        return "Download Markdown"
      case "html":
        return "Download HTML"
      default:
        return "Download"
    }
  }

  const getFileIcon = () => {
    switch (activeTab) {
      case "json":
        return <Code className="h-4 w-4" />
      case "markdown":
        return <FileCode className="h-4 w-4" />
      case "html":
        return <Globe className="h-4 w-4" />
      default:
        return <Download className="h-4 w-4" />
    }
  }

  const handleResumeUploaded = (data: ResumeData) => {
    onResumeUploaded(data)
    setIsUploadDialogOpen(false)
  }

  const handleUploadClick = () => {
    setIsUploadDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Data Input</CardTitle>
          <div className="flex space-x-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={handleUploadClick} className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
            {getConversionButtons()}
            <Button
              variant="default"
              size="sm"
              onClick={() => onDownloadFile(activeTab)}
              className="flex items-center gap-1"
              title={`Download current content as ${activeTab.toUpperCase()} file`}
            >
              {getFileIcon()}
              {getDownloadButtonText()}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="json" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="markdown" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Markdown
            </TabsTrigger>
            <TabsTrigger value="html" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              HTML
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="mt-4">
            <Textarea
              value={jsonString}
              onChange={(e) => onJsonChange(e.target.value)}
              className="font-mono text-sm min-h-[500px]"
              placeholder="Enter your JSON here..."
            />
          </TabsContent>

          <TabsContent value="markdown" className="mt-4">
            <Textarea
              value={markdownString}
              onChange={(e) => onMarkdownChange(e.target.value)}
              className="font-mono text-sm min-h-[500px]"
              placeholder="Enter your Markdown here..."
            />
          </TabsContent>

          <TabsContent value="html" className="mt-4">
            <Textarea
              value={htmlString}
              onChange={(e) => onHtmlChange(e.target.value)}
              className="font-mono text-sm min-h-[500px]"
              placeholder="Enter your HTML here..."
            />
          </TabsContent>
        </Tabs>

        {parseError && (
          <Alert className="mt-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}

        {/* Document Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DocumentUpload onResumeExtracted={handleResumeUploaded} onClose={() => setIsUploadDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
