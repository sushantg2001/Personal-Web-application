import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { siteConfig } from "@/config/site";
import { getRepos } from "@/lib/github";
import { formatDateISO } from "@/lib/blog";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/site/section";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "projects",
  description: "Ongoing development — curated projects and what's moving on GitHub.",
};

export default async function ProjectsPage() {
  const repos = await getRepos();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 md:px-8">
      <header>
        <p className="label mb-4">
          <span className="idx">02/</span> Projects
        </p>
        <h1 className="font-serif text-[34px] font-normal leading-tight">
          Ongoing development
          <span className="text-primary">.</span>
        </h1>
        <p className="mt-3 max-w-[56ch] text-muted-foreground">
          Things I&apos;m actively building and maintaining. The GitHub list below is
          generated from what actually moved recently — no showcase archaeology.
        </p>
      </header>

      <Section title="Featured" index="a">
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

      <Section
        title="Recently pushed on GitHub"
        index="b"
        link={{ label: "full profile", href: siteConfig.github.url }}
        className="pb-24"
      >
        {repos.length === 0 ? (
          <div className="border-t py-8">
            <p className="text-muted-foreground">
              GitHub wasn&apos;t reachable when this page was built.
            </p>
            <Link
              href={siteConfig.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "mono" })}
              style={{ marginTop: "1rem", display: "inline-flex" }}
            >
              github/{siteConfig.github.username}
              <ArrowUpRight />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            {repos.map((repo) => (
              <Link
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-2 border-t py-5 last:border-b sm:grid-cols-[120px_1fr]"
              >
                <time
                  dateTime={repo.pushedAt}
                  className="pt-0.5 font-mono text-[12.5px] text-muted-foreground"
                >
                  {formatDateISO(repo.pushedAt)}
                </time>
                <div>
                  <span className="font-mono text-[15px] transition-colors group-hover:text-primary">
                    {repo.name}
                    <ArrowUpRight className="ml-1 inline size-3.5 text-muted-foreground" />
                  </span>
                  {repo.description && (
                    <p className="mt-1 text-[14.5px] text-muted-foreground">
                      {repo.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    {repo.language && (
                      <Badge variant="secondary">{repo.language.toLowerCase()}</Badge>
                    )}
                    {repo.stars > 0 && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-muted-foreground">
                        <Star className="size-3" /> {repo.stars}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <p className="mt-6 font-mono text-[11.5px] text-muted-foreground">
          snapshot taken at build time · deploys refresh it
        </p>
      </Section>
    </main>
  );
}
