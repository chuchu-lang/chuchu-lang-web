import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogAmbient from "@/components/blog-ambient";
import BlogCover from "@/components/blog-cover";
import BlogMarkdown, { stripLeadingTitle } from "@/components/blog-markdown";
import SiteFooter from "@/components/site-footer";
import SiteNav from "@/components/site-nav";
import { formatBlogDate, getBlogPost, getBlogPosts } from "@/lib/hygraph";
import { hygraphPostStructuredData } from "@/lib/hygraph-structured-data";
import { JsonLd } from "@/lib/json-ld";
import { site } from "@/lib/site";

/**
 * Unknown slugs wait for a full render, so a missing article answers with a
 * real 404 status rather than a streamed "not found" body.
 */
export const ensureStatic = "navigation";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Prerender the posts published at build time. Anything published later is
 * rendered on its first request and then cached (see lib/hygraph.ts), so new
 * articles never need a redeploy. If Hygraph is unreachable during the build,
 * nothing is prerendered and every post is rendered on demand instead.
 */
export async function generateStaticParams() {
  const result = await getBlogPosts();
  if (!result.ok || result.data.length === 0) {
    // Cache Components requires at least one entry; this placeholder resolves
    // to a 404 and is never linked or listed in the sitemap.
    return [{ slug: "_" }];
  }
  return result.data.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBlogPost(slug);

  if (!result.ok) {
    // Hygraph outage: do not index a degraded page.
    return { title: "Blog", robots: { index: false } };
  }
  if (!result.data) {
    notFound();
  }

  const post = result.data;
  const path = `/blog/${post.slug}`;
  const description = post.excerpt || undefined;
  const images = post.imageUrl ? [{ url: post.imageUrl }] : undefined;

  return {
    title: post.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      siteName: site.name,
      title: `${post.title} · ${site.name}`,
      description,
      publishedTime: post.createdAt,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: `${post.title} · ${site.name}`,
      description,
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
  };
}

function PostContent({ result }: { result: Awaited<ReturnType<typeof getBlogPost>> }) {
  if (!result.ok) {
    return (
      <div className="wrap about-section">
        <div className="glass card blog-state" role="status">
          <h2>This article is temporarily unavailable</h2>
          <p>
            We could not load it right now. Please try again in a few minutes.
          </p>
          <Link className="blog-back" href="/blog">
            <span aria-hidden="true">&larr;</span> Back to the blog
          </Link>
        </div>
      </div>
    );
  }

  const post = result.data;
  if (!post) {
    notFound();
  }

  const body = stripLeadingTitle(post.markdown, post.title);

  return (
    <>
      <JsonLd data={hygraphPostStructuredData(post)} />

      <header className="wrap about-hero blog-post-hero">
        <Link className="blog-back" href="/blog">
          <span aria-hidden="true">&larr;</span> Back to the blog
        </Link>
        <div className="blog-meta">
          <time dateTime={post.createdAt}>{formatBlogDate(post.createdAt)}</time>
        </div>
        <h1 className="blog-post-title">{post.title}</h1>
        {post.excerpt ? <p className="blog-post-lede">{post.excerpt}</p> : null}
      </header>

      <div className="wrap about-section blog-article-wrap">
        {post.imageUrl ? (
          <div className="blog-article-cover">
            <BlogCover
              src={post.imageUrl}
              alt={`Cover image for ${post.title}`}
              sizes="(max-width: 1100px) 100vw, 780px"
              eager
            />
          </div>
        ) : null}

        {body.trim() ? (
          <article className="blog-prose">
            <BlogMarkdown markdown={body} />
          </article>
        ) : (
          <p className="blog-state-text">This article has no content yet.</p>
        )}

        <footer className="blog-article-footer">
          <Link className="blog-back" href="/blog">
            <span aria-hidden="true">&larr;</span> More articles
          </Link>
          <a className="blog-aside-link" href={site.links.docs}>
            Read the documentation <span aria-hidden="true">&rarr;</span>
          </a>
        </footer>
      </div>
    </>
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Resolved before rendering the shell (the fetch is cached) so an unknown
  // slug produces a real 404 response instead of a streamed "not found" body.
  const { slug } = await params;
  const result = await getBlogPost(slug);
  if (result.ok && !result.data) {
    notFound();
  }

  return (
    <div id="top" className="v2">
      <BlogAmbient />
      <SiteNav current="blog" />
      <PostContent result={result} />
      <SiteFooter />
    </div>
  );
}
