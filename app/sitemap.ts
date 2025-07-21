import { getBlogPosts } from "./patch/utils"

export const baseUrl = 'https://sparkjob.app'

export default async function sitemap() {
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/patch/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  let routes = ['', '/patch'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogs]
}
