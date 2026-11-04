import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

test('a configured cloud upload rejects storage errors instead of saving inline image data as a success', async () => {
  const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/lib/storage.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node', plugins: [{ name: 'upload-fixture', setup(builder) {
    builder.onResolve({ filter: /^\.\/(supabase|imageConversion)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({ contents: path === './supabase' ? 'export const supabase={storage:{from:()=>({upload:(...args)=>globalThis.uploadFixture.upload(...args),getPublicUrl:()=>({data:{publicUrl:"https://example.test/photo.webp"}})})}};' : 'export const smartConvertImage=async blob=>new Blob([blob],{type:"image/webp"}); export const imageBlobDataUrl=async()=>"data:image/webp;base64,fallback"; export const imageUploadPath=folder=>folder+"/photo.webp";' }));
  } }] });
  const { uploadDataUrlToSupabase } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
  let fail = true;
  const observed: any[] = [];
  (globalThis as any).uploadFixture = { async upload(...args: any[]) { observed.push(args); return fail ? { error: { message: 'storage refused this upload' } } : { data: { path: args[0] }, error: null }; } };
  try {
    await assert.rejects(uploadDataUrlToSupabase('data:image/png;base64,AQID', 'optimized'), /storage refused/);
    fail = false;
    assert.equal(await uploadDataUrlToSupabase('data:image/png;base64,AQID', 'optimized'), 'https://example.test/photo.webp');
    assert.equal(observed[1][1].type, 'image/webp');
    assert.deepEqual(observed[1][2], { contentType: 'image/webp', cacheControl: '31536000', upsert: false });
  } finally { delete (globalThis as any).uploadFixture; }
});
