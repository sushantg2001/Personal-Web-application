// Single source of truth for site content and structure.
// Adding a nav item, social link, project, or focus area here is all
// that's needed — components render from this config.

import { Mail, Globe, Terminal } from "lucide-react";
import { GithubIcon, LinkedinIcon, YoutubeIcon, type Icon } from "@/components/site/icons";

export interface NavItem {
  label: string;
  href: string;
  /** Hide from nav without deleting the entry (e.g. sections not live yet). */
  hidden?: boolean;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: Icon;
  hidden?: boolean;
}

export interface Project {
  name: string;
  description: string;
  tags: string[];
  /** Optional moss-highlighted status chip, e.g. "live". */
  highlight?: string;
  href?: string;
}

export interface FocusArea {
  title: string;
  description: string;
}

export interface Video {
  /** YouTube video id, e.g. "dQw4w9WgXcQ" — used for link + thumbnail. */
  id: string;
  title: string;
  description: string;
  /** Topic chip, e.g. "claude code". */
  topic?: string;
  /** ISO date published. */
  date?: string;
}

export const siteConfig = {
  name: "Sushant Gupta",
  domain: "sushantgupta.cloud",
  url: "https://sushantgupta.cloud",
  title: "Sushant Gupta — field notes",
  description:
    "Builder of small, durable systems. Field notes on working with Claude, self-hosting, and notes that compound.",
  tagline: "field notes",
  headline: "Builder of small, durable systems",
  location: "New Delhi",
  intro:
    "I build for the web and obsess over the infrastructure underneath it — and I write down what I learn about working with Claude, self-hosting, and keeping notes that compound.",

  nav: [
    { label: "writing", href: "/blog" },
    { label: "projects", href: "/projects" },
    { label: "videos", href: "/videos" },
    { label: "now", href: "/now" },
  ] as NavItem[],

  github: {
    username: "sushantg2001",
    url: "https://github.com/sushantg2001",
    /** Max repos shown on /projects (fetched at build time). */
    maxRepos: 8,
  },

  youtube: {
    /** Flip to the real handle when the channel goes live. */
    channelUrl: "https://youtube.com/@sushantg2001",
    live: false,
  },

  /** Curated videos shown on /videos once published. Thumbnails come from
   *  i.ytimg.com automatically. Empty = "coming soon" state. */
  videos: [] as Video[],

  /** The /now page — update these whenever life changes. */
  now: {
    updated: "2026-07-07",
    items: [
      {
        title: "Building this site in public",
        description:
          "Field-notes redesign shipped; now wiring up videos, projects, and an RSS feed. The whole loop runs through Claude Code and Claude Design.",
      },
      {
        title: "Writing about Claude workflows",
        description:
          "Coding, finance reviews, and knowledge management — one honest write-up per system, as each one stabilizes.",
      },
      {
        title: "Running my own infrastructure",
        description:
          "A VPS with Traefik, Seafile, and GitHub Actions deployments. Boring on purpose.",
      },
    ],
  },

  socials: [
    { label: "github", href: "https://github.com/sushantg2001", icon: GithubIcon },
    { label: "mail", href: "mailto:sushantg2001@gmail.com", icon: Mail },
    { label: "rss", href: "/rss.xml", icon: Globe },
    { label: "linkedin", href: "https://linkedin.com/in/sushantg2001", icon: LinkedinIcon, hidden: true },
    { label: "peerlist", href: "https://peerlist.io/sushantg2001", icon: Globe, hidden: true },
    { label: "youtube", href: "https://youtube.com/@sushantg2001", icon: YoutubeIcon, hidden: true },
    { label: "terminal", href: "/terminal", icon: Terminal },
  ] satisfies SocialLink[],

  focusAreas: [
    {
      title: "Claude for coding",
      description:
        "Agentic workflows, Claude Code in real projects, and what changes when the terminal writes back.",
    },
    {
      title: "Claude for finance",
      description:
        "Investment reviews, portfolio tracking, and monthly reconciliation with an AI in the loop.",
    },
    {
      title: "Knowledge management",
      description:
        "Obsidian, structured vaults, and turning scattered notes into a system that compounds.",
    },
  ] satisfies FocusArea[],

  projects: [
    {
      name: "personal-infra",
      description:
        "Self-hosted stack on a VPS — Traefik, Seafile, and GitHub Actions deployments.",
      tags: ["docker", "vps"],
      href: "https://storage.sushantgupta.cloud",
    },
    {
      name: "sushantgupta.cloud",
      description:
        "This site — Next.js static export shipped through Docker and GHCR.",
      tags: ["next.js"],
      highlight: "live",
      href: "https://github.com/sushantg2001",
    },
  ] satisfies Project[],

  stack: [
    "TypeScript",
    "Next.js",
    "React",
    "Node.js",
    "Docker",
    "Linux",
    "Python",
    "PostgreSQL",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
