-- Test script to verify comment search functionality
-- This script adds some test comments to verify search works

-- Insert test comments if they don't exist
INSERT INTO comments (id, post_id, content, author_name, vote_score, created_at)
SELECT 
  'test-comment-1',
  (SELECT id FROM posts LIMIT 1),
  'This is a test comment about JavaScript programming and web development',
  'test_user_1',
  5,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM comments WHERE id = 'test-comment-1');

INSERT INTO comments (id, post_id, content, author_name, vote_score, created_at)
SELECT 
  'test-comment-2',
  (SELECT id FROM posts LIMIT 1),
  'Another test comment discussing React hooks and state management',
  'test_user_2',
  3,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM comments WHERE id = 'test-comment-2');

INSERT INTO comments (id, post_id, content, author_name, vote_score, created_at)
SELECT 
  'test-comment-3',
  (SELECT id FROM posts LIMIT 1),
  'A comment about database optimization and SQL performance',
  'test_user_3',
  7,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM comments WHERE id = 'test-comment-3');

-- Test the search functionality
SELECT 'Testing comment search...' as status;

-- Test search for 'JavaScript'
SELECT 
  c.content,
  c.author_name,
  p.title as post_title,
  t.name as topic_name
FROM comments c
JOIN posts p ON c.post_id = p.id
JOIN topics t ON p.topic_id = t.id
WHERE LOWER(c.content) LIKE LOWER('%javascript%')
ORDER BY c.created_at DESC;

-- Test search for 'React'
SELECT 
  c.content,
  c.author_name,
  p.title as post_title,
  t.name as topic_name
FROM comments c
JOIN posts p ON c.post_id = p.id
JOIN topics t ON p.topic_id = t.id
WHERE LOWER(c.content) LIKE LOWER('%react%')
ORDER BY c.created_at DESC;
