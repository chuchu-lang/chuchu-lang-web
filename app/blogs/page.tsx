import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteNav from "@/components/site-nav";
import { JsonLd } from "@/lib/json-ld";
import {
  FEATURED_POST,
  OTHER_POSTS,
  formatPostDate,
} from "@/lib/blog";
import { site } from "@/lib/site";
import { blogStructuredData } from "@/lib/structured-data";

// Lets style objects carry CSS custom properties like --d.
type Vars = CSSProperties & Record<`--${string}`, string>;

const TITLE = "Chuchu blog";
const DESCRIPTION =
  "Notes from the Chuchu team: the Cheeku compiler, LLVM optimisation, type inference, benchmarks, tooling and the boundaries of a young programming language.";

export const metadata: Metadata = {
  title: "Blog",
  description: DESCRIPTION,
  alternates: { canonical: "/blogs" },
  openGraph: {
    type: "website",
    url: "/blogs",
    siteName: site.name,
    title: `${TITLE} · ${site.name}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} · ${site.name}`,
    description: DESCRIPTION,
  },
};

export default function BlogsPage() {
  return (
    <div id="top" className="v2">
      <JsonLd data={blogStructuredData()} />

      {/* AMBIENT LAYER */}
      <div className="ambient" aria-hidden="true">
        <div className="gridpaper" />
        <div
          className="orb"
          style={{ left: "58%", top: 40, width: 520, height: 520, background: "#10B23F", opacity: 0.3 }}
        />
        <div
          className="orb"
          style={{ left: "-6%", top: 300, width: 420, height: 420, background: "#FAD705", opacity: 0.36 }}
        />
        <div
          className="orb"
          style={{ left: "38%", top: 520, width: 440, height: 440, background: "#FD8AB9", opacity: 0.3 }}
        />
      </div>

      <SiteNav current="blogs" />

      {/* HERO */}
      <section className="wrap about-hero blog-hero" aria-labelledby="blogs-title">
        <p className="glass rise hero-badge" style={{ "--d": ".05s" } as Vars}>
          <span className="ping" aria-hidden="true" />
          Blog &middot; Notes from the team &middot; {OTHER_POSTS.length + 1} posts
        </p>
        <h1 id="blogs-title" className="rise about-title" style={{ "--d": ".12s" } as Vars}>
          <span>Notes from a language</span>
          <span className="accent">in the making.</span>
        </h1>
        <p className="rise about-lede" style={{ "--d": ".22s" } as Vars}>
          Compiler internals, performance measurements, type-system decisions and
          the honest edges of an early language. Everything here is written by
          the people building Chuchu and Cheeku.
        </p>
        <div className="rise about-actions" style={{ "--d": ".32s" } as Vars}>
          <a className="btn btn-primary" href="#posts">
            Browse the posts{" "}
            <span className="arr" aria-hidden="true">
              &rarr;
            </span>
          </a>
          <a className="btn btn-glass" href={site.links.docs}>
            Read the docs
          </a>
        </div>
      </section>

      {/* FEATURED */}
      <section className="wrap about-section" aria-labelledby="featured-title">
        <p className="eyebrow">
          <b />
          01 &middot; LATEST
        </p>
        <h2 id="featured-title" className="h2 about-h2">
          The newest from the compiler
        </h2>

        <article className="glass card blog-featured">
          <div className="blog-featured-body">
            <div className="blog-meta">
              <span className="blog-cat">{FEATURED_POST.category}</span>
              <span>{formatPostDate(FEATURED_POST.date)}</span>
              <span aria-hidden="true">&middot;</span>
              <span>{FEATURED_POST.readingTime} min read</span>
            </div>
            <h3 className="blog-featured-title">
              <Link href={`/blogs/${FEATURED_POST.slug}`}>
                {FEATURED_POST.title}
              </Link>
            </h3>
            <p className="blog-featured-text">{FEATURED_POST.excerpt}</p>
            <div className="blog-featured-actions">
              <Link className="btn btn-primary" href={`/blogs/${FEATURED_POST.slug}`}>
                Read the post{" "}
                <span className="arr" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
              <span className="blog-byline">By {FEATURED_POST.author}</span>
            </div>
          </div>

          <div className="blog-featured-side">
            <div>
              <p className="feature-label">IN THIS POST</p>
              <ul className="blog-side-list">
                {FEATURED_POST.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </div>
            <div className="blog-featured-terminal" aria-hidden="true">
              <div className="blog-featured-terminal-bar">
                <span>terminal</span>
                <span>CHUCHU</span>
              </div>
              <pre>
                <code>
                  <span className="blog-prompt">$ </span>
                  cheeku main.chuchu -O3{"\n"}
                  {"  "}-o main
                </code>
              </pre>
            </div>
          </div>
        </article>
      </section>

      {/* ALL POSTS */}
      <section className="wrap about-section blog-posts" id="posts" aria-labelledby="all-posts-title">
        <p className="eyebrow">
          <b />
          02 &middot; ALL POSTS
        </p>
        <h2 id="all-posts-title" className="h2 about-h2">
          Everything we have written
        </h2>
        <p className="lede">
          Short, specific notes rather than announcements. Pick a topic and read
          how the implementation actually works.
        </p>

        <div className="blog-grid">
          {OTHER_POSTS.map((post) => (
            <article key={post.slug} className="glass card blog-card">
              <div className="blog-card-top">
                <span className="blog-cat">{post.category}</span>
                <span className="blog-date">{formatPostDate(post.date)}</span>
              </div>
              <h3 className="blog-card-title">
                <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
              </h3>
              <p className="blog-card-text">{post.excerpt}</p>
              <div className="blog-card-foot">
                <span>{post.readingTime} min read</span>
                <Link
                  className="blog-card-link"
                  href={`/blogs/${post.slug}`}
                  aria-label={`Read ${post.title}`}
                >
                  Read <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="wrap cta" aria-labelledby="blogs-cta-title">
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
                <h2 id="blogs-cta-title" className="cta-title">
                  Try what you just read about.
                </h2>
                <p className="cta-text">
                  Install Cheeku, compile a .chuchu file and run the native
                  executable yourself.
                </p>
              </div>
              <div className="cta-actions">
                <a className="btn btn-light" href={site.links.install}>
                  Get started{" "}
                  <span className="arr" aria-hidden="true">
                    &rarr;
                  </span>
                </a>
                <Link className="btn btn-dark-glass" href="/">
                  Back to the homepage
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
