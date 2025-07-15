"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Upload, FileText, AlertCircle, CheckCircle2, X, File, Info, Lock } from "lucide-react"
import { extractTextFromPDF, extractTextFromPDFAdvanced, parseResumeWithAI } from "../utils/pdf-parser"
import { extractFormattedTextFromWord, parseWordResumeWithAI } from "../utils/word-parser"
import type { ResumeData } from "../types/resume"
import { useAuth } from "../contexts/auth-context"

interface DocumentUploadProps {
  onResumeExtracted: (data: ResumeData) => void
  onClose: () => void
}

type FileType = "pdf" | "docx"

const processDocumentFile = async (
  file: File,
  setProgress: (progress: number) => void,
  setCurrentStep: (step: string) => void,
): Promise<ResumeData> => {
  console.log("Processing file:", file.name, "Type:", file.type)

  const fileType = getFileType(file)
  let extractedText: string

  if (fileType === "pdf") {
    setCurrentStep("Analyzing PDF structure...")
    setProgress(30)

    try {
      console.log("Attempting primary PDF extraction...")
      extractedText = await extractTextFromPDF(file)
      setCurrentStep("PDF text extraction successful!")
      setProgress(60)
    } catch (primaryError) {
      console.warn("Primary PDF extraction failed:", primaryError)
      setCurrentStep("Trying advanced PDF extraction method...")
      setProgress(45)

      try {
        extractedText = await extractTextFromPDFAdvanced(file)
        setCurrentStep("Advanced PDF extraction successful!")
        setProgress(60)
      } catch (advancedError) {
        console.error("Both PDF extraction methods failed:", advancedError)
        throw advancedError
      }
    }

    setCurrentStep("Processing extracted text with AI...")
    setProgress(75)
    return parseResumeWithAI(extractedText)
  } else if (fileType === "docx") {
    setCurrentStep("Processing Word document...")
    setProgress(40)

    extractedText = await extractFormattedTextFromWord(file)
    setCurrentStep("Word document processed successfully!")
    setProgress(60)

    setCurrentStep("Processing extracted text with AI...")
    setProgress(75)
    return parseWordResumeWithAI(extractedText)
  } else {
    throw new Error("Unsupported file type. Please upload a PDF or Word document (.docx).")
  }
}

const getFileType = (file: File): FileType => {
  console.log("Detecting file type for:", file.name, "MIME type:", file.type)

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return "pdf"
  } else if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  ) {
    return "docx"
  } else {
    throw new Error(`Unsupported file type: ${file.type}. Please upload a PDF or Word document (.docx).`)
  }
}

export const DocumentUpload = ({ onResumeExtracted, onClose }: DocumentUploadProps) => {
  const { user } = useAuth()
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>("")
  const [fileType, setFileType] = useState<FileType | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    console.log("Validating file:", file.name, "Size:", file.size, "Type:", file.type)

    const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    const isDocx =
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".docx")

    if (!isPDF && !isDocx) {
      return `Unsupported file type: ${file.type || "unknown"}. Please upload a PDF or Word document (.docx) only.`
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      return "File size must be less than 10MB."
    }

    if (file.size === 0) {
      return "The file appears to be empty. Please select a valid document."
    }

    return null
  }

  const processFile = async (file: File) => {
    console.log("Starting file processing for:", file.name)

    setIsProcessing(true)
    setError("")
    setProgress(0)
    setCurrentStep("Validating file...")
    setExtractedText("")

    try {
      // Validate file
      const validationError = validateFile(file)
      if (validationError) {
        throw new Error(validationError)
      }

      setProgress(10)
      setCurrentStep("Detecting file type...")

      const detectedFileType = getFileType(file)
      setFileType(detectedFileType)
      console.log("Detected file type:", detectedFileType)

      setProgress(20)

      // Process the document
      const resumeData = await processDocumentFile(file, setProgress, setCurrentStep)

      // Show preview of extracted text if available
      if (resumeData) {
        const previewText = JSON.stringify(resumeData).substring(0, 500)
        setExtractedText(previewText)
      }

      setProgress(90)
      setCurrentStep("Finalizing...")

      // Small delay to show completion
      await new Promise((resolve) => setTimeout(resolve, 500))

      setProgress(100)
      setCurrentStep("Complete!")
      setSuccess(true)

      console.log("File processing completed successfully")

      // Wait a moment to show success, then callback
      setTimeout(() => {
        onResumeExtracted(resumeData)
      }, 1000)
    } catch (err) {
      console.error("Error processing document:", err)
      let errorMessage = "An unexpected error occurred while processing the document."

      if (err instanceof Error) {
        errorMessage = err.message
      }

      // Provide more specific error messages based on error content
      if (errorMessage.includes("Network error") || errorMessage.includes("fetch")) {
        errorMessage = "Network error. Please check your internet connection and try again."
      } else if (errorMessage.includes("AI service") || errorMessage.includes("parse-resume")) {
        errorMessage = "AI service is temporarily unavailable. Please try again in a few moments."
      } else if (errorMessage.includes("Server returned") || errorMessage.includes("HTTP error")) {
        errorMessage = "Server error. Please try again or contact support if the problem persists."
      }

      // Add helpful tip for PDF issues
      if (
        errorMessage.includes("scanned") ||
        errorMessage.includes("image-based") ||
        errorMessage.includes("extract")
      ) {
        errorMessage =
          errorMessage + "\n\n💡 Tip: Word documents (.docx) usually work better than PDFs for text extraction."
      }

      setError(errorMessage)
      setProgress(0)
      setCurrentStep("")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileSelect = (file: File) => {
    if (!user) {
      setError("Please log in to upload documents.")
      return
    }

    console.log("File selected:", file.name)
    processFile(file)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (!user) {
        setError("Please log in to upload documents.")
        return
      }

      const files = Array.from(e.dataTransfer.files)
      console.log("Files dropped:", files.length)

      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [user],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (user) {
        setIsDragOver(true)
      }
    },
    [user],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      setError("Please log in to upload documents.")
      return
    }

    const files = e.target.files
    console.log("File input changed:", files?.length)

    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
    // Reset the input value to allow selecting the same file again
    if (e.target) {
      e.target.value = ""
    }
  }

  const handleBrowseClick = (e?: React.MouseEvent) => {
    if (!user) {
      setError("Please log in to upload documents.")
      return
    }

    // Prevent event bubbling if called from click handler
    if (e) {
      e.stopPropagation()
    }
    fileInputRef.current?.click()
  }

  const resetUpload = () => {
    console.log("Resetting upload state")
    setError("")
    setSuccess(false)
    setProgress(0)
    setCurrentStep("")
    setIsProcessing(false)
    setFileType(null)
    setExtractedText("")
  }

  const getFileIcon = () => {
    if (fileType === "pdf") {
      return <FileText className="h-12 w-12 mx-auto mb-4 text-red-500" />
    } else if (fileType === "docx") {
      return <File className="h-12 w-12 mx-auto mb-4 text-blue-500" />
    }
    return <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Resume Document
        </DialogTitle>
        <DialogDescription>
          Upload your PDF or Word document (.docx) resume and we'll extract the information using AI to populate the
          editor.
        </DialogDescription>
      </DialogHeader>

      {/* Authentication Alert */}
      {!user && (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            <strong>Login Required:</strong> You must be logged in to upload and process documents. Please log in to
            continue.
          </AlertDescription>
        </Alert>
      )}

      {/* Information Alert */}
      {user && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>For best results:</strong>
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>
                  • <strong>Word documents (.docx)</strong> - Recommended, most reliable
                </li>
                <li>
                  • <strong>Text-based PDFs</strong> - Good, but avoid scanned PDFs
                </li>
                <li>• Ensure documents contain actual text, not just images</li>
                <li>• Remove password protection before uploading</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!isProcessing && !success && !error && user && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => handleBrowseClick()}
        >
          <div className="flex justify-center space-x-4 mb-4">
            <FileText className="h-8 w-8 text-red-500" title="PDF" />
            <File className="h-8 w-8 text-blue-500" title="Word Document" />
          </div>
          <p className="text-lg font-medium mb-2">Drop your document here</p>
          <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileInput}
            className="hidden"
          />
          <Button variant="outline" onClick={(e) => handleBrowseClick(e)}>
            Choose Document
          </Button>
          <div className="mt-4 space-y-1">
            <p className="text-xs text-muted-foreground">Supported formats:</p>
            <p className="text-xs text-muted-foreground">• Word documents (.docx) - recommended</p>
            <p className="text-xs text-muted-foreground">• PDF documents (.pdf) - text-based only</p>
            <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
          </div>
        </div>
      )}

      {/* Disabled state for non-authenticated users */}
      {!user && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/50 opacity-60">
          <div className="flex justify-center space-x-4 mb-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium mb-2 text-muted-foreground">Document Upload Disabled</p>
          <p className="text-sm text-muted-foreground mb-4">Please log in to upload documents</p>
          <Button variant="outline" disabled>
            Login Required
          </Button>
        </div>
      )}

      {isProcessing && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            {getFileIcon()}
            <p className="font-medium">{currentStep}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Processing {fileType === "docx" ? "Word document" : "PDF"}...
            </p>
          </div>
          <Progress value={progress} className="w-full" />
          {extractedText && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground mb-2">Processing preview:</p>
              <p className="text-xs font-mono max-h-20 overflow-y-auto">{extractedText.substring(0, 200)}...</p>
            </div>
          )}
        </div>
      )}

      {success && (
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
          <div>
            <p className="font-medium text-green-700">
              {fileType === "docx" ? "Word document" : "PDF"} processed successfully!
            </p>
            <p className="text-sm text-muted-foreground">
              Your resume data has been extracted and will be loaded into the editor.
            </p>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        {(error || success) && user && (
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
