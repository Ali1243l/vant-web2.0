import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseCatalogBackup, storeCatalogRestore, PREVIOUS_CATALOG_BACKUP } from '../src/lib/catalogBackup.ts';
import { categoryLabel } from '../src/lib/categoryLabel.ts';
import { FALLBACK_CATALOG_PRODUCTS } from '../src/context/site_controls/fallbackProducts.ts';
import { DEFAULT_SITE_CONTROLS } from '../src/context/defaultSiteControls.ts';
const control = { id: 'test', category: 'header', name_ar: 'اسم', name_en: 'Name', label_ar: 'اسم', label_en: 'Name', visible: true, enabled: true };
const controls = { test: control };
const backup = { version: '2.0', currency: 'IQD', controls, products: FALLBACK_CATALOG_PRODUCTS };
const parse = (value: unknown) => parseCatalogBackup(JSON.stringify(value), controls);

test('catalog backups roundtrip the existing catalog without importing control metadata or unrelated settings', () => {
  assert.deepEqual(parse(backup).products, FALLBACK_CATALOG_PRODUCTS);
  assert.deepEqual(parseCatalogBackup(JSON.stringify({ ...backup, controls: DEFAULT_SITE_CONTROLS }), DEFAULT_SITE_CONTROLS).controls, DEFAULT_SITE_CONTROLS);
  assert.equal(parse({ currency: 'USD' }).currency, 'USD');
  assert.equal(parse({ controls: { test: { ...control, name_en: 'untrusted metadata' } } }).controls!.test.name_en, 'Name');
  assert.throws(() => parse({ siteSettings: {} }));
});

test('empty, incompatible and malformed backups fail before callers can apply them', () => {
  for (const invalid of [{}, [], null, { version: '9', products: backup.products }, { products: [] }, { products: [null] }, { controls: {} }, { controls: { unknown: control } }, { controls: { test: { ...control, enabled: 'true' } } }, { currency: 'wrong' }]) assert.throws(() => parse(invalid));
  assert.throws(() => parseCatalogBackup('{', controls));
  assert.throws(() => parseCatalogBackup(' '.repeat(10_000_001), controls));
});

test('all product and variant data is validated, including duplicate IDs, unsafe images and invalid amounts', () => {
  const product = backup.products[0];
  for (const patch of [{ price: -1 }, { stock: 1.5 }, { image_url: 'javascript:alert(1)' }, { images: ['//unsafe.test/x'] }, { title: {} }, { sizes: [4] }, { original_price: 1 }, { availability: 'invalid' }, { variants: [{ id: 'v', sizes: ['M'], images: [], price: -1 }] }, { variants: [{ id: 'v', sizes: ['M'], images: [], salePrice: 100, price: 50 }] }]) assert.throws(() => parse({ products: [{ ...product, ...patch }] }));
  assert.throws(() => parse({ products: [product, product] }));
  const variant = { id: 'v', sizes: ['M'], images: ['/demo-colors/shirt.svg'], price: 40, salePrice: 30, stock: 0 };
  assert.equal(parse({ products: [{ ...product, variants: [variant] }] }).products![0].variants![0].stock, 0);
  assert.throws(() => parse({ products: [{ ...product, variants: [variant, variant] }] }));
  const original = JSON.stringify(backup);
  assert.throws(() => parse({ ...backup, products: [...backup.products, { ...product, id: 'bad', price: 'NaN' }] }));
  assert.equal(JSON.stringify(backup), original);
});

test('category names use the same translations as the header and preserve custom categories', () => {
  assert.equal(categoryLabel('ملابس وأزياء', undefined, 'en'), 'Apparel & Fashion');
  assert.equal(categoryLabel('المعاطف والسترات', undefined, 'en'), 'Outerwear');
  assert.equal(categoryLabel('T-Shirts', undefined, 'ar'), 'تيشيرتات');
  assert.equal(categoryLabel('Custom category', undefined, 'en'), 'Custom category');
});

test('restore saves a recovery copy first and rolls back all keys when storage refuses a write', () => {
  const values = new Map([['products', 'old catalog'], ['controls', 'old controls']]);
  const storage = { getItem: (key: string) => values.get(key) ?? null, removeItem: (key: string) => { values.delete(key); }, setItem: (key: string, value: string) => { if (value === 'too big') throw new Error('quota'); values.set(key, value); } };
  assert.throws(() => storeCatalogRestore(storage, 'recovery', { products: 'new catalog', currency: 'IQD', controls: 'too big' }));
  assert.equal(values.get('products'), 'old catalog');
  assert.equal(values.get('controls'), 'old controls');
  assert.equal(values.has('currency'), false);
  assert.equal(values.get(PREVIOUS_CATALOG_BACKUP), 'recovery');
  storeCatalogRestore(storage, 'recovery 2', { products: 'new catalog' });
  assert.equal(values.get('products'), 'new catalog');
  const blocked = { ...storage, setItem: () => { throw new Error('blocked'); } };
  assert.throws(() => storeCatalogRestore(blocked, 'backup', { products: 'changed' }));
  assert.equal(values.get('products'), 'new catalog');
});
