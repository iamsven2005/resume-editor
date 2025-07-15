"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Calendar,
  ExternalLink,
  Download,
  Share2,
  User,
  Award,
  Code,
  Briefcase,
} from "lucide-react"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

interface Portfolio {
  id: string
  title: string
  description?: string
  theme: string
  resume_data: any
  is_published: boolean
  portfolio_url: string
  total_views: number
  unique_visitors: number
  views_last_7_days: number
  views_last_30_days: number
  created_at: string
  updated_at: string
}

interface PortfolioViewerProps {
  portfolio: Portfolio
}

export function PortfolioViewer({ portfolio }: PortfolioViewerProps) {
  const [isSharing, setIsSharing] = useState(false)
  const resumeData = portfolio.resume_data || {}

  // Enhanced data extraction with support for sections-based JSON structure
  const getPersonalInfo = () => {
    // Handle sections-based structure
    if (resumeData.sections) {
      return {
        name: resumeData.title || portfolio.title || "Professional",
        title: resumeData.subtitle || "Professional",
        summary: resumeData.description || portfolio.description,
        email: resumeData.email,
        phone: resumeData.phone,
        location: resumeData.location,
        website: resumeData.website,
        linkedin: resumeData.linkedin,
        github: resumeData.github,
        photo: resumeData.photo,
      }
    }

    // Handle standard resume structure
    const personalInfo = resumeData.personalInfo || resumeData.personal || resumeData.basics || {}
    return {
      name: personalInfo.name || resumeData.name || portfolio.title || "Professional",
      title: personalInfo.title || personalInfo.label || resumeData.title || "Professional",
      email: personalInfo.email || resumeData.email,
      phone: personalInfo.phone || resumeData.phone,
      location: personalInfo.location || personalInfo.address || resumeData.location,
      website: personalInfo.website || personalInfo.url || resumeData.website,
      linkedin: personalInfo.linkedin || resumeData.linkedin,
      github: personalInfo.github || resumeData.github,
      summary: personalInfo.summary || personalInfo.about || resumeData.summary || portfolio.description,
      photo: personalInfo.photo || personalInfo.image || resumeData.photo,
    }
  }

  const getExperience = () => {
    // Handle sections-based structure
    if (resumeData.sections) {
      const experienceSection = resumeData.sections.find(
        (section: any) => section["section name"]?.toLowerCase() === "experience",
      )
      if (experienceSection && experienceSection.content) {
        return experienceSection.content
          .filter((item: any) => item["job title"] || item.position || item.title)
          .map((item: any) => ({
            position: item["job title"] || item.position || item.title,
            company: item.Organization || item.company,
            startDate: item.Duration ? item.Duration.split("–")[0]?.trim() || item.Duration.split("-")[0]?.trim() : "",
            endDate: item.Duration
              ? item.Duration.includes("–")
                ? item.Duration.split("–")[1]?.trim()
                : item.Duration.includes("-")
                  ? item.Duration.split("-")[1]?.trim()
                  : ""
              : "",
            description: item.Description || item.description,
            location: item.location,
          }))
      }
    }

    // Handle standard resume structure
    return resumeData.experience || resumeData.work || resumeData.employment || []
  }

  const getEducation = () => {
    // Handle sections-based structure
    if (resumeData.sections) {
      const educationSection = resumeData.sections.find(
        (section: any) => section["section name"]?.toLowerCase() === "education",
      )
      if (educationSection && educationSection.content) {
        return educationSection.content
          .filter((item: any) => item.Degree || item.degree)
          .map((item: any) => ({
            degree: item.Degree || item.degree,
            school: item.Organization || item.school || item.institution,
            startDate: item.Duration ? item.Duration.split("-")[0]?.trim() : "",
            endDate: item.Duration ? item.Duration.split("-")[1]?.trim() : "",
            gpa: item.GPA || item.gpa,
            location: item.location,
          }))
      }
    }

    // Handle standard resume structure
    return resumeData.education || resumeData.schools || []
  }

  const getSkills = () => {
    // Handle sections-based structure
    if (resumeData.sections) {
      const skillsSection = resumeData.sections.find(
        (section: any) => section["section name"]?.toLowerCase() === "skills",
      )
      if (skillsSection && skillsSection.content) {
        const skills: string[] = []
        skillsSection.content.forEach((item: any) => {
          if (item.Skills) {
            // Split skills by comma and add them to the array
            const skillList = item.Skills.split(",")
              .map((skill: string) => skill.trim())
              .filter((skill: string) => skill)
            skills.push(...skillList)
          }
        })
        return skills
      }
    }

    // Handle standard resume structure
    const skills = resumeData.skills || resumeData.technologies || []
    if (Array.isArray(skills)) {
      return skills
    }
    if (typeof skills === "object" && skills.technical) {
      return skills.technical
    }
    return []
  }

  const getProjects = () => {
    // Handle sections-based structure
    if (resumeData.sections) {
      const projectsSection = resumeData.sections.find(
        (section: any) => section["section name"]?.toLowerCase() === "projects",
      )
      if (projectsSection && projectsSection.content) {
        return projectsSection.content
          .filter((item: any) => item.name || item.title)
          .map((item: any) => ({
            name: item.name || item.title,
            description: item.description || item.Description,
            technologies: item.technologies || (item.tech ? item.tech.split(",").map((t: string) => t.trim()) : []),
            url: item.url || item.link,
            date: item.date || item.Duration,
          }))
      }
    }

    // Handle standard resume structure
    return resumeData.projects || resumeData.portfolio || []
  }

  const getCertifications = () => {
    // Handle sections-based structure
    if (resumeData.sections) {
      const certificationsSection = resumeData.sections.find(
        (section: any) =>
          section["section name"]?.toLowerCase() === "certifications" ||
          section["section name"]?.toLowerCase() === "certificates" ||
          section["section name"]?.toLowerCase() === "awards",
      )
      if (certificationsSection && certificationsSection.content) {
        return certificationsSection.content
          .filter((item: any) => item.name || item.title)
          .map((item: any) => ({
            name: item.name || item.title,
            issuer: item.issuer || item.organization || item.Organization,
            date: item.date || item.Duration,
          }))
      }
    }

    // Handle standard resume structure
    return resumeData.certifications || resumeData.certificates || resumeData.awards || []
  }

  const personalInfo = getPersonalInfo()
  const experience = getExperience()
  const education = getEducation()
  const skills = getSkills()
  const projects = getProjects()
  const certifications = getCertifications()

  const handleShare = async () => {
    setIsSharing(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${personalInfo.name} - Portfolio`,
          text: personalInfo.summary || `Check out ${personalInfo.name}'s professional portfolio`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          description: "Portfolio URL copied to clipboard",
          duration: 2000,
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
      toast({
        title: "Error",
        description: "Failed to share portfolio",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleDownload = () => {
    const dataStr = JSON.stringify(resumeData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${personalInfo.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_portfolio.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      description: "Portfolio data downloaded",
      duration: 2000,
    })
  }

  const getThemeClasses = () => {
    switch (portfolio.theme) {
      case "modern":
        return {
          container: "bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900",
          card: "bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700",
          header: "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
          accent: "text-blue-600 dark:text-blue-400",
          section: "border-l-4 border-blue-500",
        }
      case "classic":
        return {
          container: "bg-gray-50 dark:bg-gray-900",
          card: "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700",
          header: "bg-gray-800 text-white dark:bg-gray-700",
          accent: "text-gray-700 dark:text-gray-300",
          section: "border-l-4 border-gray-500",
        }
      case "minimal":
        return {
          container: "bg-white dark:bg-black",
          card: "bg-gray-50 border-gray-100 dark:bg-gray-900 dark:border-gray-800",
          header: "bg-black text-white dark:bg-white dark:text-black",
          accent: "text-black dark:text-white",
          section: "border-l-4 border-black dark:border-white",
        }
      case "creative":
        return {
          container:
            "bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900 dark:via-pink-900 dark:to-orange-900",
          card: "bg-white/90 backdrop-blur-sm border-purple-200 dark:bg-slate-800/90 dark:border-purple-700",
          header: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white",
          accent: "text-purple-600 dark:text-purple-400",
          section: "border-l-4 border-purple-500",
        }
      default:
        return {
          container: "bg-gray-50 dark:bg-gray-900",
          card: "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700",
          header: "bg-gray-800 text-white dark:bg-gray-700",
          accent: "text-gray-700 dark:text-gray-300",
          section: "border-l-4 border-gray-500",
        }
    }
  }

  const theme = getThemeClasses()

  return (
    <div className={`min-h-screen p-4 md:p-8 ${theme.container}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handleShare} disabled={isSharing}>
            <Share2 className="h-4 w-4 mr-2" />
            {isSharing ? "Sharing..." : "Share"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Header Section */}
        <Card className={theme.card}>
          <CardHeader className={`${theme.header} rounded-t-lg`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl md:text-3xl font-bold mb-2">{personalInfo.name}</CardTitle>
                <p className="text-lg opacity-90 mb-4">{personalInfo.title}</p>
                {personalInfo.summary && (
                  <p className="text-sm opacity-80 leading-relaxed max-w-2xl">{personalInfo.summary}</p>
                )}
              </div>
              {personalInfo.photo && (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/20 flex-shrink-0">
                  <img
                    src={personalInfo.photo || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${personalInfo.email}`} className={`${theme.accent} hover:underline`}>
                    {personalInfo.email}
                  </a>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${personalInfo.phone}`} className={`${theme.accent} hover:underline`}>
                    {personalInfo.phone}
                  </a>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={
                      personalInfo.website.startsWith("http") ? personalInfo.website : `https://${personalInfo.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${theme.accent} hover:underline flex items-center gap-1`}
                  >
                    Website <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={
                      personalInfo.linkedin.startsWith("http")
                        ? personalInfo.linkedin
                        : `https://linkedin.com/in/${personalInfo.linkedin}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${theme.accent} hover:underline flex items-center gap-1`}
                  >
                    LinkedIn <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {personalInfo.github && (
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={
                      personalInfo.github.startsWith("http")
                        ? personalInfo.github
                        : `https://github.com/${personalInfo.github}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${theme.accent} hover:underline flex items-center gap-1`}
                  >
                    GitHub <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills Section - Show early and prominently */}
        {skills.length > 0 && (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={`${theme.accent} flex items-center gap-2`}>
                <Code className="h-5 w-5" />
                Skills & Technologies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: any, index: number) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                    {typeof skill === "string" ? skill : skill.name || skill.skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience Section */}
        {experience.length > 0 ? (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={`${theme.accent} flex items-center gap-2`}>
                <Briefcase className="h-5 w-5" />
                Professional Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {experience.map((exp: any, index: number) => (
                <div key={index} className={`${theme.section} pl-4`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{exp.position || exp.title || exp.role}</h3>
                    {(exp.startDate || exp.endDate) && (
                      <Badge variant="secondary" className="w-fit">
                        <Calendar className="h-3 w-3 mr-1" />
                        {exp.startDate || exp.start} - {exp.endDate || exp.end || "Present"}
                      </Badge>
                    )}
                  </div>
                  <p className={`font-medium mb-2 ${theme.accent}`}>{exp.company || exp.organization}</p>
                  {exp.location && <p className="text-sm text-muted-foreground mb-2">{exp.location}</p>}
                  {exp.description && <p className="text-muted-foreground mb-2 leading-relaxed">{exp.description}</p>}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                      {exp.achievements.map((achievement: string, achIndex: number) => (
                        <li key={achIndex}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                  {exp.responsibilities && exp.responsibilities.length > 0 && (
                    <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                      {exp.responsibilities.map((responsibility: string, respIndex: number) => (
                        <li key={respIndex}>{responsibility}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          // Fallback experience section
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={`${theme.accent} flex items-center gap-2`}>
                <Briefcase className="h-5 w-5" />
                Professional Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`${theme.section} pl-4`}>
                <p className="text-muted-foreground">
                  Professional experience details will be displayed here once added to the resume.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Section */}
        {projects.length > 0 && (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={`${theme.accent} flex items-center gap-2`}>
                <Code className="h-5 w-5" />
                Projects & Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.map((project: any, index: number) => (
                <div key={index} className={`${theme.section} pl-4`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <h3 className="font-semibold">{project.name || project.title}</h3>
                    {project.date && (
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {project.date}
                      </Badge>
                    )}
                  </div>
                  {project.description && <p className="text-muted-foreground mb-2">{project.description}</p>}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {project.technologies.map((tech: string, techIndex: number) => (
                        <Badge key={techIndex} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${theme.accent} hover:underline flex items-center gap-1 text-sm`}
                    >
                      View Project <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Education Section */}
        {education.length > 0 && (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={`${theme.accent} flex items-center gap-2`}>
                <Award className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.map((edu: any, index: number) => (
                <div key={index} className={`${theme.section} pl-4`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <h3 className="font-semibold">{edu.degree || edu.studyType}</h3>
                    {(edu.startDate || edu.endDate) && (
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {edu.startDate || edu.start} - {edu.endDate || edu.end || "Present"}
                      </Badge>
                    )}
                  </div>
                  <p className={`font-medium ${theme.accent}`}>{edu.school || edu.institution}</p>
                  {edu.location && <p className="text-sm text-muted-foreground">{edu.location}</p>}
                  {edu.gpa && <p className="text-sm text-muted-foreground">GPA: {edu.gpa}</p>}
                  {edu.description && <p className="text-muted-foreground mt-2">{edu.description}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Certifications Section */}
        {certifications.length > 0 && (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={`${theme.accent} flex items-center gap-2`}>
                <Award className="h-5 w-5" />
                Certifications & Awards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {certifications.map((cert: any, index: number) => (
                <div key={index} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{cert.name || cert.title}</h3>
                    <p className={`text-sm ${theme.accent}`}>{cert.issuer || cert.organization}</p>
                  </div>
                  {cert.date && (
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {cert.date}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Default content when no specific sections are available */}
        {experience.length === 0 && projects.length === 0 && education.length === 0 && skills.length === 0 && (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={`${theme.accent} flex items-center gap-2`}>
                <User className="h-5 w-5" />
                About This Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  This portfolio is currently being built. More content will be added soon including professional
                  experience, projects, education, and skills.
                </p>
                <p className="text-sm text-muted-foreground">
                  Portfolio created with Resume Builder • Last updated{" "}
                  {new Date(portfolio.updated_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground print:hidden">
          <Separator className="mb-4" />
          <p>
            Portfolio created with Resume Builder • Last updated {new Date(portfolio.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
