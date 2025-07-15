"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Upload, FileText, AlertCircle, CheckCircle2, X, File, Info } from "lucide-react"
import { extractTextFromPDF, extractTextFromPDFAdvanced, parseResumeWithAI } from "../utils/pdf-parser"
import { extractFormattedTextFromWord, parseWordResumeWithAI } from "../utils/word-parser"
import type { ResumeData } from "../types/resume"

interface DocumentUploadProps {
  onResumeExtracted: (data: ResumeData) => void
  onClose: () => void
}

type FileType = "pdf" | "docx"

const processDocumentFile = async (file: File): Promise<ResumeData> => {
  const fileType = getFileType(file)
  let extractedText: string

  if (fileType === "pdf") {
    try {
      // Try primary PDF extraction method
      extractedText = await extractTextFromPDF(file)
    } catch (primaryError) {
      console.warn("Primary PDF extraction failed, trying advanced method:", primaryError)
      try {
        // Try advanced PDF extraction method
        extractedText = await extractTextFromPDFAdvanced(file)
      } catch (advancedError) {
        console.error("Both PDF extraction methods failed:", advancedError)
        throw new Error(
          "Failed to extract text from PDF. This PDF might be:\n\n" +
            "• A scanned document (image-based)\n" +
            "• Password-protected or encrypted\n" +
            "• Corrupted or in an unsupported format\n\n" +
            "Please try:\n" +
            "• Converting to a text-based PDF\n" +
            "• Uploading a Word document (.docx) instead\n" +
            "• Manually copying and pasting the text",
        )
      }
    }
    return parseResumeWithAI(extractedText)
  } else if (fileType === "docx") {
    extractedText = await extractFormattedTextFromWord(file)
    return parseWordResumeWithAI(extractedText)
  } else {
    throw new Error("Unsupported file type")
  }
}

const getFileType = (file: File): FileType => {
  if (file.type === "application/pdf") {
    return "pdf"
  } else if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  ) {
    return "docx"
  } else {
    throw new Error("Unsupported file type")
  }
}

export const DocumentUpload = ({ onResumeExtracted, onClose }: DocumentUploadProps) => {
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
    const isPDF = file.type === "application/pdf"
    const isDocx =
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".docx")

    if (!isPDF && !isDocx) {
      return "Please upload a PDF or Word document (.docx) only."
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
    setExtractedText("")

    try {
      // Validate file
      const validationError = validateFile(file)
      if (validationError) {
        throw new Error(validationError)
      }

      const detectedFileType = getFileType(file)
      setFileType(detectedFileType)

      setProgress(20)
      setCurrentStep(
        detectedFileType === "pdf" ? "Extracting text from PDF..." : "Extracting text from Word document...",
      )

      // Extract text with improved error handling
      let text: string
      if (detectedFileType === "pdf") {
        try {
          text = await extractTextFromPDF(file)
        } catch (primaryError) {
          setCurrentStep("Primary extraction failed, trying advanced method...")
          setProgress(35)
          text = await extractTextFromPDFAdvanced(file)
        }
      } else {
        text = await extractFormattedTextFromWord(file)
      }

      setExtractedText(text)
      setProgress(50)

      // Validate extracted text
      if (!text || text.trim().length === 0) {
        throw new Error(
          "No text could be extracted from the document. Please ensure the document contains readable text.",
        )
      }

      if (text.trim().length < 50) {
        throw new Error("Very little text was extracted. Please ensure the document contains substantial content.")
      }

      setCurrentStep("Processing with AI...")
      setProgress(70)

      // Process with AI
      let resumeData: ResumeData
      if (detectedFileType === "pdf") {
        resumeData = await parseResumeWithAI(text)
      } else {
        resumeData = await parseWordResumeWithAI(text)
      }

      setProgress(100)
      setCurrentStep("Complete!")
      setSuccess(true)

      // Wait a moment to show success, then callback
      setTimeout(() => {
        onResumeExtracted(resumeData)
      }, 1000)
    } catch (err) {
      console.error("Error processing document:", err)
      let errorMessage = "An unexpected error occurred"

      if (err instanceof Error) {
        errorMessage = err.message
      }

      // Provide helpful error messages
      if (errorMessage.includes("Network error") || errorMessage.includes("fetch")) {
        errorMessage = "Network error. Please check your internet connection and try again."
      } else if (errorMessage.includes("AI service")) {
        errorMessage = "AI service is temporarily unavailable. Please try again in a few moments."
      } else if (errorMessage.includes("Server returned")) {
        errorMessage = "Server error. Please try again or contact support if the problem persists."
      }

      setError(errorMessage)
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
    // Reset the input value to allow selecting the same file again
    if (e.target) {
      e.target.value = ""
    }
  }

  const handleBrowseClick = (e?: React.MouseEvent) => {
    // Prevent event bubbling if called from click handler
    if (e) {
      e.stopPropagation()
    }
    fileInputRef.current?.click()
  }

  const resetUpload = () => {
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

      {/* PDF Information Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>For best results:</strong> Use text-based PDFs or Word documents. Scanned PDFs or image-based
          documents may not work well. Word documents (.docx) generally provide better text extraction.
        </AlertDescription>
      </Alert>

      {!isProcessing && !success && !error && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
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

      {isProcessing && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            {getFileIcon()}
            <p className="font-medium">{currentStep}</p>
          </div>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            {fileType === "docx"
              ? "Processing Word document..."
              : "Processing PDF... This may take longer for complex documents..."}
          </p>
          {extractedText && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground mb-2">Extracted text preview:</p>
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
