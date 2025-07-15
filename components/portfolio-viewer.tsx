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
  Building,
  GraduationCap,
  Award,
  Code,
  ExternalLink,
} from "lucide-react"

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
  created_at: string
  updated_at: string
}

interface PortfolioViewerProps {
  portfolio: Portfolio
  resumeData: any
}

export function PortfolioViewer({ portfolio, resumeData }: PortfolioViewerProps) {
  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case "modern":
        return {
          container: "bg-gradient-to-br from-blue-50 to-indigo-100",
          card: "bg-white/80 backdrop-blur-sm border-blue-200",
          header: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
          accent: "text-blue-600",
          badge: "bg-blue-100 text-blue-800",
        }
      case "classic":
        return {
          container: "bg-gray-50",
          card: "bg-white border-gray-200",
          header: "bg-gray-800 text-white",
          accent: "text-gray-700",
          badge: "bg-gray-100 text-gray-800",
        }
      case "minimal":
        return {
          container: "bg-white",
          card: "bg-gray-50 border-gray-100",
          header: "bg-black text-white",
          accent: "text-black",
          badge: "bg-gray-200 text-gray-900",
        }
      case "creative":
        return {
          container: "bg-gradient-to-br from-purple-50 to-pink-100",
          card: "bg-white/90 backdrop-blur-sm border-purple-200",
          header: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
          accent: "text-purple-600",
          badge: "bg-purple-100 text-purple-800",
        }
      default:
        return {
          container: "bg-gray-50",
          card: "bg-white border-gray-200",
          header: "bg-gray-800 text-white",
          accent: "text-gray-700",
          badge: "bg-gray-100 text-gray-800",
        }
    }
  }

  const theme = getThemeClasses(portfolio.theme)
  const data = resumeData || {}

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 ${theme.container}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className={theme.card}>
          <CardHeader className={`${theme.header} rounded-t-lg`}>
            <div className="text-center space-y-4">
              <CardTitle className="text-3xl md:text-4xl font-bold">
                {data.personalInfo?.name || "Professional Portfolio"}
              </CardTitle>
              <p className="text-lg opacity-90">{data.personalInfo?.title || portfolio.description}</p>

              {/* Contact Information */}
              <div className="flex flex-wrap justify-center gap-4 text-sm opacity-90">
                {data.personalInfo?.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${data.personalInfo.email}`} className="hover:underline">
                      {data.personalInfo.email}
                    </a>
                  </div>
                )}
                {data.personalInfo?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${data.personalInfo.phone}`} className="hover:underline">
                      {data.personalInfo.phone}
                    </a>
                  </div>
                )}
                {data.personalInfo?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{data.personalInfo.location}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex justify-center gap-4">
                {data.personalInfo?.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    <a href={data.personalInfo.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
                {data.personalInfo?.linkedin && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    <a href={data.personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {data.personalInfo?.github && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    <a href={data.personalInfo.github} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Summary */}
        {data.summary && (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={theme.accent}>Professional Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{data.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${theme.accent}`}>
                <Building className="h-5 w-5" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.experience.map((exp: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-semibold">{exp.position}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Present"}
                      </span>
                    </div>
                  </div>
                  <p className={`font-medium ${theme.accent}`}>{exp.company}</p>
                  {exp.location && <p className="text-sm text-gray-600">{exp.location}</p>}
                  {exp.description && (
                    <div className="text-gray-700">
                      {exp.description.split("\n").map((line: string, i: number) => (
                        <p key={i} className="mb-1">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                  {index < data.experience.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${theme.accent}`}>
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.education.map((edu: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-semibold">{edu.degree}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : "Present"}
                      </span>
                    </div>
                  </div>
                  <p className={`font-medium ${theme.accent}`}>{edu.institution}</p>
                  {edu.location && <p className="text-sm text-gray-600">{edu.location}</p>}
                  {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                  {edu.description && <p className="text-gray-700">{edu.description}</p>}
                  {index < data.education.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${theme.accent}`}>
                <Code className="h-5 w-5" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill: any, index: number) => (
                  <Badge key={index} variant="secondary" className={theme.badge}>
                    {typeof skill === "string" ? skill : skill.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${theme.accent}`}>
                <Award className="h-5 w-5" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.projects.map((project: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    {project.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Project
                        </a>
                      </Button>
                    )}
                  </div>
                  {project.description && <p className="text-gray-700">{project.description}</p>}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {index < data.projects.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${theme.accent}`}>
                <Award className="h-5 w-5" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.certifications.map((cert: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-semibold">{cert.name}</h3>
                    {cert.date && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(cert.date)}</span>
                      </div>
                    )}
                  </div>
                  <p className={`font-medium ${theme.accent}`}>{cert.issuer}</p>
                  {cert.url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={cert.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Certificate
                      </a>
                    </Button>
                  )}
                  {index < data.certifications.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-8">
          <p>This portfolio was generated using Resume Builder</p>
          <p className="mt-1">
            © {new Date().getFullYear()} {data.personalInfo?.name || "Professional Portfolio"}
          </p>
        </div>
      </div>
    </div>
  )
}
