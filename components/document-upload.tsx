"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { parsePDF } from "@/utils/pdf-parser"
import { parseWord } from "@/utils/word-parser"
import type { ResumeData } from "@/types/resume"

interface DocumentUploadProps {
  onResumeExtracted: (resumeData: ResumeData) => void
  children?: React.ReactNode
}

export function DocumentUpload({ onResumeExtracted, children }: DocumentUploadProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [step, setStep] = useState<"upload" | "processing" | "success" | "error">("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = () => {
    setFile(null)
    setIsProcessing(false)
    setProgress(0)
    setError(null)
    setExtractedText("")
    setStep("upload")
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please select a PDF or Word document (.pdf, .docx, .doc)")
      return
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setFile(selectedFile)
    setError(null)
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    console.log("Extracting text from file:", file.name, file.type)

    try {
      if (file.type === "application/pdf") {
        return await parsePDF(file)
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
      ) {
        return await parseWord(file)
      } else {
        throw new Error("Unsupported file type")
      }
    } catch (error) {
      console.error("Text extraction error:", error)
      throw new Error(`Failed to extract text from ${file.type === "application/pdf" ? "PDF" : "Word"} file`)
    }
  }

  const processWithAI = async (text: string): Promise<ResumeData> => {
    console.log("Processing text with AI, length:", text.length)

    const response = await fetch("/api/parse-resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("AI processing result:", result)

    if (!result.success) {
      throw new Error(result.error || "Failed to process resume")
    }

    return result.resumeData
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    if (!user) {
      setError("Please log in to upload documents")
      return
    }

    setIsProcessing(true)
    setStep("processing")
    setProgress(0)
    setError(null)

    try {
      // Step 1: Extract text from file
      setProgress(25)
      console.log("Starting text extraction...")
      const extractedText = await extractTextFromFile(file)
      console.log("Text extracted successfully, length:", extractedText.length)

      if (!extractedText.trim()) {
        throw new Error("No text could be extracted from the document")
      }

      setExtractedText(extractedText)
      setProgress(50)

      // Step 2: Process with AI
      console.log("Starting AI processing...")
      const resumeData = await processWithAI(extractedText)
      console.log("AI processing completed:", resumeData)
      setProgress(75)

      // Step 3: Validate and structure data
      if (!resumeData || typeof resumeData !== "object") {
        throw new Error("Invalid resume data received from AI processing")
      }

      // Ensure proper structure
      const structuredData: ResumeData = {
        title: resumeData.title || file.name.replace(/\.[^/.]+$/, ""),
        sections: resumeData.sections || [],
      }

      setProgress(100)
      setStep("success")

      // Step 4: Pass data to parent component
      console.log("Calling onResumeExtracted with:", structuredData)
      onResumeExtracted(structuredData)

      toast({
        title: "Success!",
        description: "Resume uploaded and processed successfully",
      })

      // Close dialog after a short delay
      setTimeout(() => {
        setIsOpen(false)
        resetState()
      }, 1500)
    } catch (error) {
      console.error("Upload processing error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)
      setStep("error")

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      setIsOpen(false)
      resetState()
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" disabled={!user}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => isProcessing && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Upload Resume Document</DialogTitle>
          <DialogDescription>Upload a PDF or Word document to extract and edit your resume data</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!user && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Please log in to upload documents</AlertDescription>
            </Alert>
          )}

          {step === "upload" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Document</Label>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={triggerFileSelect}
                    className="flex-1 bg-transparent"
                    disabled={!user}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {file ? file.name : "Choose File"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, Word (.docx, .doc) • Max size: 10MB
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={!file || !user || isProcessing}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Process
                </Button>
              </div>
            </>
          )}

          {step === "processing" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Processing your document...</p>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-xs text-center text-muted-foreground">
                {progress < 25 && "Preparing file..."}
                {progress >= 25 && progress < 50 && "Extracting text..."}
                {progress >= 50 && progress < 75 && "Processing with AI..."}
                {progress >= 75 && "Finalizing..."}
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h3 className="font-medium">Upload Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Your resume has been processed and loaded into the editor
                </p>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>

              {extractedText && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Extracted Text Preview</CardTitle>
                    <CardDescription>
                      This is what was extracted from your document before AI processing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-32 overflow-y-auto text-xs bg-muted p-2 rounded">
                      {extractedText.substring(0, 500)}
                      {extractedText.length > 500 && "..."}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setStep("upload")}>
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
