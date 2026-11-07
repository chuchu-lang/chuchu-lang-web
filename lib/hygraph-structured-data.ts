import type { BlogPost, BlogPostSummary } from "./hygraph";
import { absoluteUrl, site } from "./site";
import { LANGUAGE_ID, ORGANIZATION_ID, WEBSITE_ID } from "./structured-data";

/**
 * schema.org nodes for the Hygraph-powered /blog routes. Only fields that
 * exist in the BlogPost model are used; there is no per-article author, so the
 * publisher is the site's existing Organization node.
 */

const BLOG_ID = `${absoluteUrl("/blog")}#blog`;

export function hygraphBlogStructuredData(posts: BlogPostSummary[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": BLOG_ID,
    url: absoluteUrl("/blog"),
    name: "Chuchu Blog",
    description:
      "Chuchu Lang tutorials, release announcements, compiler engineering insights, and updates about our programming language.",
    inLanguage: site.language,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: post.createdAt,
    })),
  };
}

export function hygraphPostStructuredData(post: BlogPost) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#post`,
    url,
    mainEntityOfPage: url,
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(post.imageUrl ? { image: [post.imageUrl] } : {}),
    datePublished: post.createdAt,
    inLanguage: site.language,
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": BLOG_ID },
    about: { "@id": LANGUAGE_ID },
  };
}
