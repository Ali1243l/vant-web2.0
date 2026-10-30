import type { CartItem } from './cart';
import type { Offer } from '../admin/useAdminBridge';
import { quoteOffer } from '../admin/offers/offerModel.ts';

export const CHECKOUT_DRAFTS_KEY = 'vant_checkout_drafts_v1';
export function checkoutQuote(items: CartItem[], code: string, offers: Offer[], now = Date.now()) {
  if (!items.length || items.some(item => !item.id || typeof item.title !== 'string' || !item.title.trim() || !Number.isSafeInteger(item.price) || item.price < 0 || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) throw new Error('cart');
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!Number.isSafeInteger(subtotal) || subtotal <= 0) throw new Error('cart');
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { subtotal, discount: 0, total: subtotal, code: '' };
  const matching = offers.filter(offer => offer.code === normalized);
  const quote = matching.length === 1 ? quoteOffer(matching[0], subtotal, now) : null;
  if (!quote) throw new Error('coupon');
  return { ...quote, code: normalized };
}

export function prepareCheckoutDraft(storage: Pick<Storage, 'getItem' | 'setItem'>, items: CartItem[], code: string, offers: Offer[], now = Date.now(), id: string = crypto.randomUUID()) {
  const quote = checkoutQuote(items, code, offers, now);
  const draft = { id: `VANT-${id}`, status: 'draft' as const, createdAt: new Date(now).toISOString(), items: items.map(item => ({ ...item })), ...quote };
  const raw = storage.getItem(CHECKOUT_DRAFTS_KEY);
  const previous: unknown = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(previous)) throw new Error('storage');
  storage.setItem(CHECKOUT_DRAFTS_KEY, JSON.stringify([...previous.slice(-19), draft]));
  return draft;
}
export type CheckoutDraft = ReturnType<typeof prepareCheckoutDraft>;

export function checkoutMessage(draft: CheckoutDraft, ar: boolean, format: (value: number) => string) {
  const lines = [ar ? 'مرحباً، أود تثبيت الطلب التالي (الدفع عند الاستلام):' : 'Hello, please confirm this cash-on-delivery order:', `${ar ? 'مرجع الطلب' : 'Reference'}: ${draft.id}`, ''];
  draft.items.forEach((item, index) => lines.push(`${index + 1}. ${item.title}`, `${item.size || '—'} · ${item.color || '—'} · ${ar ? 'الكمية' : 'Qty'}: ${item.quantity}`, format(item.price * item.quantity)));
  lines.push('', `${ar ? 'قيمة القطع' : 'Items subtotal'}: ${format(draft.subtotal)}`);
  if (draft.code) lines.push(`${ar ? 'كود الخصم' : 'Discount code'}: ${draft.code}`, `${ar ? 'الخصم' : 'Discount'}: ${format(draft.discount)}`);
  lines.push(`${ar ? 'بعد الخصم، قبل التوصيل' : 'After discount, before delivery'}: ${format(draft.total)}`, ar ? 'يرجى تأكيد التوفر وصلاحية الكود وأجور التوصيل والعنوان. الطلب غير مؤكد حتى رد المتجر.' : 'Please confirm availability, coupon validity, delivery fees and address. This order is not confirmed until the store replies.');
  return lines.join('\n');
}
