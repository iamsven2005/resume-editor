"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Upload,
  Edit,
  Brain,
  Sparkles,
  Download,
  Share,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  Globe,
  BarChart3,
} from "lucide-react"

interface OnboardingTutorialProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateNew?: () => void
}

const tutorialSteps = [
  {
    id: 1,
    title: "Welcome to Resume Builder",
    icon: FileText,
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Let's build your perfect resume!</h3>
          <p className="text-muted-foreground">
            This tutorial will guide you through creating, optimizing, and sharing your professional resume.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span className="font-medium">AI-Powered</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Smart suggestions and improvements</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              <span className="font-medium">Portfolio Ready</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Create shareable online portfolios</p>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Create or Upload Resume",
    icon: Upload,
    content: (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Start with your resume</h3>
        </div>
        <div className="space-y-3">
          <Card className="p-4 border-2 border-dashed border-blue-200 bg-blue-50">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium">Create from scratch</p>
                <p className="text-sm text-muted-foreground">Start with our guided form builder</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Upload className="w-6 h-6 text-gray-600" />
              <div>
                <p className="font-medium">Upload existing resume</p>
                <p className="text-sm text-muted-foreground">PDF, Word, or text files supported</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    action: {
      label: "Create New Resume",
      variant: "default" as const,
    },
  },
  {
    id: 3,
    title: "Use the Form Editor",
    icon: Edit,
    content: (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Edit className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Edit with ease</h3>
          <p className="text-muted-foreground">Our intuitive form editor makes updating your resume simple</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Badge variant="outline">1</Badge>
            <span>Fill in your personal information</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Badge variant="outline">2</Badge>
            <span>Add your work experience and education</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Badge variant="outline">3</Badge>
            <span>Include skills and achievements</span>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Use the live preview to see changes in real-time as you edit!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "AI Resume Analysis",
    icon: Brain,
    content: (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Get AI insights</h3>
          <p className="text-muted-foreground">Our AI analyzes your resume and provides detailed feedback</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Content Analysis</span>
            </div>
            <p className="text-sm text-green-700">Checks for completeness and relevance</p>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">ATS Compatibility</span>
            </div>
            <p className="text-sm text-blue-700">Ensures your resume passes applicant tracking systems</p>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: "AI-Powered Improvements",
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Enhance your resume</h3>
          <p className="text-muted-foreground">Get AI-generated suggestions to make your resume stand out</p>
        </div>
        <div className="space-y-3">
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Smart Suggestions</span>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Improved bullet point phrasing</li>
              <li>• Industry-specific keywords</li>
              <li>• Action verb recommendations</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>Pro tip:</strong> Apply suggestions selectively to maintain your personal voice!
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    title: "Export & Share",
    icon: Download,
    content: (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Export and share</h3>
          <p className="text-muted-foreground">Multiple ways to use your polished resume</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Download as PDF</p>
                <p className="text-sm text-muted-foreground">Perfect for job applications</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Create Online Portfolio</p>
                <p className="text-sm text-muted-foreground">Shareable link for networking</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Share className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium">Share with Recruiters</p>
                <p className="text-sm text-muted-foreground">Direct links and analytics</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: 7,
    title: "You're All Set!",
    icon: CheckCircle,
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Congratulations!</h3>
          <p className="text-muted-foreground mb-6">You're ready to create amazing resumes and portfolios</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
          <h4 className="font-semibold mb-3">Quick Tips for Success:</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Keep your resume updated regularly</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Use AI analysis before applying to jobs</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Create multiple versions for different roles</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Share your portfolio to build your network</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
]

export function OnboardingTutorial({ open, onOpenChange, onCreateNew }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const currentStepData = tutorialSteps.find((step) => step.id === currentStep)
  const progress = (currentStep / tutorialSteps.length) * 100

  const handleNext = () => {
    if (currentStep < tutorialSteps.length) {
      setCompletedSteps((prev) => [...prev, currentStep])
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepAction = () => {
    if (currentStepData?.action && onCreateNew) {
      onCreateNew()
      onOpenChange(false)
    }
  }

  const handleSkip = () => {
    onOpenChange(false)
  }

  const handleComplete = () => {
    setCompletedSteps((prev) => [...prev, currentStep])
    onOpenChange(false)
  }

  if (!currentStepData) return null

  const Icon = currentStepData.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              {currentStepData.title}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Step {currentStep} of {tutorialSteps.length}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </DialogHeader>

        <div className="py-6">{currentStepData.content}</div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {currentStepData.action && (
              <Button variant={currentStepData.action.variant} onClick={handleStepAction}>
                {currentStepData.action.label}
              </Button>
            )}

            {currentStep === tutorialSteps.length ? (
              <Button onClick={handleComplete}>
                Get Started
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
