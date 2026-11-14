import Link from "next/link";
import type { PostMeta } from "@/lib/blog";
import { formatDateISO } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={post.href}
      className="group grid gap-2 border-t py-5 last:border-b sm:grid-cols-[120px_1fr] sm:gap-5"
    >
      <time
        dateTime={post.date}
        className="pt-1 font-mono text-[12.5px] text-muted-foreground"
      >
        {formatDateISO(post.date)}
      </time>
      <div>
        <h3 className="font-serif text-[21px] font-normal leading-snug transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        {post.description && (
          <p className="mt-1.5 line-clamp-2 text-[14.5px] text-muted-foreground">
            {post.description}
          </p>
        )}
        <div className="mt-2.5 flex items-center gap-2">
          {post.category && <Badge variant="secondary">{post.category}</Badge>}
          <span className="font-mono text-[11.5px] text-muted-foreground">
            {post.readingTime} min
          </span>
        </div>
      </div>
    </Link>
  );
}
