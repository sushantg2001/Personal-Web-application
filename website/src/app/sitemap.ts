import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/blog", "/projects", "/videos", "/now"].map((path) => ({
    url: `${siteConfig.url}${path}/`,
    lastModified: new Date(),
  }));

  const posts = getAllPosts().map((post) => ({
    url: `${siteConfig.url}${post.href}/`,
    lastModified: new Date(post.date),
  }));

  return [...pages, ...posts];
}
