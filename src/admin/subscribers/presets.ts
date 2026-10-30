import { Gift, Flame, Sparkles, Tag, Mail } from 'lucide-react';
import type { EmailCampaignData } from '../WelcomeEmailTemplate';
import type { SentCampaignRecord } from './types';

export const initialSentHistory: SentCampaignRecord[] = [];

export interface TemplatePresetItem {
  nameAr: string;
  nameEn: string;
  icon: any;
  color: string;
  badgeBg: string;
  defaults: Partial<EmailCampaignData>;
}

export const templatePresets: Record<EmailCampaignData['templateType'], TemplatePresetItem> = {
  welcome: {
    nameAr: 'هدية ترحيبية بالعميل',
    nameEn: 'Welcome Privilege',
    icon: Gift,
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    defaults: {
      subject: '🎉 مرحباً بك في فانت! كود خصم 20% ترحيبي بانتظارك',
      preheader: 'استخدم الكود WELCOME20 واستمتع بأرقى تشكيلات الكشمير والبدلات مع خدمة كونسيرج خاصة.',
      headline: 'أهلاً بك في فانت للأزياء الرفيعة',
      bodyText:
        'يسعدنا جداً انضمامك إلى مجتمعنا الحصري. لتجربة تسوق لا تُنسى، نقدم لك هدية ترحيبية خاصة صالحة على جميع تشكيلات الكشمير، البدلات، والأحذية الإيطالية.',
      discountCode: 'WELCOME20',
      discountPercent: '20% خصم فوري ترحيبي',
      expireDate: 'خلال 7 أيام من التسجيل',
      ctaText: 'استكشف التشكيلة الآن',
      heroImage:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
    },
  },
  flash_sale: {
    nameAr: 'تخفيضات الكبسولة العاجلة',
    nameEn: 'Capsule Flash Sale',
    icon: Flame,
    color: 'text-red-400',
    badgeBg: 'bg-red-500/10 border-red-500/30 text-red-400',
    defaults: {
      subject: '⚡ عرض كونسيرج عاجل: خصومات تصل إلى 35% تنتهي الليلة!',
      preheader: 'فرصة لا تعوض - إصدارات محدودة مع شحن كونسيرج فوري لكافة المحافظات.',
      headline: 'عرض الأتيليه الحصري: قطع مختارة ومعدودة',
      bodyText:
        'خصومات استثنائية على القطع الأكثر طلباً في فانت. العرض متاح لعدد محدود من عملاء النخبة أو حتى نفاد الأقمشة المخصصة.',
      discountCode: 'FLASH35',
      discountPercent: 'خصم يصل إلى 35%',
      expireDate: 'ينتهي خلال 24 ساعة فقط',
      ctaText: 'اغتنم القطع قبل النفاد',
      heroImage:
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
    },
  },
  launch: {
    nameAr: 'إطلاق كبسولة أو تشكيلة',
    nameEn: 'Capsule Launch',
    icon: Sparkles,
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    defaults: {
      subject: '✨ كبسولة موسم 2026 وصلت رسمياً إلى أتيليه ڤانت',
      preheader: 'كن أول من يقتني أرقى القطع المفصلة بمعايير الخياطة الرفيعة Haute Couture.',
      headline: 'الحرفة اليدوية المعمارية: كبسولة الشتاء والربيع',
      bodyText:
        'يسرنا تقديم التشكيلة الأحدث المصممة حصرياً لأصحاب الذوق النخبوي الرفيع. متوفرة بأقمشة كشمير منغولي وصوف ميرينو إيطالي سوبر 160s.',
      discountCode: 'LAUNCH15',
      discountPercent: 'خصم 15% لأول 30 طلباً',
      expireDate: 'متاح للدفعة الأولى فقط',
      ctaText: 'استكشف التشكيلة الحصرية',
      heroImage:
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
    },
  },
  clearance: {
    nameAr: 'تصفية موسمية راقية',
    nameEn: 'Seasonal Archive Sale',
    icon: Tag,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    defaults: {
      subject: '🏷️ أرشيف نهاية الموسم: أسعار استثنائية على آخر قطع التشكيلة',
      preheader: 'فرصة نادرة لاقتناء قطع الدار الكلاسيكية بأسعار نهائية مخفضة بالدينار العراقي.',
      headline: 'أرشيف الموسم: خصومات تصل إلى 45%',
      bodyText:
        'نستعد لاستقبال أقمشة وموسم الصيف الجديد! نوفر لعملائنا فرصة اقتناء آخر المقاسات المتوفرة من معاطف وكنزات كبسولة الشتاء.',
      discountCode: 'ARCHIVE45',
      discountPercent: 'خصم حتى 45%',
      expireDate: 'حتى نفاد المقاسات المتبقية',
      ctaText: 'تصفح قطع الأرشيف',
      heroImage:
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
    },
  },
  newsletter: {
    nameAr: 'نشرة الأناقة والمقالات',
    nameEn: 'Atelier Gazette',
    icon: Mail,
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    defaults: {
      subject: '📰 جريدة الأتيليه: فلسفة الأزياء الهادئة ودليل اختيار الصوف النقي',
      preheader: 'دليلك لأسرار الأناقة الهادئة Quiet Luxury والعناية بالكشمير المنغولي.',
      headline: 'جريدة الأتيليه من فانت (VANT)',
      bodyText:
        'في هذا العدد نشارككم أسرار العناية بالصوف الطبيعي، وكيفية تنسيق المعاطف مزدوجة الوجه مع الأحذية الكلاسيكية لطلة متكاملة وواثقة.',
      discountCode: 'GAZETTE',
      discountPercent: 'شحن كونسيرج مجاني على طلبك القادم',
      expireDate: 'ساري طوال الشهر الحالي',
      ctaText: 'قراءة المقال والطلب',
      heroImage:
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    },
  },
};

export const heroPresets = [
  {
    labelAr: 'معاطف كشمير منغولي',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
  },
  {
    labelAr: 'بدلات وأزياء رسمية',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
  },
  {
    labelAr: 'كنزات تريكو وصوف نقي',
    url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
  },
  {
    labelAr: 'أحذية وحقائب جلد عجل',
    url: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop&q=80',
  },
];
