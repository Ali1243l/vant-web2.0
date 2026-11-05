import test from 'node:test';
import assert from 'node:assert/strict';
import { externalizeConfigImages } from '../src/lib/configImages.ts';

const inline = 'data:image/png;base64,AQID';
const url = 'https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/interface/photo.webp';
test('shared inline photos and serialized themes become one uploaded file without changing copy or input', async () => {
  const input = { enhancements: { a: { image_url: inline }, b: { image_url: inline } }, theme: JSON.stringify([{ image: inline }]), copy: 'ordinary text', bad: '[broken data:image/' };
  const before = JSON.stringify(input);
  let uploads = 0;
  const published = await externalizeConfigImages(input, async () => { uploads++; return url; });
  assert.equal(uploads, 1);
  assert.equal(published.enhancements.a.image_url, url);
  assert.equal(published.enhancements.b.image_url, url);
  assert.equal(JSON.parse(published.theme)[0].image, url);
  assert.equal(published.copy, input.copy);
  assert.equal(published.bad, input.bad);
  assert.equal(JSON.stringify(input), before);
});
test('failed or untrusted uploads reject without mutating the current configuration', async () => {
  const input = { image: inline };
  await assert.rejects(externalizeConfigImages(input, async () => { throw new Error('denied'); }), /denied/);
  await assert.rejects(externalizeConfigImages(input, async () => 'https://example.test/photo.webp'), /Invalid uploaded/);
  assert.equal(input.image, inline);
});
