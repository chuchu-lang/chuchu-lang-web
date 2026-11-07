import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Suspense } from "react";
import Link from "next/link";
import BlogAmbient from "@/components/blog-ambient";
import BlogCover from "@/components/blog-cover";
import SiteFooter from "@/components/site-footer";
import SiteNav from "@/components/site-nav";
import { formatBlogDate, getBlogPosts } from "@/lib/hygraph";
import { hygraphBlogStructuredData } from "@/lib/hygraph-structured-data";
import { JsonLd } from "@/lib/json-ld";
import { site } from "@/lib/site";

// Lets style objects carry CSS custom properties like --d.
type Vars = CSSProperties & Record<`--${string}`, string>;

const TITLE = "Chuchu Blog | Tutorials, Updates & Programming Insights";
const DESCRIPTION =
  "Explore Chuchu Lang tutorials, release announcements, compiler engineering insights, and updates about our programming language.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: "/blog",
    siteName: site.name,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

async function Posts() {
  const result = await getBlogPosts();

  if (!result.ok) {
    return (
      <div className="glass card blog-state" role="status">
        <h3>The blog is temporarily unavailable</h3>
        <p>
          We could not load articles right now. Please try again in a few
          minutes.
        </p>
      </div>
    );
  }

  const posts = result.data;

  if (posts.length === 0) {
    return (
      <div className="glass card blog-state">
        <h3>No articles yet</h3>
        <p>
          The first posts are on their way. In the meantime, the{" "}
          <a href={site.links.docs}>documentation</a> covers the language and
          the Cheeku compiler.
        </p>
      </div>
    );
  }

  return (
    <>
      <JsonLd data={hygraphBlogStructuredData(posts)} />
      <div className="blog-grid">
        {posts.map((post, index) => (
          <article key={post.slug} className="glass card blog-card blog-card-media">
            <BlogCover
              src={post.imageUrl}
              alt={`Cover image for ${post.title}`}
              sizes="(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 360px"
              eager={index === 0}
            />
            <div className="blog-card-top">
              <time className="blog-date" dateTime={post.createdAt}>
                {formatBlogDate(post.createdAt)}
              </time>
            </div>
            <h3 className="blog-card-title">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h3>
            {post.excerpt ? (
              <p className="blog-card-text">{post.excerpt}</p>
            ) : null}
            <div className="blog-card-foot">
              <span />
              <Link
                className="blog-card-link"
                href={`/blog/${post.slug}`}
                aria-label={`Read ${post.title}`}
              >
                Read article <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function PostsFallback() {
  return (
    <div className="blog-grid" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="glass card blog-card blog-skeleton" />
      ))}
    </div>
  );
}

export default function BlogPage() {
  return (
    <div id="top" className="v2">
      <BlogAmbient />
      <SiteNav current="blog" />

      <section className="wrap about-hero blog-hero" aria-labelledby="blog-title">
        <h1 id="blog-title" className="rise about-title" style={{ "--d": ".1s" } as Vars}>
          <span>Chuchu</span>
          <span className="accent">Blog</span>
        </h1>
        <p className="rise about-lede" style={{ "--d": ".2s" } as Vars}>
          Tutorials, language updates, release announcements and compiler
          engineering articles from the people building Chuchu and its Cheeku
          compiler.
        </p>
      </section>

      <section className="wrap about-section blog-posts" aria-label="Articles">
        <Suspense fallback={<PostsFallback />}>
          <Posts />
        </Suspense>
      </section>

      <SiteFooter />
    </div>
  );
}
