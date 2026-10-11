import type { Product, Order } from '../useAdminBridge';
import type { DatasetPeriod, CategoryShareItem, RecentOrderItem } from './types';

export function computeDatasets(
  orders: Order[],
  isAr: boolean,
  customStartDate: string,
  customEndDate: string
): Record<string, DatasetPeriod> {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const parseOrderTime = (o: any): number => {
    if (!o) return now;
    if (o.orderDate) {
      const parsed = new Date(o.orderDate).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    if (o.createdAt) {
      const parsed = new Date(o.createdAt).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    return now;
  };

  // Filter non-cancelled real orders from database
  const validOrders = (orders || []).filter((o) => o && o.status !== 'cancelled');

  // Helper for period calculations
  const getPeriodStats = (startDaysAgo: number, endDaysAgo: number = 0) => {
    const minTime = now - startDaysAgo * DAY_MS;
    const maxTime = now - endDaysAgo * DAY_MS;
    const matched = validOrders.filter((o) => {
      const t = parseOrderTime(o);
      return t >= minTime && t <= maxTime;
    });
    const revenue = matched.reduce((acc, o) => acc + (Number(o.totalPrice) || 0), 0);
    const count = matched.length;
    const aov = count > 0 ? Math.round(revenue / count) : 0;
    return { matched, revenue, count, aov };
  };

  // 1. 7-Day breakdown (last 7 days by day offset)
  const dayNamesAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const points7d = Array.from({ length: 7 }).map((_, i) => {
    const daysAgo = 6 - i;
    const dayStart = new Date(now - daysAgo * DAY_MS);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + DAY_MS - 1);

    const dayOrders = validOrders.filter((o) => {
      const t = parseOrderTime(o);
      return t >= dayStart.getTime() && t <= dayEnd.getTime();
    });
    const daySales = dayOrders.reduce((acc, o) => acc + (Number(o.totalPrice) || 0), 0);
    const dayIdx = dayStart.getDay();

    return {
      labelAr: dayNamesAr[dayIdx],
      labelEn: dayNamesEn[dayIdx],
      sales: daySales,
      orders: dayOrders.length,
    };
  });

  // 2. 30-Day breakdown (4 weeks of 7.5 days each)
  const weekNamesAr = ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'];
  const weekNamesEn = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];

  const points30d = Array.from({ length: 4 }).map((_, i) => {
    const startDays = 30 - i * 7.5;
    const endDays = 30 - (i + 1) * 7.5;
    const stats = getPeriodStats(startDays, endDays);
    return {
      labelAr: weekNamesAr[i],
      labelEn: weekNamesEn[i],
      sales: stats.revenue,
      orders: stats.count,
    };
  });

  // 3. 90-Day breakdown (3 months of 30 days each)
  const monthNamesAr = ['الشهر 3 (السابق)', 'الشهر 2', 'الشهر 1 (الحالي)'];
  const monthNamesEn = ['Month 3', 'Month 2', 'Month 1'];

  const points90d = Array.from({ length: 3 }).map((_, i) => {
    const startDays = 90 - i * 30;
    const endDays = 90 - (i + 1) * 30;
    const stats = getPeriodStats(startDays, endDays);
    return {
      labelAr: monthNamesAr[i],
      labelEn: monthNamesEn[i],
      sales: stats.revenue,
      orders: stats.count,
    };
  });

  // 4. Year breakdown (4 Quarters of 91 days each)
  const qNamesAr = ['الربع 1', 'الربع 2', 'الربع 3', 'الربع 4 (الحالي)'];
  const qNamesEn = ['Q1', 'Q2', 'Q3', 'Q4'];

  const pointsYear = Array.from({ length: 4 }).map((_, i) => {
    const startDays = 365 - i * 91;
    const endDays = 365 - (i + 1) * 91;
    const stats = getPeriodStats(startDays, endDays);
    return {
      labelAr: qNamesAr[i],
      labelEn: qNamesEn[i],
      sales: stats.revenue,
      orders: stats.count,
    };
  });

  // Compute period comparisons for real growth math
  const calcGrowth = (curr: number, prev: number) => {
    if (prev === 0 && curr === 0) return 0;
    if (prev === 0 && curr > 0) return 100;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const curr7d = getPeriodStats(7, 0);
  const prev7d = getPeriodStats(14, 7);
  const growth7d = calcGrowth(curr7d.revenue, prev7d.revenue);

  const curr30d = getPeriodStats(30, 0);
  const prev30d = getPeriodStats(60, 30);
  const growth30d = calcGrowth(curr30d.revenue, prev30d.revenue);

  const curr90d = getPeriodStats(90, 0);
  const prev90d = getPeriodStats(180, 90);
  const growth90d = calcGrowth(curr90d.revenue, prev90d.revenue);

  const currYear = getPeriodStats(365, 0);
  const prevYear = getPeriodStats(730, 365);
  const growthYear = calcGrowth(currYear.revenue, prevYear.revenue);

  const peak7d = points7d.reduce((prev, cur) => (cur.sales > prev.sales ? cur : prev), points7d[0]);

  return {
    '7d': {
      titleAr: 'منحنى الإيرادات الأسبوعية (آخر 7 أيام)',
      titleEn: 'Weekly Revenue Trajectory (Last 7 Days)',
      subAr: 'حجم المبيعات اليومية المحسوب من تواريخ الطلبات الحقيقية',
      subEn: 'Daily revenue volume computed from real order dates',
      peakAr:
        peak7d && peak7d.sales > 0
          ? `أعلى يوم: ${peak7d.labelAr} (${peak7d.sales.toLocaleString()} IQD)`
          : isAr
          ? '0 مبيعات مسجلة في آخر 7 أيام'
          : '0 sales recorded in last 7 days',
      peakEn:
        peak7d && peak7d.sales > 0
          ? `Peak: ${peak7d.labelEn} (${peak7d.sales.toLocaleString()} IQD)`
          : '0 sales in last 7 days',
      growth: `${growth7d >= 0 ? '+' : ''}${growth7d}%`,
      growthVal: growth7d,
      points: points7d,
      totalRevenue: curr7d.revenue,
      totalOrders: curr7d.count,
      avgAov: curr7d.aov,
      prevRevenue: prev7d.revenue,
      prevOrders: prev7d.count,
      prevAov: prev7d.aov,
    },
    '30d': {
      titleAr: 'منحنى الإيرادات الشهرية (30 يوماً)',
      titleEn: 'Monthly Revenue Trajectory (30D)',
      subAr: 'توزيع الإيرادات والطلبات عبر الأسابيع من قاعدة البيانات',
      subEn: 'Weekly breakdown across the month from real database',
      peakAr:
        curr30d.revenue > 0
          ? `إجمالي 30 يوماً: ${curr30d.revenue.toLocaleString()} IQD`
          : isAr
          ? '0 مبيعات مسجلة في آخر 30 يوماً'
          : '0 sales recorded in 30 days',
      peakEn:
        curr30d.revenue > 0
          ? `Total 30D: ${curr30d.revenue.toLocaleString()} IQD`
          : '0 sales in last 30 days',
      growth: `${growth30d >= 0 ? '+' : ''}${growth30d}%`,
      growthVal: growth30d,
      points: points30d,
      totalRevenue: curr30d.revenue,
      totalOrders: curr30d.count,
      avgAov: curr30d.aov,
      prevRevenue: prev30d.revenue,
      prevOrders: prev30d.count,
      prevAov: prev30d.aov,
    },
    '90d': {
      titleAr: 'منحنى الأداء الفصلي (90 يوماً)',
      titleEn: 'Quarterly Revenue Performance (90D)',
      subAr: 'البيانات المسجلة الحقيقية خلال الـ 90 يوماً',
      subEn: 'Comparative telemetry for the last three months',
      peakAr:
        curr90d.revenue > 0
          ? `إجمالي 90 يوماً: ${curr90d.revenue.toLocaleString()} IQD`
          : isAr
          ? '0 مبيعات مسجلة في الـ 90 يوماً'
          : '0 sales in last 90 days',
      peakEn:
        curr90d.revenue > 0
          ? `Total 90D: ${curr90d.revenue.toLocaleString()} IQD`
          : '0 sales in last 90 days',
      growth: `${growth90d >= 0 ? '+' : ''}${growth90d}%`,
      growthVal: growth90d,
      points: points90d,
      totalRevenue: curr90d.revenue,
      totalOrders: curr90d.count,
      avgAov: curr90d.aov,
      prevRevenue: prev90d.revenue,
      prevOrders: prev90d.count,
      prevAov: prev90d.aov,
    },
    year: {
      titleAr: 'منحنى الأداء السنوي الشامل',
      titleEn: 'Annual Revenue Trajectory',
      subAr: 'إجمالي أداء الأرباع السنوية من قاعدة البيانات الحقيقية',
      subEn: 'Comprehensive performance across quarters from real database',
      peakAr:
        currYear.revenue > 0
          ? `إجمالي السنة: ${currYear.revenue.toLocaleString()} IQD`
          : isAr
          ? '0 مبيعات مسجلة هذا العام'
          : '0 sales this year',
      peakEn:
        currYear.revenue > 0
          ? `Total Year: ${currYear.revenue.toLocaleString()} IQD`
          : '0 sales this year',
      growth: `${growthYear >= 0 ? '+' : ''}${growthYear}%`,
      growthVal: growthYear,
      points: pointsYear,
      totalRevenue: currYear.revenue,
      totalOrders: currYear.count,
      avgAov: currYear.aov,
      prevRevenue: prevYear.revenue,
      prevOrders: prevYear.count,
      prevAov: prevYear.aov,
    },
    custom: (() => {
      const customMinTime = customStartDate
        ? new Date(customStartDate).getTime()
        : now - 14 * DAY_MS;
      const customMaxTime = customEndDate
        ? new Date(customEndDate + 'T23:59:59').getTime()
        : now;
      const matchedCustom = validOrders.filter((o) => {
        const t = parseOrderTime(o);
        return t >= customMinTime && t <= customMaxTime;
      });
      const customRevenue = matchedCustom.reduce(
        (acc, o) => acc + (Number(o.totalPrice) || 0),
        0
      );
      const customCount = matchedCustom.length;
      const customAov = customCount > 0 ? Math.round(customRevenue / customCount) : 0;
      const rangeLabelAr =
        customStartDate && customEndDate
          ? `${customStartDate} إلى ${customEndDate}`
          : isAr
          ? 'فترة مخصصة'
          : 'Custom Range';
      const rangeLabelEn =
        customStartDate && customEndDate
          ? `${customStartDate} to ${customEndDate}`
          : 'Custom Range';

      return {
        titleAr: `تحليل الفترة المخصصة (${rangeLabelAr})`,
        titleEn: `Custom Period Analysis (${rangeLabelEn})`,
        subAr: 'تتبع ومقارنة المبيعات والطلبات ضمن المدة المحددة من قبلك',
        subEn: 'Custom date range sales telemetry from real database',
        peakAr:
          customRevenue > 0
            ? `إجمالي الفترة: ${customRevenue.toLocaleString()} IQD`
            : isAr
            ? '0 مبيعات في هذه الفترة'
            : '0 sales in custom period',
        peakEn:
          customRevenue > 0
            ? `Total Range: ${customRevenue.toLocaleString()} IQD`
            : '0 sales in custom period',
        growth: '+0%',
        growthVal: 0,
        points: [
          {
            labelAr: rangeLabelAr,
            labelEn: rangeLabelEn,
            sales: customRevenue,
            orders: customCount,
          },
        ],
        totalRevenue: customRevenue,
        totalOrders: customCount,
        avgAov: customAov,
        prevRevenue: 0,
        prevOrders: 0,
        prevAov: 0,
      };
    })(),
  };
}

export function computeCategoriesShare(
  products: Product[],
  orders: Order[],
  isAr: boolean
): CategoryShareItem[] {
  if (!products || products.length === 0) return [];
  const catMap = new Map<string, { count: number; sales: number }>();

  products.forEach((p) => {
    const cat = p.category || (isAr ? 'أخرى' : 'Other');
    if (!catMap.has(cat)) {
      catMap.set(cat, { count: 0, sales: 0 });
    }
    const curr = catMap.get(cat)!;
    curr.count += 1;
  });

  const validOrders = (orders || []).filter((o) => o && o.status !== 'cancelled');
  validOrders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const prod = products.find((p) => String(p.id) === String(item.productId));
      const cat = prod?.category || (isAr ? 'أخرى' : 'Other');
      const curr = catMap.get(cat) || { count: 0, sales: 0 };
      curr.sales += (item.price || 0) * (item.quantity || 1);
      catMap.set(cat, curr);
    });
  });

  const totalCategorySales = Array.from(catMap.values()).reduce((acc, c) => acc + c.sales, 0);

  const palette = [
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-purple-500',
  ];
  return Array.from(catMap.entries()).map(([name, data], idx) => ({
    nameAr: name,
    nameEn: name,
    percentage:
      totalCategorySales > 0 ? Math.round((data.sales / totalCategorySales) * 100) : 0,
    sales: data.sales,
    color: palette[idx % palette.length],
  }));
}

export function computeRecentOrders(orders: Order[], isAr: boolean): RecentOrderItem[] {
  return (orders || []).slice(0, 5).map((ord) => ({
    id: `#${ord.id}`,
    customer: ord.customerName || (isAr ? 'عميل كونسيرج' : 'Concierge Client'),
    date: ord.orderDate ? ord.orderDate.split(' ')[0] : isAr ? 'اليوم' : 'Today',
    items: ord.items ? ord.items.length : 1,
    total: ord.totalPrice || 0,
    status:
      ord.status === 'delivered'
        ? 'success'
        : ord.status === 'pending_payment'
        ? 'draft'
        : 'warning',
    statusLabelAr:
      ord.status === 'pending_payment'
        ? 'بانتظار التأكيد'
        : ord.status === 'processing'
        ? 'قيد التجهيز'
        : ord.status === 'shipped'
        ? 'تم الشحن'
        : ord.status === 'delivered'
        ? 'تم التسليم'
        : 'ملغي',
    statusLabelEn: ord.status,
  }));
}
