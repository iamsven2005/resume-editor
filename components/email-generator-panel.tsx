"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Copy, RefreshCw, Send, Sparkles, AlertTriangle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { ResumeAnalysis } from "../types/analysis"
import type { GeneratedEmail } from "../types/email"

interface EmailGeneratorPanelProps {
  analysis: ResumeAnalysis | null
  resumeData: any
  jobRequirements: string
}

export const EmailGeneratorPanel = ({ analysis, resumeData, jobRequirements }: EmailGeneratorPanelProps) => {
  const [emailType, setEmailType] = useState<"application" | "networking" | "follow_up">("application")
  const [customInstructions, setCustomInstructions] = useState("")
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editableSubject, setEditableSubject] = useState("")
  const [editableBody, setEditableBody] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const generateEmail = async () => {
    if (!analysis || !resumeData || !jobRequirements.trim()) {
      toast({
        variant: "destructive",
        description: "Resume analysis and job requirements are needed to generate emails.",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeData,
          jobRequirements: jobRequirements.trim(),
          analysis,
          emailType,
          customInstructions: customInstructions.trim(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedEmail(result.email)
        setEditableSubject(result.email.subject)
        setEditableBody(result.email.body)
        setIsEditing(false)
        toast({
          description: "Email generated successfully!",
        })
      } else {
        throw new Error(result.error || "Email generation failed")
      }
    } catch (error) {
      console.error("Error generating email:", error)
      toast({
        variant: "destructive",
        description: "Failed to generate email. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        description: `${type} copied to clipboard!`,
      })
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
      toast({
        variant: "destructive",
        description: "Failed to copy to clipboard.",
      })
    }
  }

  const copyFullEmail = async () => {
    if (!generatedEmail) return

    const fullEmail = `Subject: ${isEditing ? editableSubject : generatedEmail.subject}\n\n${isEditing ? editableBody : generatedEmail.body}`
    await copyToClipboard(fullEmail, "Full email")
  }

  const saveEdits = () => {
    if (generatedEmail) {
      setGeneratedEmail({
        ...generatedEmail,
        subject: editableSubject,
        body: editableBody,
      })
      setIsEditing(false)
      toast({
        description: "Email edits saved!",
      })
    }
  }

  const cancelEdits = () => {
    if (generatedEmail) {
      setEditableSubject(generatedEmail.subject)
      setEditableBody(generatedEmail.body)
      setIsEditing(false)
    }
  }

  const getEmailTypeDescription = (type: string) => {
    switch (type) {
      case "application":
        return "Direct job application email to hiring managers"
      case "networking":
        return "Professional networking email for building connections"
      case "follow_up":
        return "Follow-up email after interviews or applications"
      default:
        return ""
    }
  }

  const getEmailTypeBadgeColor = (type: string) => {
    switch (type) {
      case "application":
        return "default"
      case "networking":
        return "secondary"
      case "follow_up":
        return "outline"
      default:
        return "default"
    }
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            AI Email Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Complete a resume analysis first to generate personalized emails based on your qualifications and job
              requirements.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          AI Email Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate Email</TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedEmail}>
              Preview & Edit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-type">Email Type</Label>
                <Select value={emailType} onValueChange={(value: any) => setEmailType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select email type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="application">Job Application</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">{getEmailTypeDescription(emailType)}</p>
              </div>

              <div>
                <Label htmlFor="custom-instructions">Custom Instructions (Optional)</Label>
                <Textarea
                  id="custom-instructions"
                  placeholder="Add specific instructions for the email (e.g., mention a referral, highlight specific experience, adjust tone...)"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Based on your analysis:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Match Score:</span>
                    <Badge
                      variant={
                        analysis.overallScore >= 80
                          ? "default"
                          : analysis.overallScore >= 60
                            ? "secondary"
                            : "destructive"
                      }
                      className="ml-2"
                    >
                      {analysis.overallScore}/100
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Top Strengths:</span>
                    <p className="text-muted-foreground mt-1">{analysis.strengths.slice(0, 2).join(", ")}</p>
                  </div>
                </div>
              </div>

              <Button onClick={generateEmail} disabled={isGenerating || !jobRequirements.trim()} className="w-full">
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Email...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate {emailType.charAt(0).toUpperCase() + emailType.slice(1)} Email
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {generatedEmail && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={getEmailTypeBadgeColor(generatedEmail.type)}>
                    {generatedEmail.type.charAt(0).toUpperCase() + generatedEmail.type.slice(1)} Email
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                      {isEditing ? "Cancel Edit" : "Edit"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={copyFullEmail}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Subject Line</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(isEditing ? editableSubject : generatedEmail.subject, "Subject")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    {isEditing ? (
                      <Textarea
                        value={editableSubject}
                        onChange={(e) => setEditableSubject(e.target.value)}
                        rows={2}
                        className="font-medium"
                      />
                    ) : (
                      <div className="p-3 bg-muted rounded-md font-medium">{generatedEmail.subject}</div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Email Body</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(isEditing ? editableBody : generatedEmail.body, "Email body")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    {isEditing ? (
                      <Textarea
                        value={editableBody}
                        onChange={(e) => setEditableBody(e.target.value)}
                        rows={12}
                        className="font-mono text-sm"
                      />
                    ) : (
                      <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">{generatedEmail.body}</div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Button onClick={saveEdits}>Save Changes</Button>
                      <Button variant="outline" onClick={cancelEdits}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={generateEmail} variant="outline" disabled={isGenerating}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button
                    onClick={() =>
                      window.open(
                        `mailto:?subject=${encodeURIComponent(isEditing ? editableSubject : generatedEmail.subject)}&body=${encodeURIComponent(isEditing ? editableBody : generatedEmail.body)}`,
                      )
                    }
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Open in Email Client
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
