import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkoutQuote, prepareCheckoutDraft, checkoutMessage, CHECKOUT_DRAFTS_KEY } from '../src/lib/checkoutDraft.ts';
import { writeCart, changeCartQuantity, type CartItem } from '../src/lib/cart.ts';
import { catalogImageProps } from '../src/lib/responsiveImage.ts';
import { fetchCatalogPage } from '../src/lib/catalogFetch.ts';
const now = Date.parse('2026-10-30T12:00:00Z');
const items: CartItem[] = [{ id: 'shirt', title: 'Shirt', image: '', price: 25000, quantity: 2, size: 'M', color: 'Blue' }];
const offer = { id: 'offer', title: 'Offer', titleEn: 'Offer', code: 'SAVE10', discountType: 'percentage', discountValue: 10, status: 'active', usedCount: 0, startDate: '2026-10-01', endDate: '2026-10-31', minSpend: 40000 } as const;

test('checkout uses actual cart quantities, normalizes a code, respects restrictions and never mutates usage counts', () => {
  assert.deepEqual(checkoutQuote(items, ' save10 ', [offer], now), { subtotal: 50000, discount: 5000, total: 45000, code: 'SAVE10' });
  assert.equal(checkoutQuote(items, '', [], now).total, 50000);
  for (const changed of [{ ...offer, status: 'paused' }, { ...offer, maxUses: 1, usedCount: 1 }, { ...offer, minSpend: 60000 }, { ...offer, endDate: '2026-10-29' }, { ...offer, startDate: '2026-10-31' }]) assert.throws(() => checkoutQuote(items, 'SAVE10', [changed] as any, now));
  assert.throws(() => checkoutQuote(items, 'SAVE10', [offer, offer], now));
  assert.throws(() => checkoutQuote([{ ...items[0], quantity: 100 }], '', [], now));
  assert.throws(() => checkoutQuote([{ ...items[0], price: Number.MAX_SAFE_INTEGER }], '', [], now));
  assert.equal(offer.usedCount, 0);
});

test('drafts retain the exact quote and WhatsApp reference, stay separate from real orders and fail visibly if saving fails', () => {
  const values = new Map<string,string>();
  const storage = { getItem: (key: string) => values.get(key) || null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const draft = prepareCheckoutDraft(storage, items, 'SAVE10', [offer], now, 'local-check');
  const message = checkoutMessage(draft, false, value => `${value} IQD`);
  assert.match(message, /VANT-local-check/); assert.match(message, /SAVE10/); assert.match(message, /45000 IQD/); assert.match(message, /not confirmed/); assert.match(message, /M · Blue · Qty: 2/);
  assert.equal(JSON.parse(values.get(CHECKOUT_DRAFTS_KEY)!)[0].status, 'draft');
  assert.equal(values.has('vant_orders_v1'), false);
  assert.throws(() => prepareCheckoutDraft({ ...storage, setItem: () => { throw new Error('quota'); } }, items, '', [], now, 'fail'));
  assert.equal(JSON.parse(values.get(CHECKOUT_DRAFTS_KEY)!).length, 1);
  assert.equal(items[0].quantity, 2);
});

test('cart persistence reports main-list failures while a cache failure cannot invalidate a saved cart', () => {
  assert.throws(() => writeCart(items, { setItem: () => { throw new Error('quota'); } }));
  const saved = new Map();
  assert.equal(writeCart(items, { setItem: (key, value) => { if (key === 'vant_cart_count') throw new Error('cache'); saved.set(key, value); } }), 2);
  assert.equal(JSON.parse(saved.get('vant_cart_items'))[0].quantity, 2);
  assert.throws(() => changeCartQuantity([{ ...items[0], quantity: 99 }], items[0], 1));
});

test('responsive image sizes preserve admin grid options and leave private/custom image sources unchanged', () => {
  assert.deepEqual(catalogImageProps('/local.png'), {});
  assert.deepEqual(catalogImageProps('https://custom.test/a.png'), {});
  const props = catalogImageProps('https://images.unsplash.com/photo-test?w=800&q=80', '50vw');
  assert.match(props.srcSet!, /240w/); assert.match(props.srcSet!, /1280w/); assert.match(props.srcSet!, /q=80/); assert.equal(props.sizes, '50vw');
});

test('catalog distinguishes an empty successful response from an outage, including direct-client fallback', async () => {
  const response = (json: unknown, ok = true) => (async () => ({ ok, json: async () => json })) as any;
  let queried = false;
  const client = { from: () => { queried = true; return { select: () => ({ order: () => ({ range: async () => ({ data: [], count: 0, error: null }) }) }) }; } };
  assert.deepEqual(await fetchCatalogPage(response({ success: true, data: [], count: 0 }), client, 12), { data: [], count: 0 });
  assert.equal(queried, false);
  assert.deepEqual(await fetchCatalogPage(response({}, false), client, 12), { data: [], count: 0 });
  assert.equal(await fetchCatalogPage(response({}, false), null, 12), null);
  assert.equal(await fetchCatalogPage((async () => { throw new Error('offline'); }) as any, null, 12), null);
});
