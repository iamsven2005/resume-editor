export interface Topic {
  id: string
  slug: string
  name: string
  description: string
  created_at: string
  updated_at: string
  post_count?: number
  total_comments?: number
}

export interface Post {
  id: string
  topic_id: string
  title: string
  content?: string
  url?: string
  post_type: "text" | "link" | "image"
  author_name: string
  vote_score: number
  comment_count: number
  created_at: string
  updated_at: string
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
