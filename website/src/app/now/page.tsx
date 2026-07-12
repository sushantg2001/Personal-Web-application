import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "now",
  description: "What I'm focused on right now.",
};

export default function NowPage() {
  const { updated, items } = siteConfig.now;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-4">
        <p className="label mb-4">
          <span className="idx">04/</span> Now
        </p>
        <h1 className="font-serif text-[34px] font-normal leading-tight">
          What has my attention
          <span className="text-primary">.</span>
        </h1>
        <p className="mt-3 font-mono text-[12.5px] text-muted-foreground">
          updated {updated}
        </p>
      </header>

      <div className="mt-8 flex flex-col">
        {items.map((item) => (
          <div key={item.title} className="border-t py-6 last:border-b">
            <h2 className="font-serif text-[21px] font-normal leading-snug">
              {item.title}
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-10 max-w-[52ch] text-sm text-muted-foreground">
        This is a{" "}
        <a
          href="https://nownownow.com/about"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-primary decoration-[1.5px] underline-offset-[3px] transition-colors hover:text-primary"
        >
          now page
        </a>
        {" "}— a public answer to &ldquo;what are you up to these days?&rdquo; It
        changes
        when life does.
      </p>
    </main>
  );
}
