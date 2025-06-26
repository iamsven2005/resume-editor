"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Upload, FileText, AlertCircle, CheckCircle2, X } from "lucide-react"
import type { ResumeData } from "../types/resume"

interface PDFUploadProps {
  onResumeExtracted: (data: ResumeData) => void
  onClose: () => void
}

// Mock function for now - replace with actual implementation
const processPDFFile = async (file: File): Promise<ResumeData> => {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Return mock data for now
  return {
    title: `${file.name.replace(".pdf", "")} - Extracted Resume`,
    sections: [
      {
        "section name": "Experience",
        content: [
          {
            "job title": "Software Engineer",
            Organization: "Tech Company",
            Duration: "2020 - Present",
            Description: "Developed web applications and managed databases.",
          },
        ],
        id: "exp-" + Math.random().toString(36).substr(2, 9),
      },
      {
        "section name": "Education",
        content: [
          {
            Degree: "Bachelor of Computer Science",
            Organization: "University",
            Duration: "2016 - 2020",
            GPA: "3.8",
          },
        ],
        id: "edu-" + Math.random().toString(36).substr(2, 9),
      },
    ],
  }
}

export const PDFUpload = ({ onResumeExtracted, onClose }: PDFUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Please upload a PDF file only."
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      return "File size must be less than 10MB."
    }

    return null
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setError("")
    setProgress(0)
    setCurrentStep("Validating file...")

    try {
      // Validate file
      const validationError = validateFile(file)
      if (validationError) {
        throw new Error(validationError)
      }

      setProgress(20)
      setCurrentStep("Extracting text from PDF...")

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 80) {
            clearInterval(progressInterval)
            return 80
          }
          return prev + 10
        })
      }, 300)

      // Process the PDF (mock for now)
      const resumeData = await processPDFFile(file)

      clearInterval(progressInterval)
      setProgress(100)
      setCurrentStep("Complete!")
      setSuccess(true)

      // Wait a moment to show success, then callback
      setTimeout(() => {
        onResumeExtracted(resumeData)
      }, 1000)
    } catch (err) {
      console.error("Error processing PDF:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setProgress(0)
      setCurrentStep("")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileSelect = (file: File) => {
    processFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const resetUpload = () => {
    setError("")
    setSuccess(false)
    setProgress(0)
    setCurrentStep("")
    setIsProcessing(false)
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload PDF Resume
        </DialogTitle>
        <DialogDescription>
          Upload your PDF resume and we'll extract the information using AI to populate the editor.
        </DialogDescription>
      </DialogHeader>

      {!isProcessing && !success && !error && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleBrowseClick}
        >
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Drop your PDF here</p>
          <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileInput} className="hidden" />
          <Button variant="outline" onClick={handleBrowseClick}>
            Choose PDF File
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Maximum file size: 10MB</p>
        </div>
      )}

      {isProcessing && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="font-medium">{currentStep}</p>
          </div>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">This may take a few moments...</p>
        </div>
      )}

      {success && (
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
          <div>
            <p className="font-medium text-green-700">Resume processed successfully!</p>
            <p className="text-sm text-muted-foreground">
              Your resume data has been extracted and will be loaded into the editor.
            </p>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        {(error || success) && (
          <Button variant="outline" onClick={resetUpload}>
            Upload Another
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          Close
        </Button>
      </div>
    </div>
  )
}
