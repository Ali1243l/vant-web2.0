import type { Product } from '../types';

const colors = ['Black', 'White', 'Grey', 'Brown', 'Navy Blue', 'Olive Green'];
const images = colors.map(color => `/demo-colors/shirt_${encodeURIComponent(color)}_1.svg`);

export const DEMO_COLOR_PRODUCT: Product = {
  id: 'demo-color-tee',
  is_demo: true,
  title: 'VANT Tee — 6 Color Demo',
  title_ar: 'تيشيرت فانت — تجربة ٦ ألوان',
  category: 'T-Shirts',
  category_ar: 'تيشيرتات',
  description: 'Demo illustrations for trying color selection. Not for sale; the price is illustrative.',
  description_ar: 'رسومات تجريبية لتجربة تبديل الألوان والمقاسات. غير معروض للبيع والسعر للتوضيح فقط.',
  price: 25000,
  original_price: 35000,
  is_offer: true,
  offer_badge_ar: 'تجريبي · ٦ ألوان',
  offer_badge_en: 'DEMO · 6 COLORS',
  availability: 'in_stock',
  sizes: ['M', 'L'],
  image_url: images[0],
  images,
  colors,
};
