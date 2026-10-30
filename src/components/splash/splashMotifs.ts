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
    titleAr: 'استوديو الطباعة',
    titleEn: 'Print studio',
    subtitleAr: 'مكبس ينخفض بهدوء وطباعة تمرّ على القماش',
    subtitleEn: 'A measured press and a clean pass across the fabric',
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
    titleAr: 'تطريز التوقيع',
    titleEn: 'Signature embroidery',
    subtitleAr: 'غرز متتابعة داخل طارة التطريز',
    subtitleEn: 'A signature stitched inside an embroidery hoop',
  },
  {
    id: 'hanger',
    titleAr: 'علاقة التشكيلة',
    titleEn: 'Collection hanger',
    subtitleAr: 'توازن خفيف وحركة انسيابية للقطعة',
    subtitleEn: 'A balanced hanger with a gentle fabric rhythm',
  },
  {
    id: 'needle_thread',
    titleAr: 'الإبرة والخيط',
    titleEn: 'Needle & thread',
    subtitleAr: 'خيط متصل ينساب مع حركة الإبرة',
    subtitleEn: 'A continuous thread following the needle',
  },
  {
    id: 'mannequin',
    titleAr: 'تفاصيل القَصّة',
    titleEn: 'Tailored form',
    subtitleAr: 'مانيكان وشريط قياس يتحرك بدقة',
    subtitleEn: 'A dress form with a precise measuring ribbon',
  },
  {
    id: 'scissors',
    titleAr: 'قصّ القماش',
    titleEn: 'Fabric cut',
    subtitleAr: 'حركة مقص محسوبة فوق خطوط القماش',
    subtitleEn: 'Measured shears above the fabric guide',
  },
  {
    id: 'monogram',
    titleAr: 'توقيع فانت',
    titleEn: 'VANT signature',
    subtitleAr: 'توقيع هندسي مع مدار أزرق هادئ',
    subtitleEn: 'A geometric signature with a quiet blue orbit',
  },
];
