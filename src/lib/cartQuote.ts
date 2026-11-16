import type { CartItem } from './cart.ts';
import type { Product } from '../types';
import { resolveProductColorVariants } from './productVariants.ts';
import { checkoutQuote } from './checkoutDraft.ts';
import { normalizeOffers } from '../admin/offers/offerModel.ts';

export interface CheckedCartItem extends CartItem { issue: 'missing' | 'selection' | 'stock' | 'price' | null; previousPrice: number; maxQuantity: number }
export interface CartQuote { items: CheckedCartItem[]; subtotal: number; discount: number; total: number; code: string; couponError: boolean; blocked: boolean; checkedAt: number }
export function verifyCart(items: CartItem[], products: Product[], offers: unknown[], code: string, now = Date.now()): CartQuote {
  if (!Array.isArray(items) || items.length > 200 || code.length > 40) throw Error('cart');
  const index = new Map(products.map(product => [String(product.id), product]));
  const variants = new Map<string, ReturnType<typeof resolveProductColorVariants>>();
  const keys = new Set<string>();
  const checked: CheckedCartItem[] = items.map(item => {
    if (!item?.productId || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 || !Number.isSafeInteger(item.price) || item.price < 0) throw Error('cart');
    const product = index.get(item.productId);
    const result: CheckedCartItem = { ...item, image: item.image || '', title: item.title || '', previousPrice: item.price, maxQuantity: 0, issue: 'missing' };
    if (!product) return result;
    if (!variants.has(item.productId)) variants.set(item.productId, resolveProductColorVariants(product, 'IQD'));
    const choices = variants.get(item.productId)!.variants;
    const variant = item.variantId ? choices.find(row => row.id === item.variantId) : choices.length === 1 ? choices[0] : choices.find(row => `${row.colorNameAr} (${row.colorNameEn})` === item.color);
    const identity = JSON.stringify([item.productId, variant?.id, item.size]);
    if (!variant || !item.size || !variant.sizes.includes(item.size) || keys.has(identity)) return { ...result, issue: 'selection' };
    keys.add(identity);
    const raw = product.variants?.find(row => row.id === variant.id);
    const stock = typeof raw?.stock === 'number' ? raw.stock : product.stock;
    const maxQuantity = stock === undefined ? 99 : Number.isFinite(stock) ? Math.min(99, Math.max(0, Math.floor(stock))) : 0;
    const unavailable = product.availability === 'sold_out' || product.availability === 'coming_soon' || variant.availability === 'sold_out' || variant.availability === 'coming_soon';
    const price = variant.price;
    if (!Number.isSafeInteger(price) || price <= 0) return { ...result, issue: 'selection' };
    return { ...result, title: product.title_ar || product.title, variantId: variant.id, price, maxQuantity: unavailable ? 0 : maxQuantity, issue: unavailable || item.quantity > maxQuantity ? 'stock' : price !== item.price ? 'price' : null };
  });
  const eligible = checked.filter(item => item.issue !== 'missing' && item.issue !== 'selection' && item.issue !== 'stock');
  let totals = { subtotal: 0, discount: 0, total: 0, code: '' }, couponError = false;
  if (eligible.length) {
    totals = checkoutQuote(eligible, '', [], now);
    if (code.trim()) { try { totals = checkoutQuote(eligible, code, normalizeOffers(offers), now); } catch { couponError = true; } }
  } else if (code.trim()) couponError = true;
  return { items: checked, ...totals, couponError, blocked: !checked.length || couponError || checked.some(item => item.issue !== null), checkedAt: now };
}

export function productForCartQuote(row: any): Product {
  const meta = row.admin_metadata || {};
  return { id: row.id, title: row.title, title_ar: meta.title_ar, price: Number(row.price), original_price: meta.original_price,
    image_url: '', images: [], category: row.category || '', sizes: row.sizes || [], colors: meta.colors ?? row.colors,
    variants: meta.variants, stock: meta.stock, availability: /SOLD_OUT|OUT_OF_STOCK/.test(row.status) ? 'sold_out' : row.status === 'COMING_SOON' ? 'coming_soon' : 'in_stock' };
}
