# chuchu-lang-web

The homepage for [Chuchu](https://chuchu-lang.org), a high-performance, statically typed
programming language with inferred types. Its compiler, Cheeku, turns Chuchu
code into native programs through LLVM.

This repository is only the marketing site. The documentation lives at
[docs.chuchu-lang.org](https://docs.chuchu-lang.org) and the compiler source at
[chuchu-lang/chuchu-core](https://github.com/chuchu-lang/chuchu-core). The
[VS Code extension](https://github.com/chuchu-lang/chuchu-vscode) is featured on
the homepage and downloads page, with setup instructions in the docs.

## Stack

- Next.js (App Router) with `cacheComponents` enabled
- Plain CSS in `app/globals.css`
- Fonts via `next/font/google`: Bricolage Grotesque, Geist and Geist Mono

## SEO

Site-wide metadata lives in `app/layout.tsx` and is driven by the shared
config in `lib/site.ts`, so the canonical URL, social tags and structured
data can never drift apart.

- `lib/site.ts` — origin, name, links and keywords (single source of truth)
- `lib/structured-data.ts` — schema.org entities (`WebSite`, `Organization`,
  `ComputerLanguage`, `SoftwareSourceCode`, `SoftwareApplication`, `AboutPage`)
- `lib/json-ld.tsx` — renders JSON-LD as a plain `<script>` tag, with the
  payload escaped so it cannot break out of the tag
- `app/manifest.ts`, `app/robots.ts`, `app/sitemap.ts` — metadata routes
- `app/opengraph-image.tsx`, `app/twitter-image.tsx`, `app/about/opengraph-image.tsx`
  — social cards generated with `next/og`, using the vendored brand fonts in
  `assets/fonts`
- `app/apple-icon.tsx` — generated apple touch icon

Set `NEXT_PUBLIC_SITE_URL` to override the production origin (defaults to
`https://www.chuchu-lang.org`). Production apex-domain overrides are normalized
to `https://www.chuchu-lang.org` to match the hosting redirect. Sitemap entries,
robots.txt, canonical links and structured data all use this same origin.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Optional: copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_GA_ID` to
enable Google Analytics. Without it, no analytics script is loaded.

## Scripts

| Command         | What it does                         |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the development server         |
| `npm run build` | Create a production build            |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Run ESLint                           |

## Layout

- `app/page.tsx`: the homepage (server component)
- `app/about/page.tsx`: the About page (server component)
- `app/blogs/page.tsx`: the blog index
- `app/blogs/[slug]/page.tsx`: statically generated post pages
- `lib/blog.ts`: post content, dates, tags and ordering
- `components/featured-video.tsx`: responsive YouTube player on the homepage
- `components/vscode-extension.tsx`: shared VS Code extension section
- `components/how-it-works.tsx`: the six-stage compiler stepper (client)
- `components/optimization-levels.tsx`: the -O0 to -O3 selector (client)
- `components/site-nav.tsx`, `components/site-footer.tsx`: shared chrome
- `app/sitemap.ts`, `app/robots.ts`: SEO metadata routes

## Automatic compiler downloads

`/download` keeps the existing page design, navigation, source-build guide and
VS Code section. Its server-rendered installer section loads public metadata from
`https://downloads.chuchu-lang.org`; the browser needs no cross-origin API or AWS
credentials. `/downloads` still redirects permanently to `/download`.

`lib/release-manifest.ts` validates schema v1, canonical SemVer (matching the
release pipeline's no-build-metadata policy), a real calendar date, all four
platforms, positive integer byte sizes up to 1 GiB, lowercase SHA-256, and exact
versioned filenames/HTTPS URLs on the trusted CDN host. Release notes may only
link to the matching tag in the compiler repository. JSON reads have a five-second
timeout per request, a 64 KiB streamed limit, and reject redirects. All text is
rendered through React; no remote HTML is accepted.

The schema is defined in the compiler repository's `installer/downloads.schema.json`:

```text
schema_version: 1
version: canonical MAJOR.MINOR.PATCH[-prerelease]
release_date: YYYY-MM-DD (UTC assembly day)
installers: exactly windows-x64, macos-arm64, macos-x64, linux-x64
  each: name, filename, url, size (bytes), sha256 (64 lowercase hex digits)
release_notes_url: optional matching GitHub release tag URL
```

The compiler pipeline calculates sizes/checksums from actual installer files and
publishes immutable `downloads-<version>.json` before committing the unchanged
`latest.json` updater manifest. It then refreshes the public `downloads.json`
mirror. To handle S3's two-object consistency window, this website reads the
version from `latest.json`, requests `downloads.json`, and resolves a stale,
missing or malformed mirror through `downloads-<active version>.json`. This keeps
the website and updater on the same release pointer. Never use a mirror from a
different version. If no valid complete release is available (including 403/404,
timeout or invalid metadata), render a helpful fallback with no installer buttons.

`lib/releases.ts` uses Next.js 16's `use cache` with
`cacheLife({ stale: 60, revalidate: 60, expire: 300 })`. After 60 seconds,
subsequent traffic triggers a background refresh; after 300 seconds, a request
waits for fresh data. Successes and fallback results both expire. The route's
build-time result is therefore temporary. Visitors discover later releases
without a rebuild; an already open tab does not poll. Cache storage may be
per-instance on serverless hosts. OS detection is an optional client enhancement:
all options render on the server, and hydration adds only an OS hint/highlight.
macOS always offers both architectures; nothing downloads automatically.

### Test and deploy

Use Node.js 22.18+ (the unit tests use native TypeScript stripping), then:

```sh
npm ci
npm run test
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite starts a separate production build/server on port 3100 with
**test-process-only** CDN fixtures. It checks desktop/mobile layouts, canonical,
redirect/navigation, direct links, checksums/structured version data, then changes
the release and simulates an outage to verify actual timed revalidation. It takes
about two minutes. Screenshots are in ignored `test-results/`. No AWS access,
installer execution, uploads or real releases are involved. Run `npm run build`
again after the suite to restore the ordinary local build output.

Deploy reviewed changes through the site's existing Next.js hosting process, or
run `npm run build` followed by `npm run start` on a supported Node.js host.
Keep `cacheComponents` enabled and allow outbound HTTPS to the download host.
A static export cannot refresh server metadata. No AWS environment variables
are needed. Global SEO stays independent of remote fetching; the validated
release adds its current version in Downloads-page structured data.

Before the first release, configure the existing CloudFront distribution with a
`downloads.json` behavior using **CachingDisabled** and retain the uncached
`latest.json` behavior. Versioned snapshots use immutable origin cache headers.
Extend existing deployment IAM/OAC prefix restrictions for these new keys while
keeping S3 private. Full Console steps, IAM policy, approval/release sequence,
403 diagnosis, failed-release recovery and conditional rollback are documented in
[chuchu-core's deployment guide](https://github.com/chuchu-lang/chuchu-core/blob/main/docs/aws-installer-releases.md).

After publishing an approved compiler tag, inspect the two public manifest
versions/cache headers, HEAD all four installer URLs, independently verify
checksums, and confirm `/download` shows the new version after revalidation.
The page retains installation prerequisites and unsigned-installer caveats;
clean-machine installer validation remains part of the native release process.
