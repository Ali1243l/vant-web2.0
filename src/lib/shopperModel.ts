import { cartItemId, type CartItem } from './cart.ts';

export interface ShopperDocument { revision: number; cart: Record<string, CartItem>; wishlist: Record<string, true>; coupon: string; tombstones: Record<string, number> }
export interface ShopperOperation {
  id: string; base: number; kind: 'delta' | 'remove' | 'wish' | 'coupon' | 'merge';
  key?: string; delta?: number; item?: CartItem; enabled?: boolean; code?: string;
  restore?: boolean;
  at?: number;
  cart?: CartItem[]; wishlist?: string[];
}
export const emptyShopper = (): ShopperDocument => ({ revision: 0, cart: {}, wishlist: {}, coupon: '', tombstones: {} });
const safeKey = (key: unknown, limit = 500): key is string => typeof key === 'string' && key.length > 0 && key.length <= limit && !['__proto__', 'constructor', 'prototype'].includes(key);
export function validShopperOperation(op: any): op is ShopperOperation {
  if (!op || !/^[0-9a-f-]{36}$/i.test(op.id) || !Number.isSafeInteger(op.base) || op.base < 0) return false;
  if (op.kind === 'delta') return safeKey(op.key) && op.item?.id === op.key && !!normalizeCartItem(op.item) && Number.isSafeInteger(op.delta) && Math.abs(op.delta) <= 99;
  if (op.kind === 'remove') return safeKey(op.key);
  if (op.kind === 'wish') return safeKey(op.key, 120) && typeof op.enabled === 'boolean';
  if (op.kind === 'coupon') return typeof op.code === 'string' && op.code.length <= 40;
  return op.kind === 'merge' && Array.isArray(op.cart) && op.cart.length <= 200 && op.cart.every((item: unknown) => !!normalizeCartItem(item)) && Array.isArray(op.wishlist) && op.wishlist.length <= 2000 && op.wishlist.every((id: unknown) => safeKey(id, 120));
}
export function normalizeShopperDocument(value: any): ShopperDocument {
  if (!value || !Number.isSafeInteger(value.revision) || value.revision < 0 || typeof value.cart !== 'object' || !value.cart || typeof value.wishlist !== 'object' || !value.wishlist || typeof value.coupon !== 'string' || value.coupon.length > 40) throw Error('Invalid shopping document');
  const items = Object.values(value.cart).map(normalizeCartItem);
  if (items.length > 200 || items.some(item => !item) || Object.keys(value.wishlist).length > 2000) throw Error('Invalid shopping list');
  return { revision: value.revision, cart: Object.fromEntries(items.map(item => [item!.id, item!])), wishlist: Object.fromEntries(Object.entries(value.wishlist).filter(([key, enabled]) => safeKey(key, 120) && enabled === true).map(([key]) => [key, true as const])), coupon: value.coupon, tombstones: Object.fromEntries(Object.entries(value.tombstones || {}).filter(([key, revision]) => safeKey(key) && Number.isSafeInteger(revision) && Number(revision) >= 0).map(([key, revision]) => [key, Number(revision)])) };
}
export function normalizeCartItem(value: any): CartItem | null {
  if (!value || !safeKey(value.id) || !Number.isSafeInteger(value.quantity) || value.quantity < 1 || value.quantity > 99 || !Number.isSafeInteger(value.price) || value.price < 0) return null;
  let legacy: unknown;
  try { legacy = JSON.parse(value.id); } catch { legacy = null; }
  const productId = String(value.productId || (Array.isArray(legacy) ? legacy[0] : ''));
  if (!productId || productId.length > 120) return null;
  return { id: value.id.slice(0, 500), productId, variantId: typeof value.variantId === 'string' ? value.variantId.slice(0, 120) : undefined, title: String(value.title || '').slice(0, 200), image: String(value.image || '').slice(0, 2000), price: value.price, quantity: value.quantity, size: String(value.size || '').slice(0, 40), color: String(value.color || '').slice(0, 120) };
}
export function applyShopperOperation(doc: ShopperDocument, op: ShopperOperation): void {
  const key = op.key || '';
  if (key && !safeKey(key)) throw Error('Invalid shopping key');
  if (op.kind === 'delta' && op.item && key) {
    if (!op.restore && (doc.tombstones[key] || 0) > op.base) return;
    const quantity = Math.min(99, Math.max(0, (doc.cart[key]?.quantity || 0) + (op.delta || 0)));
    if (quantity) doc.cart[key] = { ...op.item, quantity };
    else { delete doc.cart[key]; doc.tombstones[key] = doc.revision + 1; }
  } else if (op.kind === 'remove') { delete doc.cart[key]; doc.tombstones[key] = doc.revision + 1; }
  else if (op.kind === 'wish') { if (op.enabled) doc.wishlist[key] = true; else delete doc.wishlist[key]; }
  else if (op.kind === 'coupon') doc.coupon = (op.code || '').trim().toUpperCase();
  else if (op.kind === 'merge') {
    for (const item of op.cart || []) {
      if ((doc.tombstones[item.id] || 0) > op.base) continue;
      doc.cart[item.id] = { ...item, quantity: Math.min(99, item.quantity + (doc.cart[item.id]?.quantity || 0)) };
    }
    for (const id of op.wishlist || []) doc.wishlist[id] = true;
    if (!doc.coupon && op.code) doc.coupon = op.code.trim().toUpperCase();
  }
}
export function optimisticShopper(base: ShopperDocument, operations: ShopperOperation[]): ShopperDocument {
  const result = { ...base, cart: { ...base.cart }, wishlist: { ...base.wishlist }, tombstones: { ...base.tombstones } };
  for (const operation of operations) applyShopperOperation(result, operation);
  return result;
}
export function newCartItem(productId: string | number, size: string, variantId: string, color: string, title: string, image: string, price: number): CartItem {
  return { id: cartItemId(productId, size, variantId), productId: String(productId), variantId, size, color, title, image, price, quantity: 1 };
}
