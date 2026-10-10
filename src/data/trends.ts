import type { TrendItem } from '../types';

export const DEFAULT_FEATURED_TRENDS: TrendItem[] = [];

/**
 * Image Dimension Recommendations Guide for Perfect Visual Quality
 */
export const RECOMMENDED_IMAGE_SPECS = {
  heroBannerBg: {
    name_ar: 'خلفية البنر الترحيبي العريض (Top Hero Banner Background)',
    name_en: 'Top Welcome Hero Background',
    aspectRatio: '16:5 أو 16:6 (بانورامي عريض)',
    recommendedWidth: 1920,
    recommendedHeight: 600,
    minWidth: 1400,
    minHeight: 450,
    description_ar: 'صورة أفقية عريضة بدقة عالية لتغطية كامل العرض مع وضوح نصوص المقدمة',
    description_en: 'Ultra-wide horizontal backdrop for full-bleed hero presentation',
  },
  trendCard: {
    name_ar: 'كروت تريندات الموسم (Seasonal Trends Cards)',
    name_en: 'Seasonal Trends Cards',
    aspectRatio: '4:5 (عمودي بورتريه للأزياء)',
    recommendedWidth: 800,
    recommendedHeight: 1000,
    minWidth: 600,
    minHeight: 750,
    description_ar: 'صورة عمودية بنسبة 4:5 لإبراز تفاصيل القماش وتنسيق الإطلالة',
    description_en: 'Portrait fashion proportion 4:5 for editorial clarity',
  },
  productPrimary: {
    name_ar: 'الصورة الرئيسية للمنتج (Catalog Primary Product Image)',
    name_en: 'Catalog Primary Product Image',
    aspectRatio: '4:5 (بورتريه أزياء عالي الدقة)',
    recommendedWidth: 1200,
    recommendedHeight: 1500,
    minWidth: 800,
    minHeight: 1000,
    description_ar: 'أفضل مقاس لشبكة الكتالوج لتكبير وتفحص أدق تفاصيل الخامة والقصة',
    description_en: 'Ideal high-res 4:5 fashion cut for crisp masonry rendering',
  },
  productAngles: {
    name_ar: 'صور الزوايا والتفاصيل الإضافية (Product Detail Angles)',
    name_en: 'Product Detail Angles',
    aspectRatio: '4:5 أو 1:1',
    recommendedWidth: 1200,
    recommendedHeight: 1500,
    minWidth: 800,
    minHeight: 800,
    description_ar: 'صور مقربة للخامات والبطانة والدرزات الخلفية والجانبية',
    description_en: 'Close-ups of stitchwork, textures, and alternate styling',
  },
};
