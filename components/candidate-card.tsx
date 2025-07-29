"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, User, Calendar, GraduationCap, Briefcase, Star } from "lucide-react"
import type { Candidate } from "@/types/candidate"

interface CandidateCardProps {
  candidate: Candidate
  searchTerm?: string
  onContact?: (candidate: Candidate) => void
  onViewResume?: (candidate: Candidate) => void
}

export function CandidateCard({ candidate, searchTerm, onContact, onViewResume }: CandidateCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const highlightText = (text: string, searchTerm?: string) => {
    if (!searchTerm || !text) return text

    const regex = new RegExp(`(${searchTerm})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  const hasMatchingSkill = (skills: string[], searchTerm?: string) => {
    if (!searchTerm) return false
    return skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  const matchingSkills = searchTerm
    ? candidate.skills.filter((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    : []

  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(candidate.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight mb-1">{highlightText(candidate.name, searchTerm)}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Mail className="h-4 w-4" />
              <span className="truncate">{highlightText(candidate.email, searchTerm)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="truncate">{highlightText(candidate.resume_title, searchTerm)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Skills Section */}
        {candidate.skills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Skills</span>
              {matchingSkills.length > 0 && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  {matchingSkills.length} match{matchingSkills.length !== 1 ? "es" : ""}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {candidate.skills.slice(0, 8).map((skill, index) => {
                const isMatching = searchTerm && skill.toLowerCase().includes(searchTerm.toLowerCase())
                return (
                  <Badge
                    key={`${skill}-${index}`}
                    variant={isMatching ? "default" : "secondary"}
                    className={`text-xs ${isMatching ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    {skill}
                  </Badge>
                )
              })}
              {candidate.skills.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.skills.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {candidate.experience_titles.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Recent Roles</span>
            </div>
            <div className="space-y-1">
              {candidate.experience_titles.slice(0, 3).map((title, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  • {highlightText(title, searchTerm)}
                </div>
              ))}
              {candidate.experience_titles.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{candidate.experience_titles.length - 3} more roles
                </div>
              )}
            </div>
          </div>
        )}

        {/* Education Section */}
        {candidate.education.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Education</span>
            </div>
            <div className="space-y-1">
              {candidate.education.slice(0, 2).map((edu, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  <div>{highlightText(edu.degree, searchTerm)}</div>
                  {edu.institution && (
                    <div className="text-xs">
                      {highlightText(edu.institution, searchTerm)} {edu.year && `• ${edu.year}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
            onClick={() => onViewResume?.(candidate)}
          >
            View Resume
          </Button>
          <Button size="sm" className="flex-1" onClick={() => onContact?.(candidate)}>
            <Mail className="h-4 w-4 mr-1" />
            Contact
          </Button>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Updated {formatDate(candidate.resume_updated_at)}</span>
          </div>
          <span>ID: {candidate.resume_id}</span>
        </div>
      </CardContent>
    </Card>
  )
}
