import { saveOfferSnapshot, fetchOfferSnapshot } from './offerStorage';
import { supabase } from './supabase';
import { normalizeOrders } from './orderModel';
import { imageBlobDataUrl, imageUploadPath, smartConvertImage } from './imageConversion';
import { replaceOptimizedImages } from './imageOptimizationModel';

export interface UploadedMediaItem {
  url: string;
  relativePath?: string;
  fileName: string;
  size: number;
}

/**
 * Fallback to public fast image CDN for 100% email client compatibility
 */
export async function uploadToFreeCdn(fileOrBlob: Blob | File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('source', fileOrBlob);
    formData.append('key', '6d207e02198a847aa98d0a2a901485a5');
    formData.append('action', 'upload');
    formData.append('format', 'json');

    const res = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.image?.url) {
        console.log('✓ Uploaded image to public CDN:', data.image.url);
        return data.image.url;
      }
    }
  } catch (e) {
    console.warn('Free CDN upload notice:', e);
  }
  return null;
}

/**
 * The same conversion serves previews, cloud uploads and offline fallback.
 */
export async function fileToOptimizedDataUrl(
  file: File,
  maxWidth = 2048,
  maxHeight = 2560,
  quality = 0.9
): Promise<string> {
  return imageBlobDataUrl(await smartConvertImage(file, maxWidth, maxHeight, quality));
}

/**
 * Checks if a remote image URL actually responds and renders successfully in the browser
 */
export async function testImageUrl(url: string, timeoutMs = 2500): Promise<boolean> {
  if (!url || !url.startsWith('http')) return false;

  return new Promise((resolve) => {
    const img = new Image();
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        resolve(false);
      }
    }, timeoutMs);

    img.onload = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve(true);
      }
    };

    img.onerror = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve(false);
      }
    };

    img.src = url;
  });
}

/**
 * Uploads an image File directly to Supabase Storage bucket `product-images`
 * Preserves custom organized subpaths (e.g., `catalog/collection_name/01_front.jpg`)
 * Returns the permanent public Supabase URL.
 */
export interface CloudSiteConfig {
  image_optimizations?: Record<string, string>;
  controls?: Record<string, any>;
  currency?: string;
  trendItems?: any[];
  socialLinks?: any[];
  enhancements?: Record<string, any>;
  site_settings?: Record<string, any>;
  sizeGuideRows?: any[];
  hero_bg?: string;
  banner_hero_bg?: string;
  updated_at?: string;
}

// In-memory cache of cloud configuration to ensure instant synchronous access and perfect merging
let cachedCloudConfig: CloudSiteConfig | null = null;

export function resolveStoredImages<T>(value: T): T {
  return replaceOptimizedImages(value, cachedCloudConfig?.image_optimizations);
}

const SUPABASE_PROJECT_ID = 'gjjsdnyfhhbacuciqwbq';
const SUPABASE_STORAGE_ORIGIN = `https://${SUPABASE_PROJECT_ID}.supabase.co`;

/**
 * Formats and guarantees a fully qualified absolute Supabase Storage public URL:
 * https://[PROJECT_ID].supabase.co/storage/v1/object/public/[BUCKET]/[PATH]
 */
export function formatSupabasePublicUrl(pathOrUrl: string, bucket: string = 'product-images'): string {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  let cleanPath = pathOrUrl.replace(/^\/+/, '');
  if (cleanPath.startsWith(`${bucket}/`)) {
    cleanPath = cleanPath.slice(bucket.length + 1);
  }
  return `${SUPABASE_STORAGE_ORIGIN}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

/**
 * Uploads an image File directly to Supabase Storage bucket `product-images`
 * Preserves custom organized subpaths (e.g., `banners/`, `catalog/`, `trends/`)
 * Returns the permanent fully-qualified public Supabase URL.
 */
export async function uploadImageToSupabase(
  file: File,
  folder: string = 'catalog',
  customPath?: string
): Promise<string> {
  if (!file) throw new Error('No file provided for upload');
  const converted = await smartConvertImage(file);

  // 1. Upload directly to Supabase Storage bucket `product-images`
  if (supabase) {
    try {
      const fileName = imageUploadPath(folder, customPath || file.name || 'image', converted.type);

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, converted, {
          contentType: converted.type,
          cacheControl: '31536000',
          upsert: false,
        });

      if (!error && data?.path) {
        const { data: publicData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);

        const absoluteUrl = (publicData?.publicUrl && publicData.publicUrl.startsWith('http'))
          ? publicData.publicUrl
          : formatSupabasePublicUrl(data.path, 'product-images');

        console.log('✓ Successfully uploaded image to Supabase Storage (Absolute URL):', absoluteUrl);
        return absoluteUrl;
      } else if (error) {
        console.error('Supabase storage upload error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase storage upload exception:', err);
    }
  }

  // Fallback to high-res data URL only if Supabase client is offline/disconnected
  console.warn('Supabase client unavailable, using optimized data URL fallback');
  return imageBlobDataUrl(converted);
}

/**
 * Uploads a base64 Data URL to Supabase Storage as a real file
 * and returns the permanent fully-qualified public Supabase URL.
 */
export async function uploadDataUrlToSupabase(
  dataUrl: string,
  folder: string = 'catalog',
  filePrefix: string = 'media'
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
  if (dataUrl.length > 28 * 1024 * 1024) throw new Error('حجم الصورة يتجاوز الحد المسموح.');
  const [header, base64Data] = dataUrl.split(',');
  if (!header.includes(';base64') || !base64Data) throw new Error('بيانات الصورة غير صالحة.');
  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  const byteCharacters = atob(base64Data);
  const byteArray = Uint8Array.from(byteCharacters, character => character.charCodeAt(0));
  const blob = await smartConvertImage(new Blob([byteArray], { type: mimeType }));
  if (!supabase) return imageBlobDataUrl(blob);

  try {
    const fileName = imageUploadPath(folder, filePrefix, blob.type);

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, blob, {
        contentType: blob.type,
        cacheControl: '31536000',
        upsert: false,
      });
    if (error) throw new Error(error.message);

    if (!error && data?.path) {
      const { data: pubData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      const absoluteUrl = (pubData?.publicUrl && pubData.publicUrl.startsWith('http'))
        ? pubData.publicUrl
        : formatSupabasePublicUrl(data.path, 'product-images');

      console.log('✓ Converted Data URL to permanent Supabase Storage URL (Absolute):', absoluteUrl);
      return absoluteUrl;
    }
  } catch (err) {
    console.warn('Failed to upload Data URL to Supabase Storage:', err);
    throw err;
  }
  throw new Error('لم يرجع التخزين رابطاً للصورة المرفوعة.');
}

/**
 * Persists site configuration, banner images, and trend cards directly into Supabase Storage
 * Using a non-destructive deep-merge so no section is ever overwritten or lost!
 */
export async function saveSiteConfigToSupabase(config: Partial<CloudSiteConfig>, requireFresh = false): Promise<boolean> {
  if (!supabase) return false;
  try {
    // Saves bypass the polling shortcut; legacy callers can still fall back while offline.
    const existing = await fetchSiteConfigFromSupabase(false) || (requireFresh ? null : cachedCloudConfig);
    if (requireFresh && !existing) return false;

    const bannerBg =
      config.banner_hero_bg ||
      config.hero_bg ||
      config.controls?.banner_hero_bg?.actionValue ||
      existing?.banner_hero_bg ||
      existing?.hero_bg ||
      existing?.controls?.banner_hero_bg?.actionValue;

    const resolvedCurrency = config.currency || existing?.currency || 'د.ع';

    // 2. Deep-merge all properties cleanly
    const merged: CloudSiteConfig = {
      ...existing,
      ...config,
      currency: resolvedCurrency,
      controls: {
        ...(existing?.controls || {}),
        ...(config.controls || {}),
      },
      enhancements: {
        ...(existing?.enhancements || {}),
        ...(config.enhancements || {}),
      },
      image_optimizations: { ...(existing?.image_optimizations || {}), ...(config.image_optimizations || {}) },
      trendItems: config.trendItems || existing?.trendItems || [],
      socialLinks: config.socialLinks || existing?.socialLinks || [],
      sizeGuideRows: config.sizeGuideRows || existing?.sizeGuideRows || [],
      hero_bg: bannerBg,
      banner_hero_bg: bannerBg,
      updated_at: new Date().toISOString(),
    };

    // Ensure banner_hero_bg inside controls is in sync with top-level
    if (bannerBg && merged.controls) {
      if (merged.controls.banner_hero_bg) {
        merged.controls.banner_hero_bg = {
          ...merged.controls.banner_hero_bg,
          actionValue: bannerBg,
        };
      }
    }

    const payload = JSON.stringify(merged);
    const blob = new Blob([payload], { type: 'application/json' });
    const { error } = await supabase.storage.from('product-images').upload('config/site_settings.json', blob, {
      contentType: 'application/json',
      cacheControl: '0',
      upsert: true,
    });

    if (!error) {
      cachedCloudConfig = merged;
      cloudConfigModified = null;
      console.log('✓ Site configuration, display image & banners permanently synced to Supabase Cloud');
      return true;
    }
    console.warn('Supabase config sync error:', error.message);
    if (requireFresh) throw new Error(error.message);
    return false;
  } catch (err) {
    console.warn('Failed to save site config to Supabase:', err);
    if (requireFresh) throw err;
    return false;
  }
}

/**
 * Loads latest site configuration, banner images, and trend cards from Supabase Storage
 */
let cloudConfigModified: string | null = null;
export async function fetchSiteConfigFromSupabase(allowCached = true): Promise<CloudSiteConfig | null> {
  if (!supabase) return allowCached ? cachedCloudConfig : null;
  try {
    const { data: pubData } = supabase.storage.from('product-images').getPublicUrl('config/site_settings.json');
    if (pubData?.publicUrl) {
      // Check metadata without downloading embedded media on every live-sync tick.
      if (allowCached && cachedCloudConfig && cloudConfigModified) {
        try {
          const metadata = await fetch(pubData.publicUrl, { method: 'HEAD', cache: 'no-store' });
          if (metadata.ok && metadata.headers.get('last-modified') === cloudConfigModified) return cachedCloudConfig;
        } catch { /* Fall through to the normal read if metadata is unavailable. */ }
      }
      const response = await fetch(`${pubData.publicUrl}?t=${Date.now()}`, { cache: 'no-store' });
      if (response.ok) {
        const json = await response.json();
        if (json && typeof json === 'object') {
          cachedCloudConfig = json as CloudSiteConfig;
          cloudConfigModified = response.headers.get('last-modified');
          return json as CloudSiteConfig;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch site config from Supabase:', err);
  }
  return allowCached ? cachedCloudConfig : null;
}

/**
 * Persists orders directly into Supabase Storage under config/orders.json
 */
export async function saveOrdersToSupabase(orders: any[]): Promise<boolean> {
  if (!supabase) return false;
  try {
    if (Array.isArray(orders) && orders.length > 0) {
      const dbRows = orders.map((ord) => ({
        id: String(ord.id),
        customer_name: ord.customerName || ord.customer_name || 'عميل كونسيرج',
        customer_phone: ord.customerPhone || ord.customer_phone || '',
        customer_email: ord.customerEmail || ord.customer_email || '',
        shipping_address: ord.shippingAddress || ord.shipping_address || '',
        items: Array.isArray(ord.items) ? ord.items : [],
        total_price: Number(ord.totalPrice || ord.total_price || 0),
        status: ord.status || 'pending_payment',
        type: ord.type || 'ready_to_wear',
        timeline: Array.isArray(ord.timeline) ? ord.timeline : [],
        created_at: ord.orderDate || ord.created_at || new Date().toISOString(),
      }));
      await supabase.from('orders').upsert(dbRows, { onConflict: 'id' });
    }

    const payload = JSON.stringify(orders, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const { error } = await supabase.storage.from('product-images').upload('config/orders.json', blob, {
      contentType: 'application/json',
      cacheControl: '0',
      upsert: true,
    });
    if (!error) {
      console.log('✓ Orders permanently synced to Supabase Cloud');
      return true;
    }
  } catch (err) {
    console.warn('Failed to save orders to Supabase:', err);
  }
  return false;
}

/**
 * Loads latest orders from Supabase SQL table `orders` with fallback to Supabase Storage
 */
export async function fetchOrdersFromSupabase(): Promise<any[] | null> {
  if (!supabase) return null;
  try {
    const { data: dbData, error: dbErr } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!dbErr && Array.isArray(dbData)) {
      return normalizeOrders(dbData);
    }

    // Fallback to storage file if database table returns empty or error
    const { data: pubData } = supabase.storage.from('product-images').getPublicUrl('config/orders.json');
    if (pubData?.publicUrl) {
      const response = await fetch(`${pubData.publicUrl}?t=${Date.now()}`, { cache: 'no-store' });
      if (response.ok) {
        const json = await response.json();
        if (Array.isArray(json)) {
          return json;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch orders from Supabase:', err);
  }
  return null;
}

// Full snapshots preserve conditions and deletions; SQL is a legacy read fallback only.
export const saveOffersToSupabase = (offers: any[]) => saveOfferSnapshot(supabase, offers);
export const fetchOffersFromSupabase = () => fetchOfferSnapshot(supabase);

/**
 * Recursively extracts all image files from DataTransferItemList (supports dragged folders and nested directories!)
 * Naturally sorts files by directory structure and alphabetical filename (e.g. 01_front, 02_back, 03_detail).
 */
export async function getFilesFromDataTransfer(items: DataTransferItemList): Promise<Array<{ file: File; relativePath: string }>> {
  const results: Array<{ file: File; relativePath: string }> = [];

  const traverseEntry = async (entry: any, currentPath = ''): Promise<void> => {
    if (!entry) return;

    if (entry.isFile) {
      return new Promise<void>((resolve) => {
        entry.file((file: File) => {
          if (file && isImageFile(file)) {
            const relativePath = currentPath ? `${currentPath}/${file.name}` : file.name;
            results.push({ file, relativePath });
          }
          resolve();
        }, () => resolve());
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const readEntries = async (): Promise<void> => {
        return new Promise<void>((resolve) => {
          dirReader.readEntries(async (entries: any[]) => {
            if (entries.length === 0) {
              resolve();
            } else {
              const nextPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
              for (const childEntry of entries) {
                await traverseEntry(childEntry, nextPath);
              }
              await readEntries();
              resolve();
            }
          }, () => resolve());
        });
      };
      await readEntries();
    }
  };

  const promises: Promise<void>[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file') {
      const entry = (item as any).webkitGetAsEntry ? (item as any).webkitGetAsEntry() : null;
      if (entry) {
        promises.push(traverseEntry(entry));
      } else {
        const file = item.getAsFile();
        if (file && isImageFile(file)) {
          results.push({ file, relativePath: file.name });
        }
      }
    }
  }

  await Promise.all(promises);

  // Naturally sort files by name/path (01_front.jpg before 02_back.jpg)
  results.sort((a, b) =>
    a.relativePath.localeCompare(b.relativePath, undefined, { numeric: true, sensitivity: 'base' })
  );

  return results;
}

/**
 * Checks if a file is an image by MIME type or file extension
 */
export function isImageFile(file: File): boolean {
  if (file.type && file.type.startsWith('image/')) return true;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'heic', 'heif', 'bmp', 'svg'].includes(ext || '');
}
