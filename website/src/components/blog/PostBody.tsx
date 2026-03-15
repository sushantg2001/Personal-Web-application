// app/src/components/blog/PostBody.tsx
// Server Component — renders markdown on the server, ships no JS to client
// Uses remark + rehype pipeline for full markdown support

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'           // tables, strikethrough, task lists
import remarkBreaks from 'remark-breaks'      // single line breaks
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'          // adds id to headings
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight' // syntax highlighting
import rehypeStringify from 'rehype-stringify'

interface Props {
  content: string
}

export async function PostBody({ content }: Props) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content)

  return (
    <article
      className="prose"
      dangerouslySetInnerHTML={{ __html: result.toString() }}
    />
  )
}