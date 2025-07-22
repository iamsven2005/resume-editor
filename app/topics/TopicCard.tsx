import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, Calendar } from "lucide-react"
import type { Topic } from "@/types/database"

interface TopicCardProps {
  topic: Topic
}

export function TopicCard({ topic }: TopicCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Link href={`/topics/${topic.slug}`}>
      <Card className="p-6 hover:shadow-md transition-all duration-200 hover:border-primary/20 cursor-pointer group">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                topics/{topic.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {topic.description || "No description available"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{topic.post_count || 0} posts</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{topic.total_comments || 0} comments</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Created {formatDate(topic.created_at)}</span>
            </div>
          </div>

          {/* Activity indicator */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {(topic.post_count || 0) > 10 ? "Active" : "Growing"}
            </Badge>
            <span className="text-xs text-muted-foreground">Updated {formatDate(topic.updated_at)}</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
