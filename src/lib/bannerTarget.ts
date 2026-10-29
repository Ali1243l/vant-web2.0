import type { Product } from '../types';
export const BANNER_TARGET_CONTROL = 'banner_hero_target';
export interface BannerTarget { mode: 'all_offers' | 'selected_offers' | 'selected_products'; productIds: string[] }
export function parseBannerTarget(raw?: string, strict = false): BannerTarget {
  let value: any;
  try { value = JSON.parse(raw || '{}'); } catch { if (strict) throw new Error('target'); }
  const validMode = ['all_offers', 'selected_offers', 'selected_products'].includes(value?.mode);
  if (strict && (!validMode || !Array.isArray(value.productIds) || value.productIds.length > 200 || value.productIds.some((id: unknown) => typeof id !== 'string' || !id.trim() || id.length > 150))) throw new Error('target');
  if (!validMode) return { mode: 'all_offers', productIds: [] };
  const ids = [...new Set<string>((Array.isArray(value.productIds) ? value.productIds : []).filter((id: unknown) => typeof id === 'string' && id.trim() && id.length <= 150))].slice(0, 200);
  if (strict && value.mode !== 'all_offers' && !ids.length) throw new Error('target');
  return { mode: value.mode, productIds: value.mode === 'all_offers' ? [] : ids };
}
export function matchesBannerTarget(product: Pick<Product, 'id' | 'is_offer'>, target: BannerTarget): boolean {
  if (target.mode === 'all_offers') return !!product.is_offer;
  return target.productIds.includes(String(product.id)) && (target.mode === 'selected_products' || !!product.is_offer);
}
export function hasUnloadedBannerProducts(products: Pick<Product, 'id'>[], target: BannerTarget | null): boolean {
  return !!target && target.productIds.some(id => !products.some(p => String(p.id) === id));
}
export function bannerPageRequestKey(products: Pick<Product, 'id'>[], target: BannerTarget | null, offersOnly: boolean, visibleCount: number): string | null {
  if (visibleCount > 0) return null;
  if (hasUnloadedBannerProducts(products, target)) return `${JSON.stringify(target)}:${products.length}`;
  return offersOnly ? `offers:${products.length}` : null;
}
