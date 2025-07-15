"use client"
import { Mail, Phone, MapPin } from "lucide-react"
import type { ResumeData } from "@/types/resume"

interface PortfolioViewerProps {
  portfolio: {
    id: string
    title: string
    description: string
    theme: string
    resume_data: ResumeData
    user_name: string
    user_email: string
    created_at: string
    updated_at: string
  }
  theme: string
}

const themeStyles = {
  modern: {
    background: "bg-gradient-to-br from-slate-50 to-blue-50",
    card: "bg-white/80 backdrop-blur-sm border-slate-200",
    accent: "text-blue-600",
    button: "bg-blue-600 hover:bg-blue-700",
  },
  creative: {
    background: "bg-gradient-to-br from-purple-50 to-pink-50",
    card: "bg-white/80 backdrop-blur-sm border-purple-200",
    accent: "text-purple-600",
    button: "bg-purple-600 hover:bg-purple-700",
  },
  minimal: {
    background: "bg-gray-50",
    card: "bg-white border-gray-200",
    accent: "text-gray-800",
    button: "bg-gray-800 hover:bg-gray-900",
  },
  tech: {
    background: "bg-gradient-to-br from-green-50 to-teal-50",
    card: "bg-white/80 backdrop-blur-sm border-green-200",
    accent: "text-green-600",
    button: "bg-green-600 hover:bg-green-700",
  },
}

export function PortfolioViewer({ portfolio, theme }: PortfolioViewerProps) {
  const styles = themeStyles[theme as keyof typeof themeStyles] || themeStyles.modern
  const resumeData = portfolio.resume_data

  const getContactInfo = () => {
    const personalSection = resumeData.sections?.find(
      (section) =>
        section["section name"].toLowerCase().includes("personal") ||
        section["section name"].toLowerCase().includes("contact"),
    )

    if (personalSection && personalSection.content[0]) {
      return personalSection.content[0]
    }

    return {}
  }

  const contactInfo = getContactInfo()

  return (
    <div className={`min-h-screen ${styles.background}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className={`${styles.card} rounded-lg shadow-lg p-8 mb-8`}>
          <div className="text-center mb-6">
            <h1 className={`text-4xl font-bold mb-2 ${styles.accent}`}>{portfolio.title}</h1>
            {portfolio.description && <p className="text-lg text-muted-foreground mb-4">{portfolio.description}</p>}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              {contactInfo.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${contactInfo.email}`} className="hover:underline">
                    {contactInfo.email}
                  </a>
                </div>
              )}
              {contactInfo.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{contactInfo.phone}</span>
                </div>
              )}
              {contactInfo.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{contactInfo.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
