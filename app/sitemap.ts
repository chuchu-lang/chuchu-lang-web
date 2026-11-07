import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/blog";
import { getBlogPosts } from "@/lib/hygraph";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Published Hygraph posts, refreshed on the same five-minute cache as the
  // blog itself. If Hygraph is down the sitemap still lists every other URL.
  const hygraph = await getBlogPosts();
  const hygraphPosts = hygraph.ok ? hygraph.data : [];

  return [
    {
      url: absoluteUrl("/"),
      // Fixed value: new Date() is not allowed here with cacheComponents enabled.
      lastModified: "2026-10-29",
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl("/about"),
      // Fixed value: new Date() is not allowed here with cacheComponents enabled.
      lastModified: "2026-10-29",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/download"),
      // Fixed value: new Date() is not allowed here with cacheComponents enabled.
      lastModified: "2026-10-29",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/blogs"),
      // Tracks the newest post instead of using new Date(), which
      // cacheComponents does not allow here.
      lastModified: POSTS[0]?.date ?? "2026-10-29",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: hygraphPosts[0]?.createdAt ?? "2026-10-29",
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...hygraphPosts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...POSTS.map((post) => ({
      url: absoluteUrl(`/blogs/${post.slug}`),
      lastModified: post.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
