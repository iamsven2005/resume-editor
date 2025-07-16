"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
  Calendar,
  GraduationCap,
  Briefcase,
} from "lucide-react"

interface PortfolioViewerProps {
  data: any
  theme?: "modern" | "classic" | "minimal" | "creative"
}

export function PortfolioViewer({ data, theme = "modern" }: PortfolioViewerProps) {
  // Enhanced data extraction with multiple fallback strategies
  const extractPersonalInfo = (resumeData: any) => {
    // Try different possible structures
    const personalInfo = resumeData?.personalInfo || resumeData?.personal || resumeData?.basics || {}
    const contact = resumeData?.contact || resumeData?.contactInfo || {}

    // Extract from sections array if present
    if (resumeData?.sections) {
      const personalSection = resumeData.sections.find(
        (s: any) => s.type === "personal" || s.type === "personalInfo" || s.type === "basics",
      )
      if (personalSection?.content) {
        Object.assign(personalInfo, personalSection.content)
      }
    }

    return {
      name: personalInfo.name || personalInfo.fullName || contact.name || "Professional Name",
      title: personalInfo.title || personalInfo.jobTitle || personalInfo.position || "Professional Title",
      email: personalInfo.email || contact.email || "",
      phone: personalInfo.phone || contact.phone || personalInfo.phoneNumber || "",
      location: personalInfo.location || personalInfo.address || contact.location || "",
      website: personalInfo.website || personalInfo.portfolio || "",
      linkedin: personalInfo.linkedin || personalInfo.linkedinUrl || "",
      github: personalInfo.github || personalInfo.githubUrl || "",
      summary: personalInfo.summary || personalInfo.bio || personalInfo.description || "",
    }
  }

  const extractExperience = (resumeData: any) => {
    // Try different possible structures
    let experience = resumeData?.experience || resumeData?.workExperience || resumeData?.work || []

    // Extract from sections array if present
    if (resumeData?.sections) {
      const expSection = resumeData.sections.find(
        (s: any) => s.type === "experience" || s.type === "work" || s.type === "workExperience",
      )
      if (expSection?.items || expSection?.content) {
        experience = expSection.items || expSection.content || []
      }
    }

    if (!Array.isArray(experience)) {
      experience = []
    }

    return experience.map((exp: any) => ({
      company: exp.company || exp.organization || exp.employer || "Company Name",
      position: exp.position || exp.title || exp.role || exp.jobTitle || "Position",
      duration: exp.duration || exp.period || `${exp.startDate || ""} - ${exp.endDate || "Present"}`.trim(),
      description: exp.description || exp.summary || exp.responsibilities || "",
      achievements: exp.achievements || exp.accomplishments || [],
    }))
  }

  const extractEducation = (resumeData: any) => {
    let education = resumeData?.education || resumeData?.academics || []

    // Extract from sections array if present
    if (resumeData?.sections) {
      const eduSection = resumeData.sections.find((s: any) => s.type === "education" || s.type === "academics")
      if (eduSection?.items || eduSection?.content) {
        education = eduSection.items || eduSection.content || []
      }
    }

    if (!Array.isArray(education)) {
      education = []
    }

    return education.map((edu: any) => ({
      institution: edu.institution || edu.school || edu.university || "Educational Institution",
      degree: edu.degree || edu.qualification || edu.program || "Degree",
      field: edu.field || edu.major || edu.specialization || "",
      duration: edu.duration || edu.period || `${edu.startDate || ""} - ${edu.endDate || ""}`.trim(),
      gpa: edu.gpa || edu.grade || "",
    }))
  }

  const extractSkills = (resumeData: any) => {
    let skills = resumeData?.skills || resumeData?.technologies || []

    // Extract from sections array if present
    if (resumeData?.sections) {
      const skillsSection = resumeData.sections.find((s: any) => s.type === "skills" || s.type === "technologies")
      if (skillsSection?.items || skillsSection?.content) {
        skills = skillsSection.items || skillsSection.content || []
      }
    }

    // Handle different skill formats
    if (typeof skills === "string") {
      return skills
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
    }

    if (Array.isArray(skills)) {
      return skills
        .flatMap((skill: any) => {
          if (typeof skill === "string") {
            return skill
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          }
          if (skill?.name) return skill.name
          if (skill?.skill) return skill.skill
          if (skill?.technology) return skill.technology
          return String(skill).trim()
        })
        .filter(Boolean)
    }

    return []
  }

  const extractProjects = (resumeData: any) => {
    let projects = resumeData?.projects || []

    // Extract from sections array if present
    if (resumeData?.sections) {
      const projectsSection = resumeData.sections.find((s: any) => s.type === "projects")
      if (projectsSection?.items || projectsSection?.content) {
        projects = projectsSection.items || projectsSection.content || []
      }
    }

    if (!Array.isArray(projects)) {
      projects = []
    }

    return projects.map((project: any) => ({
      name: project.name || project.title || "Project Name",
      description: project.description || project.summary || "",
      technologies: project.technologies || project.tech || project.stack || [],
      demoUrl: project.demoUrl || project.demo || project.liveUrl || "",
      codeUrl: project.codeUrl || project.github || project.repository || "",
    }))
  }

  // Extract all data
  const personal = extractPersonalInfo(data)
  const experience = extractExperience(data)
  const education = extractEducation(data)
  const skills = extractSkills(data)
  const projects = extractProjects(data)

  // Theme-specific styling
  const getThemeClasses = () => {
    switch (theme) {
      case "classic":
        return {
          container: "bg-white text-gray-900",
          header: "bg-gray-50 border-b-2 border-gray-200",
          accent: "text-gray-700",
          card: "border-gray-200 shadow-sm",
        }
      case "minimal":
        return {
          container: "bg-white text-gray-800",
          header: "bg-white border-b border-gray-100",
          accent: "text-gray-600",
          card: "border-gray-100 shadow-none",
        }
      case "creative":
        return {
          container: "bg-gradient-to-br from-purple-50 to-blue-50 text-gray-900",
          header: "bg-white/80 backdrop-blur-sm border-b border-purple-200",
          accent: "text-purple-700",
          card: "border-purple-200 shadow-md bg-white/60 backdrop-blur-sm",
        }
      default: // modern
        return {
          container: "bg-gray-50 text-gray-900",
          header: "bg-white border-b border-gray-200",
          accent: "text-blue-600",
          card: "border-gray-200 shadow-sm bg-white",
        }
    }
  }

  const themeClasses = getThemeClasses()

  return (
    <div className={`min-h-screen ${themeClasses.container}`}>
      {/* Header Section */}
      <div className={`${themeClasses.header} px-6 py-8`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">{personal.name}</h1>
            <p className={`text-xl ${themeClasses.accent} mb-4`}>{personal.title}</p>
            {personal.summary && <p className="text-gray-600 max-w-2xl mx-auto mb-6">{personal.summary}</p>}

            {/* Contact Information */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {personal.email && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={`mailto:${personal.email}`} className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {personal.email}
                  </a>
                </Button>
              )}
              {personal.phone && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={`tel:${personal.phone}`} className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {personal.phone}
                  </a>
                </Button>
              )}
              {personal.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {personal.location}
                </div>
              )}
              {personal.website && (
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={personal.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                </Button>
              )}
              {personal.linkedin && (
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={personal.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                </Button>
              )}
              {personal.github && (
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={personal.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Skills Section */}
        {skills.length > 0 && (
          <Card className={themeClasses.card}>
            <CardContent className="p-6">
              <h2 className={`text-2xl font-bold mb-4 ${themeClasses.accent}`}>Skills & Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience Section */}
        {experience.length > 0 && (
          <Card className={themeClasses.card}>
            <CardContent className="p-6">
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${themeClasses.accent}`}>
                <Briefcase className="h-6 w-6" />
                Professional Experience
              </h2>
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4 pb-6 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <h3 className="text-xl font-semibold">{exp.position}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {exp.duration}
                      </div>
                    </div>
                    <p className={`font-medium mb-2 ${themeClasses.accent}`}>{exp.company}</p>
                    {exp.description && <p className="text-gray-600 mb-3">{exp.description}</p>}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {exp.achievements.map((achievement: string, achIndex: number) => (
                          <li key={achIndex}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Section */}
        {projects.length > 0 && (
          <Card className={themeClasses.card}>
            <CardContent className="p-6">
              <h2 className={`text-2xl font-bold mb-6 ${themeClasses.accent}`}>Featured Projects</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {projects.map((project, index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                      {project.description && <p className="text-gray-600 mb-3">{project.description}</p>}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.technologies.map((tech: string, techIndex: number) => (
                            <Badge key={techIndex} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Education Section */}
        {education.length > 0 && (
          <Card className={themeClasses.card}>
            <CardContent className="p-6">
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${themeClasses.accent}`}>
                <GraduationCap className="h-6 w-6" />
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                      <h3 className="text-lg font-semibold">{edu.degree}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {edu.duration}
                      </div>
                    </div>
                    <p className={`font-medium ${themeClasses.accent}`}>{edu.institution}</p>
                    {edu.field && <p className="text-gray-600">{edu.field}</p>}
                    {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fallback content if no data */}
        {experience.length === 0 && education.length === 0 && skills.length === 0 && projects.length === 0 && (
          <Card className={themeClasses.card}>
            <CardContent className="p-6 text-center">
              <h2 className={`text-2xl font-bold mb-4 ${themeClasses.accent}`}>Professional Portfolio</h2>
              <p className="text-gray-600 mb-4">
                This portfolio is being built from your resume data. Add more sections to your resume to see them
                displayed here.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Available Sections:</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline">Experience</Badge>
                    <Badge variant="outline">Education</Badge>
                    <Badge variant="outline">Skills</Badge>
                    <Badge variant="outline">Projects</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
