/** Public schema v1. This module is pure so it can be tested without Next.js. */
export const DOWNLOAD_ORIGIN = "https://downloads.chuchu-lang.org";
export const PLATFORMS = {
  "windows-x64": { name: "Windows x64", arch: "x86_64 · MSVC", filename: "Chuchu-Setup-VERSION-windows-x64.exe", extension: ".exe", instructions: "Download and run the .exe installer. Windows C++ Build Tools and the Windows SDK may be required." },
  "macos-arm64": { name: "macOS Apple Silicon", arch: "ARM64 · aarch64", filename: "Chuchu-VERSION-aarch64-apple-darwin.pkg", extension: ".pkg", instructions: "Open the Apple Silicon .pkg from a logged-in desktop session. Apple Command Line Tools may be required; finish their installation and rerun the package." },
  "macos-x64": { name: "macOS Intel", arch: "x86_64 · Intel", filename: "Chuchu-VERSION-x86_64-apple-darwin.pkg", extension: ".pkg", instructions: "Open the Intel .pkg from a logged-in desktop session. Apple Command Line Tools may be required; finish their installation and rerun the package." },
  "linux-x64": { name: "Linux x64 GNU", arch: "x86_64 · GNU/Linux", filename: "install-chuchu-VERSION-x86_64-unknown-linux-gnu.sh", extension: ".sh", instructions: "Download the script, review it, then run the command below. A compatible glibc, libstdc++ and C development toolchain are required; apt/dnf prerequisite installation may request sudo." },
} as const;
export type Platform = keyof typeof PLATFORMS;
export type Installer = { name: string; filename: string; url: string; size: number; sha256: string };
export type Release = { schema_version: 1; version: string; release_date: string; installers: Record<Platform, Installer>; release_notes_url?: string };

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected object");
  return value as Record<string, unknown>;
}
export function releaseVersion(value: unknown): string {
  if (typeof value !== "string" || value.length > 128 || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(value)) throw new Error("Invalid version");
  const prerelease = value.split("-").slice(1).join("-");
  if (prerelease.split(".").some((part) => /^0\d+$/.test(part))) throw new Error("Invalid prerelease");
  return value;
}
export function parseRelease(value: unknown): Release {
  const data = object(value);
  if (data.schema_version !== 1) throw new Error("Unsupported schema");
  const version = releaseVersion(data.version);
  if (typeof data.release_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data.release_date) || new Date(data.release_date).toISOString().slice(0, 10) !== data.release_date) throw new Error("Invalid date");
  const entries = object(data.installers);
  if (Object.keys(entries).length !== 4 || Object.keys(entries).some((key) => !(key in PLATFORMS))) throw new Error("Incomplete or unknown platforms");
  const installers = {} as Record<Platform, Installer>;
  for (const platform of Object.keys(PLATFORMS) as Platform[]) {
    const entry = object(entries[platform]);
    const filename = PLATFORMS[platform].filename.replace("VERSION", version);
    // Exact URL equality also rejects credentials, alternate ports, queries,
    // fragments, encoded traversal and misleading host suffixes.
    if (entry.filename !== filename || entry.url !== `${DOWNLOAD_ORIGIN}/${filename}` || entry.name !== PLATFORMS[platform].name || !Number.isSafeInteger(entry.size) || (entry.size as number) <= 0 || (entry.size as number) > 1024 ** 3 || typeof entry.sha256 !== "string" || !/^[0-9a-f]{64}$/.test(entry.sha256)) throw new Error("Invalid installer");
    installers[platform] = { name: PLATFORMS[platform].name, filename, url: `${DOWNLOAD_ORIGIN}/${filename}`, size: entry.size as number, sha256: entry.sha256 };
  }
  const notes = data.release_notes_url;
  if (notes !== undefined && notes !== `https://github.com/chuchu-lang/chuchu-core/releases/tag/v${version}`) throw new Error("Untrusted release notes URL");
  return { schema_version: 1, version, release_date: data.release_date, installers, ...(typeof notes === "string" ? { release_notes_url: notes } : {}) };
}

async function readJson(fetcher: typeof fetch, path: string): Promise<unknown> {
  const response = await fetcher(`${DOWNLOAD_ORIGIN}/${path}`, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(5000) });
  if (!response.ok || !response.headers.get("content-type")?.toLowerCase().includes("application/json")) throw new Error("Manifest unavailable");
  // Bound streamed bytes too; Content-Length alone is untrusted and may be absent.
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty manifest");
  let text = "", bytes = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 65536) throw new Error("Manifest too large");
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally { await reader.cancel(); }
}

/** latest.json is the sole release pointer; downloads.json is a repairable mirror. */
export async function fetchRelease(fetcher: typeof fetch = fetch): Promise<Release | null> {
  try {
    const pointer = object(await readJson(fetcher, "latest.json"));
    if (pointer.schema_version !== 1 || pointer.update_url !== `${DOWNLOAD_ORIGIN}/latest.json`) return null;
    const version = releaseVersion(pointer.version);
    let release: Release | null = null;
    try { release = parseRelease(await readJson(fetcher, "downloads.json")); } catch { /* Resolve missing/stale mirror below. */ }
    if (release?.version !== version) release = parseRelease(await readJson(fetcher, `downloads-${version}.json`));
    return release.version === version ? release : null;
  } catch { return null; }
}
