"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  FileText,
  Edit3,
  Eye,
  Upload,
  BarChart3,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Play,
  Target,
  Download,
  User,
  Briefcase,
  GraduationCap,
} from "lucide-react"

interface OnboardingTutorialProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateNew?: () => void
  onCreateFromTemplate?: (resumeData: any) => void
}

interface TutorialStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

interface ResumeFormData {
  fullName: string
  email: string
  phone: string
  location: string
  jobTitle: string
  summary: string
  experience: {
    jobTitle: string
    company: string
    duration: string
    description: string
  }[]
  education: {
    degree: string
    school: string
    duration: string
    gpa: string
  }[]
  skills: string[]
}

export function OnboardingTutorial({ open, onOpenChange, onCreateNew, onCreateFromTemplate }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [resumeFormData, setResumeFormData] = useState<ResumeFormData>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    jobTitle: "",
    summary: "",
    experience: [{ jobTitle: "", company: "", duration: "", description: "" }],
    education: [{ degree: "", school: "", duration: "", gpa: "" }],
    skills: [],
  })
  const [skillInput, setSkillInput] = useState("")

  const generateResumeFromForm = () => {
    const resumeData = {
      title: `${resumeFormData.fullName}'s Resume`,
      sections: [
        {
          "section name": "Personal Information",
          content: [
            {
              "Full Name": resumeFormData.fullName,
              Email: resumeFormData.email,
              Phone: resumeFormData.phone,
              Location: resumeFormData.location,
              "Job Title": resumeFormData.jobTitle,
            },
          ],
          id: "personal-info",
        },
        {
          "section name": "Professional Summary",
          content: [
            {
              Summary:
                resumeFormData.summary ||
                "Motivated professional seeking new opportunities to contribute skills and experience.",
            },
          ],
          id: "summary",
        },
        {
          "section name": "Experience",
          content: resumeFormData.experience
            .filter((exp) => exp.jobTitle || exp.company)
            .map((exp) => ({
              "Job Title": exp.jobTitle,
              Organization: exp.company,
              Duration: exp.duration,
              Description: exp.description,
            })),
          id: "experience",
        },
        {
          "section name": "Education",
          content: resumeFormData.education
            .filter((edu) => edu.degree || edu.school)
            .map((edu) => ({
              Degree: edu.degree,
              Organization: edu.school,
              Duration: edu.duration,
              GPA: edu.gpa,
            })),
          id: "education",
        },
        {
          "section name": "Skills",
          content:
            resumeFormData.skills.length > 0
              ? [
                  {
                    "Technical Skills": resumeFormData.skills.join(", "),
                  },
                ]
              : [
                  {
                    "Technical Skills": "Add your skills here",
                  },
                ],
          id: "skills",
        },
      ],
    }

    onCreateFromTemplate?.(resumeData)
    setCompletedSteps((prev) => new Set([...prev, "resume-builder"]))
  }

  const addExperience = () => {
    setResumeFormData((prev) => ({
      ...prev,
      experience: [...prev.experience, { jobTitle: "", company: "", duration: "", description: "" }],
    }))
  }

  const addEducation = () => {
    setResumeFormData((prev) => ({
      ...prev,
      education: [...prev.education, { degree: "", school: "", duration: "", gpa: "" }],
    }))
  }

  const addSkill = () => {
    if (skillInput.trim()) {
      setResumeFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }))
      setSkillInput("")
    }
  }

  const removeSkill = (index: number) => {
    setResumeFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  const updateExperience = (index: number, field: string, value: string) => {
    setResumeFormData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)),
    }))
  }

  const updateEducation = (index: number, field: string, value: string) => {
    setResumeFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu)),
    }))
  }

  const steps: TutorialStep[] = [
    {
      id: "welcome",
      title: "Welcome to SparkJob!",
      description: "Your AI-powered resume builder and career optimization platform",
      icon: <Play className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            SparkJob helps you create, optimize, and analyze your resume using AI technology. Let's walk through the key
            features to get you started.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Create & Edit</span>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">AI Analysis</span>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">AI Improvement</span>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">PDF Export</span>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "create-resume",
      title: "Create Your First Resume",
      description: "Start by creating a new resume or uploading an existing one",
      icon: <FileText className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">You can start your resume journey in several ways:</p>
          <div className="space-y-3">
            <Card className="p-4 border-dashed border-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Create from Scratch</h4>
                  <p className="text-sm text-muted-foreground">Start with a blank template</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Upload className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Upload Existing Resume</h4>
                  <p className="text-sm text-muted-foreground">Upload PDF or Word document</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Quick Resume Builder</h4>
                  <p className="text-sm text-muted-foreground">Answer a few questions to create a basic resume</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "resume-builder",
      title: "Quick Resume Builder",
      description: "Let's create your resume base with some basic information",
      icon: <User className="h-6 w-6" />,
      content: (
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={resumeFormData.fullName}
                    onChange={(e) => setResumeFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={resumeFormData.email}
                    onChange={(e) => setResumeFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={resumeFormData.phone}
                    onChange={(e) => setResumeFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={resumeFormData.location}
                    onChange={(e) => setResumeFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="New York, NY"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="jobTitle">Desired Job Title</Label>
                <Input
                  id="jobTitle"
                  value={resumeFormData.jobTitle}
                  onChange={(e) => setResumeFormData((prev) => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="summary">Professional Summary (Optional)</Label>
                <Textarea
                  id="summary"
                  value={resumeFormData.summary}
                  onChange={(e) => setResumeFormData((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief description of your professional background and goals..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addExperience}>
                  Add Experience
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeFormData.experience.map((exp, index) => (
                <Card key={index} className="p-4 bg-gray-50">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Job Title</Label>
                        <Input
                          value={exp.jobTitle}
                          onChange={(e) => updateExperience(index, "jobTitle", e.target.value)}
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(index, "company", e.target.value)}
                          placeholder="Tech Corp"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input
                        value={exp.duration}
                        onChange={(e) => updateExperience(index, "duration", e.target.value)}
                        placeholder="Jan 2020 - Present"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, "description", e.target.value)}
                        placeholder="Describe your key responsibilities and achievements..."
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addEducation}>
                  Add Education
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeFormData.education.map((edu, index) => (
                <Card key={index} className="p-4 bg-gray-50">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, "degree", e.target.value)}
                          placeholder="Bachelor of Science"
                        />
                      </div>
                      <div>
                        <Label>School</Label>
                        <Input
                          value={edu.school}
                          onChange={(e) => updateEducation(index, "school", e.target.value)}
                          placeholder="University Name"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Duration</Label>
                        <Input
                          value={edu.duration}
                          onChange={(e) => updateEducation(index, "duration", e.target.value)}
                          placeholder="2016 - 2020"
                        />
                      </div>
                      <div>
                        <Label>GPA (Optional)</Label>
                        <Input
                          value={edu.gpa}
                          onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                          placeholder="3.8/4.0"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill (e.g., JavaScript, Python, etc.)"
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                />
                <Button onClick={addSkill} disabled={!skillInput.trim()}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {resumeFormData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(index)}>
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ),
      action: {
        label: "Create Resume",
        onClick: generateResumeFromForm,
      },
    },
    {
      id: "form-editor",
      title: "Edit Your Resume",
      description: "Use the Form Editor to customize your resume content",
      icon: <Edit3 className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">The Form Editor panel allows you to easily modify your resume:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                1
              </Badge>
              <div>
                <h4 className="font-medium">Edit Sections</h4>
                <p className="text-sm text-muted-foreground">Add, remove, or reorder resume sections</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                2
              </Badge>
              <div>
                <h4 className="font-medium">Customize Fields</h4>
                <p className="text-sm text-muted-foreground">Edit field names and content</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                3
              </Badge>
              <div>
                <h4 className="font-medium">Drag & Drop</h4>
                <p className="text-sm text-muted-foreground">Reorder sections and items by dragging</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "ai-analysis",
      title: "AI Resume Analysis",
      description: "Get detailed feedback on your resume's effectiveness",
      icon: <BarChart3 className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">Our AI analyzes your resume against job requirements:</p>
          <div className="space-y-3">
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">Match Score</h4>
                  <p className="text-sm text-muted-foreground">See how well your resume matches job requirements</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Detailed Feedback</h4>
                  <p className="text-sm text-muted-foreground">Get specific suggestions for improvement</p>
                </div>
              </div>
            </Card>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              💡 <strong>Tip:</strong> Paste a job description in the Data Input panel, then click "Analyze Resume" for
              best results.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "ai-improvement",
      title: "AI-Powered Improvements",
      description: "Let AI enhance your resume content automatically",
      icon: <Sparkles className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">After analysis, use AI to automatically improve your resume:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-purple-100 rounded">
                <Sparkles className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Content Enhancement</h4>
                <p className="text-sm text-muted-foreground">Improve bullet points and descriptions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 bg-purple-100 rounded">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Keyword Optimization</h4>
                <p className="text-sm text-muted-foreground">Add relevant keywords for ATS systems</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "export-pdf",
      title: "Export & Share",
      description: "Generate professional PDFs and create online portfolios",
      icon: <Eye className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">Once your resume is ready, you can export and share it:</p>
          <div className="grid grid-cols-1 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">PDF Export</h4>
                  <p className="text-sm text-muted-foreground">Download as professional PDF</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Online Portfolio</h4>
                  <p className="text-sm text-muted-foreground">Create shareable online version</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "complete",
      title: "You're All Set!",
      description: "Start building your perfect resume",
      icon: <CheckCircle className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">Congratulations! You now know how to use SparkJob effectively.</p>
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="space-y-2">
              <h4 className="font-medium text-green-800">Quick Tips for Success:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Always analyze your resume against specific job descriptions</li>
                <li>• Use AI improvements to enhance your content</li>
                <li>• Keep your resume updated with latest experiences</li>
                <li>• Create multiple versions for different job types</li>
              </ul>
            </div>
          </Card>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Ready to create your first resume?</p>
          </div>
        </div>
      ),
      action: {
        label: "Start Creating",
        onClick: () => {
          onCreateNew?.()
          onOpenChange(false)
          setCompletedSteps((prev) => new Set([...prev, "complete"]))
        },
      },
    },
  ]

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStepData.id]))
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onOpenChange(false)
  }

  const isResumeBuilderValid = () => {
    return resumeFormData.fullName.trim() && resumeFormData.email.trim()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">{currentStepData.icon}</div>
            <div>
              <DialogTitle className="text-xl">{currentStepData.title}</DialogTitle>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {completedSteps.has(currentStepData.id) && <CheckCircle className="h-5 w-5 text-green-500" />}
                <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>{currentStepData.content}</CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tutorial
              </Button>
            </div>

            <div className="flex gap-2">
              {currentStepData.action && (
                <Button
                  onClick={currentStepData.action.onClick}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={currentStepData.id === "resume-builder" && !isResumeBuilderValid()}
                >
                  {currentStepData.action.label}
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={() => onOpenChange(false)} className="bg-green-600 hover:bg-green-700">
                  Get Started
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
