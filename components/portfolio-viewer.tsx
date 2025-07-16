"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  User,
  Briefcase,
} from "lucide-react"

interface PortfolioViewerProps {
  resumeData: any
  theme?: string
}

// Helper function to safely get string value
const safeString = (value: any): string => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  return String(value)
}

// Helper function to safely get array
const safeArray = (value: any): any[] => {
  if (Array.isArray(value)) return value
  return []
}

export function PortfolioViewer({ resumeData, theme = "modern" }: PortfolioViewerProps) {
  // Extract data with fallbacks
  const personalInfo = resumeData?.personalInfo || {}
  const experience = safeArray(resumeData?.experience)
  const education = safeArray(resumeData?.education)
  const skills = safeArray(resumeData?.skills)
  const projects = safeArray(resumeData?.projects)
  const certifications = safeArray(resumeData?.certifications)

  // Extract personal information with fallbacks
  const name = safeString(personalInfo.name || personalInfo.fullName || "Professional Name")
  const title = safeString(personalInfo.title || personalInfo.jobTitle || "Professional Title")
  const email = safeString(personalInfo.email)
  const phone = safeString(personalInfo.phone)
  const location = safeString(personalInfo.location || personalInfo.address)
  const website = safeString(personalInfo.website || personalInfo.portfolio)
  const linkedin = safeString(personalInfo.linkedin)
  const github = safeString(personalInfo.github)
  const summary = safeString(personalInfo.summary || personalInfo.objective || personalInfo.about)

  // Theme configurations
  const themeConfig = {
    modern: {
      containerClass: "min-h-screen bg-gradient-to-br from-slate-50 to-blue-50",
      headerClass: "bg-white shadow-lg border-b-4 border-blue-500",
      cardClass: "bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-200",
      titleClass: "text-gray-900 font-bold",
      subtitleClass: "text-blue-600 font-semibold",
      textClass: "text-gray-700",
      accentClass: "text-blue-600",
      buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
      badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    },
    classic: {
      containerClass: "min-h-screen bg-gray-50",
      headerClass: "bg-white shadow-sm border-b-2 border-gray-300",
      cardClass: "bg-white shadow-sm border-2 border-gray-300",
      titleClass: "text-gray-900 font-serif font-bold",
      subtitleClass: "text-gray-700 font-serif font-semibold",
      textClass: "text-gray-600 font-serif",
      accentClass: "text-gray-800",
      buttonClass: "bg-gray-700 hover:bg-gray-800 text-white border border-gray-600",
      badgeClass: "bg-gray-200 text-gray-800 border-gray-300",
    },
    minimal: {
      containerClass: "min-h-screen bg-white",
      headerClass: "bg-white border-b border-gray-200",
      cardClass: "bg-white border border-gray-100 hover:border-gray-200 transition-colors",
      titleClass: "text-gray-900 font-light",
      subtitleClass: "text-gray-600 font-medium",
      textClass: "text-gray-500",
      accentClass: "text-gray-700",
      buttonClass: "bg-gray-900 hover:bg-gray-800 text-white",
      badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
    },
    creative: {
      containerClass: "min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50",
      headerClass: "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl",
      cardClass: "bg-white shadow-lg hover:shadow-xl transition-all border border-purple-200 rounded-xl",
      titleClass: "text-white font-bold",
      subtitleClass: "text-purple-600 font-bold",
      textClass: "text-gray-700",
      accentClass: "text-purple-600",
      buttonClass: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white",
      badgeClass: "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-200",
    },
  }

  const currentTheme = themeConfig[theme as keyof typeof themeConfig] || themeConfig.modern

  return (
    <div className={currentTheme.containerClass}>
      {/* Header Section */}
      <header className={`${currentTheme.headerClass} py-12 px-6`}>
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className={`text-4xl md:text-5xl ${theme === "creative" ? currentTheme.titleClass : "text-gray-900"} mb-4`}
          >
            {name}
          </h1>
          <p
            className={`text-xl md:text-2xl ${theme === "creative" ? "text-purple-100" : currentTheme.accentClass} mb-6`}
          >
            {title}
          </p>

          {/* Contact Information */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {email && (
              <a
                href={`mailto:${email}`}
                className={`flex items-center gap-2 ${theme === "creative" ? "text-white hover:text-purple-200" : "text-gray-600 hover:text-blue-600"} transition-colors`}
              >
                <Mail className="w-4 h-4" />
                {email}
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone}`}
                className={`flex items-center gap-2 ${theme === "creative" ? "text-white hover:text-purple-200" : "text-gray-600 hover:text-blue-600"} transition-colors`}
              >
                <Phone className="w-4 h-4" />
                {phone}
              </a>
            )}
            {location && (
              <span className={`flex items-center gap-2 ${theme === "creative" ? "text-white" : "text-gray-600"}`}>
                <MapPin className="w-4 h-4" />
                {location}
              </span>
            )}
            {website && (
              <a
                href={website.startsWith("http") ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 ${theme === "creative" ? "text-white hover:text-purple-200" : "text-gray-600 hover:text-blue-600"} transition-colors`}
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
            {linkedin && (
              <a
                href={linkedin.startsWith("http") ? linkedin : `https://linkedin.com/in/${linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 ${theme === "creative" ? "text-white hover:text-purple-200" : "text-gray-600 hover:text-blue-600"} transition-colors`}
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            )}
            {github && (
              <a
                href={github.startsWith("http") ? github : `https://github.com/${github}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 ${theme === "creative" ? "text-white hover:text-purple-200" : "text-gray-600 hover:text-blue-600"} transition-colors`}
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Professional Summary */}
        {summary && (
          <Card className={currentTheme.cardClass}>
            <CardHeader>
              <CardTitle className={`${currentTheme.subtitleClass} flex items-center gap-2`}>
                <User className="w-5 h-5" />
                Professional Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`${currentTheme.textClass} text-lg leading-relaxed`}>{summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Experience Section */}
        {experience.length > 0 && (
          <Card className={currentTheme.cardClass}>
            <CardHeader>
              <CardTitle className={`${currentTheme.subtitleClass} flex items-center gap-2`}>
                <Briefcase className="w-5 h-5" />
                Professional Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {experience.map((exp, index) => (
                <div key={index} className="relative">
                  {index > 0 && <Separator className="mb-8" />}
                  <div className="space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <h3 className={`text-xl font-semibold ${currentTheme.titleClass}`}>
                        {safeString(exp.title || exp.position || exp.role)}
                      </h3>
                      <div className={`flex items-center gap-2 ${currentTheme.textClass} text-sm`}>
                        <Calendar className="w-4 h-4" />
                        <span>
                          {safeString(exp.startDate)} - {safeString(exp.endDate || "Present")}
                        </span>
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 ${currentTheme.accentClass} font-medium`}>
                      <Building className="w-4 h-4" />
                      <span>{safeString(exp.company || exp.organization)}</span>
                      {exp.location && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className={currentTheme.textClass}>{safeString(exp.location)}</span>
                        </>
                      )}
                    </div>

                    {exp.description && (
                      <p className={`${currentTheme.textClass} leading-relaxed`}>{safeString(exp.description)}</p>
                    )}

                    {exp.achievements && safeArray(exp.achievements).length > 0 && (
                      <ul className={`${currentTheme.textClass} space-y-2 ml-4`}>
                        {safeArray(exp.achievements).map((achievement, achIndex) => (
                          <li key={achIndex} className="flex items-start gap-2">
                            <span
                              className={`${currentTheme.accentClass} mt-2 w-1 h-1 rounded-full bg-current flex-shrink-0`}
                            />
                            <span>{safeString(achievement)}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {exp.technologies && safeArray(exp.technologies).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {safeArray(exp.technologies).map((tech, techIndex) => (
                          <Badge key={techIndex} variant="secondary" className={currentTheme.badgeClass}>
                            {safeString(tech)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <Card className={currentTheme.cardClass}>
            <CardHeader>
              <CardTitle className={`${currentTheme.subtitleClass} flex items-center gap-2`}>
                <Award className="w-5 h-5" />
                Skills & Technologies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className={`${currentTheme.badgeClass} px-3 py-1`}>
                    {safeString(skill)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Section */}
        {projects.length > 0 && (
          <Card className={currentTheme.cardClass}>
            <CardHeader>
              <CardTitle className={`${currentTheme.subtitleClass} flex items-center gap-2`}>
                <Github className="w-5 h-5" />
                Featured Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {projects.map((project, index) => (
                <div key={index} className="space-y-3">
                  {index > 0 && <Separator />}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <h3 className={`text-lg font-semibold ${currentTheme.titleClass}`}>
                      {safeString(project.name || project.title)}
                    </h3>
                    {project.url && (
                      <Button variant="outline" size="sm" asChild className={currentTheme.buttonClass}>
                        <a href={safeString(project.url)} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-4 h-4 mr-2" />
                          View Project
                        </a>
                      </Button>
                    )}
                  </div>

                  {project.description && (
                    <p className={`${currentTheme.textClass} leading-relaxed`}>{safeString(project.description)}</p>
                  )}

                  {project.technologies && safeArray(project.technologies).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {safeArray(project.technologies).map((tech, techIndex) => (
                        <Badge key={techIndex} variant="secondary" className={currentTheme.badgeClass}>
                          {safeString(tech)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Education Section */}
        {education.length > 0 && (
          <Card className={currentTheme.cardClass}>
            <CardHeader>
              <CardTitle className={`${currentTheme.subtitleClass} flex items-center gap-2`}>
                <GraduationCap className="w-5 h-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {education.map((edu, index) => (
                <div key={index} className="space-y-2">
                  {index > 0 && <Separator />}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <h3 className={`text-lg font-semibold ${currentTheme.titleClass}`}>
                      {safeString(edu.degree || edu.qualification)}
                    </h3>
                    <div className={`flex items-center gap-2 ${currentTheme.textClass} text-sm`}>
                      <Calendar className="w-4 h-4" />
                      <span>{safeString(edu.year || edu.graduationYear || edu.endDate)}</span>
                    </div>
                  </div>

                  <div className={`${currentTheme.accentClass} font-medium`}>
                    {safeString(edu.school || edu.institution || edu.university)}
                  </div>

                  {edu.location && (
                    <div className={`${currentTheme.textClass} text-sm flex items-center gap-2`}>
                      <MapPin className="w-3 h-3" />
                      <span>{safeString(edu.location)}</span>
                    </div>
                  )}

                  {edu.gpa && <div className={`${currentTheme.textClass} text-sm`}>GPA: {safeString(edu.gpa)}</div>}

                  {edu.description && (
                    <p className={`${currentTheme.textClass} text-sm leading-relaxed`}>{safeString(edu.description)}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Certifications Section */}
        {certifications.length > 0 && (
          <Card className={currentTheme.cardClass}>
            <CardHeader>
              <CardTitle className={`${currentTheme.subtitleClass} flex items-center gap-2`}>
                <Award className="w-5 h-5" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${currentTheme.cardClass}`}>
                    <h4 className={`font-semibold ${currentTheme.titleClass} mb-2`}>
                      {safeString(cert.name || cert.title)}
                    </h4>
                    <p className={`${currentTheme.accentClass} text-sm mb-1`}>
                      {safeString(cert.issuer || cert.organization)}
                    </p>
                    {cert.date && (
                      <p className={`${currentTheme.textClass} text-sm flex items-center gap-1`}>
                        <Calendar className="w-3 h-3" />
                        {safeString(cert.date)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fallback message if no content */}
        {!summary &&
          experience.length === 0 &&
          education.length === 0 &&
          skills.length === 0 &&
          projects.length === 0 && (
            <Card className={currentTheme.cardClass}>
              <CardHeader>
                <CardTitle className={currentTheme.subtitleClass}>Professional Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={currentTheme.textClass}>
                  This portfolio is being built from your resume data. Add more sections to your resume to see them
                  displayed here.
                </p>
                <div className="flex gap-2 mt-4">
                  <Badge variant="outline" className={currentTheme.badgeClass}>
                    Experience
                  </Badge>
                  <Badge variant="outline" className={currentTheme.badgeClass}>
                    Skills
                  </Badge>
                  <Badge variant="outline" className={currentTheme.badgeClass}>
                    Education
                  </Badge>
                  <Badge variant="outline" className={currentTheme.badgeClass}>
                    Projects
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
      </main>
    </div>
  )
}
