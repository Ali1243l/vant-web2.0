import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveProductColorVariants, extractColorFromImageUrl } from '../src/lib/productVariants.ts';
import type { Product } from '../src/types.ts';
import { getStoredEnhancements, saveProductEnhancement } from '../src/context/site_controls/constants.ts';

const product: Product = {
  id: 'color-test', title: 'Test', category: 'T-Shirts', price: 25000, original_price: 35000,
  is_offer: true, sizes: ['M', 'L'], image_url: '/shirt_Black_1.svg', images: ['/shirt_Black_1.svg'],
  variants: [
    { id: 'black', colorNameAr: 'أسود', colorNameEn: 'Black', colorHex: '#17191c', price: 30000, salePrice: 24000, sizes: ['M'], stock: 4, images: ['/opaque-photo-a.svg'] },
    { id: 'white', colorNameAr: 'أبيض خاص', colorNameEn: 'Custom White', colorHex: '#f8f9fa', price: 28000, sizes: ['L'], stock: 0, images: ['/opaque-photo-b.svg'] },
  ],
};

test('admin color settings override filename inference and preserve isolated prices, names, photos, sizes and stock', () => {
  const resolved = resolveProductColorVariants(product);
  assert.equal(resolved.variants.length, 2);
  const [black, white] = resolved.variants;
  assert.equal(black.price, 24000);
  assert.equal(black.originalPrice, 30000);
  assert.deepEqual(black.images, ['/opaque-photo-a.svg']);
  assert.deepEqual(black.sizes, ['M']);
  assert.equal(white.price, 28000);
  assert.equal(white.originalPrice, undefined);
  assert.equal(white.colorNameAr, 'أبيض خاص');
  assert.equal(white.hex, '#f8f9fa');
  assert.equal(white.availability, 'sold_out');
  assert.deepEqual(white.images, ['/opaque-photo-b.svg']);
  assert.deepEqual(white.sizes, ['L']);
});

test('an empty configured color does not inherit another color image or sizes', () => {
  const resolved = resolveProductColorVariants({ ...product, variants: [{ ...product.variants![0], images: [], sizes: [] }] });
  assert.deepEqual(resolved.variants[0].images, []);
  assert.deepEqual(resolved.variants[0].sizes, []);
});

test('legacy products still infer colors; malformed URL encoding does not crash the catalog', () => {
  const resolved = resolveProductColorVariants({ ...product, variants: undefined, images: ['/shirt_Black_1.svg', '/shirt_White_1.svg'] });
  assert.equal(resolved.hasMultipleColors, true);
  assert.equal(resolved.variants.length, 2);
  assert.equal(extractColorFromImageUrl('/100%_shirt_Black_1.svg'), 'Black');
  assert.equal(resolveProductColorVariants({ ...product, variants: [null], images: [] }).variants.length, 1);
  assert.equal(resolveProductColorVariants({ ...product, variants: [{ ...product.variants![0], colorNameAr: 42 }] }).variants[0].colorNameAr, 'أسود');
});

test('optional prices inherit the product offer while invalid per-color sale prices are ignored', () => {
  const variant = product.variants![0];
  const inherited = resolveProductColorVariants({ ...product, variants: [{ ...variant, price: undefined, salePrice: undefined }] }).variants[0];
  assert.equal(inherited.price, 25000);
  assert.equal(inherited.originalPrice, 35000);
  for (const salePrice of [-1, NaN, Infinity, 31000]) {
    const resolved = resolveProductColorVariants({ ...product, variants: [{ ...variant, salePrice }] }).variants[0];
    assert.equal(resolved.price, 30000);
    assert.equal(resolved.originalPrice, undefined);
  }
});

test('saved color settings survive storage reload and an unrelated product edit', (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  } });
  t.after(() => { if (original) Object.defineProperty(globalThis, 'localStorage', original); else delete (globalThis as any).localStorage; });
  saveProductEnhancement(product.id, { variants: product.variants, colors: ['Black', 'Custom White'] });
  saveProductEnhancement(product.id, { title_ar: 'عنوان معدل' });
  assert.deepEqual(getStoredEnhancements()[product.id].variants, product.variants);
  assert.deepEqual(getStoredEnhancements()[product.id].colors, ['Black', 'Custom White']);
});
