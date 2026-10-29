import { HERO_APPEARANCE_CONTROL, parseHeroAppearance, type HeroAppearance, type HeroMotif } from './heroAppearance.ts';
import type { BannerEdits } from './bannerEditor';
import { parseStoreTheme, type StoreTheme } from './storefrontTheme.ts';

export type ThemeCategory = 'seasons' | 'occasions' | 'offers';
export interface BannerTheme {
  id: string;
  category: ThemeCategory;
  nameAr: string;
  nameEn: string;
  motif: HeroMotif;
  accent: string;
  light: string;
  dark: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
}

export const BANNER_THEMES: readonly BannerTheme[] = [
  { id: 'winter', category: 'seasons', nameAr: 'شتاء هادئ', nameEn: 'Quiet winter', motif: 'snow', accent: '#7dd3fc', light: '#eff6ff', dark: '#101e31', titleAr: 'دفء الشتاء، بأسلوب فانت', titleEn: 'Winter warmth, the VANT way', subtitleAr: 'اكتشف قطع الموسم ونسّق إطلالتك للأيام الباردة.', subtitleEn: 'Discover seasonal pieces for colder days.' },
  { id: 'spring', category: 'seasons', nameAr: 'بدايات الربيع', nameEn: 'Spring beginnings', motif: 'bloom', accent: '#6ee7b7', light: '#effaf3', dark: '#112a24', titleAr: 'بداية جديدة لإطلالتك', titleEn: 'A fresh start for your wardrobe', subtitleAr: 'ألوان هادئة وتنسيقات خفيفة لاستقبال الربيع.', subtitleEn: 'Soft colors and lighter styling for spring.' },
  { id: 'summer', category: 'seasons', nameAr: 'صيف مشرق', nameEn: 'Summer light', motif: 'sun', accent: '#fbbf24', light: '#fff7e6', dark: '#302416', titleAr: 'خفّة الصيف، حضور يختلف', titleEn: 'Light summer days, distinct style', subtitleAr: 'تصفّح اختيارات الموسم وقطعاً تناسب أيامك المشمسة.', subtitleEn: 'Explore seasonal picks for sun-filled days.' },
  { id: 'autumn', category: 'seasons', nameAr: 'ألوان الخريف', nameEn: 'Autumn tones', motif: 'leaf', accent: '#fb923c', light: '#fff3e9', dark: '#302019', titleAr: 'طبقات جديدة لموسم جديد', titleEn: 'New layers for a new season', subtitleAr: 'درجات دافئة وتفاصيل تكمل إطلالتك الخريفية.', subtitleEn: 'Warm tones and considered details for autumn.' },
  { id: 'new-year', category: 'occasions', nameAr: 'رأس السنة', nameEn: 'New Year', motif: 'celebration', accent: '#fcd34d', light: '#fff9e8', dark: '#211e18', titleAr: 'سنة جديدة، إطلالة تستحقها', titleEn: 'A new year, a look of your own', subtitleAr: 'ابدأ السنة باختيارات تعبّر عن أسلوبك.', subtitleEn: 'Start the year with pieces that express your style.' },
  { id: 'ramadan', category: 'occasions', nameAr: 'ليالي رمضان', nameEn: 'Ramadan nights', motif: 'crescent', accent: '#e9c46a', light: '#f8f5e9', dark: '#142b2c', titleAr: 'أناقة هادئة لليالي رمضان', titleEn: 'Considered style for Ramadan nights', subtitleAr: 'اختيارات للمشاركة والزيارات ولحظات الشهر الجميلة.', subtitleEn: 'Pieces for gatherings, visits and shared moments.' },
  { id: 'eid', category: 'occasions', nameAr: 'فرحة العيد', nameEn: 'Eid celebration', motif: 'gift', accent: '#a7f3d0', light: '#eefaf4', dark: '#132c27', titleAr: 'للعيد إطلالة جديدة', titleEn: 'A fresh look for Eid', subtitleAr: 'اختَر تفاصيل فرحتك من تشكيلة فانت.', subtitleEn: 'Find your celebration look in the VANT collection.' },
  { id: 'holiday', category: 'occasions', nameAr: 'أيام العطلة', nameEn: 'Holiday escape', motif: 'sun', accent: '#67e8f9', light: '#ecfbff', dark: '#12303a', titleAr: 'إطلالتك جاهزة للعطلة', titleEn: 'Your holiday wardrobe awaits', subtitleAr: 'تنسيقات مريحة للمشاوير والسفر وأوقات الراحة.', subtitleEn: 'Easy styling for travel, outings and time off.' },
  { id: 'school', category: 'occasions', nameAr: 'العودة للدراسة', nameEn: 'Back to study', motif: 'school', accent: '#93c5fd', light: '#f0f5ff', dark: '#172840', titleAr: 'بداية مرتّبة لكل يوم', titleEn: 'A considered start to every day', subtitleAr: 'قطع عملية وتنسيقات تناسب روتين الدراسة الجديد.', subtitleEn: 'Everyday pieces for a fresh study routine.' },
  { id: 'weekend', category: 'offers', nameAr: 'عروض نهاية الأسبوع', nameEn: 'Weekend offers', motif: 'sale', accent: '#fda4af', light: '#fff1f3', dark: '#321c26', titleAr: 'اختيارات نهاية الأسبوع', titleEn: 'Weekend selections', subtitleAr: 'تصفّح القطع المشمولة بالعروض واختر ما يناسبك.', subtitleEn: 'Browse pieces currently included in offers.' },
  { id: 'black-friday', category: 'offers', nameAr: 'الجمعة البيضاء', nameEn: 'White Friday', motif: 'sale', accent: '#d4d4d8', light: '#f4f4f5', dark: '#18181b', titleAr: 'اختيارات فانت للجمعة البيضاء', titleEn: 'VANT White Friday selections', subtitleAr: 'كل العروض المتاحة في مكان واحد. الأسعار والتوفّر حسب كل قطعة.', subtitleEn: 'Available offers in one place. Prices and availability vary by piece.' },
  { id: 'season-end', category: 'offers', nameAr: 'نهاية الموسم', nameEn: 'Season finale', motif: 'celebration', accent: '#c4b5fd', light: '#f5f3ff', dark: '#241e36', titleAr: 'ختام الموسم، خيارات تستحق', titleEn: 'A considered season finale', subtitleAr: 'اكتشف القطع المشمولة بعروض نهاية الموسم.', subtitleEn: 'Discover pieces included in end-of-season offers.' },
];

export function themeAppearance(theme: BannerTheme, current?: string): HeroAppearance {
  return { ...parseHeroAppearance(current), motif: theme.motif, accentColor: theme.accent, lightColor: theme.light, darkColor: theme.dark, motifOpacity: 55, fadeEnabled: true, direction: 'caption', mobileDirection: 'bottom', start: 0, middle: 42, end: 100, startOpacity: 98, middleOpacity: 90, endOpacity: 50, mobileStartOpacity: 98, mobileMiddleOpacity: 94, mobileEndOpacity: 78 };
}

export function bannerThemeEdits(theme: BannerTheme, current: string | undefined, includeCopy: boolean): BannerEdits {
  return {
    [HERO_APPEARANCE_CONTROL]: { actionValue: JSON.stringify(themeAppearance(theme, current)) },
    ...(includeCopy ? {
      banner_hero_title: { label_ar: theme.titleAr, label_en: theme.titleEn },
      banner_hero_subtitle: { label_ar: theme.subtitleAr, label_en: theme.subtitleEn },
      banner_hero_tag: { label_ar: `فانت · ${theme.nameAr}`, label_en: `VANT · ${theme.nameEn}` },
      banner_hero_btn: { label_ar: 'تصفح العروض', label_en: 'Browse Offers' },
    } : {}),
  };
}
export function themeStorePalette(theme: BannerTheme, current?: string): StoreTheme {
  const store = parseStoreTheme(current);
  return { ...store, enabled: true,
    light: { ...store.light, background: theme.light, surface: '#ffffff', text: '#15171c', muted: '#525b68', accent: theme.accent, border: '#d4d8df' },
    dark: { ...store.dark, background: theme.dark, surface: theme.dark, text: '#f3f4f6', muted: '#b4becd', accent: theme.accent, border: '#586271' },
  };
}
