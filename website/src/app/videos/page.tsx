import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "videos",
  description:
    "Screen-share walkthroughs of the systems on this site — Claude workflows, self-hosting, and knowledge management.",
};

export default function VideosPage() {
  const videos = siteConfig.videos;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 md:px-8">
      <header>
        <p className="label mb-4">
          <span className="idx">03/</span> Videos
        </p>
        <h1 className="font-serif text-[34px] font-normal leading-tight">
          Watch the systems run
          <span className="text-primary">.</span>
        </h1>
        <p className="mt-3 max-w-[56ch] text-muted-foreground">
          The writing on this site explains the systems — the videos will show
          them running, unedited where it counts.
        </p>
      </header>

      {videos.length === 0 ? (
        <>
          {/* Coming-soon state: planned topics from the same config the homepage uses */}
          <section className="py-10">
            <p className="label mb-6">
              <span className="idx">a/</span> Planned series
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {siteConfig.focusAreas.map((area) => (
                <Card key={area.title} className="p-[22px]">
                  <CardHeader className="p-0">
                    <CardTitle className="font-serif text-[19px] font-normal">
                      {area.title}
                    </CardTitle>
                    <CardDescription className="leading-relaxed">
                      {area.description}
                    </CardDescription>
                    <div className="pt-3">
                      <Badge>in production</Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          <section className="border-t py-10 pb-24">
            <p className="max-w-[52ch] text-muted-foreground">
              First uploads are on the way. Subscribe now and they&apos;ll find you,
              or check the writing in the meantime — same systems, text-first.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={siteConfig.youtube.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "mono" })}
              >
                youtube <ArrowUpRight />
              </Link>
              <Link href="/blog" className={buttonVariants({ variant: "outline" })}>
                Read the notes instead
              </Link>
            </div>
          </section>
        </>
      ) : (
        <section className="py-10 pb-24">
          <div className="grid gap-6 sm:grid-cols-2">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="h-full overflow-hidden p-0 transition-colors hover:border-primary">
                  {/* plain img: next/image optimization is off in static export */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                    alt={video.title}
                    className="aspect-video w-full border-b object-cover"
                    loading="lazy"
                  />
                  <CardHeader className="p-[22px]">
                    <CardTitle className="font-serif text-[19px] font-normal transition-colors group-hover:text-primary">
                      {video.title}
                    </CardTitle>
                    <CardDescription className="leading-relaxed">
                      {video.description}
                    </CardDescription>
                    <div className="flex items-center gap-2 pt-2">
                      {video.topic && <Badge variant="secondary">{video.topic}</Badge>}
                      {video.date && (
                        <span className="font-mono text-[11.5px] text-muted-foreground">
                          {video.date}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
