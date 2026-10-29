import { DEFAULT_SITE_CONTROLS } from '../context/defaultSiteControls.ts';
import type { SiteControlItem } from '../context/siteControlsTypes';
import { normalizeSearchText } from './search.ts';
export type ControlEdits = Record<string, Partial<Pick<SiteControlItem, 'visible' | 'enabled' | 'label_ar' | 'label_en' | 'actionValue'>>>;
export const CONTROL_GROUPS = [
  ['cart', 'السلة وتثبيت الطلب', 'Cart & order confirmation'], ['whatsapp', 'واتساب والتواصل', 'WhatsApp & contact'],
  ['wishlist', 'المفضلة', 'Wishlist'], ['size_bespoke', 'القياسات والتفصيل', 'Sizing & bespoke'],
  ['search_filter', 'البحث والتصفية', 'Search & filters'], ['hero_banner', 'البانر والثيمات', 'Banner & themes'],
  ['product_info', 'معلومات القطعة', 'Product information'], ['brand_footer', 'الهوية والفوتر', 'Brand & footer'],
] as const;
const studio = ['banner_hero_appearance', 'store_theme', 'store_custom_themes', 'banner_hero_target', 'banner_hero_bg'];
const feature = ['feature_whatsapp', 'enableCartAnimation', 'sec_category_tabs', 'banner_hero_visible', 'sec_trends_carousel', 'card_status_badge', 'card_price_tag', 'card_category_label', 'card_hover_preview', 'brand_kinetic_logo', 'sec_newsletter_subscription'];
const dynamic = ['feature_whatsapp', 'enableCartAnimation', 'sec_category_tabs', 'sec_trends_carousel', 'card_status_badge', 'card_price_tag', 'card_category_label', 'card_hover_preview', 'banner_hero_visible', 'sec_newsletter_subscription', 'footer_social_links'];
export function controlKind(id: string): 'studio' | 'phone' | 'feature' | 'action' | 'text' {
  return studio.includes(id) ? 'studio' : id.startsWith('cfg_') ? 'phone' : feature.includes(id) ? 'feature' : id.startsWith('btn_') || ['card_wishlist_btn', 'footer_social_links'].includes(id) ? 'action' : 'text';
}
export const controlActive = (item: { visible?: boolean; enabled?: boolean }) => item.visible !== false && item.enabled !== false;
export const controlHasText = (id: string) => !['phone', 'studio'].includes(controlKind(id)) && !dynamic.includes(id);
export const controlTextLimit = (id: string) => id === 'brand_kinetic_logo' ? 24 : controlKind(id) === 'action' ? 80 : 1000;
export function resolveControl(item: SiteControlItem, controls: Record<string, SiteControlItem> = DEFAULT_SITE_CONTROLS): SiteControlItem {
  if (['btn_product_whatsapp', 'btn_cart_whatsapp', 'btn_product_bespoke'].includes(item.id) && !controlActive(controls.feature_whatsapp || DEFAULT_SITE_CONTROLS.feature_whatsapp)) return { ...item, enabled: false };
  return ['feature', 'text'].includes(controlKind(item.id)) ? { ...item, visible: controlActive(item) } : item;
}
export function normalizeControlPhone(raw: string): string {
  const digits = raw.replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776)).replace(/[\s()+-]/g, '');
  if (!/^[1-9]\d{7,14}$/.test(digits)) throw new Error('phone');
  return digits;
}
export function buildControlChanges(controls: Record<string, SiteControlItem>, edits: ControlEdits): Record<string, SiteControlItem> {
  const changed: Record<string, SiteControlItem> = {};
  for (const [id, patch] of Object.entries(edits)) {
    const def = DEFAULT_SITE_CONTROLS[id], kind = controlKind(id);
    if (!Object.hasOwn(DEFAULT_SITE_CONTROLS, id) || !def || kind === 'studio') throw new Error('scope');
    const allowed = kind === 'phone' ? ['actionValue'] : [...(id === 'feature_whatsapp' ? [] : ['visible']), 'enabled', ...(controlHasText(id) ? ['label_ar', 'label_en'] : [])];
    if (Object.keys(patch).some(key => !allowed.includes(key))) throw new Error('scope');
    const next = { ...def, ...controls[id], ...patch };
    for (const key of ['visible', 'enabled'] as const) if (patch[key] !== undefined && typeof patch[key] !== 'boolean') throw new Error('state');
    for (const key of ['label_ar', 'label_en'] as const) if (patch[key] !== undefined && (typeof patch[key] !== 'string' || !patch[key]!.trim() || patch[key]!.length > controlTextLimit(id))) throw new Error('text');
    if (kind === 'phone') { if (typeof next.actionValue !== 'string') throw new Error('phone'); next.actionValue = normalizeControlPhone(next.actionValue); }
    if (id === 'btn_newsletter_subscribe' && (patch.label_ar !== undefined || patch.label_en !== undefined)) next.actionValue = 'custom-label';
    changed[id] = next;
  }
  return changed;
}
export function controlResetPatch(id: string): ControlEdits[string] {
  const item = DEFAULT_SITE_CONTROLS[id];
  if (!item || controlKind(id) === 'studio') throw new Error('scope');
  return controlKind(id) === 'phone' ? { actionValue: item.actionValue } : { ...(id === 'feature_whatsapp' ? {} : { visible: item.visible }), enabled: item.enabled, ...(controlHasText(id) ? { label_ar: item.label_ar, label_en: item.label_en } : {}) };
}
export function controlWarnings(controls: Record<string, SiteControlItem>): string[] {
  const active = (id: string) => controlActive(resolveControl(controls[id] || DEFAULT_SITE_CONTROLS[id], controls));
  const result: string[] = [];
  if (!active('feature_whatsapp')) result.push('whatsapp-master');
  if (active('btn_product_add_to_cart') && !active('btn_header_cart')) result.push('cart-entry');
  if (active('btn_header_cart') && !active('btn_cart_whatsapp')) result.push('cart-confirm');
  if (active('card_wishlist_btn') && !active('btn_header_wishlist')) result.push('wishlist-entry');
  return result;
}
export function editControlDraft(base: Record<string, SiteControlItem>, edits: ControlEdits, id: string, change: ControlEdits[string]): ControlEdits {
  const next = { ...edits }, merged = { ...edits[id], ...change };
  for (const key of Object.keys(merged) as (keyof typeof merged)[]) if (merged[key] === base[id][key]) delete merged[key];
  if (Object.keys(merged).length) next[id] = merged; else delete next[id];
  return next;
}
export function bulkControlDraft(base: Record<string, SiteControlItem>, edits: ControlEdits, ids: string[], key: 'visible' | 'enabled', value: boolean): ControlEdits {
  let next = edits;
  for (const id of ids) if (Object.hasOwn(DEFAULT_SITE_CONTROLS, id) && !['phone', 'studio'].includes(controlKind(id)) && !(id === 'feature_whatsapp' && key === 'visible')) next = editControlDraft(base, next, id, { [key]: value });
  return next;
}
export function filterControls(items: SiteControlItem[], query: string, group: string, status: string, edits: ControlEdits): SiteControlItem[] {
  const q = normalizeSearchText(query);
  const all = Object.fromEntries(items.map(item => [item.id, item]));
  return items.filter(item => (group === 'all' || item.category === group) && (!q || normalizeSearchText([item.id, item.name_ar, item.name_en, item.label_ar, item.label_en, item.description_ar, item.description_en].join(' ')).includes(q)) && (status === 'all' || (status === 'hidden' && !item.visible) || (status === 'disabled' && !resolveControl(item, all).enabled) || (status === 'active' && controlActive(resolveControl(item, all))) || (status === 'changed' && !!edits[item.id])));
}
