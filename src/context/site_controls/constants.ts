import type { ProductEnhancement } from '../siteControlsTypes';

export const STORAGE_KEY = 'vant_site_controls_v2';
export const PRODUCTS_STORAGE_KEY = 'vant_custom_products_v2';
export const ENHANCEMENTS_STORAGE_KEY = 'vant_product_enhancements_v2';
export const CURRENCY_STORAGE_KEY = 'vant_currency_code_v2';
export const SETTINGS_STORAGE_KEY = 'vant_site_settings_v1';
export const SIZES_STORAGE_KEY = 'vant_master_sizes_v2';

export function getStoredEnhancements(): Record<string, ProductEnhancement> {
  try {
    const raw = localStorage.getItem(ENHANCEMENTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function saveProductEnhancement(id: string | number, enhancement: Partial<ProductEnhancement>) {
  try {
    const current = getStoredEnhancements();
    const existing = current[String(id)] || {};
    current[String(id)] = { ...existing, ...enhancement };
    localStorage.setItem(ENHANCEMENTS_STORAGE_KEY, JSON.stringify(current));
  } catch {}
}

export function removeProductEnhancement(id: string | number) {
  try {
    const current = getStoredEnhancements();
    delete current[String(id)];
    localStorage.setItem(ENHANCEMENTS_STORAGE_KEY, JSON.stringify(current));
  } catch {}
}
