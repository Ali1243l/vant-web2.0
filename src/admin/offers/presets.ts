export function getBadgePresets(isAr: boolean) {
  return [
    { label: isAr ? '🔥 عرض خاص' : '🔥 Special Offer', value: isAr ? 'عرض خاص' : 'Special Offer' },
    { label: isAr ? '⚡ صفقة اليوم' : '⚡ Deal of Day', value: isAr ? 'صفقة اليوم' : 'Deal of Day' },
    { label: isAr ? '❄️ تخفيضات الشتاء' : '❄️ Winter Sale', value: isAr ? 'تخفيضات الشتاء' : 'Winter Sale' },
    { label: isAr ? '💥 تصفية نهائية' : '💥 Clearance', value: isAr ? 'تصفية نهائية' : 'Clearance' },
    { label: isAr ? '⭐ الأكثر طلباً' : '⭐ Bestseller', value: isAr ? 'الأكثر طلباً' : 'Bestseller' },
    { label: isAr ? '🚚 شحن مجاني' : '🚚 Free Delivery', value: isAr ? 'شحن مجاني' : 'Free Delivery' },
    { label: isAr ? '🎁 وفر الآن' : '🎁 Save Now', value: isAr ? 'وفر الآن' : 'Save Now' },
  ];
}

export const fixedDeductionPresets = [5000, 10000, 15000, 25000, 50000];

export const quickCampaignTemplates = [
  { title: 'تخفيضات الشتاء الكبرى', code: 'WINTER25', pct: 20 },
  { title: 'عروض نهاية الأسبوع', code: 'WEEKEND15', pct: 15 },
  { title: 'تصفية الموسم', code: 'CLEARANCE35', pct: 35 },
  { title: 'صفقة حصرية للعملاء', code: 'VIPDEAL25', pct: 25 },
];
