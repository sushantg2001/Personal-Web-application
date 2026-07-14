import type { Metadata } from "next";
import { getAllPosts, getCategories } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/site/post-card";

export const metadata: Metadata = {
  title: "writing",
  description:
    "Field notes on infrastructure, working with Claude, and notes that compound.",
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getCategories();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-10">
        <p className="label mb-4">
          <span className="idx">01/</span> Writing
        </p>
        <h1 className="font-serif text-[34px] font-normal leading-tight">
          Field notes
          <span className="text-primary">.</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          {posts.length === 0
            ? "Nothing here yet — first note coming soon."
            : `${posts.length} note${posts.length !== 1 ? "s" : ""} on infrastructure, Claude workflows, and things worth writing down.`}
        </p>
      </header>

      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge key={cat} variant="outline">
              {cat}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-col">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </main>
  );
}
