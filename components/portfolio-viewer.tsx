"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Share,
  Download,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Calendar,
  Building,
  GraduationCap,
  Code,
  Briefcase,
  User,
  Star,
  ExternalLink,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PortfolioViewerProps {
  portfolio: {
    id: string
    title: string
    description?: string
    theme: string
    resume_data: any
    is_published: boolean
    portfolio_url: string
    created_at: string
    updated_at: string
  }
}

export function PortfolioViewer({ portfolio }: PortfolioViewerProps) {
  const [imageError, setImageError] = useState(false)

  // Enhanced data extraction with better fallbacks
  const extractPersonalInfo = (data: any) => {
    // Handle sections-based structure
    if (data?.sections) {
      const personalSection = data.sections.find(
        (section: any) =>
          section["section name"]?.toLowerCase().includes("personal") ||
          section["section name"]?.toLowerCase().includes("contact") ||
          section["section name"]?.toLowerCase().includes("info"),
      )

      if (personalSection?.content?.[0]) {
        const info = personalSection.content[0]
        return {
          name: info.Name || info.name || info["Full Name"] || data.title || portfolio.title,
          title: info.Title || info.title || info.Position || info.position || portfolio.description || "Professional",
          email: info.Email || info.email,
          phone: info.Phone || info.phone || info["Phone Number"],
          location: info.Location || info.location || info.Address || info.address,
          website: info.Website || info.website || info.Portfolio,
          linkedin: info.LinkedIn || info.linkedin,
          github: info.GitHub || info.github,
          summary: info.Summary || info.summary || info.About || info.about,
        }
      }
    }

    // Handle direct structure
    const personalInfo = data?.personalInfo || data?.personal || data?.contact || {}
    return {
      name: personalInfo.name || personalInfo.fullName || data?.name || data?.title || portfolio.title,
      title:
        personalInfo.title || personalInfo.position || personalInfo.jobTitle || portfolio.description || "Professional",
      email: personalInfo.email,
      phone: personalInfo.phone || personalInfo.phoneNumber,
      location: personalInfo.location || personalInfo.address || personalInfo.city,
      website: personalInfo.website || personalInfo.portfolio,
      linkedin: personalInfo.linkedin,
      github: personalInfo.github,
      summary: personalInfo.summary || personalInfo.about || personalInfo.bio,
    }
  }

  // Enhanced experience extraction
  const extractExperience = (data: any) => {
    // Handle sections-based structure
    if (data?.sections) {
      const experienceSection = data.sections.find(
        (section: any) =>
          section["section name"]?.toLowerCase().includes("experience") ||
          section["section name"]?.toLowerCase().includes("work") ||
          section["section name"]?.toLowerCase().includes("employment"),
      )

      if (experienceSection?.content) {
        return experienceSection.content
          .filter((item: any) => item["job title"] || item.position || item.title)
          .map((item: any) => ({
            position: item["job title"] || item.position || item.title || item.role,
            company: item.Organization || item.organization || item.company || item.employer,
            duration: item.Duration || item.duration || item.period || item.dates,
            description: item.Description || item.description || item.responsibilities || item.summary,
            location: item.Location || item.location,
          }))
      }
    }

    // Handle direct structure
    const experience = data?.experience || data?.work || data?.employment || []
    return Array.isArray(experience) ? experience : []
  }

  // Enhanced education extraction
  const extractEducation = (data: any) => {
    // Handle sections-based structure
    if (data?.sections) {
      const educationSection = data.sections.find(
        (section: any) =>
          section["section name"]?.toLowerCase().includes("education") ||
          section["section name"]?.toLowerCase().includes("academic") ||
          section["section name"]?.toLowerCase().includes("qualification"),
      )

      if (educationSection?.content) {
        return educationSection.content
          .filter((item: any) => item.Degree || item.degree || item.qualification)
          .map((item: any) => ({
            degree: item.Degree || item.degree || item.qualification || item.program,
            institution: item.Organization || item.organization || item.institution || item.school || item.university,
            duration: item.Duration || item.duration || item.period || item.dates || item.year,
            gpa: item.GPA || item.gpa || item.grade,
            description: item.Description || item.description || item.details,
          }))
      }
    }

    // Handle direct structure
    const education = data?.education || data?.academic || []
    return Array.isArray(education) ? education : []
  }

  // Enhanced skills extraction
  const extractSkills = (data: any) => {
    // Handle sections-based structure
    if (data?.sections) {
      const skillsSection = data.sections.find(
        (section: any) =>
          section["section name"]?.toLowerCase().includes("skill") ||
          section["section name"]?.toLowerCase().includes("competenc") ||
          section["section name"]?.toLowerCase().includes("technolog"),
      )

      if (skillsSection?.content) {
        const allSkills: string[] = []
        skillsSection.content.forEach((item: any) => {
          const skillsText = item.Skills || item.skills || item.technologies || item.competencies
          if (skillsText) {
            // Split comma-separated skills and clean them
            const skills = skillsText
              .split(",")
              .map((skill: string) => skill.trim())
              .filter(Boolean)
            allSkills.push(...skills)
          }
        })
        return allSkills
      }
    }

    // Handle direct structure
    const skills = data?.skills || data?.technologies || []
    if (Array.isArray(skills)) {
      return skills.flatMap((skill: any) => {
        if (typeof skill === "string") return [skill]
        if (skill.name) return [skill.name]
        if (skill.skill) return [skill.skill]
        return []
      })
    }
    return []
  }

  // Enhanced projects extraction
  const extractProjects = (data: any) => {
    // Handle sections-based structure
    if (data?.sections) {
      const projectsSection = data.sections.find(
        (section: any) =>
          section["section name"]?.toLowerCase().includes("project") ||
          section["section name"]?.toLowerCase().includes("portfolio") ||
          section["section name"]?.toLowerCase().includes("work"),
      )

      if (projectsSection?.content) {
        return projectsSection.content
          .filter((item: any) => item.Name || item.name || item.title || item.project)
          .map((item: any) => ({
            name: item.Name || item.name || item.title || item.project,
            description: item.Description || item.description || item.summary,
            technologies: item.Technologies || item.technologies || item.tech || item.stack,
            url: item.URL || item.url || item.link || item.demo,
            github: item.GitHub || item.github || item.repository,
          }))
      }
    }

    // Handle direct structure
    const projects = data?.projects || data?.portfolio || []
    return Array.isArray(projects) ? projects : []
  }

  const personalInfo = extractPersonalInfo(portfolio.resume_data)
  const experience = extractExperience(portfolio.resume_data)
  const education = extractEducation(portfolio.resume_data)
  const skills = extractSkills(portfolio.resume_data)
  const projects = extractProjects(portfolio.resume_data)

  const handleShare = async () => {
    const url = `${window.location.origin}/portfolio/${portfolio.portfolio_url}`
    try {
      await navigator.clipboard.writeText(url)
      toast({
        description: "Portfolio URL copied to clipboard",
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    const dataStr = JSON.stringify(portfolio.resume_data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${portfolio.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_portfolio.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      description: "Portfolio data downloaded",
      duration: 2000,
    })
  }

  const formatUrl = (url: string) => {
    if (!url) return ""
    if (url.startsWith("http://") || url.startsWith("https://")) return url
    return `https://${url}`
  }

  const getThemeClasses = () => {
    switch (portfolio.theme) {
      case "creative":
        return {
          background: "bg-gradient-to-br from-purple-600 via-purple-500 to-orange-400",
          card: "bg-white/95 backdrop-blur-sm border-white/20",
          header: "bg-gradient-to-r from-purple-600 to-orange-400 text-white",
          accent: "border-l-purple-500",
          button: "bg-purple-600 hover:bg-purple-700 text-white",
        }
      case "modern":
        return {
          background: "bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400",
          card: "bg-white/90 backdrop-blur-md border-white/30",
          header: "bg-gradient-to-r from-blue-600 to-cyan-400 text-white",
          accent: "border-l-blue-500",
          button: "bg-blue-600 hover:bg-blue-700 text-white",
        }
      case "classic":
        return {
          background: "bg-gray-100",
          card: "bg-white border-gray-200",
          header: "bg-gray-800 text-white",
          accent: "border-l-gray-600",
          button: "bg-gray-800 hover:bg-gray-900 text-white",
        }
      case "minimal":
      default:
        return {
          background: "bg-white",
          card: "bg-white border-gray-200",
          header: "bg-black text-white",
          accent: "border-l-black",
          button: "bg-black hover:bg-gray-800 text-white",
        }
    }
  }

  const theme = getThemeClasses()

  return (
    <div className={`min-h-screen ${theme.background}`}>
      {/* Header with actions */}
      <div className="sticky top-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShare}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Hero Section */}
        <Card className={`mb-8 ${theme.card} shadow-xl`}>
          <div className={`${theme.header} p-8 rounded-t-lg`}>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-white/20">
                <AvatarImage
                  src={
                    !imageError
                      ? `/placeholder.svg?height=96&width=96&query=${encodeURIComponent(personalInfo.name || "Professional Avatar")}`
                      : undefined
                  }
                  alt={personalInfo.name}
                  onError={() => setImageError(true)}
                />
                <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
                  {personalInfo.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "P"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{personalInfo.name}</h1>
                <p className="text-xl opacity-90 mb-4">{personalInfo.title}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  {personalInfo.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${personalInfo.email}`} className="hover:underline">
                        {personalInfo.email}
                      </a>
                    </div>
                  )}
                  {personalInfo.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${personalInfo.phone}`} className="hover:underline">
                        {personalInfo.phone}
                      </a>
                    </div>
                  )}
                  {personalInfo.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{personalInfo.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {personalInfo.summary && (
            <CardContent className="p-8">
              <p className="text-lg leading-relaxed text-muted-foreground">{personalInfo.summary}</p>
            </CardContent>
          )}
        </Card>

        {/* Contact Links */}
        {(personalInfo.website || personalInfo.linkedin || personalInfo.github) && (
          <Card className={`mb-8 ${theme.card} shadow-lg`}>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Links
              </h2>
              <div className="flex flex-wrap gap-4">
                {personalInfo.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(formatUrl(personalInfo.website), "_blank")}
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                {personalInfo.linkedin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(formatUrl(personalInfo.linkedin), "_blank")}
                    className="flex items-center gap-2"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                {personalInfo.github && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(formatUrl(personalInfo.github), "_blank")}
                    className="flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <Card className={`mb-8 ${theme.card} shadow-lg`}>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code className="h-5 w-5" />
                Skills & Technologies
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience Section */}
        {experience.length > 0 ? (
          <Card className={`mb-8 ${theme.card} shadow-lg`}>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Experience
              </h2>
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <div key={index} className={`border-l-4 ${theme.accent} pl-6 pb-6 last:pb-0`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <h3 className="text-xl font-semibold">{exp.position}</h3>
                      {exp.duration && (
                        <Badge variant="outline" className="text-sm mt-1 sm:mt-0">
                          <Calendar className="h-3 w-3 mr-1" />
                          {exp.duration}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">{exp.company}</span>
                      {exp.location && (
                        <>
                          <span>•</span>
                          <span>{exp.location}</span>
                        </>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className={`mb-8 ${theme.card} shadow-lg`}>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Experience
              </h2>
              <div className={`border-l-4 ${theme.accent} pl-6`}>
                <p className="text-muted-foreground italic">
                  Professional experience details will be displayed here once added to the resume.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Section */}
        {projects.length > 0 && (
          <Card className={`mb-8 ${theme.card} shadow-lg`}>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Featured Projects
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {projects.map((project, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                    {project.description && (
                      <p className="text-muted-foreground mb-3 text-sm leading-relaxed">{project.description}</p>
                    )}
                    {project.technologies && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.technologies.split(",").map((tech: string, techIndex: number) => (
                          <Badge key={techIndex} variant="outline" className="text-xs">
                            {tech.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {project.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(formatUrl(project.url), "_blank")}
                          className="text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Demo
                        </Button>
                      )}
                      {project.github && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(formatUrl(project.github), "_blank")}
                          className="text-xs"
                        >
                          <Github className="h-3 w-3 mr-1" />
                          Code
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Education Section */}
        {education.length > 0 && (
          <Card className={`mb-8 ${theme.card} shadow-lg`}>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className={`border-l-4 ${theme.accent} pl-6 pb-4 last:pb-0`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <h3 className="text-lg font-semibold">{edu.degree}</h3>
                      {edu.duration && (
                        <Badge variant="outline" className="text-sm mt-1 sm:mt-0">
                          <Calendar className="h-3 w-3 mr-1" />
                          {edu.duration}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">{edu.institution}</span>
                      {edu.gpa && (
                        <>
                          <span>•</span>
                          <span>GPA: {edu.gpa}</span>
                        </>
                      )}
                    </div>
                    {edu.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Default About Section when no specific sections are available */}
        {experience.length === 0 && education.length === 0 && projects.length === 0 && (
          <Card className={`mb-8 ${theme.card} shadow-lg`}>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                About This Portfolio
              </h2>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  This portfolio is currently being built. More content will be added soon including professional
                  experience, projects, education, and skills.
                </p>
                <Separator className="my-6" />
                <p className="text-sm text-muted-foreground">
                  Portfolio created with Resume Builder • Last updated{" "}
                  {new Date(portfolio.updated_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-6 text-sm text-muted-foreground">
          <p>
            Portfolio created with Resume Builder • Last updated {new Date(portfolio.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
