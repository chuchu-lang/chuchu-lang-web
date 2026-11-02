import Image from "next/image";
import Link from "next/link";
import MobileNav, { type MobileNavItem } from "@/components/mobile-nav";
import { site } from "@/lib/site";

// Logo intrinsic size from public/chuchu-logo-3.svg (976 x 586).
const LOGO_RATIO = 586 / 976;

type SiteNavProps = {
  /** Marks the active section for assistive technology. */
  current?: "home" | "about" | "blogs" | "downloads";
};

/**
 * Primary navigation, shared by every route so the header never drifts
 * between pages.
 */
export default function SiteNav({ current }: SiteNavProps) {
  const mobileItems: MobileNavItem[] = [
    { label: "About", href: "/about", current: current === "about" },
    { label: "Blog", href: "/blogs", current: current === "blogs" },
    { label: "Documentation", href: site.links.docs, external: true },
    { label: "Downloads", href: "/download", current: current === "downloads" },
    { label: "GitHub", href: site.links.source, external: true },
  ];
  return (
    <MobileNav items={mobileItems} installHref={site.links.install}>
      <Link className="brand" href="/" aria-label="Chuchu home">
        <Image
          className="brand-logo"
          src="/chuchu-logo-3.svg"
          alt=""
          width={50}
          height={Math.round(50 * LOGO_RATIO)}
          loading="eager"
        />
        <span className="brand-name">chuchu</span>
      </Link>
      <div className="navlinks">
        <Link
          className="navlink"
          href="/about"
          aria-current={current === "about" ? "page" : undefined}
        >
          About
        </Link>
        <Link
          className="navlink"
          href="/blogs"
          aria-current={current === "blogs" ? "page" : undefined}
        >
          Blog
        </Link>
        <a className="navlink" href={site.links.docs}>
          Documentation
        </a>
        <Link
          className="navlink"
          href="/download"
          aria-current={current === "downloads" ? "page" : undefined}
        >
          Downloads
        </Link>
        <a className="navlink" href={site.links.source}>
          GitHub
        </a>
      </div>
    </MobileNav>
  );
}
