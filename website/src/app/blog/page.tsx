// app/src/app/blog/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts, getCategories, formatDate } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog — Sushant Gupta',
  description: 'Writing on infrastructure, development, and things I find interesting.',
}

export default function BlogPage() {
  const posts = getAllPosts()
  const categories = getCategories()

  if (posts.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-24">
        <p style={{ color: 'var(--dim)', fontFamily: 'var(--font-geist-mono)' }}>
          no posts yet
        </p>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">

      {/* Header */}
      <div className="mb-12">
        <Link
          href="/"
          className="font-mono text-xs mb-6 block"
          style={{ color: 'var(--dim)' }}
        >
          ← home
        </Link>
        <h1
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: 'var(--text)' }}
        >
          writing
        </h1>
        <p className="font-mono text-sm" style={{ color: 'var(--dim)' }}>
          {posts.length} post{posts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Category pills — display only, no routing */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <span
              key={cat}
              className="font-mono text-xs px-3 py-1 border"
              style={{ borderColor: 'var(--border)', color: 'var(--dim)' }}
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Post list */}
      <div className="flex flex-col">
        {posts.map(post => (
          <Link
            key={post.slug}
            href={post.href}
            className="group py-5 border-b flex gap-6 items-start"
            style={{ borderColor: 'var(--border)' }}
          >
            {/* Date */}
            <span
              className="font-mono text-xs pt-1 shrink-0 w-24"
              style={{ color: 'var(--dim)' }}
            >
              {formatDate(post.date)}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h2
                className="font-medium mb-1 group-hover:underline"
                style={{ color: 'var(--text)' }}
              >
                {post.title}
              </h2>
              {post.description && (
                <p
                  className="text-sm line-clamp-2"
                  style={{ color: 'var(--dim)' }}
                >
                  {post.description}
                </p>
              )}
              <div className="flex gap-3 mt-2 flex-wrap">
                {post.category && (
                  <span className="font-mono text-xs" style={{ color: 'var(--dim)' }}>
                    {post.category}
                  </span>
                )}
                <span className="font-mono text-xs" style={{ color: 'var(--dim)' }}>
                  {post.readingTime} min read
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </main>
  )
}