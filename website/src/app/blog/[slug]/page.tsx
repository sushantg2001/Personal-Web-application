import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAllSlugs, getPost, formatDateISO } from "@/lib/blog";
import { PostBody } from "@/components/blog/PostBody";
import { Badge } from "@/components/ui/badge";

// Next.js 15: params is a Promise
interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: [...post.tags],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/blog"
        className="group mb-10 inline-flex items-center gap-1.5 font-mono text-xs lowercase text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        all posts
      </Link>

      <header className="mb-10">
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <time
            dateTime={post.date}
            className="font-mono text-[12.5px] text-muted-foreground"
          >
            {formatDateISO(post.date)}
          </time>
          <span className="font-mono text-[11.5px] text-muted-foreground">
            {post.readingTime} min
          </span>
          {post.category && <Badge variant="secondary">{post.category}</Badge>}
        </div>

        <h1 className="font-serif text-[30px] font-normal leading-[1.2] md:text-[34px]">
          {post.title}
        </h1>

        {post.description && (
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {post.description}
          </p>
        )}

        {post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {post.cover && (
          <div className="mt-8 overflow-hidden rounded-lg border">
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

      <hr className="mb-10" />

      <PostBody content={post.content} />

      <div className="mt-16 border-t pt-8">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-1.5 font-mono text-xs lowercase text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          all posts
        </Link>
      </div>
    </main>
  );
}
