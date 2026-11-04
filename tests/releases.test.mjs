import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseRelease, fetchRelease, PLATFORMS, DOWNLOAD_ORIGIN } from '../lib/release-manifest.ts';

function fixture(version = '1.2.3') {
  return { schema_version: 1, version, release_date: '2026-11-05', installers: Object.fromEntries(Object.entries(PLATFORMS).map(([key, p]) => {
    const filename = p.filename.replace('VERSION', version);
    return [key, { name: p.name, filename, url: `${DOWNLOAD_ORIGIN}/${filename}`, size: 123, sha256: 'a'.repeat(64) }];
  })), release_notes_url: `https://github.com/chuchu-lang/chuchu-core/releases/tag/v${version}` };
}
function remote(version = '1.2.3', mirror = fixture(version)) {
  const paths = [];
  const fetcher = async (url, options) => {
    paths.push(url);
    assert.equal(options.cache, 'no-store');
    assert.equal(options.redirect, 'error');
    const data = url.endsWith('/latest.json') ? { schema_version: 1, version, update_url: `${DOWNLOAD_ORIGIN}/latest.json` } : url.endsWith('/downloads.json') ? mirror : fixture(version);
    return Response.json(data);
  };
  return { paths, fetcher };
}
test('valid manifest yields four exact native download URLs', () => {
  const data = parseRelease(fixture());
  assert.equal(Object.keys(data.installers).length, 4);
  for (const entry of Object.values(data.installers)) assert.equal(entry.url, `${DOWNLOAD_ORIGIN}/${entry.filename}`);
});
test('reject schemas, SemVer, dates, incomplete and unknown platforms', () => {
  for (const patch of [{ schema_version: 2 }, { schema_version: true }, { version: '01.2.3' }, { version: '1.2.3-01' }, { version: '../bad' }, { release_date: '2026-02-30' }, { installers: {} }, { installers: { ...fixture().installers, 'linux-arm64': {} } }]) assert.throws(() => parseRelease({ ...fixture(), ...patch }));
  const data = fixture(); delete data.installers['macos-x64']; assert.throws(() => parseRelease(data));
});
test('reject unsafe links, mismatched filenames, names, sizes and checksums', () => {
  for (const patch of [{ url: 'http://downloads.chuchu-lang.org/file.exe' }, { url: 'https://downloads.chuchu-lang.org.evil.example/a' }, { url: 'https://evil.example/a' }, { url: 'javascript:alert(1)' }, { filename: '../file.exe' }, { name: '<script>' }, { size: 0 }, { size: 1.5 }, { size: 1024 ** 3 + 1 }, { sha256: 'x'.repeat(64) }]) {
    const data = fixture(); Object.assign(data.installers['windows-x64'], patch); assert.throws(() => parseRelease(data));
  }
  assert.throws(() => parseRelease({ ...fixture(), release_notes_url: 'https://evil.example' }));
});
test('404, 403, malformed JSON, timeouts, invalid content types and oversized manifests return fallback', async () => {
  for (const fetcher of [async () => new Response('', { status: 404 }), async () => new Response('', { status: 403 }), async () => new Response('{', { headers: { 'content-type': 'application/json' } }), async () => { throw new Error('timeout'); }, async () => new Response('{}'), async () => new Response('x'.repeat(65537), { headers: { 'content-type': 'application/json' } })]) assert.equal(await fetchRelease(fetcher), null);
});
test('stale, missing or malformed website mirror resolves immutable active snapshot', async () => {
  for (const mirror of [fixture('1.0.0'), {}, null]) {
    const { paths, fetcher } = remote('1.2.3', mirror);
    assert.equal((await fetchRelease(fetcher)).version, '1.2.3');
    assert.equal(paths.at(-1), `${DOWNLOAD_ORIGIN}/downloads-1.2.3.json`);
  }
});
test('never accepts an immutable snapshot with the wrong version or missing installer', async () => {
  const { fetcher } = remote();
  assert.equal(await fetchRelease((url, opts) => url.includes('/downloads') ? Promise.resolve(Response.json(fixture('0.1.0'))) : fetcher(url, opts)), null);
});
test('fresh fetch after cache revalidation sees a new active version', async () => {
  assert.equal((await fetchRelease(remote('1.2.3').fetcher)).version, '1.2.3');
  assert.equal((await fetchRelease(remote('1.3.0').fetcher)).version, '1.3.0');
});
