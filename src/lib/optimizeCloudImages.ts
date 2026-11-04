import { supabase } from './supabase';
import { fetchSiteConfigFromSupabase, saveSiteConfigToSupabase, uploadDataUrlToSupabase } from './storage';
import { imageBlobDataUrl, smartConvertImage } from './imageConversion';
import { collectStoreImages, isStoreImage } from './imageOptimizationModel';

export interface ImageOptimizationProgress { done: number; total: number; optimized: number; skipped: number; failed: number; savedBytes: number; }

/** Originals and database rows stay intact; the shared cloud map switches published references. */
export async function optimizeCloudImages(onProgress: (progress: ImageOptimizationProgress) => void, stopped: () => boolean) {
  if (!supabase) throw new Error('اتصال Supabase غير متاح.');
  const products: any[] = [];
  for (let page = 0; ; page++) {
    if (stopped()) throw new Error('توقفت المعالجة قبل البدء.');
    const { data, error } = await supabase.from('products').select('*,product_media(*)').order('id').range(page * 100, page * 100 + 99);
    if (error || !Array.isArray(data)) throw new Error('تعذّر قراءة الكتالوج الكامل من السحابة.');
    products.push(...data);
    if (data.length < 100) break;
  }
  const config = await fetchSiteConfigFromSupabase(false);
  if (!config) throw new Error('تعذّر قراءة إعدادات الصور من السحابة.');
  const sources = collectStoreImages([products, config]).filter(source => !config.image_optimizations?.[source]);
  const progress: ImageOptimizationProgress = { done: 0, total: sources.length, optimized: 0, skipped: 0, failed: 0, savedBytes: 0 };
  onProgress({ ...progress });
  for (const source of sources) {
    if (stopped()) break;
    try {
      const response = await fetch(source, { signal: AbortSignal.timeout(20000) });
      if (!response.ok || Number(response.headers.get('content-length')) > 20 * 1024 * 1024) throw new Error('download');
      const original = await response.blob();
      const converted = await smartConvertImage(original);
      if (converted === original) progress.skipped++;
      else {
        const target = await uploadDataUrlToSupabase(await imageBlobDataUrl(converted), 'optimized', 'photo');
        if (!isStoreImage(target) || !new URL(target).pathname.includes('/product-images/optimized/')) throw new Error('upload');
        if (!await saveSiteConfigToSupabase({ image_optimizations: { [source]: target } }, true)) throw new Error('save');
        const verified = await fetchSiteConfigFromSupabase(false);
        if (verified?.image_optimizations?.[source] !== target) throw new Error('verify');
        progress.optimized++;
        progress.savedBytes += Math.max(0, original.size - converted.size);
      }
    } catch { progress.failed++; }
    progress.done++;
    onProgress({ ...progress });
  }
  return progress;
}
