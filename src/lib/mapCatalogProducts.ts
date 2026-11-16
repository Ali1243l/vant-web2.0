import type { Product, ProductAvailability } from '../types';
import { resolveStoredImages } from './storage';
import { getStoredEnhancements } from '../context/site_controls/constants';
export const mapCatalogProducts = (data: any[]): Product[] => {
    const enhancements = resolveStoredImages(getStoredEnhancements());
    return resolveStoredImages(data || []).map((p) => {
      const pIdStr = String(p.id);
      const enh = { ...(enhancements[pIdStr] || {}), ...(p.admin_metadata || {}) };
      const statusStr = String(p.status || '').toUpperCase();
      let availability: ProductAvailability = 'in_stock';
      if (statusStr === 'SOLD_OUT' || statusStr === 'OUT_OF_STOCK') {
        availability = 'sold_out';
      } else if (statusStr === 'COMING_SOON') {
        availability = 'coming_soon';
      } else if (statusStr === 'LIMITED') {
        availability = 'limited';
      }

      const rawMedia = p.product_media || [];
      const sortedMedia = Array.isArray(rawMedia)
        ? [...rawMedia].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        : [];
      const mediaUrls = sortedMedia.map((m: any) => m.media_url).filter(Boolean);

      const defaultImg =
        enh.image_url ||
        mediaUrls[0] ||
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80';
      const imagesList = enh.images && enh.images.length > 0 ? enh.images : mediaUrls.length > 0 ? mediaUrls : [defaultImg];

      return {
        id: p.id,
        title: p.title || enh.title_ar || 'قطعة فاخرة',
        title_ar: enh.title_ar || p.title || 'قطعة فاخرة',
        price: typeof p.price === 'number' ? p.price : parseFloat(p.price || 0),
        original_price: typeof enh.original_price === 'number' ? enh.original_price : undefined,
        is_offer: enh.is_offer ?? Boolean(p.is_exclusive_drop),
        offer_badge_ar: enh.offer_badge_ar || undefined,
        offer_badge_en: enh.offer_badge_en || undefined,
        category: p.category || 'Tailoring',
        category_ar: enh.category_ar || p.category || 'الأزياء الرسمية',
        description: p.description || '',
        description_ar: enh.description_ar ?? p.description ?? '',
        material: p.material || '',
        fit_details: p.fit_details || 'قصة إيطالية سليم فيت محددة بدقة',
        availability,
        sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL'],
        catalog_image: enh.catalog_image ?? p.catalog_image,
        image_url: defaultImg,
        images: imagesList,
        colors: enh.colors ?? p.colors,
        variants: enh.variants ?? p.variants,
        sku: enh.sku ?? p.sku,
        stock: enh.stock ?? p.stock,
        created_at: p.created_at,
        tags: enh.tags || [],
      };
    });
  };

