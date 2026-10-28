import assert from 'node:assert/strict';
import { test } from 'node:test';
import { filterCatalog, productPricePatch, recordedProductStock, validateProductNumbers, catalogOfferPlan, productLink, stockAvailability } from '../src/admin/products_manager/catalogModel.ts';
import { saveProductEnhancement, getStoredEnhancements } from '../src/context/site_controls/constants.ts';

const product = (id: string, extra = {}) => ({ id, name: 'قميص فانت', nameEn: 'VANT shirt', sku: `SKU-${id}`, category: 'shirts', price: 1000, stock: 0, stockKnown: false, status: 'active', salesCount: 0, ...extra } as any);
test('catalog filters and sort use valid selling price, trim search and keep unknown stock last', () => {
  const rows = [product('a', { isOnOffer: true, salePrice: 500 }), product('b', { price: 700, stockKnown: true, stock: 2 }), product('c', { price: 900000 })];
  const filters = { search: '  VANT ', category: 'all', status: 'all', min: 0, max: Number.MAX_SAFE_INTEGER, sort: 'price-asc' };
  assert.deepEqual(filterCatalog(rows, filters).map(row => row.id), ['a', 'b', 'c']);
  assert.equal(filterCatalog(rows, { ...filters, max: 600 }).length, 1);
  assert.equal(filterCatalog(rows, { ...filters, search: ' SKU-c ' })[0].id, 'c');
  assert.equal(filterCatalog(rows, { ...filters, sort: 'stock' })[0].id, 'b');
});
test('removing an offer restores the base price, and unrelated edits cannot silently change prices', () => {
  const sale = product('sale', { isOnOffer: true, salePrice: 600 });
  assert.deepEqual(productPricePatch(sale, { isOnOffer: false, salePrice: undefined }), { price: 1000, original_price: undefined, is_offer: false });
  assert.equal(productPricePatch(sale, { price: 1200 }).price, 600);
  assert.equal(productPricePatch(sale, { price: 1200 }).original_price, 1200);
  assert.throws(() => productPricePatch(sale, { salePrice: 2000 }));
  assert.throws(() => productPricePatch(sale, { price: -1 }));
});
test('stock is recorded only when every contributing quantity is known', () => {
  assert.equal(recordedProductStock({}), null);
  assert.equal(recordedProductStock({ availability: 'sold_out' }), 0);
  assert.equal(recordedProductStock({ stock: 12 }), 12);
  assert.equal(recordedProductStock({ variants: [{ stock: 2 }, {}] }), null);
  assert.equal(recordedProductStock({ variants: [{ stock: 2 }, { stock: 3 }] }), 5);
  assert.equal(recordedProductStock({ stock: -1 }), null);
});
test('invalid product prices, discounts and fractional stock are rejected', () => {
  for (const values of [['0', '', ''], ['1000', '1000', '2'], ['1000', '-1', '2'], ['1000', '', '2.5']]) assert.throws(() => validateProductNumbers(...values as [string, string, string]));
  assert.doesNotThrow(() => validateProductNumbers('1000', '750', ''));
});
test('known zero stock cannot stay available, while unknown quantities and coming-soon intent are preserved', () => {
  assert.equal(stockAvailability(0, 'in_stock'), 'sold_out');
  assert.equal(stockAvailability(3, 'in_stock'), 'limited');
  assert.equal(stockAvailability(null, 'in_stock'), 'in_stock');
  assert.equal(stockAvailability(0, 'coming_soon'), 'coming_soon');
});
test('category offer planning validates all items before applying and preserves fixed campaign discounts', () => {
  const campaign = { discountType: 'fixed', discountValue: 250 } as any;
  assert.deepEqual(catalogOfferPlan([product('a'), product('b', { price: 2000 })], { discountPercent: 25 }, campaign).map(row => row.salePrice), [750, 1750]);
  assert.throws(() => catalogOfferPlan([product('a'), product('b', { price: 100 })], {}, campaign));
  const link = new URL(productLink('https://example.test/?admin', 'piece & 1'));
  assert.equal(link.searchParams.get('item'), 'piece & 1');
  assert.equal(link.searchParams.has('admin'), false);
});
test('partial metadata updates preserve unrelated fields while explicit offer removal clears old badges', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) || null, setItem: (key: string, value: string) => values.set(key, value) } });
  try {
    saveProductEnhancement('p', { title_ar: 'فانت', images: ['image'], stock: 4, is_offer: true, original_price: 1000, offer_badge_ar: 'Sale' });
    saveProductEnhancement('p', { title_ar: undefined, images: undefined, stock: 5 });
    assert.equal(getStoredEnhancements().p.title_ar, 'فانت');
    assert.deepEqual(getStoredEnhancements().p.images, ['image']);
    saveProductEnhancement('p', { is_offer: false });
    assert.equal(getStoredEnhancements().p.offer_badge_ar, undefined);
    assert.equal(getStoredEnhancements().p.stock, 5);
  } finally { if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor); else Reflect.deleteProperty(globalThis, 'localStorage'); }
});
