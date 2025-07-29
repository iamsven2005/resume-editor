"use client"

import { useState, useRef } from "react"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Upload, Lock, AlertCircle, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import type { ResumeData } from "../types/resume"

interface DocumentUploadProps {
  onResumeExtracted: (data: ResumeData) => void
  onClose: () => void
}

export default function DocumentUpload({ onResumeExtracted, onClose }: DocumentUploadProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [textInput, setTextInput] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [preview, setPreview] = useState("")

  const resetState = () => {
    setIsProcessing(false)
    setProgress(0)
    setCurrentStep("")
    setTextInput("")
    setError("")
    setSuccess(false)
    setPreview("")
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ""
  }

  const processFile = async (file: File) => {
    resetState()
    if (!user) return setError("Please log in to upload files.")

    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
      return setError("Unsupported file type. Only PDF and DOCX are allowed.")
    }

    if (file.size > 10 * 1024 * 1024) {
      return setError("File is too large. Max size is 10MB.")
    }

    setIsProcessing(true)
    setCurrentStep("Reading file...")
    setProgress(10)

    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result?.toString()
      if (!base64) {
        setIsProcessing(false)
        return setError("Failed to read file.")
      }

      setProgress(30)
      setCurrentStep("Sending to AI for processing...")

      try {
        const res = await fetch("/api/parse-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64 }),
        })
        const { success, data, error: serverError } = await res.json()

        if (!success) throw new Error(serverError || "Unknown error from server")

        setProgress(100)
        setCurrentStep("Success!")
        setPreview(JSON.stringify(data, null, 2))
        setSuccess(true)

        setTimeout(() => {
          onResumeExtracted(data)
          onClose()
        }, 1000)
      } catch (err: any) {
        console.error(err)
        setError("Failed to process resume. " + (err?.message || "Unknown error"))
      } finally {
        setIsProcessing(false)
      }
    }

    reader.readAsDataURL(file)
  }

  const processText = async () => {
    resetState()
    if (!textInput.trim()) return setError("Please enter some resume content.")

    setIsProcessing(true)
    setProgress(20)
    setCurrentStep("Sending to AI for processing...")

    try {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput }),
      })

      const { success, data, error: serverError } = await res.json()

      if (!success) throw new Error(serverError || "Unknown error from server")

      setProgress(100)
      setCurrentStep("Success!")
      setPreview(JSON.stringify(data, null, 2))
      setSuccess(true)

      setTimeout(() => {
        onResumeExtracted(data)
        onClose()
      }, 1000)
    } catch (err: any) {
      console.error(err)
      setError("Failed to parse resume. " + (err?.message || "Unknown error"))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload or Paste Resume
        </DialogTitle>
        <DialogDescription>
          Choose to upload a resume file (PDF or Word), or paste the content directly for AI parsing.
        </DialogDescription>
      </DialogHeader>

      {!user && (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>Please log in to use this feature.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Upload File</TabsTrigger>
          <TabsTrigger value="text">Paste Text</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4 py-4">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileInput}
            disabled={!user || isProcessing}
          />
        </TabsContent>

        <TabsContent value="text" className="space-y-4 py-4">
          <Textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste resume content here..."
            className="min-h-[200px]"
            disabled={!user || isProcessing}
          />
          <Button onClick={processText} disabled={isProcessing || !user}>
            {isProcessing ? "Processing..." : "Extract from Text"}
          </Button>
        </TabsContent>
      </Tabs>

      {isProcessing && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{currentStep}</p>
          <Progress value={progress} />
        </div>
      )}

      {success && (
        <div className="text-green-700 text-sm space-y-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p>Resume successfully processed!</p>
          <pre className="text-xs bg-green-100 p-2 rounded max-h-[200px] overflow-y-auto">{preview}</pre>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        {(error || success) && (
          <Button variant="outline" onClick={resetState}>
            Try Another
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
