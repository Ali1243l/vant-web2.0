import test from 'node:test';
import assert from 'node:assert/strict';
import { EmailImageError, normalizeEmailHtmlImages, normalizeEmailImageUrl } from '../src/lib/emailImage.ts';

const base = 'https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/';
test('email image URLs repair old duplicated bucket prefixes and preserve correct public URLs', () => {
  const image = base + 'newsletter-banners/photo.webp';
  assert.equal(normalizeEmailImageUrl(image), image);
  assert.equal(normalizeEmailImageUrl(base + image), image);
  assert.equal(normalizeEmailImageUrl(base + base + image), image);
  assert.equal(normalizeEmailImageUrl('product-images/newsletter-banners/my photo.jpg'), base + 'newsletter-banners/my%20photo.jpg');
  assert.equal(normalizeEmailImageUrl('https://example.test/photo.jpg?a=1&b=2'), 'https://example.test/photo.jpg?a=1&b=2');
  const unsplash = new URL(normalizeEmailImageUrl('https://images.unsplash.com/photo-test?auto=format&w=800'));
  assert.equal(unsplash.searchParams.get('fm'), 'jpg');
  assert.equal(unsplash.searchParams.has('auto'), false);
  for (const invalid of ['data:image/png;base64,AA==', 'blob:https://example.test/1', 'file:///photo.jpg', 'javascript:alert(1)', '//example.test/photo.jpg', 'http://example.test/photo.jpg', 'https://u:p@example.test/a.jpg', 'https://localhost/photo.jpg']) assert.equal(normalizeEmailImageUrl(invalid), '');
});

test('custom HTML receives the same image repair, safely escapes URL attributes, and rejects temporary or missing sources', () => {
  const html = normalizeEmailHtmlImages(`<img alt="test" src='${base + base}catalog/photo.jpg?a=1&amp;b=2'><p>unchanged</p>`);
  assert.ok(html.includes(`src="${base}catalog/photo.jpg?a=1&amp;b=2"`));
  assert.ok(html.includes('<p>unchanged</p>'));
  assert.throws(() => normalizeEmailHtmlImages('<img src="blob:https://example.test/id">'), EmailImageError);
  assert.throws(() => normalizeEmailHtmlImages('<img alt="missing">'), EmailImageError);
  assert.equal(normalizeEmailHtmlImages('<p>No image intended</p>'), '<p>No image intended</p>');
});
