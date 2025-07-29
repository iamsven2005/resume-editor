"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Upload, CheckCircle2, AlertCircle, X, File, Lock } from "lucide-react"
import { useAuth } from "../contexts/auth-context"
import type { ResumeData } from "../types/resume"

interface DocumentUploadProps {
  onResumeExtracted: (data: ResumeData) => void
  onClose: () => void
}

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(",")[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const DocumentUpload = ({ onResumeExtracted, onClose }: DocumentUploadProps) => {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>("")
  const [previewText, setPreviewText] = useState<string>("")

  const reset = () => {
    setIsProcessing(false)
    setProgress(0)
    setError("")
    setSuccess(false)
    setCurrentStep("")
    setPreviewText("")
  }

  const handleBrowseClick = () => {
    if (!user) {
      setError("Please log in to upload documents.")
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files?.[0]) {
      handleFileSelect(files[0])
    }
    e.target.value = ""
  }

  const handleFileSelect = async (file: File) => {
    reset()
    if (!user) {
      setError("Please log in to upload documents.")
      return
    }

    setIsProcessing(true)
    setProgress(10)
    setCurrentStep("Reading file...")

    try {
      const base64 = await readFileAsBase64(file)
      setProgress(30)
      setCurrentStep("Decoding file...")

      const decoded = atob(base64)
      const textSample = decoded.slice(0, 300)
      setPreviewText(textSample)

      setProgress(60)
      setCurrentStep("Sending to AI for parsing...")

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: decoded, type: file.type }),
      })

      const json = await response.json()

      if (!json.success) {
        throw new Error(json.error || "AI failed to parse resume.")
      }

      setProgress(100)
      setCurrentStep("Complete!")
      setSuccess(true)

      setTimeout(() => {
        onResumeExtracted(json.data)
        onClose()
      }, 1000)
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "Unknown error occurred.")
      setProgress(0)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Any File
        </DialogTitle>
        <DialogDescription>
          Upload a resume or document. We'll extract and analyze it using AI. Supports PDF, Word, TXT, RTF, JPG, and more.
        </DialogDescription>
      </DialogHeader>

      {!user && (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to upload and process documents.
          </AlertDescription>
        </Alert>
      )}

      {user && !isProcessing && !success && !error && (
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50"
          onClick={handleBrowseClick}
        >
          <File className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-lg font-medium mb-1">Click to upload a document</p>
          <p className="text-sm text-muted-foreground mb-3">Supported: PDF, DOCX, TXT, RTF, JPG, PNG, etc.</p>
          <Button variant="outline" onClick={handleBrowseClick}>Choose File</Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            className="hidden"
            accept="*/*"
          />
        </div>
      )}

      {isProcessing && (
        <div className="space-y-4 text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-2 rounded-full" />
          <p className="font-medium">{currentStep}</p>
          <Progress value={progress} />
          {previewText && (
            <div className="bg-muted p-3 mt-2 rounded text-left">
              <p className="text-xs text-muted-foreground">Preview:</p>
              <pre className="text-xs overflow-x-auto max-h-32">{previewText}</pre>
            </div>
          )}
        </div>
      )}

      {success && (
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
          <p className="font-medium text-green-700">File processed successfully!</p>
          <p className="text-sm text-muted-foreground">Resume data has been extracted.</p>
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
          <Button variant="outline" onClick={reset}>Upload Another</Button>
        )}
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          Close
        </Button>
      </div>
    </div>
  )
}
