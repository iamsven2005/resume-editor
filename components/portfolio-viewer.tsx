"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar, ExternalLink, Download, Share2 } from "lucide-react"
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
  const resumeData = portfolio.resume_data

  const handleShare = async () => {
    setIsSharing(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${portfolio.title} - Portfolio`,
          text: portfolio.description || `Check out ${portfolio.title}'s professional portfolio`,
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

  const getThemeClasses = () => {
    switch (portfolio.theme) {
      case "modern":
        return {
          container: "bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900",
          card: "bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700",
          header: "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
          accent: "text-blue-600 dark:text-blue-400",
        }
      case "classic":
        return {
          container: "bg-gray-50 dark:bg-gray-900",
          card: "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700",
          header: "bg-gray-800 text-white dark:bg-gray-700",
          accent: "text-gray-700 dark:text-gray-300",
        }
      case "minimal":
        return {
          container: "bg-white dark:bg-black",
          card: "bg-gray-50 border-gray-100 dark:bg-gray-900 dark:border-gray-800",
          header: "bg-black text-white dark:bg-white dark:text-black",
          accent: "text-black dark:text-white",
        }
      case "creative":
        return {
          container:
            "bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900 dark:via-pink-900 dark:to-orange-900",
          card: "bg-white/90 backdrop-blur-sm border-purple-200 dark:bg-slate-800/90 dark:border-purple-700",
          header: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white",
          accent: "text-purple-600 dark:text-purple-400",
        }
      default:
        return {
          container: "bg-gray-50 dark:bg-gray-900",
          card: "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700",
          header: "bg-gray-800 text-white dark:bg-gray-700",
          accent: "text-gray-700 dark:text-gray-300",
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
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">
                  {resumeData?.personalInfo?.name || resumeData?.name || "Professional Portfolio"}
                </CardTitle>
                <p className="text-lg opacity-90 mt-1">
                  {resumeData?.personalInfo?.title || resumeData?.title || "Professional"}
                </p>
              </div>
              {resumeData?.personalInfo?.photo && (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/20">
                  <img
                    src={resumeData.personalInfo.photo || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {resumeData?.personalInfo?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${resumeData.personalInfo.email}`} className={`${theme.accent} hover:underline`}>
                    {resumeData.personalInfo.email}
                  </a>
                </div>
              )}
              {resumeData?.personalInfo?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${resumeData.personalInfo.phone}`} className={`${theme.accent} hover:underline`}>
                    {resumeData.personalInfo.phone}
                  </a>
                </div>
              )}
              {resumeData?.personalInfo?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{resumeData.personalInfo.location}</span>
                </div>
              )}
              {resumeData?.personalInfo?.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={resumeData.personalInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${theme.accent} hover:underline flex items-center gap-1`}
                  >
                    Website <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {resumeData?.personalInfo?.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={resumeData.personalInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${theme.accent} hover:underline flex items-center gap-1`}
                  >
                    LinkedIn <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {resumeData?.personalInfo?.github && (
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={resumeData.personalInfo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${theme.accent} hover:underline flex items-center gap-1`}
                  >
                    GitHub <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Summary */}
            {resumeData?.personalInfo?.summary && (
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${theme.accent}`}>Professional Summary</h3>
                <p className="text-muted-foreground leading-relaxed">{resumeData.personalInfo.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Experience Section */}
        {resumeData?.experience && resumeData.experience.length > 0 && (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={theme.accent}>Professional Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.experience.map((exp: any, index: number) => (
                <div key={index} className="border-l-2 border-muted pl-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{exp.position || exp.title}</h3>
                    <Badge variant="secondary" className="w-fit">
                      <Calendar className="h-3 w-3 mr-1" />
                      {exp.startDate} - {exp.endDate || "Present"}
                    </Badge>
                  </div>
                  <p className={`font-medium mb-2 ${theme.accent}`}>{exp.company}</p>
                  {exp.location && <p className="text-sm text-muted-foreground mb-2">{exp.location}</p>}
                  {exp.description && <p className="text-muted-foreground">{exp.description}</p>}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                      {exp.achievements.map((achievement: string, achIndex: number) => (
                        <li key={achIndex}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Education Section */}
        {resumeData?.education && resumeData.education.length > 0 && (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={theme.accent}>Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.education.map((edu: any, index: number) => (
                <div key={index} className="border-l-2 border-muted pl-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {edu.startDate} - {edu.endDate || "Present"}
                    </Badge>
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

        {/* Skills Section */}
        {resumeData?.skills && resumeData.skills.length > 0 && (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={theme.accent}>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill: any, index: number) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {typeof skill === "string" ? skill : skill.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Section */}
        {resumeData?.projects && resumeData.projects.length > 0 && (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={theme.accent}>Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.projects.map((project: any, index: number) => (
                <div key={index} className="border-l-2 border-muted pl-4">
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

        {/* Certifications Section */}
        {resumeData?.certifications && resumeData.certifications.length > 0 && (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={theme.accent}>Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resumeData.certifications.map((cert: any, index: number) => (
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
