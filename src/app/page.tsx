import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { getAllPosts } from "@/lib/blog";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/site/section";
import { PostCard } from "@/components/site/post-card";
import { cn } from "@/lib/utils";

export default function Home() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <main className="mx-auto max-w-4xl px-6 md:px-8">
      {/* Hero */}
      <section className="py-20 md:py-24">
        <p className="label mb-5">
          {siteConfig.name} &nbsp;·&nbsp; {siteConfig.tagline} &nbsp;·&nbsp;{" "}
          {siteConfig.location}
        </p>
        <h1 className="max-w-[16ch] font-serif text-[38px] font-normal leading-[1.12] md:text-[54px]">
          {siteConfig.headline}
          <span className="text-primary">.</span>
        </h1>
        <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
          {siteConfig.intro}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/blog" className={cn(buttonVariants(), "group")}>
            Read the notes
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="https://github.com/sushantg2001"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "mono" })}
          >
            github
            <ArrowUpRight />
          </Link>
        </div>
      </section>

      <hr className="rule-dotted" />

      {/* What I write about */}
      <Section title="Currently exploring" index="01" className="pt-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {siteConfig.focusAreas.map((area) => (
            <Card key={area.title} className="p-[22px] transition-colors hover:border-primary">
              <CardHeader className="p-0">
                <CardTitle className="font-serif text-[19px] font-normal">
                  {area.title}
                </CardTitle>
                <CardDescription className="leading-relaxed">
                  {area.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      {/* Latest writing */}
      {posts.length > 0 && (
        <Section
          title="Latest writing"
          index="02"
          link={{ label: "all posts", href: "/blog" }}
        >
          <div className="flex flex-col">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </Section>
      )}

      {/* Projects */}
      <Section
        title="Projects"
        index="03"
        id="projects"
        link={{ label: "all projects", href: "/projects" }}
        className="pb-24"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {siteConfig.projects.map((project) => {
            const inner = (
              <Card className="h-full p-[22px] transition-colors hover:border-primary">
                <CardHeader className="p-0">
                  <CardTitle className="flex items-center justify-between font-serif text-[19px] font-normal">
                    {project.name}
                    {project.href && (
                      <ArrowUpRight className="size-4 text-muted-foreground" />
                    )}
                  </CardTitle>
                  <CardDescription className="leading-relaxed">
                    {project.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 pt-3">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    {project.highlight && <Badge>{project.highlight}</Badge>}
                  </div>
                </CardHeader>
              </Card>
            );
            return project.href ? (
              <Link
                key={project.name}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
              </Link>
            ) : (
              <div key={project.name}>{inner}</div>
            );
          })}
        </div>
      </Section>
    </main>
  );
}
