import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  CreditCard,
  Calendar,
  Layers,
  Sparkles,
  Timer,
  AlertTriangle,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  Search,
  Zap,
  Target,
  BarChart3,
  RefreshCw,
  Gauge,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminBridge } from './useAdminBridge';
import { formatCurrency, formatNumber, formatPercent } from './format';
import { Card, StatusBadge, Button, Input, Modal } from './ui';
import {
  getAggregatedAnalytics,
  HesitationIncident,
  CustomerSession,
  SizeDemandItem,
  UnmetSearchQuery,
} from './lib/analytics';

type AnalyticsTab = 'overview' | 'hesitation' | 'personas' | 'demand-sizing';

export const AdminAnalyticsDashboard: React.FC = () => {
  const { lang, products, offers, subscribers, orders = [], setActiveView } = useAdminBridge();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'year'>('30d');
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);
  const [refreshSeed, setRefreshSeed] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [chartMetric, setChartMetric] = useState<'both' | 'sales' | 'orders'>('both');
  const [selectedBarData, setSelectedBarData] = useState<{
    labelAr: string;
    labelEn: string;
    sales: number;
    orders: number;
  } | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const isAr = lang === 'ar';

  // Fetch real aggregated analytics from live products and orders
  const analyticsData = useMemo(
    () => getAggregatedAnalytics(products, orders),
    [products, orders, refreshSeed]
  );

  // Dynamic datasets computed strictly from real database orders with true date math
  const datasets = useMemo(() => {
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
    const validOrders = orders.filter((o) => o && o.status !== 'cancelled');

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

    const totalRevenueAll = validOrders.reduce((a, b) => a + (Number(b.totalPrice) || 0), 0);
    const totalOrdersAll = validOrders.length;
    const aovAll = totalOrdersAll > 0 ? Math.round(totalRevenueAll / totalOrdersAll) : 0;

    const peak7d = points7d.reduce((prev, cur) => (cur.sales > prev.sales ? cur : prev), points7d[0]);

    return {
      '7d': {
        titleAr: 'منحنى الإيرادات الأسبوعية (آخر 7 أيام)',
        titleEn: 'Weekly Revenue Trajectory (Last 7 Days)',
        subAr: 'حجم المبيعات اليومية المحسوب من تواريخ الطلبات الحقيقية',
        subEn: 'Daily revenue volume computed from real order dates',
        peakAr: peak7d && peak7d.sales > 0 ? `أعلى يوم: ${peak7d.labelAr} (${peak7d.sales.toLocaleString()} IQD)` : (isAr ? '0 مبيعات مسجلة في آخر 7 أيام' : '0 sales recorded in last 7 days'),
        peakEn: peak7d && peak7d.sales > 0 ? `Peak: ${peak7d.labelEn} (${peak7d.sales.toLocaleString()} IQD)` : '0 sales in last 7 days',
        growth: `${growth7d >= 0 ? '+' : ''}${growth7d}%`,
        growthVal: growth7d,
        points: points7d,
        totalRevenue: curr7d.revenue,
        totalOrders: curr7d.count,
        aov: curr7d.aov,
        prevRevenue: prev7d.revenue,
        prevOrders: prev7d.count,
        prevAov: prev7d.aov,
      },
      '30d': {
        titleAr: 'منحنى الإيرادات الشهرية (30 يوماً)',
        titleEn: 'Monthly Revenue Trajectory (30D)',
        subAr: 'توزيع الإيرادات والطلبات عبر الأسابيع من قاعدة البيانات',
        subEn: 'Weekly breakdown across the month from real database',
        peakAr: curr30d.revenue > 0 ? `إجمالي 30 يوماً: ${curr30d.revenue.toLocaleString()} IQD` : (isAr ? '0 مبيعات مسجلة في آخر 30 يوماً' : '0 sales recorded in 30 days'),
        peakEn: curr30d.revenue > 0 ? `Total 30D: ${curr30d.revenue.toLocaleString()} IQD` : '0 sales in last 30 days',
        growth: `${growth30d >= 0 ? '+' : ''}${growth30d}%`,
        growthVal: growth30d,
        points: points30d,
        totalRevenue: curr30d.revenue,
        totalOrders: curr30d.count,
        aov: curr30d.aov,
        prevRevenue: prev30d.revenue,
        prevOrders: prev30d.count,
        prevAov: prev30d.aov,
      },
      '90d': {
        titleAr: 'منحنى الأداء الفصلي (90 يوماً)',
        titleEn: 'Quarterly Revenue Performance (90D)',
        subAr: 'البيانات المسجلة الحقيقية خلال الـ 90 يوماً',
        subEn: 'Comparative telemetry for the last three months',
        peakAr: curr90d.revenue > 0 ? `إجمالي 90 يوماً: ${curr90d.revenue.toLocaleString()} IQD` : (isAr ? '0 مبيعات مسجلة في الـ 90 يوماً' : '0 sales in last 90 days'),
        peakEn: curr90d.revenue > 0 ? `Total 90D: ${curr90d.revenue.toLocaleString()} IQD` : '0 sales in last 90 days',
        growth: `${growth90d >= 0 ? '+' : ''}${growth90d}%`,
        growthVal: growth90d,
        points: points90d,
        totalRevenue: curr90d.revenue,
        totalOrders: curr90d.count,
        aov: curr90d.aov,
        prevRevenue: prev90d.revenue,
        prevOrders: prev90d.count,
        prevAov: prev90d.aov,
      },
      'year': {
        titleAr: 'منحنى الأداء السنوي الشامل',
        titleEn: 'Annual Revenue Trajectory',
        subAr: 'إجمالي أداء الأرباع السنوية من قاعدة البيانات الحقيقية',
        subEn: 'Comprehensive performance across quarters from real database',
        peakAr: currYear.revenue > 0 ? `إجمالي السنة: ${currYear.revenue.toLocaleString()} IQD` : (isAr ? '0 مبيعات مسجلة هذا العام' : '0 sales this year'),
        peakEn: currYear.revenue > 0 ? `Total Year: ${currYear.revenue.toLocaleString()} IQD` : '0 sales this year',
        growth: `${growthYear >= 0 ? '+' : ''}${growthYear}%`,
        growthVal: growthYear,
        points: pointsYear,
        totalRevenue: currYear.revenue,
        totalOrders: currYear.count,
        aov: currYear.aov,
        prevRevenue: prevYear.revenue,
        prevOrders: prevYear.count,
        prevAov: prevYear.aov,
      },
    };
  }, [orders, isAr]);

  const currentDataset = datasets[timeRange];
  const chartData = currentDataset.points;
  const maxSales = Math.max(1, ...chartData.map((d) => d.sales));
  const maxOrders = Math.max(1, ...chartData.map((d) => d.orders));

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshSeed((prev) => prev + 1);
      setIsRefreshing(false);
    }, 450);
  };

  const revenueGrowth = currentDataset.growthVal;
  const ordersGrowth = currentDataset.prevOrders > 0
    ? Math.round(((currentDataset.totalOrders - currentDataset.prevOrders) / currentDataset.prevOrders) * 100)
    : (currentDataset.totalOrders > 0 ? 100 : 0);
  const aovGrowth = currentDataset.prevAov > 0
    ? Math.round(((currentDataset.aov - currentDataset.prevAov) / currentDataset.prevAov) * 100)
    : (currentDataset.aov > 0 ? 100 : 0);

  const stats = [
    {
      titleAr: 'إجمالي الإيرادات (IQD)',
      titleEn: 'Total Revenue (IQD)',
      value: currentDataset.totalRevenue,
      isCurrency: true,
      change: revenueGrowth,
      trend: revenueGrowth >= 0 ? 'up' : 'down',
      subAr: isAr ? `من إجمالي ${currentDataset.totalOrders} طلب حقيقي مسجل` : `From ${currentDataset.totalOrders} real recorded orders`,
      subEn: `From ${currentDataset.totalOrders} real orders`,
      icon: DollarSign,
      color: 'text-indigo-400',
    },
    {
      titleAr: 'إجمالي الطلبات',
      titleEn: 'Total Orders',
      value: currentDataset.totalOrders,
      isCurrency: false,
      change: ordersGrowth,
      trend: ordersGrowth >= 0 ? 'up' : 'down',
      subAr: isAr ? `${orders.filter((o) => o.status === 'delivered').length} طلب تم تسليمه` : `${orders.filter((o) => o.status === 'delivered').length} delivered orders`,
      subEn: 'Delivered orders',
      icon: ShoppingBag,
      color: 'text-emerald-400',
    },
    {
      titleAr: 'متوسط قيمة الطلب (IQD)',
      titleEn: 'Average Order Value (IQD)',
      value: currentDataset.aov,
      isCurrency: true,
      change: aovGrowth,
      trend: aovGrowth >= 0 ? 'up' : 'down',
      subAr: isAr ? 'محسوب من طلبات قاعدة البيانات الحقيقية' : 'Calculated from real database orders',
      subEn: 'Based on real database orders',
      icon: CreditCard,
      color: 'text-amber-400',
    },
    {
      titleAr: 'معدل التحويل الكلي',
      titleEn: 'Conversion Rate',
      valueText: `${analyticsData.overview.conversionRate}%`,
      change: 0,
      trend: analyticsData.overview.conversionRate > 0 ? 'up' : 'down',
      subAr: isAr ? 'نسبة التحويل من الزيارات الحقيقية' : 'Real visitor conversion rate',
      subEn: 'Real visitor conversion rate',
      icon: Users,
      color: 'text-purple-400',
    },
  ];

  // Category sales distribution derived strictly from real non-cancelled orders in database
  const categoriesShare = useMemo(() => {
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

    // Add sales strictly from valid real orders
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

    const palette = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-purple-500'];
    return Array.from(catMap.entries()).map(([name, data], idx) => ({
      nameAr: name,
      nameEn: name,
      percentage: totalCategorySales > 0 ? Math.round((data.sales / totalCategorySales) * 100) : 0,
      sales: data.sales,
      color: palette[idx % palette.length],
    }));
  }, [products, orders, isAr]);

  // Real recent orders directly from database
  const recentOrders = useMemo(() => {
    return orders.slice(0, 5).map((ord) => ({
      id: `#${ord.id}`,
      customer: ord.customerName || (isAr ? 'عميل كونسيرج' : 'Concierge Client'),
      date: ord.orderDate ? ord.orderDate.split(' ')[0] : (isAr ? 'اليوم' : 'Today'),
      items: ord.items ? ord.items.length : 1,
      total: ord.totalPrice || 0,
      status: ord.status === 'delivered' ? 'success' : ord.status === 'pending_payment' ? 'draft' : 'warning',
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
  }, [orders, isAr]);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleOpenWhatsApp = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabsConfig = [
    {
      id: 'overview',
      labelAr: 'نظرة عامة وبيانية',
      labelEn: 'Overview & Bento',
      icon: BarChart3,
    },
    {
      id: 'hesitation',
      labelAr: 'خوارزمية 1: كاشف التردد',
      labelEn: 'Algorithm 1: Hesitation Engine',
      icon: Timer,
      badge: `${analyticsData.hesitationIncidents.length}`,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'personas',
      labelAr: 'خوارزمية 2: شخصيات المشترين',
      labelEn: 'Algorithm 2: Buyer Personas',
      icon: Target,
      badge: `${analyticsData.customerSessions.length}`,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'demand-sizing',
      labelAr: 'خوارزمية 3: سرعة الطلب والمقاسات',
      labelEn: 'Algorithm 3: Demand Velocity',
      icon: Zap,
      badge: `${analyticsData.unmetSearches.length}`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner with Live Refresh and Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              {isAr ? 'محرك التحليلات السلوكية العميقة v2' : 'Deep Behavioral Analytics Engine v2'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {isAr ? 'لوحة الذكاء السلوكي وتحليلات المتجر' : 'Store Behavioral Intelligence Hub'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {isAr
              ? 'رصد التردد، تصنيف المشترين RFM، وسرعة دوران مقاسات الكتالوج بالدينار العراقي.'
              : 'Hesitation radar, RFM buyer personas, sizing velocity & unmet demand intelligence in IQD.'}
          </p>
        </div>

        {/* Top Header Actions (Ordered logically: Time Range Filter -> Live Refresh) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time range segmented tabs for overview */}
          {activeTab === 'overview' && (
            <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl shadow-inner">
              {[
                { id: '7d', labelAr: '7 أيام', labelEn: '7D' },
                { id: '30d', labelAr: '30 يوماً', labelEn: '30D' },
                { id: '90d', labelAr: '90 يوماً', labelEn: '90D' },
                { id: 'year', labelAr: 'سنة كاملة', labelEn: 'Year' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeRange(t.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    timeRange === t.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {isAr ? t.labelAr : t.labelEn}
                </button>
              ))}
            </div>
          )}

          {/* Live Refresh Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />}
            className="border-slate-800 bg-slate-900/60 hover:bg-slate-800"
          >
            {isRefreshing ? (isAr ? 'جاري التحديث...' : 'Updating...') : isAr ? 'تحديث البيانات الحية' : 'Refresh Telemetry'}
          </Button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar with Framer Motion Layout Glow */}
      <div className="p-1.5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 flex items-center gap-2 overflow-x-auto shadow-lg shadow-black/20">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AnalyticsTab)}
              className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2.5 shrink-0 select-none cursor-pointer ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md shadow-indigo-600/40"
                  transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full border font-mono ${
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Animated Tab Content Container with AnimatePresence */}
      <AnimatePresence mode="wait">
        {/* =========================================================================
            TAB 1: OVERVIEW (Bento Grid)
           ========================================================================= */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <Card key={idx} hoverable className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border-slate-800/80">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-slate-400">
                        {isAr ? s.titleAr : s.titleEn}
                      </span>
                      <div className="p-2 rounded-lg bg-slate-800/80 text-slate-300">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between gap-2 mb-2">
                      <span className="text-2xl font-bold text-white tracking-tight font-mono">
                        {s.valueText ||
                          (s.isCurrency
                            ? formatCurrency(s.value as number, 'IQD', isAr ? 'ar' : 'en')
                            : formatNumber(s.value as number, isAr ? 'ar' : 'en'))}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      {isAr ? s.subAr : s.subEn}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Main Charts & Breakdown Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Chart (2 columns) */}
              <Card className="lg:col-span-2 flex flex-col justify-between bg-slate-900/50 backdrop-blur-xl border-slate-800/80">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {isAr ? currentDataset.titleAr : currentDataset.titleEn}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isAr ? currentDataset.subAr : currentDataset.subEn}
                      </p>
                    </div>

                    {/* Interactive metric toggle buttons: Sales | Orders | Both */}
                    <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setChartMetric('sales')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                          chartMetric === 'sales'
                            ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                            : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span>{isAr ? 'المبيعات' : 'Sales'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartMetric('orders')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                          chartMetric === 'orders'
                            ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                            : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>{isAr ? 'الطلبات' : 'Orders'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartMetric('both')}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                          chartMetric === 'both'
                            ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-semibold'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        {isAr ? 'كلاهما (مقارنة)' : 'Both'}
                      </button>
                    </div>
                  </div>

                  {/* Interactive Bar Chart */}
                  <div className="h-64 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2">
                    {chartData.map((bar, index) => {
                      const salesPercent = (bar.sales / maxSales) * 100;
                      const ordersPercent = (bar.orders / maxOrders) * 100;
                      const activeHeight =
                        chartMetric === 'sales'
                          ? salesPercent
                          : chartMetric === 'orders'
                          ? ordersPercent
                          : salesPercent;
                      const isHovered = hoveredDataIndex === index;

                      return (
                        <div
                          key={index}
                          className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
                          onMouseEnter={() => setHoveredDataIndex(index)}
                          onMouseLeave={() => setHoveredDataIndex(null)}
                          onClick={() => setSelectedBarData(bar)}
                          title={isAr ? 'اضغط لعرض تفاصيل الفترة' : 'Click for period breakdown'}
                        >
                          {/* Tooltip on Hover */}
                          <div
                            className={`text-[10px] bg-slate-800 text-white px-2 py-1.5 rounded-lg border border-slate-700 shadow-xl pointer-events-none transition-opacity whitespace-nowrap z-20 ${
                              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            }`}
                          >
                            <div className="font-mono font-bold text-indigo-300">
                              {formatCurrency(bar.sales, 'IQD', isAr ? 'ar' : 'en')}
                            </div>
                            <div className="text-emerald-400 font-medium">
                              {bar.orders} {isAr ? 'طلب مكتمل' : 'orders'}
                            </div>
                          </div>

                          {/* Bar visual */}
                          <div className="w-full bg-slate-800/60 rounded-t-lg relative flex items-end overflow-hidden h-44">
                            <div
                              style={{ height: `${activeHeight}%` }}
                              className={`w-full rounded-t-lg transition-all duration-300 ${
                                chartMetric === 'orders'
                                  ? isHovered
                                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40'
                                    : 'bg-emerald-600/80 hover:bg-emerald-500'
                                  : isHovered
                                  ? 'bg-indigo-500 shadow-lg shadow-indigo-500/40'
                                  : 'bg-indigo-600/80 hover:bg-indigo-500'
                              }`}
                            />
                          </div>

                          {/* Day / Period label */}
                          <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
                            {isAr ? bar.labelAr : bar.labelEn}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-slate-300">
                    {isAr ? currentDataset.peakAr : currentDataset.peakEn}
                  </span>
                  <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    {currentDataset.growth} {isAr ? 'نمو مقارن' : 'Growth'}
                  </span>
                </div>
              </Card>

              {/* Categories Share & Inventory Summary (1 column) */}
              <Card className="flex flex-col justify-between bg-slate-900/50 backdrop-blur-xl border-slate-800/80">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                    <h3 className="text-base font-bold text-white">
                      {isAr ? 'توزيع المبيعات حسب الفئة' : 'Sales by Category'}
                    </h3>
                    <Layers className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="space-y-4">
                    {categoriesShare.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        {isAr ? 'لا توجد تصنيفات مسجلة في قاعدة البيانات' : 'No categories recorded in database'}
                      </div>
                    ) : (
                      categoriesShare.map((cat, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-200">
                              {isAr ? cat.nameAr : cat.nameEn}
                            </span>
                            <span className="text-slate-400 font-mono">
                              {formatCurrency(cat.sales, 'IQD', isAr ? 'ar' : 'en')} ({cat.percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${cat.percentage}%` }}
                              className={`h-full rounded-full ${cat.color}`}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="my-6 border-t border-slate-800/80" />

                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-300">
                      {isAr ? 'المؤشرات السلوكية المرصودة' : 'Behavioral Telemetry'}
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 text-xs">
                      <span className="text-slate-400">{isAr ? 'حالات التردد الحالية' : 'Hesitation Incidents'}</span>
                      <span className="font-bold text-rose-400 font-mono">
                        {analyticsData.hesitationIncidents.length} {isAr ? 'حالات' : 'cases'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 text-xs">
                      <span className="text-slate-400">{isAr ? 'فرص المبيعات الضائعة بالبحث' : 'Unmet Search Demand'}</span>
                      <span className="font-bold text-amber-400 font-mono">
                        {formatCurrency(analyticsData.overview.unmetSearchLossIQD, 'IQD', isAr ? 'ar' : 'en')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 text-xs">
                      <span className="text-slate-400">{isAr ? 'جلسات المشترين النشطة' : 'Active Buyer Profiles'}</span>
                      <span className="font-bold text-indigo-400 font-mono">
                        {analyticsData.customerSessions.length} {isAr ? 'جلسة' : 'sessions'}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('hesitation')}
                  className="w-full mt-4"
                >
                  {isAr ? 'فتح رادار التردد واسترجاع السلات' : 'Open Hesitation Recovery Engine'}
                </Button>
              </Card>
            </div>

            {/* Bottom Grid: Top Selling Products & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Selling Products */}
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/80">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {isAr ? 'أفضل المنتجات مبيعاً' : 'Top Performing Products'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isAr ? 'المنتجات ذات أعلى معدل طلب وإقبال' : 'Highest demand and order conversion'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveView('products')}>
                    {isAr ? 'الكل' : 'View All'}
                  </Button>
                </div>

                <div className="space-y-3">
                  {products.slice(0, 4).map((prod) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 border border-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {prod.imageUrl?.trim() ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-800 shrink-0 flex items-center justify-center text-slate-500 text-xs">
                            —
                          </div>
                        )}
                        <div className="min-w-0 text-start">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {isAr ? prod.name : prod.nameEn}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-mono">{prod.sku}</span>
                            <span>·</span>
                            <span className="text-indigo-400 font-medium">
                              {prod.salesCount} {isAr ? 'مبيعة' : 'sold'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-end shrink-0 ps-2">
                        <div className="text-xs font-bold text-white font-mono">
                          {formatCurrency(prod.price, 'IQD', isAr ? 'ar' : 'en')}
                        </div>
                        <div className="mt-1">
                          <StatusBadge
                            status={prod.status}
                            label={
                              prod.status === 'active'
                                ? (isAr ? 'متوفر' : 'In Stock')
                                : prod.status === 'lowStock'
                                ? (isAr ? 'منخفض' : 'Low')
                                : (isAr ? 'نفد' : 'Out')
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Orders Stream */}
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/80">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {isAr ? 'آخر طلبات الشراء الواردة' : 'Recent Customer Orders'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isAr ? 'تحديث فوري لمعاملات الدفع والشحن' : 'Real-time order checkout activity'}
                    </p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="space-y-3">
                  {recentOrders.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      {isAr ? 'لا توجد طلبات مسجلة في قاعدة البيانات حتى الآن' : 'No customer orders recorded in database yet'}
                    </div>
                  ) : (
                    recentOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800 text-start"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white">{ord.id}</span>
                            <span className="text-xs text-slate-300 font-medium">{ord.customer}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                            <span>{ord.date}</span>
                            <span>·</span>
                            <span>{ord.items} {isAr ? 'منتجات' : 'items'}</span>
                          </div>
                        </div>

                        <div className="text-end">
                          <div className="text-xs font-bold text-emerald-400 font-mono">
                            {formatCurrency(ord.total, 'IQD', isAr ? 'ar' : 'en')}
                          </div>
                          <div className="mt-1">
                            <StatusBadge
                              status={ord.status as any}
                              label={isAr ? ord.statusLabelAr : ord.statusLabelEn}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            TAB 2: ALGORITHM 1 (Hesitation Engine)
           ========================================================================= */}
        {activeTab === 'hesitation' && (
          <motion.div
            key="hesitation"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Algorithm 1 Intro Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-slate-900/60 border border-rose-500/20 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
                    <Timer className="w-4 h-4 text-rose-400" />
                    <span>{isAr ? 'خوارزمية رادار التردد اللحظي (Hesitation Engine)' : 'Algorithm 1: Sizing & Checkout Dwell Radar'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {isAr ? 'اكتشاف تعثر العملاء واسترجاعهم فوراً عبر واتساب' : 'Detect Drop-off Hesitation & Trigger 1-Click WhatsApp Recovery'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    {isAr
                      ? 'يقوم المحرك برصد العملاء الذين توقفوا عند اختيار المقاس أو ترددوا في صفحة الدفع لأكثر من 90 ثانية، مع حساب مؤشر نية الشراء (Intent Score) وتوليد رسالة مخصصة لفتح محادثة واتساب فوراً.'
                      : 'Monitors users stuck on sizing pickers or checkout forms (>90s dwell), calculates purchase intent scores, and synthesizes 1-click personalized WhatsApp recovery messages.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[110px]">
                    <div className="text-2xl font-bold font-mono text-rose-400">
                      {analyticsData.hesitationIncidents.length}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isAr ? 'حالات نشطة حالياً' : 'Active Dropoffs'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[110px]">
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                      {(() => {
                        if (analyticsData.hesitationIncidents.length > 0) {
                          const sum = analyticsData.hesitationIncidents.reduce((acc, inc) => acc + (inc.intentScore || 0), 0);
                          return Math.round(sum / analyticsData.hesitationIncidents.length);
                        }
                        if (analyticsData.customerSessions.length > 0) {
                          const sum = analyticsData.customerSessions.reduce((acc, sess) => acc + (sess.purchaseProbability || sess.rfmScore || 0), 0);
                          return Math.round(sum / analyticsData.customerSessions.length);
                        }
                        return 0;
                      })()}%
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isAr ? 'متوسط نية الشراء' : 'Avg Intent Score'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hesitation Incidents List */}
            <div className="space-y-4">
              {analyticsData.hesitationIncidents.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                  <Timer className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-300">
                    {isAr ? 'لا توجد حالات تردد مسجلة حالياً' : 'No Hesitation Incidents Detected'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    {isAr
                      ? 'يقوم النظام بمراقبة سلوك الزوار في المتجر ورصد أي تردد عند اختيار المقاس أو الدفع في الوقت الفعلي عند حدوثه.'
                      : 'The engine monitors live visitor sizing and checkout dwell times in real time.'}
                  </p>
                </div>
              ) : (
                analyticsData.hesitationIncidents.map((incident) => {
                const isCopied = copiedMessageId === incident.id;
                const stageLabel =
                  incident.stage === 'sizing'
                    ? (isAr ? 'تردد في تحديد المقاس' : 'Sizing Picker Stalled')
                    : incident.stage === 'checkout'
                    ? (isAr ? 'تردد في صفحة الدفع' : 'Checkout Form Stalled')
                    : (isAr ? 'توقف عند السلة' : 'Cart Dwell Stalled');

                return (
                  <Card
                    key={incident.id}
                    className="p-5 bg-slate-900/50 backdrop-blur-xl border-slate-800/80 hover:border-slate-700/80 transition-all space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Customer & Product details */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center font-bold text-white text-base shrink-0">
                          {incident.customerName.charAt(0)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="font-bold text-white text-sm sm:text-base">
                              {incident.customerName}
                            </h4>
                            <span className="text-xs text-slate-400 font-mono">
                              {incident.phone}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-[11px] text-slate-400">
                              {incident.timestamp}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs">
                            <span className="text-slate-300 font-medium">
                              {incident.productTitle}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              <Timer className="w-3 h-3 text-amber-400" />
                              <span>{stageLabel} ({incident.dwellSeconds} {isAr ? 'ثانية' : 'sec'})</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Intent Gauge */}
                      <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 shrink-0">
                        <div className="text-start">
                          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                            {isAr ? 'مؤشر نية الشراء' : 'Intent Score'}
                          </div>
                          <div className="text-lg font-bold font-mono text-emerald-400">
                            %{incident.intentScore}
                          </div>
                        </div>
                        <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${incident.intentScore}%` }}
                            className={`h-full rounded-full ${
                              incident.intentScore > 85 ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Generated Recovery WhatsApp Message Banner */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-start">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-0.5">
                            {isAr ? 'رسالة واتساب المقترحة للاسترجاع (Generated Recovery Message):' : 'Suggested WhatsApp Hook:'}
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            "{incident.recoveryMessage}"
                          </p>
                        </div>
                      </div>

                      {/* Recovery Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyMessage(incident.id, incident.recoveryMessage)}
                          leftIcon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          className="text-slate-300 hover:text-white"
                        >
                          {isCopied ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ الرسالة' : 'Copy'}
                        </Button>

                        <Button
                          variant="emerald"
                          size="sm"
                          onClick={() => handleOpenWhatsApp(incident.phone, incident.recoveryMessage)}
                          leftIcon={<ExternalLink className="w-3.5 h-3.5 text-white" />}
                          className="bg-emerald-600 hover:bg-emerald-500 font-semibold"
                        >
                          {isAr ? 'فتح محادثة واتساب' : 'Open WhatsApp'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              }))}
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            TAB 3: ALGORITHM 2 (Buyer Personas & RFM Intelligence)
           ========================================================================= */}
        {activeTab === 'personas' && (
          <motion.div
            key="personas"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Algorithm 2 Intro Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/60 border border-indigo-500/20 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    <Target className="w-4 h-4 text-indigo-400" />
                    <span>{isAr ? 'خوارزمية تصنيف المشترين (RFM Buyer Personas)' : 'Algorithm 2: Behavioral Personas & RFM Lead Scoring'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {isAr ? 'تصنيف زوار المتجر وتحديد النتيجة القياسية (RFM Score 0–100)' : 'Classify Customer Sessions & Compute RFM Lead Scores (0-100)'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    {isAr
                      ? 'تحديد نمط كل زائر تلقائياً (عميل VIP، صائد العروض، متصفح عابر، أو متردد) لحساب احتمالية إتمام الشراء وتوجيه الحملات الترويجية المناسبة.'
                      : 'Segments incoming traffic into behavioral archetypes (VIP, Deal Hunter, Window Shopper, Hesitant) based on session activity, cart intent, and purchase history.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 shrink-0">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'عملاء VIP' : 'VIP Buyers'}</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      {analyticsData.customerSessions.filter((s) => s.persona === 'VIP').length}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'صيادو الصفقات' : 'Deal Hunters'}</span>
                    <span className="text-lg font-bold font-mono text-indigo-400">
                      {analyticsData.customerSessions.filter((s) => s.persona === 'Deal Hunter').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Persona Sessions Table Card */}
            <Card className="p-0 overflow-hidden bg-slate-900/50 backdrop-blur-xl border-slate-800/80">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                      <th className="py-3.5 px-4 text-start">{isAr ? 'العميل والجلسة' : 'Customer Session'}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? 'نمط المشتري (Persona)' : 'Persona Archetype'}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? 'درجة RFM (0-100)' : 'RFM Lead Score'}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? 'احتمالية الشراء' : 'Purchase Prob.'}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? 'التفاعل بالسلة' : 'Activity'}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? 'إجمالي المشتريات (IQD)' : 'Total Spent (IQD)'}</th>
                      <th className="py-3.5 px-4 text-end">{isAr ? 'الحالة' : 'Activity'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {analyticsData.customerSessions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                          {isAr ? 'لا توجد جلسات عملاء مسجلة في قاعدة البيانات حالياً' : 'No customer sessions recorded in database yet'}
                        </td>
                      </tr>
                    ) : (
                      analyticsData.customerSessions.map((session) => {
                      const personaConfig = {
                        VIP: {
                          labelAr: 'عميل مميز (VIP)',
                          labelEn: 'VIP Patron',
                          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                          dot: 'bg-emerald-400',
                        },
                        'Deal Hunter': {
                          labelAr: 'صائد صفقات (Deal Hunter)',
                          labelEn: 'Deal Hunter',
                          badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
                          dot: 'bg-indigo-400',
                        },
                        'Window Shopper': {
                          labelAr: 'متصفح عابر (Window Shopper)',
                          labelEn: 'Window Shopper',
                          badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
                          dot: 'bg-slate-400',
                        },
                        'Hesitant Buyer': {
                          labelAr: 'مشترٍ متردد (Hesitant)',
                          labelEn: 'Hesitant Buyer',
                          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                          dot: 'bg-amber-400',
                        },
                      };

                      const currentP = personaConfig[session.persona];

                      return (
                        <tr key={session.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Name & Contact */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white text-sm">{session.customerName}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{session.phone}</div>
                          </td>

                          {/* Persona Tag */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${currentP.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${currentP.dot}`} />
                              <span>{isAr ? currentP.labelAr : currentP.labelEn}</span>
                            </span>
                          </td>

                          {/* RFM Score Progress */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white text-sm min-w-[28px]">
                                {session.rfmScore}
                              </span>
                              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${session.rfmScore}%` }}
                                  className={`h-full rounded-full ${
                                    session.rfmScore >= 85
                                      ? 'bg-emerald-400'
                                      : session.rfmScore >= 70
                                      ? 'bg-indigo-400'
                                      : 'bg-amber-400'
                                  }`}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Purchase Probability */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-bold text-emerald-400 font-mono text-sm">
                              %{session.purchaseProbability}
                            </span>
                          </td>

                          {/* Activity */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                            <span className="font-semibold text-white">{session.viewCount}</span> {isAr ? 'مشاهدة' : 'views'}
                            <span className="text-slate-500 mx-1.5">/</span>
                            <span className="font-semibold text-indigo-400">{session.cartCount}</span> {isAr ? 'بالسلة' : 'carted'}
                          </td>

                          {/* Total Spent in Iraqi Dinar */}
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-white">
                            {formatCurrency(session.totalSpentIQD, 'IQD', isAr ? 'ar' : 'en')}
                          </td>

                          {/* Last Active */}
                          <td className="py-3.5 px-4 text-end whitespace-nowrap">
                            <span className="text-[11px] text-slate-400 font-medium">
                              {session.lastActive}
                            </span>
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* =========================================================================
            TAB 4: ALGORITHM 3 (Demand Velocity & Sizing Intelligence)
           ========================================================================= */}
        {activeTab === 'demand-sizing' && (
          <motion.div
            key="demand-sizing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Algorithm 3 Intro Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-slate-900/60 border border-amber-500/20 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? 'خوارزمية سرعة الطلب والمقاسات (Demand Velocity Matrix)' : 'Algorithm 3: Size Demand & Unmet Search Intelligence'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {isAr ? 'مصفوفة توازن المقاسات وتحليل الكلمات البحثية غير الملباة' : 'Size Request-to-Stock Ratios & Unmet Customer Searches'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    {isAr
                      ? 'مقارنة حجم الطلب الفعلي على كل مقاس مقابل المخزون المتوفر للتنبؤ بنفاد السلع وتفادي انخفاض المبيعات، مع كشف عمليات البحث التي لم تسفر عن نتائج لتحديد المنتجات المطلوبة في السوق العراقي.'
                      : 'Evaluates size velocity against available inventory to flag stockout risks and highlights zero-result customer searches indicating unmet market demand in IQD.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[140px] shrink-0">
                  <div className="text-xs text-slate-400 mb-0.5">{isAr ? 'خسائر البحث غير الملبى' : 'Unmet Demand Loss'}</div>
                  <div className="text-base font-bold font-mono text-amber-400">
                    {formatCurrency(analyticsData.overview.unmetSearchLossIQD, 'IQD', isAr ? 'ar' : 'en')}
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix Section 1: Sizing Velocity Table */}
            <Card className="p-5 bg-slate-900/50 backdrop-blur-xl border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isAr ? 'مصفوفة استهلاك وتوفر المقاسات (Size Demand Matrix)' : 'Size Request vs. Stock Matrix'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isAr ? 'مقارنة معدل اختيار المقاس مع المخزون المتبقي ومعدل انخفاض التحويل' : 'Compare requested velocity with inventory buffer'}
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  {analyticsData.sizeDemandMatrix.length} {isAr ? 'مقاسات مرصودة' : 'tracked sizes'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase">
                      <th className="py-3 px-3 text-start">{isAr ? 'المنتج' : 'Product'}</th>
                      <th className="py-3 px-3 text-start">{isAr ? 'المقاس / الحجم' : 'Size / Variant'}</th>
                      <th className="py-3 px-3 text-start">{isAr ? 'سرعة الطلب (7 أيام)' : 'Weekly Velocity'}</th>
                      <th className="py-3 px-3 text-start">{isAr ? 'المخزون المتبقي' : 'In Stock'}</th>
                      <th className="py-3 px-3 text-start">{isAr ? 'هبوط التحويل' : 'Dropoff Rate'}</th>
                      <th className="py-3 px-3 text-end">{isAr ? 'حالة التوازن' : 'Deficit Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {analyticsData.sizeDemandMatrix.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                          {isAr ? 'لا توجد بيانات مقاسات مسجلة في قاعدة البيانات حالياً' : 'No size demand telemetry recorded yet'}
                        </td>
                      </tr>
                    ) : (
                      analyticsData.sizeDemandMatrix.map((item) => {
                      const isRisk = item.status === 'stockout_risk';
                      const isSurplus = item.status === 'surplus';

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 font-medium text-white">{item.productName}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs font-semibold border border-slate-700">
                              {item.size}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-200">
                            <strong>{item.requestedVelocity}</strong> {isAr ? 'طلب' : 'reqs'}
                          </td>
                          <td className="py-3 px-3 font-mono">
                            <span className={item.stockLevel <= 3 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                              {item.stockLevel} {isAr ? 'قطعة' : 'units'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-rose-400 font-semibold">
                            %{item.conversionDropRate}
                          </td>
                          <td className="py-3 px-3 text-end whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                isRisk
                                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                  : isSurplus
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                              }`}
                            >
                              {isRisk ? (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                                  <span>{isAr ? 'خطر نفاد حاد' : 'Stockout Risk'}</span>
                                </>
                              ) : isSurplus ? (
                                <span>{isAr ? 'فائض مخزون' : 'Surplus'}</span>
                              ) : (
                                <span>{isAr ? 'متوازن' : 'Balanced'}</span>
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Matrix Section 2: Unmet Search Intelligence */}
            <Card className="p-5 bg-slate-900/50 backdrop-blur-xl border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? 'ذكاء عمليات البحث غير الملباة (Unmet Search Intelligence)' : 'Unmet Search Intelligence'}</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isAr
                      ? 'كلمات بحث العملاء التي لم تسفر عن نتائج، مع القيمة التقديرية للإيرادات المفقودة'
                      : 'Zero-result product queries highlighting immediate inventory expansion opportunities'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {analyticsData.unmetSearches.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    {isAr ? 'لا توجد عمليات بحث بدون نتائج مسجلة حتى الآن' : 'No zero-result searches recorded'}
                  </div>
                ) : (
                  analyticsData.unmetSearches.map((unmet) => (
                  <div
                    key={unmet.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[10px] text-indigo-400 font-semibold">{unmet.category}</span>
                        <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                          +{unmet.growthTrend}% {isAr ? 'نمو' : 'trend'}
                        </span>
                      </div>
                      <h5 className="font-bold text-white text-xs leading-snug">
                        "{unmet.query}"
                      </h5>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{isAr ? 'عمليات البحث' : 'Searches'}</span>
                        <span className="font-bold font-mono text-white">{unmet.searchVolume}</span>
                      </div>
                      <div className="text-end">
                        <span className="text-[10px] text-slate-400 block">{isAr ? 'الإيراد المفقود' : 'Est. Lost Rev.'}</span>
                        <span className="font-bold font-mono text-amber-400">
                          {formatCurrency(unmet.estimatedLostRevenueIQD, 'IQD', isAr ? 'ar' : 'en')}
                        </span>
                      </div>
                    </div>
                  </div>
                )))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Bar Details Modal */}
      {selectedBarData && (
        <Modal
          isOpen={!!selectedBarData}
          onClose={() => setSelectedBarData(null)}
          title={isAr ? `تحليل أداء فترة: ${selectedBarData.labelAr}` : `Telemetry Breakdown: ${selectedBarData.labelEn}`}
          description={isAr ? 'بيانات المبيعات وحجم الطلبات ومؤشرات التحويل المرصودة' : 'Sales volume, completed orders and conversion telemetry'}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                <span className="text-slate-400 block mb-1 font-medium">{isAr ? 'إجمالي المبيعات' : 'Total Revenue'}</span>
                <span className="text-lg font-bold text-white font-mono">
                  {formatCurrency(selectedBarData.sales, 'IQD', isAr ? 'ar' : 'en')}
                </span>
                <span className="text-[10px] text-indigo-400 block mt-1">
                  {currentDataset.totalRevenue > 0
                    ? `${formatPercent(Math.round((selectedBarData.sales / currentDataset.totalRevenue) * 1000) / 10)} ${isAr ? 'من إجمالي الفترة' : 'of period total'}`
                    : '0%'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <span className="text-slate-400 block mb-1 font-medium">{isAr ? 'الطلبات المكتملة' : 'Completed Orders'}</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {selectedBarData.orders} {isAr ? 'طلب' : 'orders'}
                </span>
                <span className="text-[10px] text-emerald-300 block mt-1">
                  {currentDataset.totalOrders > 0
                    ? `${formatPercent(Math.round((selectedBarData.orders / currentDataset.totalOrders) * 1000) / 10)} ${isAr ? 'من إجمالي الطلبات' : 'of total orders'}`
                    : '0%'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed">
              <div className="text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isAr ? 'ملخص تحليلي حقيقي' : 'Database Telemetry Summary'}</span>
              </div>
              <p className="text-xs text-slate-300">
                {isAr
                  ? `سجلت هذه الفترة ${selectedBarData.orders} طلب بإجمالي مبيعات قدره ${formatCurrency(selectedBarData.sales, 'IQD', 'ar')} مباشرة من قاعدة البيانات.`
                  : `This period recorded ${selectedBarData.orders} orders with total sales of ${formatCurrency(selectedBarData.sales, 'IQD', 'en')} directly from database.`}
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button size="sm" onClick={() => setSelectedBarData(null)}>
                {isAr ? 'إغلاق النافذة' : 'Close'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default AdminAnalyticsDashboard;
