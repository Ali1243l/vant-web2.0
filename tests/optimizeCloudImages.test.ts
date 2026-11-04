import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const root = 'https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/';
const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/lib/optimizeCloudImages.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node', plugins: [{ name: 'cloud-image-fixtures', setup(builder) {
  builder.onResolve({ filter: /^\.\/(supabase|storage|imageConversion)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
  builder.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({ contents: path === './supabase' ? 'export const supabase = {from: (...args) => globalThis.cloudImageFixture.from(...args)};' : path === './storage' ? 'export const fetchSiteConfigFromSupabase = (...args) => globalThis.cloudImageFixture.config(...args); export const saveSiteConfigToSupabase = (...args) => globalThis.cloudImageFixture.save(...args); export const uploadDataUrlToSupabase = (...args) => globalThis.cloudImageFixture.upload(...args);' : 'export const smartConvertImage = (...args) => globalThis.cloudImageFixture.convert(...args); export const imageBlobDataUrl = async () => "data:image/webp;base64,test";' }));
} }] });
const { optimizeCloudImages } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));

test('batch scans all database pages, deduplicates shared images, verifies cloud publication, and retains failed originals', async () => {
  const fetcher = globalThis.fetch;
  const mappings: Record<string, string> = {};
  const downloads: string[] = [];
  let pages = 0;
  let stop = false;
  let saveFails = false;
  let verifyFails = false;
  const shared = root + 'catalog/shared.svg';
  const efficient = root + 'catalog/small.webp';
  const broken = root + 'catalog/broken.jpg';
  const reports: any[] = [];
  const original = new Blob([new Uint8Array(1000)], { type: 'image/png' });
  const small = new Blob([new Uint8Array(20)], { type: 'image/webp' });
  (globalThis as any).cloudImageFixture = {
    from(table: string) { assert.equal(table, 'products'); const query = { select() { return query; }, order() { return query; }, async range(first: number) { pages++; return { data: first === 0 ? Array.from({ length: 100 }, () => ({ images: [shared] })) : [{ images: [efficient, broken] }] }; } }; return query; },
    async config(allowCached: boolean) { assert.equal(allowCached, false); return { image_optimizations: verifyFails ? {} : { ...mappings }, controls: { banner: shared } }; },
    async save(patch: any, requireFresh: boolean) { assert.equal(requireFresh, true); if (saveFails) return false; Object.assign(mappings, patch.image_optimizations); return true; },
    async upload(_data: string, folder: string) { assert.equal(folder, 'optimized'); return root + 'optimized/result.webp'; },
    async convert(blob: Blob) { return blob === small ? blob : small; },
  };
  globalThis.fetch = (async (url: string) => { downloads.push(url); if (url === broken) throw new Error('offline'); return { ok: true, headers: new Headers(), blob: async () => url === efficient ? small : original }; }) as typeof fetch;
  try {
    let result = await optimizeCloudImages((report: any) => reports.push(report), () => stop);
    assert.equal(pages, 2);
    assert.equal(downloads.filter(url => url === shared).length, 1);
    assert.deepEqual(result, { done: 3, total: 3, optimized: 1, skipped: 1, failed: 1, savedBytes: 980, lastError: 'broken.jpg: offline' });
    assert.equal(mappings[shared], root + 'optimized/result.webp');
    assert.equal(mappings[broken], undefined);
    assert.ok(reports.every(report => report.done <= report.total));
    downloads.length = 0;
    await optimizeCloudImages(() => {}, () => false);
    assert.equal(downloads.includes(shared), false);
    delete mappings[shared]; saveFails = true;
    result = await optimizeCloudImages(() => {}, () => false);
    assert.equal(result.optimized, 0);
    assert.equal(mappings[shared], undefined);
    saveFails = false; verifyFails = true;
    result = await optimizeCloudImages(() => {}, () => false);
    assert.equal(result.optimized, 0);
    stop = true;
    await assert.rejects(optimizeCloudImages(() => {}, () => stop));
  } finally { globalThis.fetch = fetcher; delete (globalThis as any).cloudImageFixture; }
});
