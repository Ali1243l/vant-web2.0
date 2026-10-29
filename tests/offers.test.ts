import assert from 'node:assert/strict';
import { test } from 'node:test';
import { offerBoundary, offerDay, offerState, parseOfferNumber, validateOffer, quoteOffer, productCampaignPrice, normalizeOffers } from '../src/admin/offers/offerModel.ts';
import { fetchOfferSnapshot, saveOfferSnapshot } from '../src/lib/offerStorage.ts';
const now = Date.parse('2026-10-29T09:00:00Z');
const offer = (extra = {}) => ({ id: 'a', title: 'Campaign', titleEn: '', code: 'TEST20', discountType: 'percentage', discountValue: 20, startDate: '2026-10-29', endDate: '2026-10-30', status: 'active', usedCount: 0, ...extra } as any);

test('offer dates include the complete Baghdad end day and use start dates for scheduling', () => {
  assert.equal(offerDay(Date.parse('2026-10-28T21:01:00Z')), '2026-10-29');
  assert.equal(offerState(offer(), Date.parse('2026-10-28T20:59:59Z')), 'scheduled');
  assert.equal(offerState(offer(), Date.parse('2026-10-30T20:59:59.999Z')), 'active');
  assert.equal(offerState(offer(), Date.parse('2026-10-30T21:00:00Z')), 'expired');
  assert.equal(offerBoundary('2026-02-30'), NaN);
  assert.equal(offerBoundary('2026-02-30T12:00:00Z'), NaN);
});
test('effective offer state separates pause, expiry, schedule, invalid data and exhausted counters', () => {
  assert.equal(offerState(offer({ status: 'paused' }), now), 'paused');
  assert.equal(offerState(offer({ status: 'expired' }), now), 'paused');
  assert.equal(offerState(offer({ startDate: '2026-10-30' }), now), 'scheduled');
  assert.equal(offerState(offer({ usedCount: 3, maxUses: 3 }), now), 'exhausted');
  assert.equal(offerState(offer({ usedCount: 4, maxUses: 3 }), now), 'exhausted');
  assert.equal(offerState(offer({ endDate: '2026-10-28' }), now), 'invalid');
  assert.equal(offerState(offer({ startDate: '2026-10-01', endDate: '2026-10-28' }), now), 'expired');
  assert.equal(offerState(offer({ discountValue: NaN }), now), 'invalid');
});
test('validation rejects duplicate codes, invalid discounts, fractional money and malformed rules', () => {
  assert.equal(validateOffer(offer()), null);
  assert.equal(validateOffer(offer({ id: 'b' }), [offer()]), 'duplicate');
  assert.equal(validateOffer(offer({ code: 'A B' })), 'code');
  for (const value of [0, -1, 100, Infinity]) assert.equal(validateOffer(offer({ discountValue: value })), 'amount');
  assert.equal(validateOffer(offer({ discountType: 'fixed', discountValue: 1.5 })), 'amount');
  assert.equal(validateOffer(offer({ minSpend: -1 })), 'minimum');
  assert.equal(validateOffer(offer({ maxUses: 1.5 })), 'limit');
  assert.equal(validateOffer(offer({ usedCount: -1 })), 'limit');
  assert.equal(validateOffer(offer({ startDate: 'bad' })), 'dates');
});
test('preview honors minimum spend, caps a fixed discount and never yields a negative total', () => {
  assert.deepEqual(quoteOffer(offer(), 10000, now), { subtotal: 10000, discount: 2000, total: 8000 });
  assert.equal(quoteOffer(offer({ minSpend: 15000 }), 10000, now), null);
  assert.deepEqual(quoteOffer(offer({ discountType: 'fixed', discountValue: 20000 }), 10000, now), { subtotal: 10000, discount: 10000, total: 0 });
  assert.equal(quoteOffer(offer({ status: 'paused' }), 10000, now), null);
  assert.equal(quoteOffer(offer(), NaN, now), null);
});
test('product campaigns cannot bypass scheduling, spend conditions, limits or positive sale-price validation', () => {
  assert.equal(productCampaignPrice(offer(), 10000, now), 8000);
  assert.equal(productCampaignPrice(offer({ discountType: 'fixed', discountValue: 2500 }), 10000, now), 7500);
  for (const extra of [{ status: 'paused' }, { startDate: '2026-10-30' }, { minSpend: 1 }, { maxUses: 10 }, { discountType: 'fixed', discountValue: 10000 }]) assert.equal(productCampaignPrice(offer(extra), 10000, now), null);
});
test('numeric text is fully validated and localized digits are supported without silently dropping junk', () => {
  assert.equal(parseOfferNumber('٢٠٫٥'), 20.5);
  assert.equal(parseOfferNumber('۱۲۵۰۰'), 12500);
  for (const value of ['', '-20', '2e1', '2x0', '1,000', '1.2.3']) assert.equal(Number.isNaN(parseOfferNumber(value)), true);
});
test('legacy normalization preserves optional rules and empty snapshots without inventing dates', () => {
  const [row] = normalizeOffers([{ id: 'a', title: 'Legacy', code: ' test ', discount_type: 'fixed', discount_value: 1000, min_spend: 5000, max_uses: 20, used_count: 2, status: 'active' }]);
  assert.equal(row.code, 'TEST'); assert.equal(row.minSpend, 5000); assert.equal(row.maxUses, 20); assert.equal(row.usedCount, 2);
  assert.equal(offerState(row, now), 'invalid');
  assert.deepEqual(normalizeOffers([]), []);
  assert.equal(normalizeOffers([offer(), offer(), null]).length, 1);
});
const client = (upload: (path: string, blob: Blob, options: unknown) => Promise<any>, legacy: any[] = []) => ({
  storage: { from: () => ({ upload, getPublicUrl: () => ({ data: { publicUrl: 'https://example.test/offers.json' } }) }) },
  from: () => ({ select: () => ({ order: async () => ({ data: legacy, error: null }) }) }),
});
test('cloud snapshot saves all conditions including an empty list and confirms failure honestly', async () => {
  let saved: unknown;
  const db = client(async (path, blob) => { assert.equal(path, 'config/offers.json'); saved = JSON.parse(await blob.text()); return { error: null }; });
  assert.equal(await saveOfferSnapshot(db, [offer({ minSpend: 5000, maxUses: 3 })]), true);
  assert.equal((saved as any[])[0].minSpend, 5000); assert.equal((saved as any[])[0].maxUses, 3);
  assert.equal(await saveOfferSnapshot(db, []), true); assert.deepEqual(saved, []);
  assert.equal(await saveOfferSnapshot(db, [null]), false);
  assert.equal(await saveOfferSnapshot(client(async () => ({ error: new Error('denied') })), []), false);
  assert.equal(await saveOfferSnapshot(client(async () => { throw new Error('offline'); }), []), false);
});
test('reading a current empty snapshot cannot resurrect SQL campaigns; transient failures do not fall back', async () => {
  const db = client(async () => ({ error: null }), [offer()]);
  assert.deepEqual(await fetchOfferSnapshot(db, async () => new Response('[]')), []);
  assert.equal(await fetchOfferSnapshot(db, async () => new Response('offline', { status: 503 })), null);
  assert.equal(await fetchOfferSnapshot(db, async () => new Response('{}')), null);
  assert.equal(await fetchOfferSnapshot(db, async () => new Response('[null]')), null);
  assert.deepEqual(await fetchOfferSnapshot(db, async () => new Response('', { status: 404 })), [offer()]);
});
