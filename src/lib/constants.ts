/**
 * Maison VANT - Application Configuration & Production Constants
 */

export const DEFAULT_WHATSAPP_PHONE = (
  import.meta.env.VITE_WHATSAPP_PHONE || '9647000000000'
).replace(/[^0-9]/g, '');

export const PRODUCTS_PAGE_SIZE = 12;

export const HERO_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80';

export const CATEGORY_TRANSLATIONS: Record<string, { en: string; ar: string }> = {
  All: { en: 'All', ar: 'الكل' },
  'T-Shirts': { en: 'T-Shirts', ar: 'تيشيرتات' },
  'ملابس وأزياء': { en: 'Apparel & Fashion', ar: 'ملابس وأزياء' },
  Outerwear: { en: 'Outerwear', ar: 'المعاطف والسترات' },
  Tailoring: { en: 'Tailoring', ar: 'الأزياء الرسمية' },
  Knitwear: { en: 'Knitwear', ar: 'التريكو والصوف' },
  Footwear: { en: 'Footwear', ar: 'الأحذية' },
  Accessories: { en: 'Accessories', ar: 'الإكسسوارات' },
};
