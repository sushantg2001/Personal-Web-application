// app/src/lib/blog.ts

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// ── Types ─────────────────────────────────────────────────────────

export interface PostMeta {
  title: string
  date: string
  description: string
  tags: string[]
  cover?: string
  slug: string
  category: string       // from subfolder name — used for filtering/display only
  href: string           // /blog/slug (flat)
  readingTime: number
}

export interface Post extends PostMeta {
  content: string
}

// ── Constants ─────────────────────────────────────────────────────

const CONTENT_DIR = path.join(process.cwd(), 'content/blog')

// ── Helpers ───────────────────────────────────────────────────────

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function parsePost(filePath: string, slug: string, category: string): Post {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  return {
    title: data.title ?? slug,
    date: data.date
      ? new Date(data.date).toISOString()
      : new Date().toISOString(),
    description: data.description ?? '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    cover: data.cover,
    slug,
    category,
    href: `/blog/${slug}`,          // flat URL
    readingTime: estimateReadingTime(content),
    content,
  }
}

// ── Public API ────────────────────────────────────────────────────

/**
 * Get all posts sorted newest first.
 * Walks all subdirectories — category is derived from subfolder name.
 * All slugs are unique and flat: /blog/slug
 */
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return []

  const posts: PostMeta[] = []

  function walk(dir: string, category = '') {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry)
      const stat = fs.statSync(full)

      if (stat.isDirectory()) {
        walk(full, entry)           // subfolder name becomes category
      } else if (entry.endsWith('.md')) {
        const slug = entry.replace(/\.md$/, '')
        posts.push(parsePost(full, slug, category))
      }
    }
  }

  walk(CONTENT_DIR)

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

/**
 * Get a single post by slug.
 * Searches all subdirectories — slug must be unique across all posts.
 */
export function getPost(slug: string): Post | null {
  if (!fs.existsSync(CONTENT_DIR)) return null

  function find(dir: string, category = ''): Post | null {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry)
      const stat = fs.statSync(full)

      if (stat.isDirectory()) {
        const result = find(full, entry)
        if (result) return result
      } else if (entry === `${slug}.md`) {
        return parsePost(full, slug, category)
      }
    }
    return null
  }

  return find(CONTENT_DIR)
}

/**
 * Get all slugs — used by generateStaticParams.
 */
export function getAllSlugs(): { slug: string }[] {
  return getAllPosts().map(post => ({ slug: post.slug }))
}

/**
 * Get all unique categories — used for filtering on /blog.
 */
export function getCategories(): string[] {
  const cats = getAllPosts()
    .map(p => p.category)
    .filter(Boolean)
  return [...new Set(cats)].sort()
}

/**
 * Get all unique tags.
 */
export function getAllTags(): string[] {
  const tags = getAllPosts().flatMap(p => p.tags)
  return [...new Set(tags)].sort()
}

/**
 * Format ISO date string for display.
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}