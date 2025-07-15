"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Calendar,
  Building,
  GraduationCap,
  ExternalLink,
  Code,
  User,
  Briefcase,
  Star,
} from "lucide-react"
import type { Resume } from "@/types/resume"

interface PortfolioViewerProps {
  resume: Resume
  theme?: "modern" | "classic" | "minimal" | "creative"
}

export function PortfolioViewer({ resume, theme = "modern" }: PortfolioViewerProps) {
  // Enhanced data extraction with better fallbacks
  const extractPersonalInfo = () => {
    const info = resume.personalInfo || {}
    const sections = resume.sections || []

    // Try to find personal info in sections if not in personalInfo
    const personalSection = sections.find((s) => s.type === "personal" || s.title?.toLowerCase().includes("personal"))

    return {
      name: info.name || personalSection?.content?.name || "Professional",
      title: info.title || info.position || personalSection?.content?.title || "Software Developer",
      email: info.email || personalSection?.content?.email || "",
      phone: info.phone || personalSection?.content?.phone || "",
      location: info.location || info.address || personalSection?.content?.location || "",
      website: info.website || personalSection?.content?.website || "",
      linkedin: info.linkedin || personalSection?.content?.linkedin || "",
      github: info.github || personalSection?.content?.github || "",
      twitter: info.twitter || personalSection?.content?.twitter || "",
      summary:
        info.summary ||
        info.objective ||
        personalSection?.content?.summary ||
        "Passionate developer with expertise in modern technologies.",
      avatar: info.avatar || personalSection?.content?.avatar || "",
    }
  }

  const extractExperience = () => {
    const sections = resume.sections || []
    const experienceSection = sections.find(
      (s) =>
        s.type === "experience" ||
        s.title?.toLowerCase().includes("experience") ||
        s.title?.toLowerCase().includes("work"),
    )

    if (experienceSection?.items) {
      return experienceSection.items.map((item: any) => ({
        title: item.title || item.position || item.role || "Software Developer",
        company: item.company || item.organization || "Company",
        duration: item.duration || item.period || `${item.startDate || ""} - ${item.endDate || "Present"}`.trim(),
        description: item.description || item.summary || "Professional experience in software development.",
        location: item.location || "",
      }))
    }

    // Fallback experience
    return [
      {
        title: "Software Developer",
        company: "Tech Company",
        duration: "2022 - Present",
        description: "Developing innovative solutions using modern technologies.",
        location: "Remote",
      },
    ]
  }

  const extractEducation = () => {
    const sections = resume.sections || []
    const educationSection = sections.find(
      (s) => s.type === "education" || s.title?.toLowerCase().includes("education"),
    )

    if (educationSection?.items) {
      return educationSection.items.map((item: any) => ({
        degree: item.degree || item.title || "Bachelor's Degree",
        institution: item.institution || item.school || item.university || "University",
        duration: item.duration || item.period || item.year || "2020-2024",
        gpa: item.gpa || "",
        description: item.description || "",
      }))
    }

    // Fallback education
    return [
      {
        degree: "Bachelor of Science in Computer Science",
        institution: "University",
        duration: "2020-2024",
        gpa: "",
        description: "",
      },
    ]
  }

  const extractSkills = () => {
    const sections = resume.sections || []
    const skillsSection = sections.find((s) => s.type === "skills" || s.title?.toLowerCase().includes("skill"))

    if (skillsSection?.items) {
      // Handle different skill formats
      const skills = skillsSection.items.flatMap((item: any) => {
        if (typeof item === "string") return [item]
        if (item.name) return [item.name]
        if (item.skill) return [item.skill]
        if (item.title) return [item.title]
        return []
      })
      return skills.filter(Boolean)
    }

    if (skillsSection?.content) {
      // Handle comma-separated skills
      if (typeof skillsSection.content === "string") {
        return skillsSection.content
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      }
      if (Array.isArray(skillsSection.content)) {
        return skillsSection.content.filter(Boolean)
      }
    }

    // Fallback skills
    return ["JavaScript", "React", "Node.js", "TypeScript", "Python", "Git"]
  }

  const extractProjects = () => {
    const sections = resume.sections || []
    const projectsSection = sections.find((s) => s.type === "projects" || s.title?.toLowerCase().includes("project"))

    if (projectsSection?.items) {
      return projectsSection.items.map((item: any) => ({
        name: item.name || item.title || "Project",
        description: item.description || item.summary || "An innovative project showcasing technical skills.",
        technologies: item.technologies || item.tech || item.stack || [],
        demoUrl: item.demoUrl || item.demo || item.url || "",
        codeUrl: item.codeUrl || item.github || item.repository || "",
      }))
    }

    // Fallback projects
    return [
      {
        name: "Portfolio Website",
        description: "A responsive portfolio website built with modern web technologies.",
        technologies: ["React", "TypeScript", "Tailwind CSS"],
        demoUrl: "",
        codeUrl: "",
      },
    ]
  }

  const personalInfo = extractPersonalInfo()
  const experience = extractExperience()
  const education = extractEducation()
  const skills = extractSkills()
  const projects = extractProjects()

  const themeClasses = {
    modern: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950",
    classic: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900",
    minimal: "bg-white dark:bg-gray-950",
    creative: "bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950 dark:to-pink-950",
  }

  const accentColors = {
    modern: "text-blue-600 dark:text-blue-400",
    classic: "text-gray-700 dark:text-gray-300",
    minimal: "text-black dark:text-white",
    creative: "text-purple-600 dark:text-purple-400",
  }

  return (
    <div className={`min-h-screen ${themeClasses[theme]} p-8`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={personalInfo.avatar || "/placeholder.svg"} alt={personalInfo.name} />
                <AvatarFallback className="text-2xl">
                  {personalInfo.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className={`text-4xl font-bold mb-2 ${accentColors[theme]}`}>{personalInfo.name}</h1>
                <p className="text-xl text-muted-foreground mb-4">{personalInfo.title}</p>
                <p className="text-muted-foreground mb-6 max-w-2xl">{personalInfo.summary}</p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  {personalInfo.email && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${personalInfo.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </a>
                    </Button>
                  )}
                  {personalInfo.phone && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${personalInfo.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </a>
                    </Button>
                  )}
                  {personalInfo.linkedin && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {personalInfo.github && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={personalInfo.github} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {personalInfo.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={personalInfo.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>

                {personalInfo.location && (
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-4 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{personalInfo.location}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Experience Section */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${accentColors[theme]}`}>
                  <Briefcase className="h-5 w-5" />
                  Professional Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {experience.map((exp, index) => (
                  <div key={index} className="relative">
                    {index > 0 && <Separator className="mb-6" />}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{exp.title}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Building className="h-4 w-4" />
                          <span>{exp.company}</span>
                          {exp.location && (
                            <>
                              <span>•</span>
                              <span>{exp.location}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Calendar className="h-4 w-4" />
                          <span>{exp.duration}</span>
                        </div>
                        <p className="text-muted-foreground">{exp.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Projects Section */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${accentColors[theme]}`}>
                  <Code className="h-5 w-5" />
                  Featured Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {projects.map((project, index) => (
                  <div key={index} className="relative">
                    {index > 0 && <Separator className="mb-6" />}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <div className="flex gap-2">
                          {project.demoUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Demo
                              </a>
                            </Button>
                          )}
                          {project.codeUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={project.codeUrl} target="_blank" rel="noopener noreferrer">
                                <Github className="h-3 w-3 mr-1" />
                                Code
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{project.description}</p>
                      {project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, techIndex) => (
                            <Badge key={techIndex} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Skills Section */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${accentColors[theme]}`}>
                  <Star className="h-5 w-5" />
                  Skills & Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education Section */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${accentColors[theme]}`}>
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className="space-y-2">
                    {index > 0 && <Separator className="mb-4" />}
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-muted-foreground">{edu.institution}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{edu.duration}</span>
                      {edu.gpa && (
                        <>
                          <span>•</span>
                          <span>GPA: {edu.gpa}</span>
                        </>
                      )}
                    </div>
                    {edu.description && <p className="text-sm text-muted-foreground">{edu.description}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${accentColors[theme]}`}>
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {personalInfo.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${personalInfo.email}`} className="text-sm hover:underline">
                      {personalInfo.email}
                    </a>
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${personalInfo.phone}`} className="text-sm hover:underline">
                      {personalInfo.phone}
                    </a>
                  </div>
                )}
                {personalInfo.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{personalInfo.location}</span>
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={personalInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      {personalInfo.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
