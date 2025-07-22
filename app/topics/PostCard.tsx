import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, MessageSquare, ExternalLink, Clock, User } from 'lucide-react';
import { useState } from 'react';
import type { Post, Topic } from '@/data/mockData';

interface PostCardProps {
  post: Post;
  topic?: Topic;
  isDetailView?: boolean;
}

export const PostCard = ({ post, topic, isDetailView = false }: PostCardProps) => {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [currentScore, setCurrentScore] = useState(post.vote_score);

  const handleVote = (voteType: 'up' | 'down') => {
    if (userVote === voteType) {
      // Remove vote
      setUserVote(null);
      setCurrentScore(post.vote_score);
    } else {
      // Add or change vote
      const scoreDiff = userVote ? (voteType === 'up' ? 2 : -2) : (voteType === 'up' ? 1 : -1);
      setUserVote(voteType);
      setCurrentScore(currentScore + scoreDiff);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <Card className="border border-border overflow-hidden">
      <div className="flex">
        {/* Vote buttons */}
        <div className="flex flex-col items-center p-3 bg-secondary/30 border-r border-border">
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-auto ${userVote === 'up' ? 'text-upvote' : 'text-vote-text hover:text-upvote'}`}
            onClick={() => handleVote('up')}
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
          <span className={`font-bold text-sm ${userVote === 'up' ? 'text-upvote' : userVote === 'down' ? 'text-downvote' : 'text-vote-text'}`}>
            {currentScore}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-auto ${userVote === 'down' ? 'text-downvote' : 'text-vote-text hover:text-downvote'}`}
            onClick={() => handleVote('down')}
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>

        {/* Post content */}
        <div className="flex-1 p-4">
          <div className="space-y-3">
            {/* Post header */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {topic && (
                <>
                  <span className="font-medium text-foreground">r/{topic.name}</span>
                  <span>•</span>
                </>
              )}
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="font-medium">u/{post.author_name}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(post.created_at)}</span>
              </div>
            </div>

            {/* Post title */}
            <h2 className={`font-semibold text-foreground leading-tight ${isDetailView ? 'text-xl' : 'text-lg'}`}>
              {post.title}
            </h2>

            {/* Post content */}
            {post.content && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isDetailView ? post.content : `${post.content.slice(0, 200)}${post.content.length > 200 ? '...' : ''}`}
              </p>
            )}

            {/* External link */}
            {post.url && (
              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded border border-border">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">{post.url}</span>
              </div>
            )}

            {/* Post type badge */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {post.post_type}
              </Badge>
            </div>

            {/* Comments button */}
            <div className="flex items-center gap-4 pt-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <MessageSquare className="w-4 h-4 mr-1" />
                {post.comment_count} comments
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
