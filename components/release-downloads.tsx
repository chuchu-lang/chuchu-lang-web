import { JsonLd } from "@/lib/json-ld";
import { getRelease } from "@/lib/releases";
import { PLATFORMS, type Platform } from "@/lib/release-manifest";
import { absoluteUrl, site } from "@/lib/site";
import { COMPILER_ID } from "@/lib/structured-data";
import OSHighlight from "./os-highlight";

export function ReleaseFallback() {
  return <div className="glass card about-status-col">
    <p className="feature-label">COMPILER DOWNLOADS</p>
    <h2 id="status-title" className="about-card-title">No downloadable compiler release is available right now.</h2>
    <p className="feature-text">You can <a href="#source-title">build Cheeku from source</a> or check <a href={site.links.releases}>GitHub Releases</a>. If downloads are temporarily unavailable, try again shortly.</p>
  </div>;
}

export default async function ReleaseDownloads() {
  const release = await getRelease();
  if (!release) return <ReleaseFallback />;
  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "SoftwareApplication", "@id": COMPILER_ID, name: "Cheeku", softwareVersion: release.version, datePublished: release.release_date, operatingSystem: ["Windows", "macOS", "Linux"], applicationCategory: "DeveloperApplication", downloadUrl: absoluteUrl("/download") }} />
    <p className="feature-label">COMPILER DOWNLOADS</p>
    <h2 id="status-title" className="h2 about-h2">Download Chuchu · v{release.version}</h2>
    <p className="lede">Released <time dateTime={release.release_date}>{release.release_date}</time>. Choose your operating system and CPU architecture. {release.release_notes_url && <a href={release.release_notes_url}>Release notes</a>}</p>
    <OSHighlight />
    <div className="bento installer-grid">
      {(Object.keys(PLATFORMS) as Platform[]).map((key) => {
        const platform = PLATFORMS[key], installer = release.installers[key];
        return <article key={key} data-installer-os={key.split("-")[0]} className="glass card b6 about-card installer-card">
          <p className="feature-label">{platform.arch}</p>
          <h3 className="about-card-title">{platform.name}</h3>
          <p className="feature-text">{platform.instructions}</p>
          <div className="about-actions"><a className="btn btn-primary" href={installer.url} aria-label={`Download Chuchu ${release.version} for ${platform.name}`}>Download {platform.extension}</a><span>{(installer.size / 1048576).toFixed(1)} MiB</span></div>
          {key === "linux-x64" && <pre className="installer-command"><code>sh {installer.filename}</code></pre>}
          <details className="installer-checksum"><summary>Verify SHA-256 · {installer.size.toLocaleString("en-US")} bytes</summary><code>{installer.sha256}</code><p>Compare this with your file using <code>sha256sum</code> (Linux), <code>shasum -a 256</code> (macOS), or <code>Get-FileHash -Algorithm SHA256</code> (PowerShell).</p></details>
        </article>;
      })}
    </div>
    <p className="feature-text">Official installers bundle LLVM; using them does not require building Rust or LLVM. System toolchains may still be needed. Public signing and notarization are not yet configured, so your OS may show a security warning.</p>
    <div className="glass about-terminal"><div className="about-terminal-bar">ALREADY INSTALLED?</div><pre className="about-terminal-body"><code>cheeku update --check{"\n"}cheeku update</code></pre></div>
  </>;
}
