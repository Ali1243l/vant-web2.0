import React from 'react';
import { Shirt, Scissors, Compass, Layers, Crown } from 'lucide-react';

export type MotifKey = 'hanger' | 'scissors' | 'monogram' | 'needle' | 'crown';

export interface MotifOption {
  key: MotifKey;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SPLASH_MOTIFS: MotifOption[] = [
  {
    key: 'hanger',
    labelAr: 'شماعة الأزياء الراقية',
    labelEn: 'Luxury Haute Coat Hanger',
    descAr: 'رمز الأناقة والتصميم الرفيع للأزياء المخصصة',
    descEn: 'Symbol of couture silhouettes and bespoke tailoring',
    icon: Shirt,
  },
  {
    key: 'scissors',
    labelAr: 'مقص الخياطة الذهبي',
    labelEn: 'Master Tailor Shears',
    descAr: 'رمز الدقة والحرفية اليدوية الإيطالية العريقة',
    descEn: 'Represents hand-cut precision and artisanal tailoring',
    icon: Scissors,
  },
  {
    key: 'monogram',
    labelAr: 'المونوغرام الملكي (AR)',
    labelEn: 'Royal Monogram Emblem',
    descAr: 'شعار دار الرافدين المحفور بماء الذهب',
    descEn: 'Classic royal heraldic seal engraved in gold',
    icon: Compass,
  },
  {
    key: 'needle',
    labelAr: 'إبرة وخيط الحرير',
    labelEn: 'Silk Needle & Thread',
    descAr: 'رمز التطريز الدقيق والأقمشة الكشميرية الفاخرة',
    descEn: 'Intricate embroidery and pure mulberry silk stitching',
    icon: Layers,
  },
  {
    key: 'crown',
    labelAr: 'التاج الإمبراطوري',
    labelEn: 'Imperial Sovereign Crown',
    descAr: 'رمز الفخامة والسيادة والأزياء الملكية الحصرية',
    descEn: 'Exclusivity, heritage, and royal bespoke prestige',
    icon: Crown,
  },
];

// Presets for splash screen text
export const SPLASH_TEXT_PRESETS = [
  {
    ar: 'دار الرافدين للأزياء • أصالة الحرفة العراقية',
    en: 'Dar Al-Rafidain • Iraqi Haute Couture & Craftsmanship',
  },
  {
    ar: 'أناقة ملكية مستوحاة من عراقة بلاد الرافدين',
    en: 'Royal Elegance Inspired by Mesopotamian Heritage',
  },
  {
    ar: 'جاري تحميل أحدث تشكيلات 2026 الحصرية وتفاصيل الكشمير',
    en: 'Loading 2026 Exclusive Bespoke & Cashmere Collection',
  },
  {
    ar: 'التفصيل الرفيع • أقمشة إيطالية وأيدي ماهرة تصنع الفارق',
    en: 'Haute Couture • Italian Fabrics & Master Tailors Crafting Excellence',
  },
];

// Preset luxury banner backgrounds
export const BANNER_PRESETS = [
  {
    name: 'Atelier Cashmere',
    nameAr: 'استوديو الكشمير الإيطالي',
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bespoke Fitting Suite',
    nameAr: 'جناح التفصيل والقياس الخاص',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Luxury Fabrics Loom',
    nameAr: 'نسيج الحرير والصوف الملكي',
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Royal Boutique Facade',
    nameAr: 'واجهة البوتيك الفاخر',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Artisan Tailoring Workshop',
    nameAr: 'مشغل الحياكة اليدوية الدقيقة',
    url: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=1600&auto=format&fit=crop&q=80',
  },
];
