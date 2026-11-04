/** Test process only: Next server/build fixture transport; never imported by app code. */
import { readFileSync } from 'node:fs';
import { PLATFORMS, DOWNLOAD_ORIGIN } from '../lib/release-manifest.ts';
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, options) => {
  const url = String(input instanceof Request ? input.url : input);
  if (!url.startsWith(DOWNLOAD_ORIGIN + '/')) return originalFetch(input, options);
  const { version, status = 200 } = JSON.parse(readFileSync(process.env.CDN_TEST_STATE, 'utf8'));
  if (status !== 200) return new Response('', { status });
  const data = url.endsWith('/latest.json') ? { schema_version: 1, version, update_url: `${DOWNLOAD_ORIGIN}/latest.json` } : {
    schema_version: 1, version, release_date: '2026-11-05',
    release_notes_url: `https://github.com/chuchu-lang/chuchu-core/releases/tag/v${version}`,
    installers: Object.fromEntries(Object.entries(PLATFORMS).map(([key, p]) => {
      const filename = p.filename.replace('VERSION', version);
      return [key, { name: p.name, filename, url: `${DOWNLOAD_ORIGIN}/${filename}`, size: 123456, sha256: 'a'.repeat(64) }];
    })),
  };
  return Response.json(data);
};
