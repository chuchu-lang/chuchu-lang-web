import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/site-footer";
import SiteNav from "@/components/site-nav";
import {
  POSTS,
  formatPostDate,
  getPost,
  getPostNeighbours,
  type BlogBlock,
} from "@/lib/blog";
import { JsonLd } from "@/lib/json-ld";
import { site } from "@/lib/site";
import { blogPostStructuredData } from "@/lib/structured-data";

// Lets style objects carry CSS custom properties like --d.
type Vars = CSSProperties & Record<`--${string}`, string>;

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blogs/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/blogs/${post.slug}`,
      siteName: site.name,
      title: `${post.title} · ${site.name}`,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} · ${site.name}`,
      description: post.excerpt,
    },
  };
}

function BlogBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return <h2 key={index}>{block.text}</h2>;
          case "paragraph":
            return <p key={index}>{block.text}</p>;
          case "list": {
            const List = block.ordered ? "ol" : "ul";
            return (
              <List key={index}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </List>
            );
          }
          case "code":
            return (
              <div className="blog-code" key={index}>
                <div className="blog-code-head">
                  <span>{block.filename ?? block.language}</span>
                  <span>{block.language.toUpperCase()}</span>
                </div>
                <pre>
                  <code>{block.code}</code>
                </pre>
              </div>
            );
          case "quote":
            return (
              <blockquote key={index}>
                <p>{block.text}</p>
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const { previous, next } = getPostNeighbours(post.slug);

  return (
    <div id="top" className="v2">
      <JsonLd data={blogPostStructuredData(post)} />

      {/* AMBIENT LAYER */}
      <div className="ambient" aria-hidden="true">
        <div className="gridpaper" />
        <div
          className="orb"
          style={{ left: "58%", top: 40, width: 520, height: 520, background: "#10B23F", opacity: 0.26 }}
        />
        <div
          className="orb"
          style={{ left: "-6%", top: 300, width: 420, height: 420, background: "#FAD705", opacity: 0.3 }}
        />
        <div
          className="orb"
          style={{ left: "38%", top: 520, width: 440, height: 440, background: "#FD8AB9", opacity: 0.24 }}
        />
      </div>

      <SiteNav current="blogs" />

      {/* HERO */}
      <header className="wrap about-hero blog-post-hero">
        <Link className="blog-back" href="/blogs">
          <span aria-hidden="true">&larr;</span> All posts
        </Link>
        <div className="blog-meta rise" style={{ "--d": ".05s" } as Vars}>
          <span className="blog-cat">{post.category}</span>
          <span>
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          </span>
          <span aria-hidden="true">&middot;</span>
          <span>{post.readingTime} min read</span>
        </div>
        <h1 className="blog-post-title rise" style={{ "--d": ".12s" } as Vars}>
          {post.title}
        </h1>
        <p className="blog-post-lede rise" style={{ "--d": ".22s" } as Vars}>
          {post.excerpt}
        </p>
        <div className="blog-post-meta rise" style={{ "--d": ".3s" } as Vars}>
          <span>By {post.author}</span>
          <span aria-hidden="true">&middot;</span>
          <span>Chuchu blog</span>
        </div>
      </header>

      {/* ARTICLE */}
      <div className="wrap about-section">
        <div className="blog-post-layout">
          <article className="blog-prose" aria-label={post.title}>
            <BlogBody blocks={post.blocks} />
          </article>

          <aside className="blog-aside" aria-label="Post details">
            <div className="glass card blog-aside-card">
              <p className="feature-label">WRITTEN BY</p>
              <p className="blog-aside-author">{post.author}</p>
              <p className="blog-aside-text">
                Building the Chuchu language and the Cheeku compiler in the
                open.
              </p>
              <a className="blog-aside-link" href={site.links.source}>
                View the source <span aria-hidden="true">&rarr;</span>
              </a>
            </div>

            <div className="glass card blog-aside-card">
              <p className="feature-label">TAGGED</p>
              <ul className="blog-tags" role="list">
                {post.tags.map((tag) => (
                  <li key={tag} className="blog-tag">
                    {tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass card blog-aside-card">
              <p className="feature-label">KEEP READING</p>
              <p className="blog-aside-text">
                The documentation covers the language reference, tooling and
                compiler architecture.
              </p>
              <a className="blog-aside-link" href={site.links.docs}>
                Read the docs <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </aside>
        </div>

        {/* PREVIOUS / NEXT */}
        {(previous || next) && (
          <nav className="blog-pager" aria-label="More posts">
            {previous ? (
              <Link
                className="glass card blog-pager-link"
                href={`/blogs/${previous.slug}`}
              >
                <span className="blog-pager-label">&larr; Previous post</span>
                <span className="blog-pager-title">{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                className="glass card blog-pager-link blog-pager-next"
                href={`/blogs/${next.slug}`}
              >
                <span className="blog-pager-label">Next post &rarr;</span>
                <span className="blog-pager-title">{next.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>

      {/* CTA */}
      <section className="wrap cta" aria-labelledby="post-cta-title">
        <div className="ring">
          <div className="ring-in cta-inner">
            <div
              aria-hidden="true"
              className="orb"
              style={{ right: -60, top: -80, width: 360, height: 360, background: "#10B23F", opacity: 0.4 }}
            />
            <div
              aria-hidden="true"
              className="orb"
              style={{ left: -60, bottom: -120, width: 340, height: 340, background: "#FD8AB9", opacity: 0.26 }}
            />
            <div className="cta-body">
              <div className="cta-copy">
                <h2 id="post-cta-title" className="cta-title">
                  Read it. Then run it.
                </h2>
                <p className="cta-text">
                  Install Cheeku, compile the example and see the native binary
                  for yourself.
                </p>
              </div>
              <div className="cta-actions">
                <a className="btn btn-light" href={site.links.install}>
                  Get started{" "}
                  <span className="arr" aria-hidden="true">
                    &rarr;
                  </span>
                </a>
                <Link className="btn btn-dark-glass" href="/blogs">
                  More posts
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
