// Public GitHub data, fetched once at build time (the site is a static
// export). Failures degrade to an empty list — the page renders a fallback.

import { siteConfig } from "@/config/site";

export interface Repo {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  pushedAt: string;
}

interface GithubRepoResponse {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
}

export async function getRepos(): Promise<Repo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${siteConfig.github.username}/repos?sort=pushed&per_page=30&type=owner`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": `${siteConfig.domain} (build)`,
        },
      }
    );
    if (!res.ok) return [];

    const repos = (await res.json()) as GithubRepoResponse[];
    return repos
      .filter((r) => !r.fork && !r.archived)
      .slice(0, siteConfig.github.maxRepos)
      .map((r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        language: r.language,
        stars: r.stargazers_count,
        pushedAt: r.pushed_at,
      }));
  } catch {
    return [];
  }
}
