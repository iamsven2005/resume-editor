import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, MessageSquare, User, Clock } from 'lucide-react';
import { useState } from 'react';
import type { Comment } from '@/data/mockData';

interface CommentCardProps {
  comment: Comment;
  level?: number;
}

export const CommentCard = ({ comment, level = 0 }: CommentCardProps) => {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [currentScore, setCurrentScore] = useState(comment.vote_score);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleVote = (voteType: 'up' | 'down') => {
    if (userVote === voteType) {
      setUserVote(null);
      setCurrentScore(comment.vote_score);
    } else {
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

  const leftBorderColor = level > 0 ? 'border-l-2 border-border' : '';
  const marginLeft = level > 0 ? `ml-${Math.min(level * 4, 16)}` : '';

  return (
    <div className={`${leftBorderColor} ${marginLeft} ${level > 0 ? 'pl-4' : ''}`}>
      <div className="space-y-3">
        {/* Comment header */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="font-medium text-foreground">u/{comment.author_name}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(comment.created_at)}</span>
          </div>
        </div>

        {/* Comment content */}
        <p className="text-sm text-foreground leading-relaxed">
          {comment.content}
        </p>

        {/* Comment actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`p-1 h-auto ${userVote === 'up' ? 'text-upvote' : 'text-vote-text hover:text-upvote'}`}
              onClick={() => handleVote('up')}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <span className={`text-xs font-medium ${userVote === 'up' ? 'text-upvote' : userVote === 'down' ? 'text-downvote' : 'text-vote-text'}`}>
              {currentScore}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={`p-1 h-auto ${userVote === 'down' ? 'text-downvote' : 'text-vote-text hover:text-downvote'}`}
              onClick={() => handleVote('down')}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Reply
          </Button>
        </div>

        {/* Reply form placeholder */}
        {showReplyForm && (
          <div className="p-3 bg-secondary/30 rounded border border-border">
            <p className="text-xs text-muted-foreground">Reply functionality coming soon...</p>
          </div>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4 mt-4">
            {comment.replies.map((reply) => (
              <CommentCard key={reply.id} comment={reply} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
