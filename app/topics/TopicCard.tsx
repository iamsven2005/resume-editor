import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import type { Topic } from '@/data/mockData';

interface TopicCardProps {
  topic: Topic;
}

export const TopicCard = ({ topic }: TopicCardProps) => {
  return (
    <Link href={`/topics/${topic.slug}`} passHref>
      <a className="block">
        <Card className="p-6 hover:bg-secondary/50 transition-colors border border-border">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
                  r/{topic.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {topic.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{topic.memberCount.toLocaleString()} members</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Created {new Date(topic.created_at).getFullYear()}</span>
              </div>
            </div>

            <Badge variant="secondary" className="w-fit">
              Community
            </Badge>
          </div>
        </Card>
      </a>
    </Link>
  );
};
