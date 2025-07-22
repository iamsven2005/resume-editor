export interface Topic {
  id: string;
  slug: string;
  name: string;
  description: string;
  memberCount: number;
  created_at: string;
}

export interface Post {
  id: string;
  topic_id: string;
  title: string;
  content?: string;
  url?: string;
  post_type: 'text' | 'link' | 'image';
  author_name: string;
  vote_score: number;
  comment_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  parent_comment_id?: string;
  content: string;
  author_name: string;
  vote_score: number;
  created_at: string;
  replies?: Comment[];
}

export const mockTopics: Topic[] = [
  {
    id: '1',
    slug: 'programming',
    name: 'Programming',
    description: 'Discussion about programming and software development',
    memberCount: 125000,
    created_at: '2023-01-15T10:00:00Z'
  },
  {
    id: '2',
    slug: 'technology',
    name: 'Technology',
    description: 'Latest tech news and discussions',
    memberCount: 89000,
    created_at: '2023-02-20T14:30:00Z'
  },
  {
    id: '3',
    slug: 'gaming',
    name: 'Gaming',
    description: 'Video games and gaming culture',
    memberCount: 156000,
    created_at: '2023-03-10T09:15:00Z'
  },
  {
    id: '4',
    slug: 'react',
    name: 'React',
    description: 'Everything about React development',
    memberCount: 78000,
    created_at: '2023-04-05T16:45:00Z'
  },
  {
    id: '5',
    slug: 'webdev',
    name: 'Web Development',
    description: 'Frontend, backend, and full-stack development',
    memberCount: 201000,
    created_at: '2023-01-28T11:20:00Z'
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    topic_id: '1',
    title: 'Just built my first full-stack app with React and Node.js!',
    content: "After months of learning, I finally deployed my first real project. It's a task management app with authentication, real-time updates, and a clean UI. The journey was challenging but incredibly rewarding!",
    post_type: 'text',
    author_name: 'CodeNinja42',
    vote_score: 147,
    comment_count: 23,
    created_at: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    topic_id: '1',
    title: 'Best practices for handling async operations in JavaScript',
    content: "I've been working with async/await and Promises for a while now, but I'm curious about the community's thoughts on best practices. When do you use Promise.all vs Promise.allSettled? How do you handle error boundaries in async functions?",
    post_type: 'text',
    author_name: 'AsyncMaster',
    vote_score: 89,
    comment_count: 34,
    created_at: '2024-01-19T09:45:00Z'
  },
  {
    id: '3',
    topic_id: '2',
    title: 'Apple announces new M4 chip with 40% better performance',
    url: 'https://example.com/apple-m4-chip-announcement',
    post_type: 'link',
    author_name: 'TechReporter',
    vote_score: 234,
    comment_count: 67,
    created_at: '2024-01-18T14:20:00Z'
  },
  {
    id: '4',
    topic_id: '3',
    title: 'Baldur\'s Gate 3 wins Game of the Year at The Game Awards!',
    content: "What an incredible year for gaming! BG3 absolutely deserved this award. The depth of storytelling, character development, and player choice is unmatched. What were your favorite moments from the game?",
    post_type: 'text',
    author_name: 'RPGFanatic',
    vote_score: 312,
    comment_count: 89,
    created_at: '2024-01-17T20:15:00Z'
  },
  {
    id: '5',
    topic_id: '4',
    title: 'React 19 Beta: What\'s new and exciting?',
    content: "The React 19 beta is out and there are some amazing new features! Server Components are now stable, the new compiler looks promising, and the concurrent features are more robust. Who else is excited to try these out?",
    post_type: 'text',
    author_name: 'ReactDevPro',
    vote_score: 156,
    comment_count: 42,
    created_at: '2024-01-16T12:30:00Z'
  }
];

export const mockComments: Comment[] = [
  {
    id: '1',
    post_id: '1',
    content: "Congratulations! That's a huge milestone. What tech stack did you end up using for the backend?",
    author_name: 'StackOverflow_Helper',
    vote_score: 12,
    created_at: '2024-01-20T16:00:00Z'
  },
  {
    id: '2',
    post_id: '1',
    content: "Amazing work! I remember my first full-stack project - such a great feeling when everything clicks together. Mind sharing the GitHub repo?",
    author_name: 'OpenSourceFan',
    vote_score: 8,
    created_at: '2024-01-20T16:15:00Z'
  },
  {
    id: '3',
    post_id: '1',
    parent_comment_id: '1',
    content: "Thanks! I used Express.js with MongoDB and Socket.io for real-time features. The authentication was the trickiest part.",
    author_name: 'CodeNinja42',
    vote_score: 5,
    created_at: '2024-01-20T16:30:00Z'
  }
];

export const getTopicBySlug = (slug: string): Topic | undefined => {
  return mockTopics.find(topic => topic.slug === slug);
};

export const getPostsByTopicId = (topicId: string): Post[] => {
  return mockPosts.filter(post => post.topic_id === topicId);
};

export const getCommentsByPostId = (postId: string): Comment[] => {
  const comments = mockComments.filter(comment => comment.post_id === postId);
  
  // Organize comments with replies
  const topLevelComments = comments.filter(comment => !comment.parent_comment_id);
  const repliesMap = new Map<string, Comment[]>();
  
  comments.filter(comment => comment.parent_comment_id).forEach(reply => {
    const parentId = reply.parent_comment_id!;
    if (!repliesMap.has(parentId)) {
      repliesMap.set(parentId, []);
    }
    repliesMap.get(parentId)!.push(reply);
  });
  
  return topLevelComments.map(comment => ({
    ...comment,
    replies: repliesMap.get(comment.id) || []
  }));
};
