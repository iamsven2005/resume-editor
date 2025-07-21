import { notFound } from 'next/navigation';
import { CustomMDX } from '@/components/mdx';
import { formatDate, getBlogPosts } from '../utils';
import { baseUrl } from '@/app/sitemap';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ClipboardLink from '@/components/clipboard';

export default function Blog({ params }: any) {
  let post = getBlogPosts().find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  const postUrl = `${baseUrl}/patch/${post.slug}`;

  return (
    <section className='mx-auto flex flex-col p-5 m-5 items-center justify-center'>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: postUrl,
            author: {
              '@type': 'Person',
              name: 'My Portfolio',
            },
          }),
        }}
      />
      <h1 className="font-semibold text-2xl tracking-tighter">
        {post.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {formatDate(post.metadata.publishedAt)}
        </p>
      </div>
      <ClipboardLink url={postUrl} /> 
      <article className="prose dark:prose-invert">
        <CustomMDX source={post.content} />
        <Button variant={"link"}>
          <Link href={"/patch"}>
            Back to blogs
          </Link>
        </Button>
      </article>
    </section>
  );
}
