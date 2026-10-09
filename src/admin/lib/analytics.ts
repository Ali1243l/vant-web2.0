/**
 * Deep Behavioral Analytics Engine
 * Provides aggregated analytics, hesitation tracking, buyer persona classification,
 * and demand velocity intelligence.
 */

export type HesitationStage = 'sizing' | 'checkout' | 'cart';
export type PersonaType = 'VIP' | 'Deal Hunter' | 'Window Shopper' | 'Hesitant Buyer';
export type StockDeficitStatus = 'surplus' | 'balanced' | 'stockout_risk';

export interface HesitationIncident {
  id: string;
  customerName: string;
  phone: string;
  productTitle: string;
  stage: HesitationStage;
  dwellSeconds: number;
  intentScore: number; // 0 to 100
  recoveryMessage: string;
  timestamp: string;
  suggestedDiscount?: number;
}

export interface CustomerSession {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  persona: PersonaType;
  rfmScore: number; // 0 to 100
  viewCount: number;
  cartCount: number;
  purchaseProbability: number; // %
  lastActive: string;
  totalSpentIQD: number;
  preferredCategory: string;
}

export interface SizeDemandItem {
  id: string;
  productName: string;
  size: string;
  requestedVelocity: number; // Requests in last 7 days
  stockLevel: number;
  status: StockDeficitStatus;
  conversionDropRate: number; // % dropped due to out of size
}

export interface UnmetSearchQuery {
  id: string;
  query: string;
  searchVolume: number;
  category: string;
  estimatedLostRevenueIQD: number;
  growthTrend: number; // % change
}

export interface AggregatedAnalytics {
  overview: {
    totalRevenueIQD: number;
    totalOrders: number;
    averageOrderValueIQD: number;
    conversionRate: number;
    hesitationCount: number;
    unmetSearchLossIQD: number;
  };
  hesitationIncidents: HesitationIncident[];
  customerSessions: CustomerSession[];
  sizeDemandMatrix: SizeDemandItem[];
  unmetSearches: UnmetSearchQuery[];
}

/**
 * Generate fresh or aggregated behavioral analytics
 */
export function getAggregatedAnalytics(seedVariation: number = 0): AggregatedAnalytics {
  const hesitationIncidents: HesitationIncident[] = [
    {
      id: `hes-${1 + seedVariation}`,
      customerName: 'حيدر الزيدي',
      phone: '+9647712345678',
      productTitle: 'معطف كشمير منغولي مزدوج الوجه 650gsm',
      stage: 'sizing',
      dwellSeconds: 142,
      intentScore: 88,
      recoveryMessage: 'مرحباً حيدر! لاحظنا اهتمامك بمعطف الكشمير المنغولي. هل تحتاج مساعدة في اختيار المقاس أو طول الأكمام؟ يسعدنا توفير قسيمة كونسيرج بقيمة 25,000 IQD لإتمام تفصيل طلبك اليوم!',
      timestamp: 'منذ 4 دقائق',
      suggestedDiscount: 25000,
    },
    {
      id: `hes-${2 + seedVariation}`,
      customerName: 'مريم الكرخي',
      phone: '+9647809876543',
      productTitle: 'حقيبة وثائق جلدية معمارية بقطع البلاديوم',
      stage: 'checkout',
      dwellSeconds: 215,
      intentScore: 94,
      recoveryMessage: 'أهلاً مريم، حقيبة الوثائق المصنوعة من جلد العجل الفرنسي وقطع البلاديوم بانتظاركِ عند صفحة الدفع. استخدمي كود FREESHIP لشحن كونسيرج مجاني وسريع لبغداد والمحافظات!',
      timestamp: 'منذ 11 دقيقة',
      suggestedDiscount: 10000,
    },
    {
      id: `hes-${3 + seedVariation}`,
      customerName: 'مصطفى الربيعي',
      phone: '+9647501112233',
      productTitle: 'بدلة رسمية بهيكل هندسي صوف ميرينو سوبر 160s',
      stage: 'sizing',
      dwellSeconds: 98,
      intentScore: 79,
      recoveryMessage: 'مرحباً مصطفى، هل تواجه حيرة بين المقاسات الإيطالية للبدلة الملكية؟ خياط الأتيليه جاهز لمراجعة مقاسات الصدر والكتف وتقديم بروفة قياس مخصصة مجاناً.',
      timestamp: 'منذ 23 دقيقة',
    },
    {
      id: `hes-${4 + seedVariation}`,
      customerName: 'نور الهدى السلامي',
      phone: '+9647814445566',
      productTitle: 'كنزة تريكو صوفية مضلعة عيار 7 صوف نقي',
      stage: 'cart',
      dwellSeconds: 180,
      intentScore: 85,
      recoveryMessage: 'أهلاً نور، كنزة التريكو المضلعة من صوف الميرينو الطبيعي متبقي منها قطعتان فقط في مستودع الدار. أكملي الطلب لتأمينها وتغليفها بصندوق الهدايا الملكي.',
      timestamp: 'منذ 45 دقيقة',
      suggestedDiscount: 15000,
    },
    {
      id: `hes-${5 + seedVariation}`,
      customerName: 'علي البصري',
      phone: '+9647723334455',
      productTitle: 'حذاء كلاسيكي من جلد العجل الفرنسي المشمع',
      stage: 'checkout',
      dwellSeconds: 165,
      intentScore: 76,
      recoveryMessage: 'مرحباً علي، هل واجهتك أي صعوبة في اختيار طريقة الدفع أو الشحن للبصرة؟ يتوفر الدفع عند الاستلام مع معاينة جودة جلد العجل الفرنسي قبل الاستلام.',
      timestamp: 'منذ ساعة',
    },
  ];

  const customerSessions: CustomerSession[] = [
    {
      id: `sess-101`,
      customerName: 'عمر القيسي',
      email: 'omar.qaisi@example.com',
      phone: '+964 770 445 1200',
      persona: 'VIP',
      rfmScore: 96,
      viewCount: 18,
      cartCount: 4,
      purchaseProbability: 92,
      lastActive: 'نشط الآن',
      totalSpentIQD: 3450000,
      preferredCategory: 'المعاطف والسترات',
    },
    {
      id: `sess-102`,
      customerName: 'زينب الشمري',
      email: 'zainab.sh@example.com',
      phone: '+964 782 110 9988',
      persona: 'Deal Hunter',
      rfmScore: 78,
      viewCount: 24,
      cartCount: 2,
      purchaseProbability: 68,
      lastActive: 'منذ 15 دقيقة',
      totalSpentIQD: 820000,
      preferredCategory: 'الإكسسوارات',
    },
    {
      id: `sess-103`,
      customerName: 'يوسف الدليمي',
      email: 'youssef.d@example.com',
      phone: '+964 750 332 7711',
      persona: 'Window Shopper',
      rfmScore: 42,
      viewCount: 31,
      cartCount: 0,
      purchaseProbability: 25,
      lastActive: 'منذ 32 دقيقة',
      totalSpentIQD: 0,
      preferredCategory: 'الأزياء الرسمية',
    },
    {
      id: `sess-104`,
      customerName: 'رنا العامري',
      email: 'rana.amiri@example.com',
      phone: '+964 771 889 0022',
      persona: 'Hesitant Buyer',
      rfmScore: 84,
      viewCount: 14,
      cartCount: 3,
      purchaseProbability: 81,
      lastActive: 'منذ ساعة',
      totalSpentIQD: 1250000,
      preferredCategory: 'المعاطف والسترات',
    },
    {
      id: `sess-105`,
      customerName: 'كرار فاضل',
      email: 'karrar.f@example.com',
      phone: '+964 780 665 4433',
      persona: 'VIP',
      rfmScore: 91,
      viewCount: 12,
      cartCount: 2,
      purchaseProbability: 89,
      lastActive: 'منذ ساعتين',
      totalSpentIQD: 2180000,
      preferredCategory: 'الأحذية',
    },
    {
      id: `sess-106`,
      customerName: 'فاطمة الكناني',
      email: 'fatima.k@example.com',
      phone: '+964 770 999 8811',
      persona: 'Deal Hunter',
      rfmScore: 74,
      viewCount: 19,
      cartCount: 1,
      purchaseProbability: 62,
      lastActive: 'منذ 3 ساعات',
      totalSpentIQD: 640000,
      preferredCategory: 'التريكو والصوف',
    },
  ];

  const sizeDemandMatrix: SizeDemandItem[] = [
    {
      id: 'sz-1',
      productName: 'معطف كشمير منغولي مزدوج الوجه 650gsm',
      size: '52 (L)',
      requestedVelocity: 148,
      stockLevel: 3,
      status: 'stockout_risk',
      conversionDropRate: 28.4,
    },
    {
      id: 'sz-2',
      productName: 'معطف كشمير منغولي مزدوج الوجه 650gsm',
      size: '50 (M)',
      requestedVelocity: 82,
      stockLevel: 14,
      status: 'balanced',
      conversionDropRate: 4.1,
    },
    {
      id: 'sz-3',
      productName: 'بدلة رسمية بهيكل هندسي صوف ميرينو',
      size: '52 (L Regular)',
      requestedVelocity: 195,
      stockLevel: 4,
      status: 'stockout_risk',
      conversionDropRate: 22.8,
    },
    {
      id: 'sz-4',
      productName: 'كنزة تريكو صوفية مضلعة عيار 7',
      size: 'L',
      requestedVelocity: 65,
      stockLevel: 22,
      status: 'surplus',
      conversionDropRate: 1.2,
    },
    {
      id: 'sz-5',
      productName: 'حذاء كلاسيكي من جلد العجل الفرنسي',
      size: '43',
      requestedVelocity: 110,
      stockLevel: 2,
      status: 'stockout_risk',
      conversionDropRate: 26.5,
    },
    {
      id: 'sz-6',
      productName: 'تيشيرت بيما قطن ملكي مطرز',
      size: 'XL',
      requestedVelocity: 160,
      stockLevel: 0,
      status: 'stockout_risk',
      conversionDropRate: 41.2,
    },
  ];

  const unmetSearches: UnmetSearchQuery[] = [
    {
      id: 'unm-1',
      query: 'معطف كشمير كحلي داكن مقاس 54 تفصيل خاص',
      searchVolume: 342,
      category: 'المعاطف والسترات',
      estimatedLostRevenueIQD: 24500000,
      growthTrend: 34.2,
    },
    {
      id: 'unm-2',
      query: 'بدلة توكسيدو مخملية سوداء للأعراس والمناسبات',
      searchVolume: 218,
      category: 'الأزياء الرسمية',
      estimatedLostRevenueIQD: 18450000,
      growthTrend: 18.5,
    },
    {
      id: 'unm-3',
      query: 'حذاء ديربي جلد عجل فرنسي بني محروق مقاس 44',
      searchVolume: 185,
      category: 'الأحذية',
      estimatedLostRevenueIQD: 12950000,
      growthTrend: 45.0,
    },
    {
      id: 'unm-4',
      query: 'كنزة صوف ياقة عالية رول نك رمادي حجري عيار 7',
      searchVolume: 160,
      category: 'التريكو والصوف',
      estimatedLostRevenueIQD: 8800000,
      growthTrend: 12.3,
    },
    {
      id: 'unm-5',
      query: 'حقيبة وثائق جلد تمساح نباتي مع قفل بلاديوم',
      searchVolume: 140,
      category: 'الإكسسوارات',
      estimatedLostRevenueIQD: 11300000,
      growthTrend: 22.1,
    },
  ];

  const totalUnmetLost = unmetSearches.reduce((acc, curr) => acc + curr.estimatedLostRevenueIQD, 0);

  return {
    overview: {
      totalRevenueIQD: 166200000,
      totalOrders: 553,
      averageOrderValueIQD: 300500,
      conversionRate: 3.82,
      hesitationCount: hesitationIncidents.length,
      unmetSearchLossIQD: totalUnmetLost,
    },
    hesitationIncidents,
    customerSessions,
    sizeDemandMatrix,
    unmetSearches,
  };
}
