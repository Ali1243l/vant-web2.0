import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG_IMAGE_RATIO, catalogImageStyle, normalizeCatalogImage, validCatalogImage } from '../src/lib/catalogImage.ts';
import { parseCatalogBackup } from '../src/lib/catalogBackup.ts';
import { mergeProductEnhancements, saveProductEnhancement, getStoredEnhancements } from '../src/context/site_controls/constants.ts';

test('landscape, tall and square source images share one frame without rewriting the original', () => {
  for (const [width, height] of [[1200, 900], [900, 1600], [900, 900]]) {
    const original = { id: `${width}-${height}`, title: 'Shirt', category: 'T-Shirts', sizes: ['M'], price: 25000, image_url: '/original.svg', width, height, aspect_ratio: `${width}:${height}` };
    const product = { ...original, catalog_image: { fit: 'cover', x: 25, y: 100 } };
    assert.equal(CATALOG_IMAGE_RATIO, '3 / 4');
    assert.deepEqual(catalogImageStyle(undefined), { objectFit: 'cover', objectPosition: '50% 50%' });
    assert.deepEqual(catalogImageStyle(product.catalog_image), { objectFit: 'cover', objectPosition: '25% 100%' });
    const restored = parseCatalogBackup(JSON.stringify({ products: [product] }), {}).products![0];
    assert.deepEqual(restored.catalog_image, product.catalog_image);
    assert.equal(restored.image_url, original.image_url);
    assert.equal(restored.aspect_ratio, original.aspect_ratio);
    assert.equal(restored.height, original.height);
  }
});

test('unconfigured products fill the frame, explicit full-image choices persist, and positions stay safe', () => {
  assert.deepEqual(normalizeCatalogImage(null), { fit: 'cover', x: 50, y: 50 });
  assert.deepEqual(normalizeCatalogImage({ fit: 'invalid', x: NaN, y: '10px' }), { fit: 'cover', x: 50, y: 50 });
  assert.deepEqual(normalizeCatalogImage({ fit: 'cover', x: -20, y: 200 }), { fit: 'cover', x: 0, y: 100 });
  assert.equal(normalizeCatalogImage({ fit: 'contain', x: 50, y: 50 }).fit, 'contain');
  assert.equal(catalogImageStyle({ fit: 'contain', x: 0, y: 100 }).objectPosition, '50% 50%');
});

test('backups reject invalid image settings before applying any products', () => {
  const product = { id: '1', title: 'Shirt', category: 'T-Shirts', image_url: '/original.svg', sizes: ['M'], price: 100 };
  for (const settings of [null, [], { fit: 'stretch', x: 50, y: 50 }, { fit: 'cover', x: -1, y: 50 }, { fit: 'cover', x: 50, y: '50' }]) {
    assert.equal(validCatalogImage(settings), false);
    assert.throws(() => parseCatalogBackup(JSON.stringify({ products: [{ ...product, catalog_image: settings }] }), {}));
  }
  assert.equal(validCatalogImage({ fit: 'cover', x: 0, y: 100 }), true);
});

test('older cloud enhancements do not erase a local image setting; explicit synced settings still apply', () => {
  const current = { one: { catalog_image: { fit: 'cover' as const, x: 20, y: 90 }, title_ar: 'old' }, two: { title_ar: 'keep' } };
  const merged = mergeProductEnhancements(current, { one: { title_ar: 'new' } });
  assert.deepEqual(merged.one.catalog_image, current.one.catalog_image);
  assert.equal(merged.one.title_ar, 'new');
  assert.equal(merged.two.title_ar, 'keep');
  assert.equal(current.one.title_ar, 'old');
  const synced = { fit: 'contain' as const, x: 50, y: 50 };
  assert.deepEqual(mergeProductEnhancements(current, { one: { catalog_image: synced } }).one.catalog_image, synced);
  const unusual = mergeProductEnhancements({}, JSON.parse('{"__proto__":{"title_ar":"data only"}}'));
  assert.equal(Object.getPrototypeOf(unusual), Object.prototype);
  assert.equal(Object.hasOwn(unusual, '__proto__'), true);
});

test('product image settings survive the existing enhancement save/load path without replacing color data', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) || null, setItem: (key: string, value: string) => values.set(key, value) } });
  try {
    saveProductEnhancement('p', { images: ['/original.svg'], colors: ['Blue'] });
    saveProductEnhancement('p', { catalog_image: { fit: 'cover', x: 25, y: 75 } });
    assert.deepEqual(getStoredEnhancements().p.catalog_image, { fit: 'cover', x: 25, y: 75 });
    assert.deepEqual(getStoredEnhancements().p.images, ['/original.svg']);
    assert.deepEqual(getStoredEnhancements().p.colors, ['Blue']);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
