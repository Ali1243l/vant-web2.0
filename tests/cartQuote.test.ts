import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyCart } from '../src/lib/cartQuote.ts';
import { isPasswordRecoveryUrl } from '../src/lib/passwordRecovery.ts';
import { requestShopperLink } from '../src/lib/shopperSignIn.ts';
import { newCartItem } from '../src/lib/shopperModel.ts';
import { saveVerifiedCheckoutDraft } from '../src/lib/checkoutDraft.ts';
import { isShopperCallback } from '../src/lib/shopperAuthUrl.ts';
const now = Date.parse('2026-11-16T10:00:00Z');
const product: any = { id: 'p', title: 'Shirt', price: 25000, image_url: '/shirt', category: 'shirts', sizes: ['M'], availability: 'in_stock', variants: [{ id: 'black-id', colorNameEn: 'Black', colorNameAr: 'أسود', price: 25000, stock: 4, sizes: ['M'], images: ['/shirt'] }] };
const item = newCartItem('p', 'M', 'black-id', 'Black', 'Shirt', '/shirt', 25000);
const offer = { id: 'c', title: 'Ten', code: 'TEN', discountType: 'percentage', discountValue: 10, status: 'active', usedCount: 0, maxUses: 1, startDate: '2026-11-01', endDate: '2026-11-30' };
test('quote uses canonical product price and stock, blocks tampered or unavailable selections', () => {
  assert.equal(verifyCart([item], [product], [], '', now).blocked, false);
  const changed = verifyCart([{ ...item, price: 1 }], [product], [], '', now);
  assert.equal(changed.items[0].price, 25000); assert.equal(changed.items[0].issue, 'price'); assert.equal(changed.blocked, true);
  assert.equal(verifyCart([{ ...item, quantity: 5 }], [product], [], '', now).items[0].issue, 'stock');
  assert.equal(verifyCart([item], [], [], '', now).items[0].issue, 'missing');
  assert.equal(verifyCart([{ ...item, size: 'XL' }], [product], [], '', now).items[0].issue, 'selection');
  assert.equal(verifyCart([item, { ...item, id: 'different-key' }], [product], [], '', now).blocked, true);
});
test('coupon is revalidated without redeeming it; expired/exhausted codes cannot finalize', () => {
  const quote = verifyCart([item], [product], [offer], ' ten ', now);
  assert.equal(quote.total, 22500); assert.equal(quote.blocked, false); assert.equal(offer.usedCount, 0);
  assert.equal(verifyCart([item], [product], [{ ...offer, usedCount: 1 }], 'TEN', now).couponError, true);
  assert.equal(verifyCart([item], [product], [offer], 'TEN', Date.parse('2026-12-01T00:00:00Z')).blocked, true);
  assert.throws(() => saveVerifiedCheckoutDraft({ getItem: () => null, setItem: () => {} }, quote, now + 31000));
});
test('customer callback routing leaves recovery and administration isolated', () => {
  assert.equal(isShopperCallback(new URL('https://vant.test/?shopper=1#type=magiclink')), true);
  assert.equal(isShopperCallback(new URL('https://vant.test/#type=signup')), true);
  assert.equal(isShopperCallback(new URL('https://vant.test/?auth=recovery#type=recovery')), false);
  assert.equal(isShopperCallback(new URL('https://vant.test/?admin')), false);
  assert.equal(isPasswordRecoveryUrl('https://vant.test/?shopper=1#error_code=otp_expired'), false);
  assert.equal(isShopperCallback(new URL('https://vant.test/?shopper=1&auth=recovery#type=recovery')), false);
});
test('a stopped or unmigrated database cannot trigger sign-in mail', async () => {
  let sent = 0;
  const client = { rpc: async () => ({ data: false, error: null }), auth: { signInWithOtp: async () => { sent++; return { error: null }; } } };
  await assert.rejects(requestShopperLink(client, 'person@example.test', 'https://vant.test'), /sync-unavailable/);
  assert.equal(sent, 0);
});
test('a verified fixed-discount quote may cover the subtotal without producing a negative total', () => {
  const quote = verifyCart([item], [product], [{ ...offer, discountType: 'fixed', discountValue: 30000 }], 'TEN', now);
  assert.equal(quote.total, 0);
  const draft = saveVerifiedCheckoutDraft({ getItem: () => null, setItem: () => {} }, quote, now);
  assert.equal(draft.total, 0); assert.equal(draft.discount, 25000);
});
