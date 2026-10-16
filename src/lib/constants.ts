/**
 * Maison VANT - Application Configuration & Production Constants
 */

// Empty when not configured: callers must not send orders to a made-up number
export const DEFAULT_WHATSAPP_PHONE = (import.meta.env.VITE_WHATSAPP_PHONE || '').replace(/[^0-9]/g, '');

// People type 0770… or +964 770… (or Arabic digits); wa.me needs plain international digits
export const normalizePhone = (value?: string) => {
  const digits = (value || '')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/\D/g, '');
  return digits.startsWith('0') ? `964${digits.slice(1)}` : digits;
};

export const resolveWhatsappPhone = (value?: string) => {
  const digits = normalizePhone(value);
  return digits.length >= 8 ? digits : DEFAULT_WHATSAPP_PHONE;
};

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
