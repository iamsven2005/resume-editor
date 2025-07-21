import { formatDate, getBlogPosts } from '@/app/patch/utils'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export function BlogPosts() {
    let allBlogs = getBlogPosts()

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">
                    Blog
                </CardTitle>
            </CardHeader>
            <CardContent>

                {allBlogs
                    .sort((a, b) => {
                        if (
                            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
                        ) {
                            return -1
                        }
                        return 1
                    })
                    .map((post: any) => (
                        <Link
                            key={post.slug}
                            className="flex flex-col space-y-1 m-5 gap-5"
                            href={`/patch/${post.slug}`}
                        >

                            <CardDescription>
                                {formatDate(post.metadata.publishedAt, false)}
                            </CardDescription>
                            <CardTitle>
                                {post.metadata.title}
                            </CardTitle>
                            <hr />
                        </Link>
                    ))}
            </CardContent>

        </Card>
    )
}
