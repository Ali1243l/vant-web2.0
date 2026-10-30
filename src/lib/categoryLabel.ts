import type { Language } from '../types';

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
export function categoryLabel(category: string, arabic: string | undefined, lang: Language) {
  const translated = CATEGORY_TRANSLATIONS[category] || Object.values(CATEGORY_TRANSLATIONS).find(item => item.ar === category);
  return lang === 'ar' ? arabic || translated?.ar || category : translated?.en || category;
}
