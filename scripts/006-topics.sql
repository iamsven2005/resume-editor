-- Topics/Communities table
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  content TEXT,
  url VARCHAR(500), -- for link posts
  post_type VARCHAR(20) DEFAULT 'text', -- 'text', 'link', 'image'
  author_name VARCHAR(100) NOT NULL, -- hardcoded for now
  vote_score INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- for nested comments
  content TEXT NOT NULL,
  author_name VARCHAR(100) NOT NULL, -- hardcoded for now
  vote_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table (for posts and comments)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier VARCHAR(100) NOT NULL, -- IP or session for now
  target_id UUID NOT NULL, -- post_id or comment_id
  target_type VARCHAR(20) NOT NULL, -- 'post' or 'comment'
  vote_value INTEGER CHECK (vote_value IN (-1, 1)), -- -1 downvote, 1 upvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_identifier, target_id, target_type)
);

-- Indexes for performance
CREATE INDEX idx_posts_topic_id ON posts(topic_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX idx_votes_target ON votes(target_id, target_type);

-- Sample data
INSERT INTO topics (slug, name, description) VALUES 
('programming', 'Programming', 'Discussion about programming and software development'),
('technology', 'Technology', 'Latest tech news and discussions'),
('gaming', 'Gaming', 'Video games and gaming culture');
