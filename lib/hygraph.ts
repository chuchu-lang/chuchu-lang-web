/**
 * Hygraph Content API client for the /blog routes.
 *
 * The endpoint is a public, read-only Content API URL, so it is intentionally
 * hardcoded (no env vars, no token). Hygraph must grant the PUBLIC role read
 * access to the BlogPost model and Asset model, otherwise every request is
 * answered with a 403 "not allowed".
 *
 * Freshness: results are cached with `use cache` and revalidated in the
 * background every five minutes. Publishing in Hygraph therefore reaches the
 * site (listing, detail pages and sitemap) without a redeploy.
 */

import { cacheLife } from "next/cache";

export const HYGRAPH_ENDPOINT =
  "https://ap-south-1.cdn.hygraph.com/content/cmvnygy8d0ju106uyt3hk5jdo/master";

/** Fields the listing needs. The article body is deliberately excluded. */
export type BlogPostSummary = {
  title: string;
  slug: string;
  excerpt: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
  imageUrl: string | null;
};

export type BlogPost = BlogPostSummary & {
  markdown: string;
};

/**
 * `ok: false` means Hygraph could not be reached or refused the request. It is
 * kept distinct from an empty or missing result so outages are never shown as
 * "no posts" or "not found".
 */
export type HygraphResult<T> = { ok: true; data: T } | { ok: false };

const LIST_QUERY = /* GraphQL */ `
  query BlogPosts {
    blogPosts(stage: PUBLISHED, orderBy: createdAt_DESC, first: 100) {
      title
      slug
      excerpt
      createdAt
      image {
        url
      }
    }
  }
`;

const POST_QUERY = /* GraphQL */ `
  query BlogPost($slug: String!) {
    blogPost(where: { slug: $slug }, stage: PUBLISHED) {
      title
      slug
      excerpt
      createdAt
      image {
        url
      }
      content {
        markdown
      }
    }
  }
`;

/** Slugs are interpolated into URLs, so reject anything unexpected early. */
const SLUG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,199}$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

type GraphQLResponse<T> = {
  data?: T | null;
  errors?: { message?: string }[];
};

async function hygraphRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(HYGRAPH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Hygraph responded with HTTP ${response.status}`);
  }

  const json = (await response.json()) as GraphQLResponse<T>;

  // Hygraph reports permission problems as GraphQL errors on a 200 response.
  if (json.errors?.length) {
    throw new Error(
      `Hygraph GraphQL error: ${json.errors.map((e) => e.message).join("; ")}`,
    );
  }
  if (!json.data) {
    throw new Error("Hygraph returned no data");
  }
  return json.data;
}

type RawPost = {
  title?: unknown;
  slug?: unknown;
  excerpt?: unknown;
  createdAt?: unknown;
  image?: { url?: unknown } | null;
  content?: { markdown?: unknown } | null;
};

function toSummary(raw: RawPost | null | undefined): BlogPostSummary | null {
  if (!raw) return null;
  const { title, slug, excerpt, createdAt } = raw;
  if (
    typeof title !== "string" ||
    typeof slug !== "string" ||
    !isValidSlug(slug) ||
    typeof createdAt !== "string" ||
    Number.isNaN(Date.parse(createdAt))
  ) {
    return null;
  }
  const imageUrl = raw.image?.url;
  return {
    title,
    slug,
    excerpt: typeof excerpt === "string" ? excerpt : "",
    createdAt,
    imageUrl:
      typeof imageUrl === "string" && imageUrl.startsWith("https://")
        ? imageUrl
        : null,
  };
}

/**
 * Failures are retried after 30 seconds so a recovered API is picked up
 * quickly. `expire` stays at five minutes because anything shorter is excluded
 * from prerendering, which the blog routes require (see ensureStatic).
 */
function cacheFailure(): void {
  cacheLife({ stale: 30, revalidate: 30, expire: 300 });
}

function cacheContent(): void {
  cacheLife({ stale: 300, revalidate: 300, expire: 86400 });
}

/** All published posts, newest first. */
export async function getBlogPosts(): Promise<
  HygraphResult<BlogPostSummary[]>
> {
  "use cache";

  try {
    const data = await hygraphRequest<{ blogPosts?: RawPost[] | null }>(
      LIST_QUERY,
    );
    if (!Array.isArray(data.blogPosts)) {
      throw new Error("Unexpected Hygraph response shape");
    }
    const posts = data.blogPosts
      .map(toSummary)
      .filter((post): post is BlogPostSummary => post !== null);
    cacheContent();
    return { ok: true, data: posts };
  } catch (error) {
    console.error("[hygraph] Failed to load blog posts:", error);
    cacheFailure();
    return { ok: false };
  }
}

/** One published post by slug, or `null` when no such post exists. */
export async function getBlogPost(
  slug: string,
): Promise<HygraphResult<BlogPost | null>> {
  "use cache";

  if (!isValidSlug(slug)) {
    cacheContent();
    return { ok: true, data: null };
  }

  try {
    const data = await hygraphRequest<{ blogPost?: RawPost | null }>(
      POST_QUERY,
      { slug },
    );
    if (data.blogPost === undefined) {
      throw new Error("Unexpected Hygraph response shape");
    }
    const summary = toSummary(data.blogPost);
    const markdown = data.blogPost?.content?.markdown;
    cacheContent();
    if (!summary || summary.slug !== slug) {
      return { ok: true, data: null };
    }
    return {
      ok: true,
      data: { ...summary, markdown: typeof markdown === "string" ? markdown : "" },
    };
  } catch (error) {
    console.error(`[hygraph] Failed to load blog post "${slug}":`, error);
    cacheFailure();
    return { ok: false };
  }
}

/** "November 8, 2026" for an ISO timestamp, stable across server and client. */
export function formatBlogDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
