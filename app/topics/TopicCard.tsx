"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShareButton } from "@/components/share-button"
import { Users, Calendar, TrendingUp } from "lucide-react"
import type { Topic } from "@/lib/api"

interface TopicCardProps {
  topic: Topic
}

export const TopicCard = ({ topic }: TopicCardProps) => {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 30) return `${diffInDays} days ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  const communityUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/topics/${topic.slug}`

  return (
    <Link href={`/topics/${topic.slug}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground mb-1">r/{topic.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{topic.description}</p>
            </div>
            <div onClick={(e) => e.preventDefault()}>
              <ShareButton url={communityUrl} title={`r/${topic.name} community`} type="community" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{topic.memberCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatTimeAgo(topic.created_at)}</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
