import type { Metadata } from "next";
import { Suspense, type CSSProperties } from "react";
import ReleaseDownloads from "@/components/release-downloads";
import SiteFooter from "@/components/site-footer";
import SiteNav from "@/components/site-nav";
import VSCodeExtension from "@/components/vscode-extension";
import { JsonLd } from "@/lib/json-ld";
import { site } from "@/lib/site";
import { downloadsStructuredData } from "@/lib/structured-data";

// Lets style objects carry CSS custom properties like --d.
type Vars = CSSProperties & Record<`--${string}`, string>;

const TITLE = "Chuchu download: Cheeku and the VS Code extension";
const DESCRIPTION =
  "Download Chuchu installers for Windows, macOS and Linux, check system requirements, or build Cheeku from source. Set up the Chuchu VS Code extension.";

export const metadata: Metadata = {
  title: "Download",
  description: DESCRIPTION,
  alternates: { canonical: "/download" },
  openGraph: {
    type: "website",
    url: "/download",
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

export default function DownloadsPage() {
  return (
    <div id="top" className="v2">
      <JsonLd data={downloadsStructuredData()} />

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

      <SiteNav current="downloads" />

      {/* HERO */}
      <section className="wrap about-hero" aria-labelledby="downloads-title">
        <p className="glass rise hero-badge" style={{ "--d": ".05s" } as Vars}>
          <span className="ping" aria-hidden="true" />
          Downloads &middot; Compiler &amp; editor tools
        </p>
        <h1 id="downloads-title" className="rise about-title" style={{ "--d": ".12s" } as Vars}>
          <span>The language.</span>
          <span className="accent">The tools to write it.</span>
        </h1>
        <p className="rise about-lede" style={{ "--d": ".22s" } as Vars}>
          Cheeku turns .chuchu source files into fast native executables
          through LLVM. Install the compiler for your platform and add the Chuchu
          extension to VS Code for editing, navigation and build commands.
        </p>
        <div className="rise about-actions" style={{ "--d": ".32s" } as Vars}>
          <a className="btn btn-primary" href={site.links.install}>
            Installation guide{" "}
            <span className="arr" aria-hidden="true">
              &rarr;
            </span>
          </a>
          <a className="btn btn-glass" href="#vscode">
            VS Code extension
          </a>
          <a className="btn btn-glass" href={site.links.releases}>
            GitHub Releases
          </a>
        </div>
      </section>

      <section className="wrap about-section" aria-labelledby="status-title">
        <Suspense fallback={<div className="glass card about-status-col"><h2 id="status-title" className="about-card-title">Checking compiler downloads…</h2></div>}>
          <ReleaseDownloads />
        </Suspense>
      </section>

      {/* BUILD FROM SOURCE */}
      <section className="wrap about-section" aria-labelledby="source-title">
        <p className="eyebrow">
          <b />
          02 &middot; BUILD FROM SOURCE
        </p>
        <h2 id="source-title" className="h2 about-h2">
          Build Cheeku yourself (advanced)
        </h2>
        <p className="lede">
          You need Rust 1.88 or newer and an LLVM 23.1 installation. Point{" "}
          <code>LLVM_SYS_231_PREFIX</code> at it, then build in release mode.
          The installation guide covers each operating system in detail.
        </p>
        <div className="glass about-terminal">
          <div className="about-terminal-bar">
            <span>BUILD AND RUN</span>
          </div>
          <pre className="about-terminal-body">
            <code>
              git clone https://github.com/chuchu-lang/chuchu-core.git{"\n"}
              cd chuchu-core{"\n"}
              export LLVM_SYS_231_PREFIX=/path/to/llvm-23.1{"\n"}
              cargo build --locked --release{"\n"}
              ./target/release/cheeku examples/main.chuchu -o hello{"\n"}
              ./hello
            </code>
          </pre>
        </div>
      </section>

      <VSCodeExtension number="03" />

      {/* NOTES */}
      <section className="wrap about-section" aria-labelledby="notes-title">
        <p className="eyebrow">
          <b />
          04 &middot; GOOD TO KNOW
        </p>
        <h2 id="notes-title" className="h2 about-h2">
          Installation notes
        </h2>
        <div className="bento">
          <article className="glass card b6 about-card">
            <p className="feature-label">DEPENDENCIES</p>
            <h3 className="about-card-title">Bundled runtime, system toolchains</h3>
            <p className="feature-text">
              Official installers bundle the compiler runtime and LLVM. System
              SDKs and C toolchains may still be required. Building from source
              requires your own Rust and LLVM installations.
            </p>
          </article>
          <article className="glass card b6 about-card">
            <p className="feature-label">TARGETS</p>
            <h3 className="about-card-title">Host-native output</h3>
            <p className="feature-text">
              Cheeku produces executables for the machine it runs on. There is
              no cross-OS target flag yet.
            </p>
          </article>
        </div>
        <div className="rise about-actions">
          <a className="btn btn-glass" href={site.links.docs}>
            Read the docs
          </a>
          <a className="btn btn-glass" href={site.links.newIssue}>
            Report a download problem
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
