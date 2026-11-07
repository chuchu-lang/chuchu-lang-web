import { isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";

/**
 * Renders Hygraph Markdown on the server.
 *
 * react-markdown builds React elements instead of injecting HTML, and raw HTML
 * in the source is ignored (no rehype-raw), so article content cannot inject
 * markup. Its default URL transform also strips `javascript:` links.
 */

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return "";
}

const components: Components = {
  // The page title is the only H1; demote any H1 in the body.
  h1: ({ children }) => <h2>{children}</h2>,
  a: ({ href, children }) => {
    const external = typeof href === "string" && /^https?:\/\//i.test(href);
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <a href={href}>{children}</a>
    );
  },
  img: ({ src, alt }) =>
    typeof src === "string" && src.startsWith("https://") ? (
      // eslint-disable-next-line @next/next/no-img-element -- dimensions of CMS-embedded images are unknown
      <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" />
    ) : null,
  // Covers fenced blocks and indented blocks (which carry no language).
  pre: ({ children }) => {
    const code = isValidElement<{ className?: string; children?: ReactNode }>(
      children,
    )
      ? children
      : null;
    const language = /language-([\w+#-]+)/.exec(code?.props.className ?? "")?.[1];
    const source = textOf(code ? code.props.children : children).replace(
      /\n$/,
      "",
    );
    return (
      <div className="blog-code">
        <div className="blog-code-head">
          <span>{language ?? "code"}</span>
          {language ? <span>{language.toUpperCase()}</span> : null}
        </div>
        <pre tabIndex={0}>
          <code>{source}</code>
        </pre>
      </div>
    );
  },
};

export default function BlogMarkdown({ markdown }: { markdown: string }) {
  return <ReactMarkdown components={components}>{markdown}</ReactMarkdown>;
}

/** Leading H1 duplicates the page title, so drop it when it matches. */
export function stripLeadingTitle(markdown: string, title: string): string {
  const match = /^\s*#\s+(.+?)\s*#*\s*(?:\r?\n|$)/.exec(markdown);
  if (match && match[1].trim().toLowerCase() === title.trim().toLowerCase()) {
    return markdown.slice(match[0].length);
  }
  return markdown;
}
