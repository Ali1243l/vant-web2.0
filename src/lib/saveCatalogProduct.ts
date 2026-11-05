import type { Product } from '../types';
import { uploadDataUrlToSupabase } from './storage';

export async function saveCatalogProduct(client: any, id: string | number | null, patch: Partial<Product>) {
  if (!client) throw new Error('اتصال السحابة غير متاح.');
  patch = { ...patch };
  const uploaded = new Map<string, string>();
  const prepare = async (url: string) => {
    if (!url.startsWith('data:')) return url;
    if (!uploaded.has(url)) uploaded.set(url, await uploadDataUrlToSupabase(url, 'catalog', 'media'));
    return uploaded.get(url)!;
  };
  if (patch.images) { const images: string[] = []; for (const url of patch.images) images.push(await prepare(url)); patch.images = images; }
  if (patch.image_url) patch.image_url = await prepare(patch.image_url);
  if (patch.variants) {
    const variants = [];
    for (const variant of patch.variants) { const images: string[] = []; for (const url of variant.images) images.push(await prepare(url)); variants.push({ ...variant, images }); }
    patch.variants = variants;
  }
  const fields: Record<string, unknown> = {};
  for (const key of ['title', 'price', 'category', 'description', 'material', 'fit_details', 'sizes', 'colors'] as const) {
    if (patch[key] !== undefined) fields[key] = patch[key];
  }
  if (patch.title_ar !== undefined && patch.title === undefined) fields.title = patch.title_ar;
  if (patch.description_ar !== undefined && patch.description === undefined) fields.description = patch.description_ar;
  if (patch.is_offer !== undefined) fields.is_exclusive_drop = patch.is_offer;
  if (patch.availability !== undefined) fields.status = ({ sold_out: 'SOLD_OUT', coming_soon: 'COMING_SOON', limited: 'LIMITED', in_stock: 'AVAILABLE' })[patch.availability];
  const metadata: Record<string, unknown> = {};
  for (const key of ['title_ar', 'description_ar', 'category_ar', 'is_offer', 'original_price', 'offer_badge_ar', 'offer_badge_en', 'tags', 'catalog_image', 'image_url', 'images', 'colors', 'variants', 'sku', 'stock'] as const) {
    if (Object.hasOwn(patch, key)) metadata[key] = patch[key] ?? null;
  }
  if (patch.is_offer === false) Object.assign(metadata, { original_price: null, offer_badge_ar: null, offer_badge_en: null });
  const media = patch.images !== undefined ? patch.images : patch.image_url ? [patch.image_url] : null;
  const { data, error } = await client.rpc('save_catalog_product', { p_id: id, p_fields: fields, p_metadata: metadata, p_media: media });
  if (error || !data?.id) throw new Error('تعذّر حفظ المنتج بالسحابة. بقيت المسودة مفتوحة؛ تحقق من الاتصال وصلاحية الأدمن.');
  return data;
}
