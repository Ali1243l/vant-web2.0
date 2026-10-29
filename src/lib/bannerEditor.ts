import type { SiteControlItem } from '../context/siteControlsTypes';
import type { TrendItem } from '../types';
import { DEFAULT_SITE_CONTROLS } from '../context/defaultSiteControls.ts';
import { HERO_APPEARANCE_CONTROL, parseHeroAppearance } from './heroAppearance.ts';
import { STORE_THEME_CONTROL, CUSTOM_THEMES_CONTROL, parseStoreTheme, paletteIssue, type StoreTheme } from './storefrontTheme.ts';
import { BANNER_TARGET_CONTROL, parseBannerTarget } from './bannerTarget.ts';
export type BannerEdits = Record<string, Partial<SiteControlItem>>;
export type TrendEdits = Record<string, Partial<TrendItem>>;
const bannerIds = ['banner_hero_visible', 'banner_hero_title', 'banner_hero_subtitle', 'banner_hero_tag', 'banner_hero_btn', 'banner_hero_bg', HERO_APPEARANCE_CONTROL, STORE_THEME_CONTROL, CUSTOM_THEMES_CONTROL, BANNER_TARGET_CONTROL];
export function validBannerImage(value: string): boolean {
  if (!value) return true;
  if (/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) return value.length <= 4000000;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}
export function validateBannerFile(file: { type: string; size: number }): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size > 0 && file.size <= 10 * 1024 * 1024;
}
export function buildBannerChanges(controls: Record<string, SiteControlItem>, trends: TrendItem[], edits: BannerEdits, trendEdits: TrendEdits) {
  const changedControls: Record<string, SiteControlItem> = {};
  for (const [id, patch] of Object.entries(edits)) {
    const base = controls[id] || DEFAULT_SITE_CONTROLS[id];
    if (!bannerIds.includes(id) || !base) throw new Error('scope');
    if (Object.keys(patch).some(key => !['label_ar', 'label_en', 'visible', 'actionValue'].includes(key))) throw new Error('scope');
    if (patch.visible !== undefined && typeof patch.visible !== 'boolean') throw new Error('visibility');
    for (const key of ['label_ar', 'label_en'] as const) if (patch[key] !== undefined && (typeof patch[key] !== 'string' || patch[key]!.length > 1000 || !patch[key]!.trim())) throw new Error('text');
    const next = { ...base, ...patch };
    if (id === 'banner_hero_bg' && !validBannerImage(next.actionValue || '')) throw new Error('image');
    if (id === HERO_APPEARANCE_CONTROL) next.actionValue = JSON.stringify(parseHeroAppearance(next.actionValue));
    if (id === STORE_THEME_CONTROL) {
      const theme = parseStoreTheme(next.actionValue);
      if (theme.enabled && paletteIssue(theme)) throw new Error('contrast');
      next.actionValue = JSON.stringify(theme);
    }
    if (id === CUSTOM_THEMES_CONTROL) next.actionValue = JSON.stringify(parseSavedThemes(next.actionValue, true));
    if (id === BANNER_TARGET_CONTROL) next.actionValue = JSON.stringify(parseBannerTarget(next.actionValue, true));
    changedControls[id] = next;
  }
  for (const [id, patch] of Object.entries(trendEdits)) {
    if (!trends.some(row => row.id === id) || Object.keys(patch).some(key => !['titleAr', 'titleEn', 'subtitleAr', 'subtitleEn', 'tagAr', 'tagEn', 'image'].includes(key))) throw new Error('scope');
    if (Object.values(patch).some(value => typeof value !== 'string')) throw new Error('text');
    if (patch.image !== undefined && !validBannerImage(patch.image)) throw new Error('image');
    if (Object.entries(patch).some(([key, value]) => key !== 'image' && (!value!.trim() || value!.length > 1000))) throw new Error('text');
  }
  return { controls: changedControls, trendItems: trends.map(row => ({ ...row, ...trendEdits[row.id] })) };
}
export interface SavedTheme { id: string; name: string; appearance: string; store: StoreTheme; image: string; copy: Record<'banner_hero_title' | 'banner_hero_subtitle' | 'banner_hero_tag' | 'banner_hero_btn', { label_ar: string; label_en: string }> }
export function parseSavedThemes(raw?: string, strict = false): SavedTheme[] {
  try {
    if (raw && raw.length > 6000000) throw new Error('themes');
    const items: unknown = JSON.parse(raw || '[]');
    if (!Array.isArray(items) || items.length > 20) throw new Error('themes');
    const seen = new Set<string>();
    return items.map(row => {
      if (!row || typeof row.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(row.id) || seen.has(row.id) || typeof row.name !== 'string' || !row.name.trim() || row.name.length > 80 || typeof row.image !== 'string' || !validBannerImage(row.image)) throw new Error('themes');
      seen.add(row.id);
      const store = parseStoreTheme(JSON.stringify(row.store));
      if (paletteIssue(store)) throw new Error('contrast');
      const copy = {} as SavedTheme['copy'];
      for (const id of ['banner_hero_title', 'banner_hero_subtitle', 'banner_hero_tag', 'banner_hero_btn'] as const) {
        const text = row.copy?.[id];
        if (!text || ![text.label_ar, text.label_en].every(value => typeof value === 'string' && value.trim() && value.length <= 1000)) throw new Error('themes');
        copy[id] = { label_ar: text.label_ar, label_en: text.label_en };
      }
      return { id: row.id, name: row.name.trim(), image: row.image, appearance: JSON.stringify(parseHeroAppearance(row.appearance)), store, copy };
    });
  } catch (error) { if (strict) throw error; return []; }
}
export function captureSavedTheme(id: string, name: string, controls: Record<string, SiteControlItem>): SavedTheme {
  const copy = Object.fromEntries(['banner_hero_title', 'banner_hero_subtitle', 'banner_hero_tag', 'banner_hero_btn'].map(key => [key, { label_ar: controls[key]?.label_ar || '', label_en: controls[key]?.label_en || '' }])) as SavedTheme['copy'];
  return parseSavedThemes(JSON.stringify([{ id, name, copy, appearance: controls[HERO_APPEARANCE_CONTROL]?.actionValue, store: parseStoreTheme(controls[STORE_THEME_CONTROL]?.actionValue), image: controls.banner_hero_bg?.actionValue || '' }]), true)[0];
}
export function savedThemeEdits(theme: SavedTheme): BannerEdits {
  return { [HERO_APPEARANCE_CONTROL]: { actionValue: theme.appearance }, [STORE_THEME_CONTROL]: { actionValue: JSON.stringify(theme.store) }, banner_hero_bg: { actionValue: theme.image }, ...theme.copy };
}
export function validateWelcomeDraft(draft: { welcome_title_ar: string; welcome_title_en: string; welcome_message_ar: string; welcome_message_en: string; welcome_coupon_code: string; welcome_discount_percent: number; welcome_modal_enabled: boolean }) {
  if (![draft.welcome_title_ar, draft.welcome_title_en, draft.welcome_message_ar, draft.welcome_message_en].every(value => typeof value === 'string' && value.trim() && value.length <= 1000)) return 'text';
  if (typeof draft.welcome_coupon_code !== 'string' || !/^[A-Z0-9_-]{3,40}$/.test(draft.welcome_coupon_code)) return 'code';
  if (!Number.isFinite(draft.welcome_discount_percent) || draft.welcome_discount_percent <= 0 || draft.welcome_discount_percent >= 100) return 'discount';
  return null;
}

export function storeBannerDraft(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>, controlKey: string, controls: unknown, trends: unknown) {
  const entries = [[controlKey, JSON.stringify(controls)], ['vant_custom_trends_v2', JSON.stringify(trends)]];
  const previous = entries.map(([key]) => [key, storage.getItem(key)] as const);
  try { for (const [key, value] of entries) storage.setItem(key, value); }
  catch (error) {
    for (const [key, value] of previous) {
      try { if (value === null) storage.removeItem(key); else storage.setItem(key, value); } catch {}
    }
    throw error;
  }
}
