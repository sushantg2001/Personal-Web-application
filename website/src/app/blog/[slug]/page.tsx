// app/src/app/blog/[slug]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getAllSlugs, getPost, formatDate } from '@/lib/blog'
import { PostBody } from '@/components/blog/PostBody'

// Next.js 15: params is a Promise
interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllSlugs()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}

  return {
    title: `${post.title} — Sushant Gupta`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">

      <Link
        href="/blog"
        className="font-mono text-xs mb-10 block"
        style={{ color: 'var(--dim)' }}
      >
        ← blog
      </Link>

      <header className="mb-10">
        <h1
          className="text-3xl font-bold tracking-tight leading-tight mb-4"
          style={{ color: 'var(--text)' }}
        >
          {post.title}
        </h1>

        <div
          className="flex flex-wrap gap-4 font-mono text-xs"
          style={{ color: 'var(--dim)' }}
        >
          <span>{formatDate(post.date)}</span>
          <span>{post.readingTime} min read</span>
          {post.category && <span>{post.category}</span>}
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="font-mono text-xs px-2 py-0.5 border"
                style={{ borderColor: 'var(--border)', color: 'var(--dim)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {post.cover && (
          <div
            className="mt-8 rounded overflow-hidden border"
            style={{ borderColor: 'var(--border)' }}
          >
            <Image
              src={`/blog/images/${post.cover}`}
              alt={post.title}
              width={800}
              height={400}
              className="w-full object-cover"
            />
          </div>
        )}
      </header>

      <hr className="mb-10" style={{ borderColor: 'var(--border)' }} />

      <PostBody content={post.content} />

      <div className="mt-16 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
        <Link
          href="/blog"
          className="font-mono text-xs"
          style={{ color: 'var(--dim)' }}
        >
          ← all posts
        </Link>
      </div>

    </main>
  )
}