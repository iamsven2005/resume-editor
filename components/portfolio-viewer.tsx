"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  Linkedin, 
  Github,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  User,
  Building,
  Clock
} from 'lucide-react'

interface ResumeData {
  title?: string
  personalInfo?: {
    name?: string
    title?: string
    email?: string
    phone?: string
    location?: string
    linkedin?: string
    github?: string
    website?: string
    summary?: string
  }
  sections?: Array<{
    id: string
    'section name': string
    content: any[]
  }>
}

interface PortfolioViewerProps {
  resumeData: ResumeData
  theme?: 'modern' | 'classic' | 'minimal' | 'creative'
}

export function PortfolioViewer({ resumeData, theme = 'modern' }: PortfolioViewerProps) {
  const getThemeClasses = () => {
    switch (theme) {
      case 'classic':
        return {
          container: 'bg-white text-gray-900',
          header: 'bg-gray-50 border-b-2 border-gray-200',
          accent: 'text-blue-700',
          card: 'bg-white border border-gray-200 shadow-sm',
          badge: 'bg-blue-100 text-blue-800'
        }
      case 'minimal':
        return {
          container: 'bg-gray-50 text-gray-800',
          header: 'bg-white border-b border-gray-100',
          accent: 'text-gray-900',
          card: 'bg-white border-0 shadow-none',
          badge: 'bg-gray-100 text-gray-700'
        }
      case 'creative':
        return {
          container: 'bg-gradient-to-br from-purple-50 to-blue-50 text-gray-900',
          header: 'bg-white/80 backdrop-blur-sm border-b border-purple-200',
          accent: 'text-purple-700',
          card: 'bg-white/70 backdrop-blur-sm border border-purple-100 shadow-lg',
          badge: 'bg-purple-100 text-purple-800'
        }
      default: // modern
        return {
          container: 'bg-gray-50 text-gray-900',
          header: 'bg-white border-b border-gray-200',
          accent: 'text-indigo-600',
          card: 'bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow',
          badge: 'bg-indigo-100 text-indigo-800'
        }
    }
  }

  const themeClasses = getThemeClasses()

  const formatDuration = (duration: string) => {
    if (!duration) return null
    return duration.replace(/–/g, '–').replace(/-/g, '–')
  }

  const renderPersonalInfo = () => {
    const personalInfo = resumeData.personalInfo || {}
    const title = personalInfo.title || 'Professional Portfolio'
    const description = personalInfo.description|| resumeData.title || ''

    return (
      <div className={`${themeClasses.header} px-8 py-12`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              {name}
            </h1>
            {description && (
              <p className={`text-xl md:text-2xl ${themeClasses.accent} font-medium mb-6`}>
                {description}
              </p>
            )}
            {personalInfo.summary && (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {personalInfo.summary}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {personalInfo.email && (
              <a 
                href={`mailto:${personalInfo.email}`}
                className={`flex items-center gap-2 ${themeClasses.accent} hover:underline transition-colors`}
              >
                <Mail className="w-4 h-4" />
                {personalInfo.email}
              </a>
            )}
            {personalInfo.phone && (
              <a 
                href={`tel:${personalInfo.phone}`}
                className={`flex items-center gap-2 ${themeClasses.accent} hover:underline transition-colors`}
              >
                <Phone className="w-4 h-4" />
                {personalInfo.phone}
              </a>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                {personalInfo.location}
              </div>
            )}
            {personalInfo.linkedin && (
              <a 
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 ${themeClasses.accent} hover:underline transition-colors`}
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            )}
            {personalInfo.github && (
              <a 
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 ${themeClasses.accent} hover:underline transition-colors`}
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            )}
            {personalInfo.website && (
              <a 
                href={personalInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 ${themeClasses.accent} hover:underline transition-colors`}
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderExperienceSection = (content: any[]) => {
    const validExperiences = content.filter(exp => 
      exp['job title'] && exp['job title'].trim() !== ''
    )

    if (validExperiences.length === 0) return null

    return (
      <div className="space-y-6">
        {validExperiences.map((experience, index) => (
          <Card key={index} className={themeClasses.card}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-500" />
                    {experience['job title']}
                  </h3>
                  {experience.Organization && (
                    <p className={`${themeClasses.accent} font-medium mb-2 flex items-center gap-2`}>
                      <Building className="w-4 h-4" />
                      {experience.Organization}
                    </p>
                  )}
                </div>
                {experience.Duration && (
                  <div className="flex items-center gap-2 text-gray-600 md:text-right">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{formatDuration(experience.Duration)}</span>
                  </div>
                )}
              </div>
              {experience.Description && (
                <div className="text-gray-700 leading-relaxed">
                  <p>{experience.Description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderEducationSection = (content: any[]) => {
    const validEducation = content.filter(edu => 
      edu.Degree && edu.Degree.trim() !== ''
    )

    if (validEducation.length === 0) return null

    return (
      <div className="space-y-4">
        {validEducation.map((education, index) => (
          <Card key={index} className={themeClasses.card}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-gray-500" />
                    {education.Degree}
                  </h3>
                  {education.Organization && (
                    <p className={`${themeClasses.accent} font-medium`}>
                      {education.Organization}
                    </p>
                  )}
                </div>
                {education.Duration && (
                  <div className="flex items-center gap-2 text-gray-600 mt-2 md:mt-0">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{education.Duration}</span>
                  </div>
                )}
              </div>
              {education.GPA && education.GPA.trim() !== '' && (
                <div className="mt-3">
                  <Badge variant="secondary" className={themeClasses.badge}>
                    GPA: {education.GPA}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderSkillsSection = (content: any[]) => {
    const validSkills = content.filter(skill => 
      skill.Category && skill.Category.trim() !== '' && 
      skill.Skills && skill.Skills.trim() !== ''
    )

    if (validSkills.length === 0) return null

    return (
      <div className="space-y-6">
        {validSkills.map((skillGroup, index) => (
          <Card key={index} className={themeClasses.card}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-gray-500" />
                {skillGroup.Category}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {skillGroup.Skills.split(',').map((skill: string, skillIndex: number) => {
                  const trimmedSkill = skill.trim()
                  if (!trimmedSkill) return null
                  return (
                    <Badge 
                      key={skillIndex} 
                      variant="secondary" 
                      className={`${themeClasses.badge} text-sm`}
                    >
                      {trimmedSkill}
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderSection = (section: any) => {
    const sectionName = section['section name']?.toLowerCase()
    
    switch (sectionName) {
      case 'experience':
        return renderExperienceSection(section.content)
      case 'education':
        return renderEducationSection(section.content)
      case 'skills':
        return renderSkillsSection(section.content)
      default:
        return null
    }
  }

  const getSectionIcon = (sectionName: string) => {
    switch (sectionName.toLowerCase()) {
      case 'experience':
        return <Briefcase className="w-6 h-6" />
      case 'education':
        return <GraduationCap className="w-6 h-6" />
      case 'skills':
        return <Award className="w-6 h-6" />
      default:
        return <User className="w-6 h-6" />
    }
  }

  const sections = resumeData.sections || []
  const validSections = sections.filter(section => 
    section['section name'] && section.content && section.content.length > 0
  )

  return (
    <div className={`min-h-screen ${themeClasses.container}`}>
      {renderPersonalInfo()}
      
      <div className="max-w-4xl mx-auto px-8 py-12 space-y-12">
        {validSections.map((section, index) => {
          const renderedSection = renderSection(section)
          if (!renderedSection) return null

          return (
            <section key={section.id || index}>
              <div className="flex items-center gap-3 mb-8">
                <div className={themeClasses.accent}>
                  {getSectionIcon(section['section name'])}
                </div>
                <h2 className="text-3xl font-bold tracking-tight">
                  {section['section name']}
                </h2>
                <div className="flex-1 h-px bg-gray-200 ml-4" />
              </div>
              {renderedSection}
            </section>
          )
        })}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm py-8">
        <div className="max-w-4xl mx-auto px-8 text-center text-gray-600">
          <p>© {new Date().getFullYear()} {resumeData.personalInfo?.name || 'Professional Portfolio'}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
