import type { Offer } from '../useAdminBridge';

export type OfferState = 'active' | 'scheduled' | 'paused' | 'expired' | 'exhausted' | 'invalid';
export function offerDay(now = Date.now()) {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Baghdad', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  return ['year', 'month', 'day'].map(key => parts.find(part => part.type === key)!.value).join('-');
}
export function offerBoundary(value: string, end = false): number {
  if (typeof value !== 'string') return NaN;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const day = Date.parse(`${value}T00:00:00Z`);
    if (!Number.isFinite(day) || new Date(day).toISOString().slice(0, 10) !== value) return NaN;
    return Date.parse(`${value}T00:00:00+03:00`) + (end ? 86400000 - 1 : 0);
  }
  return /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,6})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(offerBoundary(value.slice(0, 10))) ? Date.parse(value) : NaN;
}
export function parseOfferNumber(value: string): number {
  const text = value.trim().replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776)).replace('٫', '.');
  return /^\d+(?:\.\d{1,2})?$/.test(text) ? Number(text) : NaN;
}
export function validateOffer(offer: Omit<Offer, 'id' | 'usedCount'> & { id?: string; usedCount?: number }, offers: Offer[] = []): string | null {
  if (!offer.title?.trim()) return 'title';
  if (!/^[A-Z0-9_-]{3,40}$/.test(offer.code)) return 'code';
  if (offers.some(other => other.id !== offer.id && other.code.trim().toUpperCase() === offer.code)) return 'duplicate';
  if (!Number.isFinite(offer.discountValue) || offer.discountValue <= 0 || !['percentage', 'fixed'].includes(offer.discountType)
    || (offer.discountType === 'percentage' ? offer.discountValue >= 100 : !Number.isSafeInteger(offer.discountValue))) return 'amount';
  if (offer.minSpend !== undefined && (!Number.isSafeInteger(offer.minSpend) || offer.minSpend < 0)) return 'minimum';
  if (offer.maxUses !== undefined && (!Number.isSafeInteger(offer.maxUses) || offer.maxUses <= 0)) return 'limit';
  if (offer.usedCount !== undefined && (!Number.isSafeInteger(offer.usedCount) || offer.usedCount < 0)) return 'limit';
  if (!['active', 'scheduled', 'paused', 'expired'].includes(offer.status)) return 'status';
  const start = offerBoundary(offer.startDate), end = offerBoundary(offer.endDate, true);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) return 'dates';
  return null;
}
export function offerState(offer: Offer, now = Date.now()): OfferState {
  if (validateOffer(offer) || !Number.isFinite(now)) return 'invalid';
  if (now > offerBoundary(offer.endDate, true)) return 'expired';
  if (offer.maxUses !== undefined && offer.usedCount >= offer.maxUses) return 'exhausted';
  if (offer.status === 'paused' || offer.status === 'expired') return 'paused';
  if (now < offerBoundary(offer.startDate)) return 'scheduled';
  return 'active';
}
export function productCampaignPrice(offer: Offer, price: number, now = Date.now()): number | null {
  if (offerState(offer, now) !== 'active' || (offer.minSpend || 0) > 0 || offer.maxUses !== undefined || !Number.isFinite(price) || price <= 0) return null;
  const result = offer.discountType === 'percentage' ? Math.round(price * (1 - offer.discountValue / 100) / 250) * 250 : price - offer.discountValue;
  return result > 0 && result < price ? result : null;
}
export function quoteOffer(offer: Offer, subtotal: number, now = Date.now()) {
  if (offerState(offer, now) !== 'active' || !Number.isSafeInteger(subtotal) || subtotal <= 0 || subtotal < (offer.minSpend || 0)) return null;
  const discount = Math.min(subtotal, offer.discountType === 'percentage' ? Math.round(subtotal * (offer.discountValue / 100)) : offer.discountValue);
  return { subtotal, discount, total: subtotal - discount };
}
export function normalizeOffers(value: unknown): Offer[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.filter(row => {
    if (!row || typeof row !== 'object' || typeof row.id !== 'string' || ids.has(row.id)) return false;
    ids.add(row.id); return true;
  }).map(row => ({
    id: row.id, title: String(row.title ?? ''), titleEn: String(row.titleEn ?? row.title_en ?? ''), code: String(row.code ?? '').trim().toUpperCase(),
    discountType: row.discountType ?? row.discount_type, discountValue: Number(row.discountValue ?? row.discount_value), status: row.status,
    startDate: String(row.startDate ?? row.start_date ?? ''), endDate: String(row.endDate ?? row.end_date ?? ''), usedCount: Number(row.usedCount ?? row.used_count ?? 0),
    minSpend: row.minSpend == null && row.min_spend == null ? undefined : Number(row.minSpend ?? row.min_spend),
    maxUses: row.maxUses == null && row.max_uses == null ? undefined : Number(row.maxUses ?? row.max_uses),
  }));
}
