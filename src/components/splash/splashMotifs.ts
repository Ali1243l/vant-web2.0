import type { SplashMotifType } from '../../context/SiteControlsContext';

export interface MotifOption {
  id: SplashMotifType;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
}

export const AVAILABLE_SPLASH_MOTIFS: MotifOption[] = [
  {
    id: 'print_press',
    titleAr: 'ماكينة السكرين برنت والطباعة الحرارية',
    titleEn: 'Screen Print Squeegee & Laser Press',
    subtitleAr: 'سحب مساحة الحبر وطباعة شعار ڤانت مباشرة على قماش التيشيرت بالليزر',
    subtitleEn: 'Laser print squeegee pass stamping VANT emblem onto garment fabric',
  },
  {
    id: 'tshirt_print',
    titleAr: 'تيشيرت ڤانت وطباعة الشعار الأرشيفية',
    titleEn: 'VANT Streetwear T-Shirt & DTG Print',
    subtitleAr: 'قصّة تيشيرت الأوفرسايز الفاخرة مع دروز الياقة وطباعة الشعار على الصدر',
    subtitleEn: 'Luxury streetwear crewneck silhouette with chest emblem graphic print',
  },
  {
    id: 'embroidery',
    titleAr: 'تطريز الخيط الملكي وإطار الأتيليه',
    titleEn: 'Atelier Embroidery Hoop & Stitches',
    subtitleAr: 'طارة التطريز اليدوي الفاخرة وإبرة حياكة الغرز المتقاطعة الدقيقة',
    subtitleEn: 'Royal embroidery hoop with needle stitching gold and cobalt crest',
  },
  {
    id: 'hanger',
    titleAr: 'علاقة الأزياء المعمارية والحرير',
    titleEn: 'Architectural Atelier Hanger',
    subtitleAr: 'علاقة أزياء هندسية مع انسياب خيط الحرير والختم الألماسي',
    subtitleEn: 'Bespoke coat hanger with draped silk thread & diamond seal',
  },
  {
    id: 'needle_thread',
    titleAr: 'إبرة الحياكة وخيط الحرير المنساب',
    titleEn: 'Sartorial Needle & Silk Thread',
    subtitleAr: 'إبرة خياطة فضية تحيك تموجات الحرير الملكية وغرز الأتيليه',
    subtitleEn: 'Silver tailor needle weaving cobalt silk waves and stitches',
  },
  {
    id: 'mannequin',
    titleAr: 'مانيكان التفصيل وشريط القياس',
    titleEn: 'Couture Mannequin & Ribbon',
    subtitleAr: 'جذع تمثال الخياطة الراقي مع شريط القياس الحريري المنسدل',
    subtitleEn: 'Atelier dressmaker dress form draped with measuring tape',
  },
  {
    id: 'scissors',
    titleAr: 'مقص الأتيليه وقماش الحرير',
    titleEn: 'Tailoring Shears & Silk Fabric',
    subtitleAr: 'مقص تفصيل الأقمشة الكلاسيكي مع خطوط طي الحرير الراقية',
    subtitleEn: 'Classic sartorial shears cutting and draping fine silk fibers',
  },
  {
    id: 'monogram',
    titleAr: 'شعار المونوغرام الهندسي الفاخر',
    titleEn: 'Geometric Monogram Emblem',
    subtitleAr: 'درع هندسي فاخر متداخل مع حلقة مدارية وبوصلة أزياء',
    subtitleEn: 'Interlocking diamond facet crest with subtle orbital halo',
  },
];
