import test from 'node:test';
import assert from 'node:assert/strict';
import { collectStoreImages, isStoreImage, replaceOptimizedImages } from '../src/lib/imageOptimizationModel.ts';

const root = 'https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/';
const source = root + 'catalog/old.jpg';
const target = root + 'optimized/new.webp';

test('catalog, color and banner references share one optimized photo without changing product data or originals', () => {
  const original = { products: [{ id: 'p', price: 25000, images: [source], variants: [{ color: 'Blue', images: [source] }] }], controls: { banner: { actionValue: source } }, image_optimizations: { [source]: target } };
  assert.deepEqual(collectStoreImages(original), [source]);
  const replaced = replaceOptimizedImages(original, original.image_optimizations);
  assert.equal(replaced.products[0].images[0], target);
  assert.equal(replaced.products[0].variants[0].images[0], target);
  assert.equal(replaced.controls.banner.actionValue, target);
  assert.equal(replaced.products[0].price, 25000);
  assert.equal(original.products[0].images[0], source);
  assert.deepEqual(replaced.image_optimizations, original.image_optimizations);
  const theme = JSON.stringify([{ name: 'Winter', heroImage: source }], null, 2);
  assert.deepEqual(collectStoreImages({ actionValue: theme }), [source]);
  assert.equal(JSON.parse(replaceOptimizedImages(theme, { [source]: target }))[0].heroImage, target);
  assert.equal(replaceOptimizedImages(theme), theme);
});

test('private, signed, foreign and non-image files cannot be converted or injected as replacements', () => {
  for (const invalid of [source + '?token=secret', source + '#a', source.replace('/public/', '/sign/'), source.replace('https:', 'http:'), source.replace('.supabase.co', '.supabase.co.evil.test'), root + 'config/site_settings.json', 'https://user:secret@gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/a.jpg']) {
    assert.equal(isStoreImage(invalid), false);
    assert.deepEqual(collectStoreImages([invalid]), []);
    assert.equal(replaceOptimizedImages(source, { [source]: invalid }), source);
  }
  assert.deepEqual(collectStoreImages([target]), []);
  assert.equal(replaceOptimizedImages(source, { [source]: root + 'catalog/other.jpg' }), source);
  assert.equal(replaceOptimizedImages('unmapped', { [source]: target }), 'unmapped');
});
