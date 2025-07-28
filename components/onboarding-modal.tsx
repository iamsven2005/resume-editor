"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Plus, X, User, Briefcase, GraduationCap, Award, Eye } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { generateId } from "@/utils/conversion"

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (resumeData: any) => void
}

interface FormData {
  // Personal Info
  fullName: string
  email: string
  phone: string
  location: string

  // Professional Info
  jobTitle: string
  experienceLevel: string
  professionalSummary: string

  // Skills
  skills: string[]

  // Education
  degree: string
  school: string
  graduationYear: string

  // Experience (optional)
  company: string
  position: string
  duration: string
  description: string
}

const STEPS = [
  { id: 1, title: "Personal Info", icon: User, description: "Basic contact information" },
  { id: 2, title: "Professional", icon: Briefcase, description: "Job title and summary" },
  { id: 3, title: "Skills", icon: Award, description: "Your key skills" },
  { id: 4, title: "Education", icon: GraduationCap, description: "Educational background" },
  { id: 5, title: "Experience", icon: Briefcase, description: "Work experience (optional)" },
  { id: 6, title: "Review", icon: Eye, description: "Review and create" },
]

const COMMON_SKILLS = [
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "HTML/CSS",
  "SQL",
  "Git",
  "AWS",
  "Project Management",
  "Communication",
  "Leadership",
  "Problem Solving",
  "Microsoft Office",
  "Adobe Creative Suite",
  "Data Analysis",
  "Marketing",
  "Sales",
  "Customer Service",
  "Writing",
  "Research",
  "Teaching",
  "Design",
]

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (3-5 years)" },
  { value: "senior", label: "Senior Level (6-10 years)" },
  { value: "executive", label: "Executive (10+ years)" },
  { value: "student", label: "Student/Recent Graduate" },
]

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    location: "",
    jobTitle: "",
    experienceLevel: "",
    professionalSummary: "",
    skills: [],
    degree: "",
    school: "",
    graduationYear: "",
    company: "",
    position: "",
    duration: "",
    description: "",
  })

  const progress = (currentStep / STEPS.length) * 100

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      updateFormData("skills", [...formData.skills, skill])
    }
  }

  const removeSkill = (skill: string) => {
    updateFormData(
      "skills",
      formData.skills.filter((s) => s !== skill),
    )
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)

    try {
      // Generate resume data from form
      const resumeData = {
        title: `${formData.fullName}'s Resume`,
        sections: [
          {
            "section name": "Contact Information",
            content: [
              {
                "Full Name": formData.fullName,
                Email: formData.email,
                Phone: formData.phone,
                Location: formData.location,
              },
            ],
            id: generateId(),
          },
          {
            "section name": "Professional Summary",
            content: [
              {
                Summary:
                  formData.professionalSummary ||
                  `${formData.experienceLevel} ${formData.jobTitle} with strong skills in ${formData.skills.slice(0, 3).join(", ")}.`,
              },
            ],
            id: generateId(),
          },
          {
            "section name": "Skills",
            content: formData.skills.map((skill) => ({
              Skill: skill,
              Category: "Technical",
            })),
            id: generateId(),
          },
          {
            "section name": "Education",
            content: [
              {
                Degree: formData.degree,
                Institution: formData.school,
                "Graduation Year": formData.graduationYear,
              },
            ],
            id: generateId(),
          },
        ],
      }

      // Add experience section if provided
      if (formData.company && formData.position) {
        resumeData.sections.push({
          "section name": "Experience",
          content: [
            {
              Position: formData.position,
              Company: formData.company,
              Duration: formData.duration,
              Description: formData.description,
            },
          ],
          id: generateId(),
        })
      }

      await onComplete(resumeData)
    } catch (error) {
      console.error("Error creating resume:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateFormData("fullName", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                  placeholder="New York, NY"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => updateFormData("jobTitle", e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <Label htmlFor="experienceLevel">Experience Level *</Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value) => updateFormData("experienceLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                value={formData.professionalSummary}
                onChange={(e) => updateFormData("professionalSummary", e.target.value)}
                placeholder="Brief description of your professional background and goals..."
                rows={4}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Add Skills</Label>
              <div className="flex flex-wrap gap-2 mb-4">
                {COMMON_SKILLS.map((skill) => (
                  <Button
                    key={skill}
                    variant={formData.skills.includes(skill) ? "default" : "outline"}
                    size="sm"
                    onClick={() => (formData.skills.includes(skill) ? removeSkill(skill) : addSkill(skill))}
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </div>

            {formData.skills.length > 0 && (
              <div>
                <Label>Selected Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="customSkill">Add Custom Skill</Label>
              <div className="flex gap-2">
                <Input
                  id="customSkill"
                  placeholder="Type a skill and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const input = e.target as HTMLInputElement
                      addSkill(input.value)
                      input.value = ""
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("customSkill") as HTMLInputElement
                    addSkill(input.value)
                    input.value = ""
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="degree">Degree *</Label>
              <Input
                id="degree"
                value={formData.degree}
                onChange={(e) => updateFormData("degree", e.target.value)}
                placeholder="Bachelor of Science in Computer Science"
              />
            </div>
            <div>
              <Label htmlFor="school">School/University *</Label>
              <Input
                id="school"
                value={formData.school}
                onChange={(e) => updateFormData("school", e.target.value)}
                placeholder="University of California, Berkeley"
              />
            </div>
            <div>
              <Label htmlFor="graduationYear">Graduation Year</Label>
              <Input
                id="graduationYear"
                value={formData.graduationYear}
                onChange={(e) => updateFormData("graduationYear", e.target.value)}
                placeholder="2023"
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add your most recent work experience (optional - you can add more later)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => updateFormData("company", e.target.value)}
                  placeholder="Google Inc."
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => updateFormData("position", e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => updateFormData("duration", e.target.value)}
                placeholder="Jan 2022 - Present"
              />
            </div>
            <div>
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Describe your key responsibilities and achievements..."
                rows={4}
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resume Preview</CardTitle>
                <CardDescription>Review your information before creating your resume</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">Personal Information</h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.fullName} • {formData.email} • {formData.phone} • {formData.location}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Professional</h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.jobTitle} ({formData.experienceLevel})
                  </p>
                  {formData.professionalSummary && (
                    <p className="text-sm text-muted-foreground mt-1">{formData.professionalSummary}</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold">Skills ({formData.skills.length})</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.skills.slice(0, 10).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {formData.skills.length > 10 && (
                      <Badge variant="outline" className="text-xs">
                        +{formData.skills.length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold">Education</h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.degree} from {formData.school} ({formData.graduationYear})
                  </p>
                </div>

                {formData.company && (
                  <div>
                    <h4 className="font-semibold">Experience</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.position} at {formData.company} ({formData.duration})
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.email
      case 2:
        return formData.jobTitle && formData.experienceLevel
      case 3:
        return formData.skills.length > 0
      case 4:
        return formData.degree && formData.school
      case 5:
        return true // Optional step
      case 6:
        return true
      default:
        return false
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Create Your First Resume</DialogTitle>
              <DialogDescription>
                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.description}
              </DialogDescription>
            </div>
            <Badge variant="outline">{Math.round(progress)}% Complete</Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex flex-col items-center space-y-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : isCompleted
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-center hidden sm:block">{step.title}</span>
                </div>
              )
            })}
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">{renderStep()}</div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep === STEPS.length ? (
              <Button onClick={handleComplete} disabled={!canProceed() || isSubmitting}>
                {isSubmitting ? "Creating Resume..." : "Create Resume"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={nextStep} disabled={!canProceed()}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
