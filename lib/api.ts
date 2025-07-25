// Client-side API functions to replace mock data usage

export interface Topic {
  id: string
  slug: string
  name: string
  description: string
  memberCount: number
  created_at: string
}
export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  url?: string;
  domain?: string;
  linkPreview?: LinkPreview;
}

export interface LinkPreview {
  title: string;
  description: string;
  image?: string;
  url: string;
  domain: string;
}


export interface Comment {
  id: string
  post_id: string
  parent_comment_id?: string
  content: string
  author_name: string
  vote_score: number
  created_at: string
  replies?: Comment[]
}

export const getTopics = async (): Promise<Topic[]> => {
  const response = await fetch("/api/topics")
  if (!response.ok) throw new Error("Failed to fetch topics")
  return response.json()
}

export const getTopicBySlug = async (slug: string): Promise<Topic> => {
  const response = await fetch(`/api/topics/${slug}`)
  if (!response.ok) throw new Error("Failed to fetch topic")
  return response.json()
}
export const detectUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};
export const getPostsByTopicSlug = async (slug: string): Promise<Post[]> => {
  const response = await fetch(`/api/topics/${slug}/posts`)
  if (!response.ok) throw new Error("Failed to fetch posts")
  return response.json()
}

export const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  const response = await fetch(`/api/posts/${postId}/comments`)
  if (!response.ok) throw new Error("Failed to fetch comments")
  return response.json()
}

export const createPost = async (
  slug: string,
  postData: {
    title: string
    content?: string
    url?: string
    post_type?: string
  },
): Promise<Post> => {
  const response = await fetch(`/api/topics/${slug}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData),
  })
  if (!response.ok) throw new Error("Failed to create post")
  return response.json()
}

export const createComment = async (
  postId: string,
  commentData: {
    content: string
    parent_comment_id?: string
  },
): Promise<Comment> => {
  const response = await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(commentData),
  })
  if (!response.ok) throw new Error("Failed to create comment")
  return response.json()
}

export const vote = async (targetId: string, targetType: "post" | "comment", voteValue: 1 | -1) => {
  const response = await fetch("/api/votes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      target_id: targetId,
      target_type: targetType,
      vote_value: voteValue,
    }),
  })
  if (!response.ok) throw new Error("Failed to process vote")
  return response.json()
}
