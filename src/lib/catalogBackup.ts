import type { Product } from '../types';
import type { CurrencyType, SiteControlItem } from '../context/siteControlsTypes';

export const PREVIOUS_CATALOG_BACKUP = 'vant_catalog_before_restore';
export function storeCatalogRestore(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>, before: string, writes: Record<string, string>) {
  const previous = Object.keys(writes).map(key => [key, storage.getItem(key)] as const);
  storage.setItem(PREVIOUS_CATALOG_BACKUP, before);
  try { for (const [key, value] of Object.entries(writes)) storage.setItem(key, value); }
  catch (error) {
    for (const [key] of previous) storage.removeItem(key);
    for (const [key, value] of previous) if (value !== null) storage.setItem(key, value);
    throw error;
  }
}
export interface CatalogBackup { version?: string; currency?: CurrencyType; controls?: Record<string, SiteControlItem>; products?: Product[] }
const object = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string';
const money = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;
const strings = (value: unknown) => Array.isArray(value) && value.every(text);
const availability = ['in_stock', 'limited', 'sold_out', 'coming_soon'];
const image = (value: string) => !value || /^\/(?!\/)/.test(value) || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value) || (() => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password; } catch { return false; } })();
const images = (value: unknown) => strings(value) && (value as string[]).every(image);

export function parseCatalogBackup(raw: string, knownControls: Record<string, SiteControlItem>): CatalogBackup {
  if (raw.length > 10_000_000) throw new Error('size');
  const data: unknown = JSON.parse(raw);
  if (!object(data) || (data.version !== undefined && data.version !== '2.0')) throw new Error('version');
  const result: CatalogBackup = {};
  if (data.currency !== undefined) {
    if (!['د.ع', 'IQD', 'USD'].includes(data.currency)) throw new Error('currency');
    result.currency = data.currency;
  }
  if (data.controls !== undefined) {
    if (!object(data.controls) || !Object.keys(data.controls).length) throw new Error('controls');
    result.controls = {};
    for (const [id, control] of Object.entries(data.controls)) {
      if (!Object.hasOwn(knownControls, id) || !object(control) || control.id !== id || typeof control.visible !== 'boolean' || typeof control.enabled !== 'boolean' || !['label_ar', 'label_en'].every(key => text(control[key])) || (control.actionValue !== undefined && !text(control.actionValue))) throw new Error('control');
      if (id === 'banner_hero_bg' && control.actionValue && !image(control.actionValue)) throw new Error('image');
      result.controls[id] = { ...knownControls[id], visible: control.visible, enabled: control.enabled, label_ar: control.label_ar, label_en: control.label_en, ...(control.actionValue !== undefined ? { actionValue: control.actionValue } : {}) };
    }
  }
  if (data.products !== undefined) {
    if (!Array.isArray(data.products) || !data.products.length) throw new Error('products');
    const ids = new Set<string>();
    for (const product of data.products) {
      if (!object(product) || !((text(product.id) && product.id.trim()) || (typeof product.id === 'number' && Number.isFinite(product.id))) || ids.has(String(product.id))) throw new Error('id');
      ids.add(String(product.id));
      if (!text(product.title) || !product.title.trim() || !text(product.category) || !text(product.image_url) || !image(product.image_url) || !money(product.price) || !strings(product.sizes)) throw new Error('product');
      for (const key of ['title_ar', 'category_ar', 'description', 'description_ar', 'material', 'fit_details', 'sku', 'currency', 'aspect_ratio', 'created_at', 'offer_badge_ar', 'offer_badge_en']) if (product[key] !== undefined && !text(product[key])) throw new Error(key);
      for (const key of ['colors', 'tags']) if (product[key] !== undefined && !strings(product[key])) throw new Error(key);
      for (const key of ['width', 'height']) if (product[key] != null && (!money(product[key]) || product[key] === 0)) throw new Error(key);
      if ((product.images !== undefined && !images(product.images)) || (product.availability !== undefined && !availability.includes(product.availability)) || (product.stock !== undefined && (!Number.isSafeInteger(product.stock) || product.stock < 0)) || (product.original_price !== undefined && (!money(product.original_price) || product.original_price < product.price))) throw new Error('product values');
      for (const key of ['is_offer', 'is_demo']) if (product[key] !== undefined && typeof product[key] !== 'boolean') throw new Error(key);
      if (product.variants !== undefined) {
        if (!Array.isArray(product.variants)) throw new Error('variants');
        const variantIds = new Set<string>();
        for (const variant of product.variants) {
          if (!object(variant) || !text(variant.id) || !variant.id || variantIds.has(variant.id) || !strings(variant.sizes) || !images(variant.images)) throw new Error('variant');
          variantIds.add(variant.id);
          for (const key of ['colorNameAr', 'colorNameEn', 'colorHex']) if (variant[key] !== undefined && !text(variant[key])) throw new Error(key);
          if ((variant.price !== undefined && !money(variant.price)) || (variant.salePrice !== undefined && (!money(variant.salePrice) || variant.salePrice >= (variant.price ?? product.original_price ?? product.price))) || (variant.stock !== undefined && (!Number.isSafeInteger(variant.stock) || variant.stock < 0)) || (variant.availability !== undefined && !availability.includes(variant.availability))) throw new Error('variant values');
        }
      }
    }
    result.products = data.products;
  }
  if (!Object.keys(result).length) throw new Error('empty');
  return result;
}
