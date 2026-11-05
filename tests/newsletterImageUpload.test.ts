import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

test('campaign image upload preserves an absolute public URL and never substitutes an unrelated image on failure', async () => {
  const base = 'https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/';
  const built = await build({ entryPoints: [fileURLToPath(new URL('../src/lib/newsletter.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node', plugins: [{ name: 'cloud-fixture', setup(builder) {
    builder.onResolve({ filter: /^\.\/(storage|supabase)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({ contents: path === './supabase' ? 'export const supabase=null;' : `export const uploadImageToSupabase=async()=>globalThis.newsletterUploadFixture;export const uploadToFreeCdn=async()=>null;export const formatSupabasePublicUrl=value=>value.startsWith('https://')?value:${JSON.stringify(base)}+value.replace(/^product-images\\//,'');export const resolveStoredImages=value=>value;` }));
  } }] });
  const { uploadCampaignImageFile } = await import('data:text/javascript;base64,' + Buffer.from(built.outputFiles[0].text).toString('base64'));
  const file = new File(['fixture'], 'photo.jpg', { type: 'image/jpeg' });
  try {
    (globalThis as any).newsletterUploadFixture = base + 'newsletter-banners/photo.webp';
    assert.equal(await uploadCampaignImageFile(file), base + 'newsletter-banners/photo.webp');
    (globalThis as any).newsletterUploadFixture = 'data:image/png;base64,AA==';
    await assert.rejects(uploadCampaignImageFile(file));
    (globalThis as any).newsletterUploadFixture = '';
    await assert.rejects(uploadCampaignImageFile(file));
  } finally { delete (globalThis as any).newsletterUploadFixture; }
});
